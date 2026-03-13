#!/usr/bin/env node
/**
 * CodeDNA Autonomous Runner v3.0 — Multi-Agent Support
 * 
 * Runs survival loop for one or multiple agents:
 *   1. Read chain state for each agent
 *   2. Rule-based decision (DNA + state → deterministic action)
 *   3. Execute on chain
 *   4. Save memory
 *   5. Wait for cooldown
 *   6. Repeat
 * 
 * Usage:
 *   node runner.mjs                        — Run all agents in config
 *   node runner.mjs --token 1              — Run single agent #1
 *   node runner.mjs --token 1,2,3          — Run agents #1, #2, #3
 *   node runner.mjs --once                 — Run one cycle and exit
 *   node runner.mjs --status               — Show runner status
 * 
 * Config (~/.codedna/config.json):
 *   { "agents": [1, 2, 3] }          — Multi-agent mode
 *   { "tokenId": 1 }                 — Legacy single-agent (auto-upgraded)
 * 
 * Prerequisites:
 *   - ~/.codedna/wallet.json exists (run setup.mjs)
 *   - ~/.codedna/config.json has agents list or tokenId
 *   - Agent wallet has >= 0.005 BNB for gas
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { ethers } from "ethers";
import {
  getAgentFullState,
  getAdjacentPlots,
  getNearbyAgents,
  executeAction,
  getCurrentBlock,
  getBnbBalance,
  getWalletAddress,
} from "./chain.mjs";
import { decide } from "./brain.mjs";
import { saveMemory } from "./memory.mjs";

// ========== Config ==========

const CONFIG_DIR = join(homedir(), ".codedna");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const WALLET_PATH = join(CONFIG_DIR, "wallet.json");
const STATUS_PATH = join(CONFIG_DIR, "runner_status.json");

const INTERVAL_BLOCKS = 300;   // ~15 min between full cycles
const MIN_BNB = 0.005;
const POLL_INTERVAL_MS = 10000;
const AGENT_DELAY_MS = 3000;   // 3s pause between agents to avoid RPC spam

// ========== Parse CLI Args ==========

const cliArgs = process.argv.slice(2);
let tokenOverride = null;
let onceMode = false;
let statusMode = false;

for (let i = 0; i < cliArgs.length; i++) {
  if (cliArgs[i] === "--token" && cliArgs[i+1]) {
    tokenOverride = cliArgs[i+1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    i++;
  }
  if (cliArgs[i] === "--once") onceMode = true;
  if (cliArgs[i] === "--status") statusMode = true;
}

// ========== Status ==========

function writeStatus(data) {
  try {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(STATUS_PATH, JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString(),
      pid: process.pid,
    }, null, 2));
  } catch {}
}

function readStatus() {
  if (!existsSync(STATUS_PATH)) return null;
  try { return JSON.parse(readFileSync(STATUS_PATH, "utf-8")); } catch { return null; }
}

if (statusMode) {
  const s = readStatus();
  console.log(s ? JSON.stringify(s, null, 2) : "No runner status found.");
  process.exit(0);
}

// ========== Load Agent List ==========

function loadAgentList() {
  // CLI override
  if (tokenOverride && tokenOverride.length > 0) return tokenOverride;

  // Config file
  if (!existsSync(CONFIG_PATH)) {
    console.error("❌ 配置不存在。运行: node scripts/setup.mjs");
    process.exit(1);
  }

  let config;
  try { config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8")); } catch {
    console.error("❌ 配置文件损坏");
    process.exit(1);
  }

  // New format: { agents: [1, 2, 3] }
  if (config.agents && Array.isArray(config.agents) && config.agents.length > 0) {
    return config.agents;
  }

  // Legacy format: { tokenId: 1 }
  if (config.tokenId) {
    // Auto-upgrade to new format
    config.agents = [config.tokenId];
    try { writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2)); } catch {}
    return [config.tokenId];
  }

  console.error("❌ 没有配置 Agent。运行: node setup.mjs add-token <id>");
  process.exit(1);
}

// ========== Pre-flight ==========

function preflight() {
  if (!existsSync(WALLET_PATH)) {
    console.error("❌ 钱包不存在。运行: node scripts/setup.mjs");
    process.exit(1);
  }
  return loadAgentList();
}

// ========== Graceful Shutdown ==========

let shutdownRequested = false;

process.on("SIGINT", () => {
  console.log("\n[Runner] SIGINT — 正在优雅停止...");
  shutdownRequested = true;
});

process.on("SIGTERM", () => {
  console.log("\n[Runner] SIGTERM — 正在优雅停止...");
  shutdownRequested = true;
});

// ========== Helpers ==========

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForBlock(target) {
  while (!shutdownRequested) {
    const current = await getCurrentBlock();
    if (current >= target) return current;
    await sleep(POLL_INTERVAL_MS);
  }
  return await getCurrentBlock();
}

// ========== Run One Agent Cycle ==========

async function runAgentCycle(tokenId, cycleNum) {
  console.log(`\n  ── Agent #${tokenId} ──`);

  // 1. Read chain state
  const state = await getAgentFullState(tokenId);

  if (state.status === 1) {
    console.log(`  ☠️  Agent #${tokenId} 已死亡，跳过`);
    return { action: "dead", skipped: true };
  }

  const gold = parseFloat(ethers.formatEther(state.lockedBalance)).toFixed(2);
  console.log(`  状态: E=${state.currentEnergy}/${state.maxEnergy} | 位置(${state.locationX},${state.locationY}) | 金=${gold}`);

  // 2. Nearby agents
  const plotId = state.locationX * 1000 + state.locationY;
  let nearby = [];
  try { nearby = await getNearbyAgents(plotId, 5); } catch {}

  // 2.5. Adjacent plots
  try { state.adjacentPlots = await getAdjacentPlots(state.locationX, state.locationY); } catch {
    state.adjacentPlots = [];
  }

  // 3. Decide
  const decision = decide(state, nearby);
  console.log(`  决策: ${decision.action} | ${decision.reason}`);

  // 4. Execute
  if (decision.action === "idle") {
    console.log(`  跳过 (无可执行行动)`);
    return { action: "idle", skipped: true };
  }

  console.log(`  执行: ${decision.action}...`);
  const result = await executeAction(decision, state);
  console.log(`  ${result.success ? "✅" : "❌"} ${result.result}`);
  if (result.txHash) {
    console.log(`  TX: https://bscscan.com/tx/${result.txHash}`);
  }

  // Save memory
  const newBlock = await getCurrentBlock();
  let newState;
  try { newState = await getAgentFullState(tokenId); } catch { newState = state; }

  saveMemory(tokenId, {
    block: newBlock,
    action: decision.action,
    target: decision.target_agent || decision.target_x,
    result: result.result,
    energyAfter: newState.currentEnergy,
    note: decision.reason,
  });

  return { action: decision.action, success: result.success };
}

// ========== Main Loop ==========

async function main() {
  const agentList = preflight();

  // Check wallet
  const walletAddr = getWalletAddress();
  if (!walletAddr) {
    console.error("❌ 无法加载钱包。检查 ~/.codedna/wallet.json");
    process.exit(1);
  }

  const bnb = parseFloat(await getBnbBalance(walletAddr));
  if (bnb < MIN_BNB) {
    console.error(`❌ Gas 不足: ${bnb} BNB (需要 >= ${MIN_BNB})`);
    console.error(`   请向 ${walletAddr} 转入 BNB`);
    process.exit(1);
  }

  console.log("╔══════════════════════════════════════╗");
  console.log("║   CodeDNA Autonomous Runner v3.0     ║");
  console.log("║        Multi-Agent Support           ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Agents: ${agentList.map(id => "#" + id).join(", ")} (共 ${agentList.length} 个)`);
  console.log(`Wallet: ${walletAddr}`);
  console.log(`BNB: ${bnb.toFixed(4)}`);
  console.log(`Interval: ${INTERVAL_BLOCKS} blocks (~${Math.round(INTERVAL_BLOCKS * 3 / 60)} min)`);
  console.log(`Mode: ${onceMode ? "单次" : "持续运行"}`);
  console.log("");

  let lastDecisionBlock = 0;
  let cycleCount = 0;

  writeStatus({ state: "running", agents: agentList, wallet: walletAddr, cycle: 0 });

  while (!shutdownRequested) {
    try {
      cycleCount++;
      const currentBlock = await getCurrentBlock();

      // Wait for interval
      if (lastDecisionBlock > 0 && currentBlock < lastDecisionBlock + INTERVAL_BLOCKS) {
        const targetBlock = lastDecisionBlock + INTERVAL_BLOCKS;
        const waitBlocks = targetBlock - currentBlock;
        console.log(`\n⏳ 等待区块 ${targetBlock} (还需 ${waitBlocks} 块 ≈ ${Math.round(waitBlocks * 3 / 60)}分钟)...`);
        writeStatus({ state: "waiting", agents: agentList, wallet: walletAddr, cycle: cycleCount, targetBlock });
        await waitForBlock(targetBlock);
        if (shutdownRequested) break;
      }

      const block = await getCurrentBlock();
      console.log(`\n═══ 周期 ${cycleCount} | 区块 ${block} | ${agentList.length} 个 Agent ═══`);

      // Run each agent
      const results = {};
      for (const tokenId of agentList) {
        if (shutdownRequested) break;
        try {
          results[tokenId] = await runAgentCycle(tokenId, cycleCount);
        } catch (err) {
          console.error(`  ❌ Agent #${tokenId} 错误: ${err.message}`);
          results[tokenId] = { action: "error", error: err.message };
        }
        // Pause between agents
        if (agentList.indexOf(tokenId) < agentList.length - 1) {
          await sleep(AGENT_DELAY_MS);
        }
      }

      // Summary
      const actions = Object.entries(results).map(([id, r]) => `#${id}:${r.action}`).join(" | ");
      console.log(`\n  📊 小结: ${actions}`);

      // Gas check every 10 cycles
      if (cycleCount % 10 === 0) {
        const gasLeft = parseFloat(await getBnbBalance(walletAddr));
        console.log(`  Gas 余额: ${gasLeft.toFixed(4)} BNB`);
        if (gasLeft < MIN_BNB) {
          console.error(`  ⚠️ Gas 不足! 请充值 ${walletAddr}`);
          writeStatus({ state: "low_gas", agents: agentList, wallet: walletAddr, cycle: cycleCount, gasLeft });
        }
      }

      lastDecisionBlock = await getCurrentBlock();
      writeStatus({ state: "running", agents: agentList, wallet: walletAddr, cycle: cycleCount, lastBlock: lastDecisionBlock, results });

      if (onceMode) {
        console.log("\n[Runner] 单次模式，退出。");
        break;
      }

    } catch (err) {
      console.error(`\n[ERROR] 周期 ${cycleCount} 失败: ${err.message}`);
      writeStatus({ state: "error", agents: agentList, wallet: walletAddr, cycle: cycleCount, error: err.message });
      await sleep(30000);
    }
  }

  writeStatus({ state: "stopped", agents: agentList, wallet: walletAddr, cycle: cycleCount });
  console.log("\n[Runner] 已停止。");
  process.exit(0);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  writeStatus({ state: "fatal", error: err.message });
  process.exit(1);
});
