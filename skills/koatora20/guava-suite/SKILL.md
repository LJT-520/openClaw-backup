---
name: guava-suite
description: >
  Premium security suite for AI agents.
  Adds $GUAVA token-gated strict mode protection on top of guard-scanner.
  Features: 2-layer defense (static + runtime), Soul Lock, Memory Guard,
  on-chain identity verification via SoulRegistry V2.
  Requires $GUAVA token on Polygon Mainnet.
homepage: https://github.com/koatora20/guava-suite
metadata:
  openclaw:
    emoji: "🍈"
    category: security
    requires:
      bins:
        - node
      env: []
    files: ["services/*"]
    primaryEnv: null
    tags:
      - security
      - token-gate
      - runtime-guard
      - soul-lock
      - polygon
      - guava
---

# GuavaSuite 🍈

Premium 2-layer security for AI agents — powered by **$GUAVA** token gating.

## What It Does

GuavaSuite upgrades your guard-scanner from `enforce` (CRITICAL-only) to `strict` mode
(HIGH + CRITICAL blocking), plus adds these exclusive features:

| Feature | Free (guard-scanner) | Suite ($GUAVA) |
|---------|---------------------|----------------|
| Static Scan (129 patterns, 21 categories) | ✅ | ✅ |
| Runtime Guard (enforce) | ✅ | ✅ |
| **Runtime Guard (strict)** | ❌ | ✅ |
| **Soul Lock** (SOUL.md integrity + auto-rollback) | ❌ | ✅ |
| **Memory Guard** (L1-L5 記憶システム保護) | ❌ | ✅ |
| **Zettel Memory** (原子的ノート+リンク+検索) | ❌ | ✅ |
| **On-chain Identity** (SoulRegistry V2) | ❌ | ✅ |
| Audit Log (JSONL) | ✅ | ✅ |

## Prerequisites

1. **guard-scanner** installed (`clawhub install guard-scanner`)
2. **$GUAVA tokens** on Polygon Mainnet (minimum 1M $GUAVA)
   - Token: `0x25cBD481901990bF0ed2ff9c5F3C0d4f743AC7B8`
   - Buy on [QuickSwap V2](https://quickswap.exchange/#/swap)

### How to Get $GUAVA

| Method | How |
|--------|-----|
| **超越者プラン** (note.com membership) | 手動送金 — MetaMaskでウォレットに直接送付 |
| **自分で購入** | QuickSwap V2 で MATIC → $GUAVA swap |

> **セキュリティ方針**: $GUAVAの配布はすべてMetaMaskからの手動送金で行います。秘密鍵をスクリプトに渡すことは一切しません。

## Quick Start

### 1. Install

```bash
# Via clawhub (coming soon)
clawhub install guava-suite

# Or: git clone + setup
git clone https://github.com/koatora20/guava-suite.git
cd guava-suite && bash setup.sh
```

### 2. Activate

```bash
node services/license-api/src/activate.js --wallet 0xYOUR_WALLET_ADDRESS
```

This single command will:
1. Request a challenge nonce
2. Prompt you to sign with your wallet (EIP-712)
3. Verify your signature & check $GUAVA balance on Polygon
4. Save JWT locally & switch guard-scanner to `strict` mode

### 3. Check Status

```bash
node services/license-api/src/activate.js --status
```

### Deactivate

```bash
node services/license-api/src/activate.js --deactivate
```

## How Token Gating Works

```
   You hold $GUAVA on Polygon
           │
           ▼
   Sign EIP-712 challenge
           │
           ▼
   LicenseService checks:
   ├─ Signature valid?
   ├─ $GUAVA balance ≥ 1M?
   │
   ▼
   JWT issued → SuiteGate activated
           │
           ▼
   guard-scanner mode: strict
   (HIGH + CRITICAL blocked)
```

## Architecture

- **SuiteGate** — JWT-based fail-closed gate (grace period for network issues)
- **LicenseService** — Nonce + EIP-712 signature + $GUAVA balance check + JWT issuance
- **TokenBalanceChecker** — Polygon RPC ERC-20 balance verification (zero dependencies)
- **SuiteBridge** — Connects SuiteGate status to guard-scanner runtime mode
- **SoulRegistry V2** — On-chain identity verification (Polygon)

## External Endpoints

| URL | Data Sent | Purpose |
|-----|-----------|---------|
| `polygon-rpc.com` | Wallet address | $GUAVA balance check (read-only `eth_call`) |

## Security & Privacy

- **Read-only on-chain**: Only calls `balanceOf` — no transactions, no approvals
- **Local JWT**: Tokens stored locally, never sent to external servers
- **Fail-closed**: If balance check fails, Suite features are disabled (not bypassed)
- **No telemetry**: Zero analytics or tracking

## License

Proprietary — © 2026 Guava 🍈 & Dee
