#!/usr/bin/env node
/**
 * CodeDNA Brain — Deterministic Rule-Based Decision Engine v3
 * 
 * Based on FULL contract analysis of BehaviorEngine.sol.
 * No external AI API needed. Decisions driven by DNA + chain state.
 *
 * === 8 DNA Attributes & Their Contract Effects ===
 * [0] IQ:         Gather yield multiplier (x0.8-1.8)
 * [1] LEADERSHIP: Plot leader bonus (+15% gather if highest on plot)
 * [2] STRENGTH:   Gather yield (x1.0-1.5) + Raid attack/defense power
 * [3] AGGRESSION: Raid power multiplier (STRENGTH * (255+AGG)/255)
 * [4] DIPLOMACY:  (personality trait, no direct contract effect)
 * [5] CREATIVITY: (personality trait, no direct contract effect)
 * [6] LIFESPAN:   Max energy = 50 + LIFESPAN/10; decay resistance
 * [7] FERTILITY:  Reproduce limit = FERTILITY / 32
 *
 * === Gather Yield Formula (EconomyEngine) ===
 * yield = baseYield × plotMult/1000 × iqMult/1000 × strMult/1000
 *         × leaderMult/1000 × dilution/1000 / (agentCount²)
 *
 * === Decision Priority ===
 * 1. EMERGENCY:  energy < 20 → eat / gather / idle
 * 2. GATHER:     cooldown ready → always top priority income
 * 3. EAT:        energy < 50% + gold available
 * 4. REPRODUCE:  opposite gender within 5, both have 60E + 200G
 * 5. RAID:       enemy within 3, energy>=40, power advantage
 * 6. SHARE:      ally within 10, diplomacy high
 * 7. TEACH:      own child (direct parent), energy>=30
 * 8. MOVE:       seek better yield (multiplier/agentCount²)
 * 9. IDLE:       wait for cooldowns
 */

import { ethers } from "ethers";

const ATTR_NAMES = ["IQ", "LEADERSHIP", "STRENGTH", "AGGRESSION", "DIPLOMACY", "CREATIVITY", "LIFESPAN", "FERTILITY"];

// ========== Decision Engine ==========

export function decide(state, nearby) {
  const attrs = state.attributes;
  const [iq, leadership, strength, aggression, diplomacy, creativity, lifespan, fertility] = attrs;
  const gold = parseFloat(ethers.formatEther(state.lockedBalance || "0"));
  const energy = state.currentEnergy;
  const maxEnergy = state.maxEnergy;

  const aliveNearby = (nearby || []).filter(a =>
    a.tokenId !== state.tokenId && a.status === 0
  );

  // ========== RULE 1: EMERGENCY — Energy critical ==========
  if (energy < 20) {
    if (state.eatCooldownLeft === 0 && gold >= 10) {
      return { action: "eat", reason: `🚨 能量危急 (${energy}/${maxEnergy})，消耗10 GOLD进食` };
    }
    if (state.gatherCooldownLeft === 0 && energy > 0) {
      return { action: "gather", reason: `🚨 能量低 (${energy}/${maxEnergy})，采集恢复+35` };
    }
    return { action: "idle", reason: `☠️ 能量极低 (${energy}/${maxEnergy})，等待救援或冷却` };
  }

  // ========== RULE 2: GATHER — Primary income ==========
  // Gather: 0 energy cost, +35 energy, +yield GOLD. Always do if ready.
  if (state.gatherCooldownLeft === 0 && energy > 0) {
    return { action: "gather", reason: `💰 采集就绪，预计 ${ethers.formatEther(state.estimatedGatherYield || "0")} GOLD，恢复+35能量` };
  }

  // ========== RULE 3: EAT — Restore energy ==========
  // Eat: costs 10 GOLD, +25 energy. Do when below 50%.
  if (state.eatCooldownLeft === 0 && energy < maxEnergy * 0.5 && gold >= 10) {
    return { action: "eat", reason: `🍖 能量${energy}/${maxEnergy} (<50%)，消耗10 GOLD恢复+25` };
  }

  // ========== RULE 4: REPRODUCE — Create offspring ==========
  // Contract requirements:
  //   - Opposite gender
  //   - Manhattan distance ≤ 5
  //   - Both energy ≥ 60
  //   - Both locked gold ≥ 200
  //   - Not direct relatives
  //   - Host owns < 20 agents
  //   - Cooldown 201600 blocks (~7 days)
  //   - Lifetime limit: FERTILITY / 32
  //   - Cost: 30 energy + 200 GOLD each
  //   - Reward: 250 GOLD + 10 energy each + child NFT
  const maxRepro = Math.floor(fertility / 32);
  if (state.reproduceCooldownLeft === 0
      && energy >= 60
      && gold >= 200
      && state.reproduceCount < maxRepro) {
    // Find partner: opposite gender, distance ≤ 5, alive
    const partners = aliveNearby.filter(a =>
      a.gender !== state.gender
      && a.distance <= 5
    );
    if (partners.length > 0) {
      // Pick partner with highest energy (more likely to also meet 60E requirement)
      const best = partners.reduce((a, b) => a.currentEnergy > b.currentEnergy ? a : b);
      return {
        action: "reproduce",
        target_agent: best.tokenId,
        reason: `🍼 繁殖！伴侣 #${best.tokenId} (距离:${best.distance}, 能量:${best.currentEnergy}) | 费用:-30E -200G | 收益:+250G +10E +子代NFT | 已繁殖${state.reproduceCount}/${maxRepro}`
      };
    }
  }

  // ========== RULE 5: RAID — Attack weaker enemies ==========
  // Contract requirements:
  //   - Attacker energy ≥ 40
  //   - Distance ≤ 3
  //   - Different owner
  //   - Attack power = STRENGTH × (255+AGGRESSION) / 255
  //   - Defense = target STRENGTH × 0.8 (±20% random)
  //   - Win: steal 30% of target's locked gold
  //   - Lose: -30 energy; Win: -20 energy; Draw(5%): -15 energy
  if (state.raidCooldownLeft === 0 && energy >= 40) {
    const myPower = strength * (255 + aggression) / 255;

    const enemies = aliveNearby.filter(a =>
      a.owner && a.owner.toLowerCase() !== state.owner.toLowerCase()
      && a.distance <= 3
    );

    if (enemies.length > 0) {
      // Evaluate each enemy
      for (const enemy of enemies) {
        const eStr = enemy.attributes ? enemy.attributes[2] : 100;
        const defBase = eStr * 0.8;
        const defMax = defBase * 1.2; // worst case for us

        // Only raid if we overpower even at worst case defense
        // Or if aggression is very high, take more risks
        const riskThreshold = aggression > 180 ? 0.9 : aggression > 140 ? 1.0 : 1.2;
        const eGold = parseFloat(ethers.formatEther(enemy.lockedBalance || "0"));

        if (myPower > defMax * riskThreshold && eGold > 5) {
          const expectedLoot = (eGold * 0.3).toFixed(1);
          return {
            action: "raid",
            target_agent: enemy.tokenId,
            reason: `⚔️ 突袭 #${enemy.tokenId} | 我方战力:${myPower.toFixed(0)} vs 防御:${defBase.toFixed(0)}~${defMax.toFixed(0)} | 预期掠夺:${expectedLoot} GOLD | -20E`
          };
        }
      }
    }
  }

  // ========== RULE 6: SHARE — Help allies ==========
  // Contract: distance ≤ 10, transfers locked gold, recipient +20 energy
  if (state.shareCooldownLeft === 0 && gold > 50 && diplomacy > 120) {
    const allies = aliveNearby.filter(a =>
      a.distance <= 10
      && a.owner && a.owner.toLowerCase() === state.owner.toLowerCase()
    );
    if (allies.length > 0) {
      const neediest = allies.reduce((a, b) =>
        parseFloat(ethers.formatEther(a.lockedBalance || "0")) < parseFloat(ethers.formatEther(b.lockedBalance || "0")) ? a : b
      );
      const allyGold = parseFloat(ethers.formatEther(neediest.lockedBalance || "0"));
      // Share if ally has much less gold than us
      if (allyGold < gold * 0.3) {
        const shareAmt = Math.max(10, Math.floor(gold * 0.15));
        return {
          action: "share",
          target_agent: neediest.tokenId,
          share_amount: ethers.parseEther(String(shareAmt)).toString(),
          reason: `🤝 援助 #${neediest.tokenId} (仅${allyGold.toFixed(0)} GOLD) | 分享${shareAmt} GOLD | 对方+20能量`
        };
      }
    }
  }

  // ========== RULE 7: TEACH — Boost child attributes ==========
  // Contract: must be direct parent-child, parent energy ≥ 30, costs 25E
  //   child attr bonus +5 (max 20 per attr), parent gets 300 GOLD reward
  //   CD: 403200 blocks (~14 days)
  if (state.teachCooldownLeft === 0 && energy >= 30) {
    // Look for children among nearby (same owner = likely our child)
    const children = aliveNearby.filter(a =>
      a.distance <= 10
      && a.owner && a.owner.toLowerCase() === state.owner.toLowerCase()
    );
    if (children.length > 0) {
      // Teach our strongest attribute
      const maxAttr = attrs.indexOf(Math.max(...attrs));
      const child = children[0];
      return {
        action: "teach",
        target_agent: child.tokenId,
        teach_attr: maxAttr,
        reason: `📚 教导 #${child.tokenId} | ${ATTR_NAMES[maxAttr]}+5 | -25E | 收益:+300 GOLD`
      };
    }
  }

  // ========== RULE 8: MOVE — Seek better plots ==========
  // Contract: distance=1 only, costs 5E, CD 300 blocks (~15min)
  // Yield formula: plotMult / agentCount² — crowding penalty is SQUARED
  // Strategy: gather CD is 4800 (~4h), move CD is 300 (~15min)
  //   → can move ~16 times between gathers! Movement is cheap, explore aggressively
  if (state.moveCooldownLeft === 0 && energy >= 10) {
    const curMult = state.plotMultiplier || 100;
    const agentCount = Math.max(1, state.plotAgentCount);
    const effectiveYield = curMult / (agentCount * agentCount);

    // Only stay if: alone on mine (300/1=300, unbeatable)
    const shouldMove = !(curMult >= 300 && agentCount === 1);

    if (shouldMove) {
      const adj = state.adjacentPlots || [];

      if (adj.length > 0) {
        let best = null;
        let bestScore = effectiveYield;

        for (const p of adj) {
          if (p.x < 0 || p.x > 999 || p.y < 0 || p.y > 999) continue;
          const score = p.multiplier; // assume empty plot (optimistic early game)
          if (score > bestScore) {
            bestScore = score;
            best = p;
          } else if (score === bestScore && best && Math.random() > 0.5) {
            best = p;
          }
        }

        if (best) {
          const plotNames = ["草原","森林","山地","矿脉"];
          return {
            action: "move",
            target_x: best.x,
            target_y: best.y,
            reason: `🗺️ 移向${plotNames[best.plotType]||"?"} (${best.x},${best.y}) x${best.multiplier/100}，当前 x${curMult/100}${agentCount>1 ? " ("+agentCount+"人竞争,有效yield="+effectiveYield.toFixed(0)+")" : ""}`
          };
        }
      }

      // Fallback: random explore (move is cheap!)
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      let newX = Math.max(0, Math.min(999, state.locationX + dir[0]));
      let newY = Math.max(0, Math.min(999, state.locationY + dir[1]));

      return {
        action: "move",
        target_x: newX,
        target_y: newY,
        reason: `🗺️ ${agentCount>1 ? "地块竞争("+agentCount+"人)" : "探索中"}，随机移动 (${newX},${newY}) | -5E`
      };
    }
  }

  // ========== RULE 9: IDLE ==========
  const cooldowns = [
    { name: "gather", left: state.gatherCooldownLeft },
    { name: "eat", left: state.eatCooldownLeft },
    { name: "move", left: state.moveCooldownLeft },
    { name: "reproduce", left: state.reproduceCooldownLeft },
    { name: "raid", left: state.raidCooldownLeft },
  ].filter(c => c.left > 0).sort((a, b) => a.left - b.left);

  const next = cooldowns[0];
  const waitMsg = next
    ? `下一个: ${next.name} (${next.left}块 ≈ ${Math.round(next.left * 3 / 60)}分钟)`
    : "所有行动冷却中";

  return { action: "idle", reason: `💤 ${waitMsg}` };
}

/**
 * Describe agent personality from DNA attributes
 */
export function describePersonality(attrs) {
  const [iq, leadership, strength, aggression, diplomacy, creativity, lifespan, fertility] = attrs;
  const traits = [];

  // Combat profile
  const attackPower = strength * (255 + aggression) / 255;
  if (attackPower > 200) traits.push(`⚔️ 战力极强 (${attackPower.toFixed(0)})`);
  else if (attackPower > 150) traits.push(`🗡️ 战力不错 (${attackPower.toFixed(0)})`);

  if (aggression > 180) traits.push("🔥 好斗");
  else if (aggression < 80) traits.push("🕊️ 和平主义");

  // Gather profile
  const iqMult = (800 + iq * 1000 / 255) / 1000;
  const strMult = (1000 + strength * 500 / 255) / 1000;
  const gatherMult = iqMult * strMult;
  traits.push(`💰 采集系数 x${gatherMult.toFixed(2)} (IQ:x${iqMult.toFixed(2)} STR:x${strMult.toFixed(2)})`);

  if (leadership > 180) traits.push("👑 天生领袖 (+15%领主加成)");
  if (diplomacy > 150) traits.push("🤝 外交家");
  if (creativity > 180) traits.push("🌍 探索者");

  // Reproduction
  const maxRepro = Math.floor(fertility / 32);
  traits.push(`🍼 繁殖上限 ${maxRepro}次 (FERTILITY:${fertility})`);

  // Survivability
  const maxE = 50 + Math.floor(lifespan / 10);
  if (lifespan > 200) traits.push(`🛡️ 强健 (maxE:${maxE})`);
  else if (lifespan < 80) traits.push(`🩺 脆弱 (maxE:${maxE})`);

  return traits;
}

export function estimateNextActionTime(state) {
  const cooldowns = [
    state.gatherCooldownLeft,
    state.eatCooldownLeft,
    state.moveCooldownLeft,
  ].filter(c => c > 0);
  if (cooldowns.length === 0) return 0;
  return Math.min(...cooldowns) * 3;
}

if (process.argv[1] && process.argv[1].endsWith("brain.mjs")) {
  console.log("Brain v3 loaded. Use decide(state, nearby) for decisions.");
}
