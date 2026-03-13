#!/usr/bin/env node
/**
 * CodeDNA Memory System
 * 
 * Local JSON-based memory for agent decision history.
 * Storage: ~/.codedna/memory_{tokenId}.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const DATA_DIR = join(homedir(), ".codedna");
const MAX_ENTRIES = 100;

function memoryPath(tokenId) {
  return join(DATA_DIR, `memory_${tokenId}.json`);
}

/**
 * Load all memory entries for an agent (max 100)
 */
export function loadMemory(tokenId) {
  const fp = memoryPath(tokenId);
  if (!existsSync(fp)) return [];
  try {
    const raw = readFileSync(fp, "utf-8");
    const entries = JSON.parse(raw);
    return Array.isArray(entries) ? entries.slice(-MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

/**
 * Append a memory entry, keeping max 100
 * 
 * @param {number} tokenId
 * @param {{ block: number, action: string, target?: number|string, result: string, energyAfter: number, note: string }} entry
 */
export function saveMemory(tokenId, entry) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const entries = loadMemory(tokenId);
  entries.push(entry);
  const trimmed = entries.slice(-MAX_ENTRIES);
  writeFileSync(memoryPath(tokenId), JSON.stringify(trimmed, null, 2));
}

/**
 * Get the most recent N memory entries
 */
export function getRecentMemory(tokenId, count = 20) {
  const all = loadMemory(tokenId);
  return all.slice(-count);
}

// ========== CLI ==========
if (process.argv[1] && process.argv[1].endsWith("memory.mjs")) {
  const [cmd, ...args] = process.argv.slice(2);
  switch (cmd) {
    case "show": {
      const tokenId = parseInt(args[0]);
      if (!tokenId) { console.error("Usage: node memory.mjs show <tokenId> [count]"); process.exit(1); }
      const count = parseInt(args[1]) || 20;
      const mem = getRecentMemory(tokenId, count);
      if (mem.length === 0) {
        console.log(`No memories for agent #${tokenId}`);
      } else {
        for (const e of mem) {
          console.log(`[Block ${e.block}] ${e.action}${e.target ? ` → ${e.target}` : ""} | ${e.result} | E:${e.energyAfter} | ${e.note}`);
        }
      }
      break;
    }
    case "clear": {
      const tokenId = parseInt(args[0]);
      if (!tokenId) { console.error("Usage: node memory.mjs clear <tokenId>"); process.exit(1); }
      const fp = memoryPath(tokenId);
      if (existsSync(fp)) {
        writeFileSync(fp, "[]");
        console.log(`Memory cleared for agent #${tokenId}`);
      } else {
        console.log(`No memory file for agent #${tokenId}`);
      }
      break;
    }
    default:
      console.error("Usage: node memory.mjs <show|clear> <tokenId> [count]");
      process.exit(1);
  }
}
