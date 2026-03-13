#!/usr/bin/env node
/**
 * CodeDNA Chain Interaction Script (V3)
 * 
 * Usage:
 *   node chain.mjs <command> [args...]
 * 
 * Commands:
 *   state <agentId>                  — Get full agent state
 *   mint                             — Mint a genesis agent (costs 0.1+ BNB)
 *   place <agentId> [x] [y]         — Place agent on world map
 *   gather <agentId>                 — Gather DNAGOLD
 *   eat <agentId>                    — Eat to restore energy
 *   move <agentId> <x> <y>          — Move to coordinates
 *   raid <agentId> <targetId>       — Raid another agent
 *   share <agentId> <targetId> <amount> — Share DNAGOLD
 *   teach <agentId> <targetId> <attr>   — Teach attribute (0-7)
 *   reproduce <agentId> <partnerId>     — Reproduce
 *   rescue <agentId> <targetId>     — Rescue a dying agent
 *   nearby <agentId> [radius]       — Get nearby agents
 *   list <address>                   — List owned agent IDs
 *   supply                           — Token supply info
 *   price                            — Current mint price
 *   world                            — World stats
 *   balance <address>                — BNB balance of address
 *   can-execute <agentId> <action> [targetId] — Check if action is executable
 * 
 * Environment:
 *   CODEDNA_RPC_URL       — BSC RPC (default: https://bsc-dataseed1.binance.org)
 *   CODEDNA_PRIVATE_KEY   — Wallet private key (required for write ops)
 *                            Falls back to ~/.codedna/wallet.json if not set.
 *   CODEDNA_CHAIN_ID      — Chain ID (default: 56)
 */

import { ethers } from "ethers";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ========== V3 Contract Addresses (BSC Mainnet) ==========
const CONTRACTS = {
  dnagold:    "0x660AA4225956975171deE3D78612c7B58c5e96B6",
  core:       "0x4033AFaFAb90191a4982CdAfa5Cb4E117A91f185",
  worldMap:   "0x9C3eD84D6BFDDD425b46a94052f725B23593c297",
  family:     "0x7D71118205FECBF4B62c2a5157c170588c6e9DD7",
  economy:    "0x615DBE2117c8D68514bA14aC8f9E026045977F7a",
  behavior:   "0x293fbFC88E6d6E01b9428806D7F1F93C23EA4D77",
  death:      "0x03b15E325EDF110897bf527E2dA08b1D6f60b32c",
  reproduce:  "0x7873ECE552C11C31Fb37822c8B5c699b4Fd51c04",
  sale:       "0xcBe90d6F542FCaafCdaCd569EeA66B87af56d7de",
  market:     "0x90A7f9025D9a57508Aba43126f58DaB032C37371",
  bridge:     "0x319881A6F66a832f4f09Ad94128Fb01b1bEB23CE",
};

const ATTR_LABELS = ["IQ","领导力","力量","攻击","外交","创造力","寿命","繁殖力"];
const GENDER = ["♀ 女","♂ 男"];
const PLOT_TYPES = ["草原","森林","山地","矿脉"];
const GAS_LIMIT = 500000;

// ========== ABIs ==========
const BRIDGE_ABI = [
  `function getAgentFullState(uint256 agentId) view returns (
    tuple(
      uint256 tokenId, address owner,
      uint256 currentEnergy, uint256 maxEnergy,
      uint256 locationX, uint256 locationY,
      uint256 lockedBalance,
      uint8 status, uint8 gender, bool onMap,
      uint256 gatherCooldownLeft, uint256 eatCooldownLeft,
      uint256 moveCooldownLeft, uint256 reproduceCooldownLeft,
      uint256 raidCooldownLeft, uint256 shareCooldownLeft,
      uint256 teachCooldownLeft,
      uint16[8] attributes, uint16[8] attributeBonus,
      uint256 reproduceCount, uint256 reproduceLimit,
      uint256 familyRoot, uint256 familyHeadcount,
      uint256 fatherId, uint256 motherId,
      uint256 halvingCount, uint256 dilutionFactor,
      uint256 totalLiving, uint256 baseYield,
      uint8 plotType, uint256 plotMultiplier,
      uint256 plotAgentCount, bool isPlotLeader,
      uint256 estimatedGatherYield
    )
  )`,
  `function getNearbyAgents(uint256 centerPlotId, uint256 radius) view returns (
    tuple(
      uint256 tokenId, uint256 locationX, uint256 locationY,
      uint256 distance, uint256 currentEnergy,
      address owner, uint8 gender, uint8 status,
      uint256 lockedBalance
    )[]
  )`,
  `function canExecute(uint256 agentId, string action, uint256 targetId) view returns (bool ok, string reason)`,
  `function getWorldStats() view returns (
    uint256 totalGenesis, uint256 totalTokens, uint256 totalLiving,
    uint256 totalBorn, uint256 halvingCount, uint256 baseYield, uint256 dilutionFactor
  )`,
];

const CORE_ABI = [
  "function totalGenesisCount() view returns (uint256)",
  "function totalTokenCount() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getAttributes(uint256) view returns (uint16[8], uint8)",
  "function agentEnergy(uint256) view returns (uint256)",
  "function maxEnergy(uint256) view returns (uint256)",
  "function MAX_GENESIS() view returns (uint256)",
];

const SALE_ABI = [
  "function getGenesisPrice() view returns (uint256)",
  "function mintGenesis() payable returns (uint256)",
];

const BEHAVIOR_ABI = [
  "function placeOnMap(uint256 agentId, uint256 x, uint256 y)",
  "function gather(uint256 agentId)",
  "function eat(uint256 agentId)",
  "function move(uint256 agentId, uint256 newX, uint256 newY)",
  "function raid(uint256 agentId, uint256 targetId)",
  "function share(uint256 agentId, uint256 targetId, uint256 amount)",
  "function teach(uint256 agentId, uint256 targetId, uint256 attrIndex)",
  "function reproduce(uint256 agentId, uint256 partnerId)",
  "function rescue(uint256 rescuerId, uint256 targetId)",
];

const GOLD_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function lockedBalance(uint256 agentId) view returns (uint256)",
];

// ========== Setup ==========

function loadPrivateKey() {
  if (process.env.CODEDNA_PRIVATE_KEY) return process.env.CODEDNA_PRIVATE_KEY;
  const walletPath = join(homedir(), ".codedna", "wallet.json");
  if (existsSync(walletPath)) {
    try {
      const data = JSON.parse(readFileSync(walletPath, "utf-8"));
      return data.privateKey;
    } catch {}
  }
  return "";
}

const rpc = process.env.CODEDNA_RPC_URL || "https://bsc-dataseed1.binance.org";
const pk = loadPrivateKey();

const provider = new ethers.JsonRpcProvider(rpc);
const wallet = pk ? new ethers.Wallet(pk, provider) : null;

const bridge = new ethers.Contract(CONTRACTS.bridge, BRIDGE_ABI, provider);
const core = new ethers.Contract(CONTRACTS.core, CORE_ABI, provider);
const sale = new ethers.Contract(CONTRACTS.sale, SALE_ABI, wallet || provider);
const behavior = new ethers.Contract(CONTRACTS.behavior, BEHAVIOR_ABI, wallet || provider);
const gold = new ethers.Contract(CONTRACTS.dnagold, GOLD_ABI, provider);
const worldMap = new ethers.Contract(CONTRACTS.worldMap, [
  "function getPlotType(uint256) view returns (uint8)",
  "function getPlotMultiplier(uint256) view returns (uint256)"
], provider);

function needWallet() {
  if (!wallet) {
    console.error("ERROR: No wallet available. Set CODEDNA_PRIVATE_KEY or run setup.mjs first.");
    process.exit(1);
  }
}

function fmt(wei) {
  return ethers.formatEther(wei);
}

// ========== Exported Functions (for runner.mjs) ==========

/**
 * Parse raw getAgentFullState tuple into a plain object
 */
function parseAgentState(s) {
  const n = (v) => Number(v);
  return {
    tokenId: n(s.tokenId),
    owner: s.owner,
    currentEnergy: n(s.currentEnergy),
    maxEnergy: n(s.maxEnergy),
    locationX: n(s.locationX),
    locationY: n(s.locationY),
    lockedBalance: s.lockedBalance.toString(),
    status: n(s.status),
    gender: n(s.gender),
    onMap: s.onMap,
    gatherCooldownLeft: n(s.gatherCooldownLeft),
    eatCooldownLeft: n(s.eatCooldownLeft),
    moveCooldownLeft: n(s.moveCooldownLeft),
    reproduceCooldownLeft: n(s.reproduceCooldownLeft),
    raidCooldownLeft: n(s.raidCooldownLeft),
    shareCooldownLeft: n(s.shareCooldownLeft),
    teachCooldownLeft: n(s.teachCooldownLeft),
    attributes: Array.from(s.attributes).map(Number),
    attributeBonus: Array.from(s.attributeBonus).map(Number),
    reproduceCount: n(s.reproduceCount),
    reproduceLimit: n(s.reproduceLimit),
    familyRoot: n(s.familyRoot),
    familyHeadcount: n(s.familyHeadcount),
    fatherId: n(s.fatherId),
    motherId: n(s.motherId),
    halvingCount: n(s.halvingCount),
    dilutionFactor: n(s.dilutionFactor),
    totalLiving: n(s.totalLiving),
    baseYield: s.baseYield.toString(),
    plotType: n(s.plotType),
    plotMultiplier: n(s.plotMultiplier),
    plotAgentCount: n(s.plotAgentCount),
    isPlotLeader: s.isPlotLeader,
    estimatedGatherYield: s.estimatedGatherYield.toString(),
  };
}

export async function getAgentFullState(tokenId) {
  const raw = await bridge.getAgentFullState(tokenId);
  return parseAgentState(raw);
}

export async function getNearbyAgents(centerPlotId, radius = 5) {
  const raw = await bridge.getNearbyAgents(centerPlotId, radius);
  return raw.map((a) => ({
    tokenId: Number(a.tokenId),
    locationX: Number(a.locationX),
    locationY: Number(a.locationY),
    distance: Number(a.distance),
    currentEnergy: Number(a.currentEnergy),
    owner: a.owner,
    gender: Number(a.gender),
    status: Number(a.status),
    lockedBalance: a.lockedBalance.toString(),
  }));
}

export async function getAdjacentPlots(x, y) {
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  const results = [];
  for (const [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx > 999 || ny < 0 || ny > 999) continue;
    const plotId = nx * 1000 + ny;
    try {
      const [ptHex, multHex] = await Promise.all([
        worldMap.getPlotType(plotId),
        worldMap.getPlotMultiplier(plotId)
      ]);
      results.push({ x: nx, y: ny, plotType: Number(ptHex), multiplier: Number(multHex) });
    } catch { results.push({ x: nx, y: ny, plotType: 0, multiplier: 100 }); }
  }
  return results;
}

export async function canExecute(agentId, action, targetId = 0) {
  const [ok, reason] = await bridge.canExecute(agentId, action, targetId);
  return { ok, reason };
}

export async function getCurrentBlock() {
  return await provider.getBlockNumber();
}

export async function getBnbBalance(address) {
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
}

export async function listOwnedAgents(address) {
  const total = Number(await core.totalGenesisCount());
  const addr = address.toLowerCase();
  const ids = [];
  // Scan all minted tokens (no ERC721Enumerable)
  for (let i = 0; i < total; i++) {
    try {
      const owner = await core.ownerOf(i);
      if (owner.toLowerCase() === addr) ids.push(i);
    } catch {}
  }
  return ids;
}

/**
 * Execute a behavior action on chain
 * @returns {{ success: boolean, result: string, txHash?: string }}
 */
export async function executeAction(decision, state) {
  needWallet();
  const { action, target_agent, target_x, target_y, share_amount, teach_attr } = decision;
  const agentId = state.tokenId;

  // Pre-validate via canExecute
  let canExecTarget = 0;
  if (action === "move" && target_x !== undefined && target_y !== undefined) {
    canExecTarget = target_x * 1000 + target_y;
  } else if (target_agent !== undefined) {
    canExecTarget = target_agent;
  }

  try {
    const { ok, reason } = await canExecute(agentId, action, canExecTarget);
    if (!ok) {
      return { success: false, result: `canExecute rejected: ${reason}` };
    }
  } catch (err) {
    console.warn(`[Chain] canExecute check failed: ${err.message}`);
    // Proceed anyway
  }

  try {
    let tx;
    const opts = { gasLimit: GAS_LIMIT };

    switch (action) {
      case "gather":
        tx = await behavior.gather(agentId, opts);
        break;
      case "eat":
        tx = await behavior.eat(agentId, opts);
        break;
      case "move":
        if (target_x === undefined || target_y === undefined) {
          return { success: false, result: "move requires target_x and target_y" };
        }
        tx = await behavior.move(agentId, target_x, target_y, opts);
        break;
      case "reproduce":
        if (target_agent === undefined) {
          return { success: false, result: "reproduce requires target_agent (partner)" };
        }
        tx = await behavior.reproduce(agentId, target_agent, opts);
        break;
      case "raid":
        if (target_agent === undefined) {
          return { success: false, result: "raid requires target_agent" };
        }
        tx = await behavior.raid(agentId, target_agent, opts);
        break;
      case "share":
        if (target_agent === undefined) {
          return { success: false, result: "share requires target_agent" };
        }
        const amount = share_amount || ethers.parseEther("10").toString();
        tx = await behavior.share(agentId, target_agent, amount, opts);
        break;
      case "teach":
        if (target_agent === undefined) {
          return { success: false, result: "teach requires target_agent (child)" };
        }
        const attrIdx = teach_attr ?? 0;
        tx = await behavior.teach(agentId, target_agent, attrIdx, opts);
        break;
      case "rescue":
        if (target_agent === undefined) {
          return { success: false, result: "rescue requires target_agent" };
        }
        tx = await behavior.rescue(agentId, target_agent, opts);
        break;
      default:
        return { success: false, result: `unknown action: ${action}` };
    }

    const receipt = await tx.wait();
    const gasUsed = receipt?.gasUsed?.toString() || "?";
    return { success: true, result: `${action} succeeded | gas: ${gasUsed}`, txHash: tx.hash };
  } catch (err) {
    const reason = err.reason || err.shortMessage || err.message || "unknown error";
    return { success: false, result: `tx failed: ${reason}` };
  }
}

export function getWalletAddress() {
  return wallet ? wallet.address : null;
}

export { provider, wallet, bridge, behavior, core, sale, gold, CONTRACTS, fmt };

// ========== CLI Commands ==========
async function cliGetState(agentId) {
  const s = await getAgentFullState(agentId);
  const attrs = s.attributes.map((v, i) => `${ATTR_LABELS[i]}:${v}`).join(" | ");
  const bonus = s.attributeBonus.map((v, i) => v > 0 ? `${ATTR_LABELS[i]}+${v}` : "").filter(Boolean).join(", ");

  const out = {
    id: s.tokenId,
    owner: s.owner,
    status: s.status === 0 ? "🟢 存活" : "💀 死亡",
    gender: GENDER[s.gender] || "?",
    energy: `${s.currentEnergy}/${s.maxEnergy}`,
    location: s.onMap ? `(${s.locationX}, ${s.locationY})` : "未放置",
    plot: s.onMap ? `${PLOT_TYPES[s.plotType] || "?"} (x${s.plotMultiplier/100}) ${s.plotAgentCount}人 ${s.isPlotLeader ? "👑领主" : ""}` : "-",
    lockedGold: fmt(s.lockedBalance) + " DNAGOLD",
    gatherYield: fmt(s.estimatedGatherYield) + " DNAGOLD",
    attributes: attrs,
    bonus: bonus || "无",
    cooldowns: {
      gather: s.gatherCooldownLeft,
      eat: s.eatCooldownLeft,
      move: s.moveCooldownLeft,
      reproduce: s.reproduceCooldownLeft,
      raid: s.raidCooldownLeft,
      share: s.shareCooldownLeft,
      teach: s.teachCooldownLeft,
    },
    reproduce: `${s.reproduceCount}/${s.reproduceLimit}`,
    family: { root: s.familyRoot, headcount: s.familyHeadcount, father: s.fatherId > 1e30 ? "无" : s.fatherId, mother: s.motherId > 1e30 ? "无" : s.motherId },
    world: { living: s.totalLiving, halvings: s.halvingCount, dilution: s.dilutionFactor, baseYield: fmt(s.baseYield) },
  };
  console.log(JSON.stringify(out, null, 2));
}

async function cliMint() {
  needWallet();
  const price = await sale.getGenesisPrice();
  console.log(`铸造价格: ${fmt(price)} BNB`);
  const tx = await sale.mintGenesis({ value: price, gasLimit: GAS_LIMIT });
  console.log(`TX: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`✅ 铸造成功! Gas: ${fmt(receipt.gasUsed * receipt.gasPrice)} BNB`);
  for (const log of receipt.logs) {
    try {
      const parsed = core.interface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed && parsed.name === "Transfer") {
        console.log(`Agent ID: ${parsed.args[2]}`);
      }
    } catch {}
  }
}

async function cliPlace(agentId, x, y) {
  needWallet();
  if (x === undefined) x = 50 + Math.floor(Math.random() * 900);
  if (y === undefined) y = 50 + Math.floor(Math.random() * 900);
  console.log(`放置 Agent #${agentId} 到 (${x}, ${y})...`);
  const tx = await behavior.placeOnMap(agentId, x, y, { gasLimit: GAS_LIMIT });
  console.log(`TX: ${tx.hash}`);
  await tx.wait();
  console.log(`✅ 放置成功! 位置: (${x}, ${y})`);
}

async function cliAction(name, fn) {
  needWallet();
  console.log(`执行 ${name}...`);
  const tx = await fn();
  console.log(`TX: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`✅ ${name} 成功! Gas: ${fmt(receipt.gasUsed * receipt.gasPrice)} BNB`);
}

async function cliNearby(agentId, radius = 50) {
  // getNearbyAgents takes a plotId, but for CLI convenience we first get state to derive plotId
  const state = await getAgentFullState(agentId);
  const plotId = state.locationX * 1000 + state.locationY;
  const agents = await getNearbyAgents(plotId, radius);
  const out = agents.map(a => ({
    id: a.tokenId,
    pos: `(${a.locationX},${a.locationY})`,
    dist: a.distance,
    energy: a.currentEnergy,
    gender: GENDER[a.gender],
    status: a.status === 0 ? "存活" : "死亡",
    gold: fmt(a.lockedBalance),
  }));
  console.log(JSON.stringify(out, null, 2));
}

async function cliList(address) {
  const ids = await listOwnedAgents(address);
  console.log(JSON.stringify(ids));
}

async function cliSupply() {
  const total = await gold.totalSupply();
  const genesis = await core.totalGenesisCount();
  const tokens = await core.totalTokenCount();
  console.log(JSON.stringify({
    dnagoldSupply: fmt(total) + " DNAGOLD",
    genesisAgents: Number(genesis),
    totalAgents: Number(tokens),
  }));
}

async function cliPrice() {
  const price = await sale.getGenesisPrice();
  const count = await core.totalGenesisCount();
  const max = await core.MAX_GENESIS();
  console.log(JSON.stringify({
    currentPrice: fmt(price) + " BNB",
    minted: `${count}/${max}`,
  }));
}

async function cliWorld() {
  const stats = await bridge.getWorldStats();
  console.log(JSON.stringify({
    totalLiving: Number(stats[2]),
    halvings: Number(stats[4]),
    dilution: Number(stats[6]),
    baseYield: fmt(stats[5]) + " DNAGOLD",
  }));
}

async function cliBalance(address) {
  const bal = await getBnbBalance(address);
  console.log(`${bal} BNB`);
}

async function cliCanExecute(agentId, action, targetId) {
  const result = await canExecute(agentId, action, targetId || 0);
  console.log(JSON.stringify(result));
}

// ========== CLI Entry ==========
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith("chain.mjs") || process.argv[1].endsWith("chain.js")
);

if (isDirectRun) {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    switch (cmd) {
      case "state":      await cliGetState(args[0]); break;
      case "mint":       await cliMint(); break;
      case "place":      await cliPlace(args[0], args[1] ? Number(args[1]) : undefined, args[2] ? Number(args[2]) : undefined); break;
      case "gather":     await cliAction("采集", () => behavior.gather(args[0], { gasLimit: GAS_LIMIT })); break;
      case "eat":        await cliAction("觅食", () => behavior.eat(args[0], { gasLimit: GAS_LIMIT })); break;
      case "move":       await cliAction(`移动到(${args[1]},${args[2]})`, () => behavior.move(args[0], args[1], args[2], { gasLimit: GAS_LIMIT })); break;
      case "raid":       await cliAction(`突袭#${args[1]}`, () => behavior.raid(args[0], args[1], { gasLimit: GAS_LIMIT })); break;
      case "share":      await cliAction(`分享给#${args[1]}`, () => behavior.share(args[0], args[1], ethers.parseEther(args[2]), { gasLimit: GAS_LIMIT })); break;
      case "teach":      await cliAction(`教导#${args[1]}属性${args[2]}`, () => behavior.teach(args[0], args[1], args[2], { gasLimit: GAS_LIMIT })); break;
      case "reproduce":  await cliAction(`繁殖(伴侣#${args[1]})`, () => behavior.reproduce(args[0], args[1], { gasLimit: GAS_LIMIT })); break;
      case "rescue":     await cliAction(`营救#${args[1]}`, () => behavior.rescue(args[0], args[1], { gasLimit: GAS_LIMIT })); break;
      case "nearby":     await cliNearby(args[0], args[1] || 50); break;
      case "list":       await cliList(args[0]); break;
      case "supply":     await cliSupply(); break;
      case "price":      await cliPrice(); break;
      case "world":      await cliWorld(); break;
      case "balance":    await cliBalance(args[0]); break;
      case "can-execute": await cliCanExecute(args[0], args[1], args[2]); break;
      default:
        console.error("Usage: node chain.mjs <command> [args...]");
        console.error("Commands: state mint place gather eat move raid share teach reproduce rescue nearby list supply price world balance can-execute");
        process.exit(1);
    }
  } catch (e) {
    console.error("ERROR:", e.reason || e.message || e);
    process.exit(1);
  }
}
