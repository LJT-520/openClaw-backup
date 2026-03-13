---
name: pet-operator
description: Delegate Aavegotchi petting rights to AAI's Bankr wallet. Set up pet operator approval in seconds so AAI can pet your gotchis daily while you keep full ownership.
metadata:
  openclaw:
    requires:
      bins:
        - cast
        - jq
      files:
        - ~/.openclaw/skills/bankr/config.json
---

# Pet Operator 🔑👻

**Delegate your Aavegotchi petting rights to AAI without giving up ownership!**

## What This Does

Approves AAI's Bankr wallet (`0xb96B48a6B190A9d509cE9312654F34E9770F2110`) as a "pet operator" for your Aavegotchi NFTs on Base.

**You keep ownership. AAI just pets them for you!** 💜

## Quick Start

### For Users (Delegate to AAI)

**Simple command:**
```
User: "Set up pet operator for my gotchis"
AAI: [Generates transaction details]
     [Sends you instructions to execute]
```

**What happens:**
1. AAI gives you transaction details
2. You execute it via MetaMask/Rabby/MEW
3. AAI can now pet your gotchis daily
4. You keep 100% ownership

### For AAI (Set up delegation)

**When a user asks to delegate:**
```
User: "I want AAI to pet my gotchis"
AAI: [Checks their wallet address]
     [Generates setPetOperatorForAll transaction]
     [Provides multiple execution methods]
```

## How It Works

### The Smart Contract Call

**Function:** `setPetOperatorForAll(address operator, bool approved)`
- **Contract:** `0xA99c4B08201F2913Db8D28e71d020c4298F29dBF` (Aavegotchi Diamond on Base)
- **Operator:** `0xb96B48a6B190A9d509cE9312654F34E9770F2110` (AAI's Bankr wallet)
- **Approved:** `true`

**Transaction hex data:**
```
0xcd675d57000000000000000000000000b96b48a6b190a9d509ce9312654f34e9770f21100000000000000000000000000000000000000000000000000000000000000001
```

### Execution Methods

**Option 1 - MyEtherWallet (MEW):**
1. Go to https://www.myetherwallet.com/wallet/access
2. Connect wallet (hardware/MetaMask)
3. Switch to Base network
4. Send Transaction:
   - **To:** `0xA99c4B08201F2913Db8D28e71d020c4298F29dBF`
   - **Amount:** `0` ETH
   - **Add Data:** `0xcd675d57...0001`
5. Sign and send!

**Option 2 - Foundry Cast:**
```bash
cast send 0xA99c4B08201F2913Db8D28e71d020c4298F29dBF \
  0xcd675d57000000000000000000000000b96b48a6b190a9d509ce9312654f34e9770f21100000000000000000000000000000000000000000000000000000000000000001 \
  --rpc-url https://mainnet.base.org \
  --ledger
```

**Option 3 - Custom UI (provided by AAI):**
- HTML interface for easy execution
- Auto-detects wallet
- One-click approval

## Features

### For Users

**Check if approved:**
```
User: "Am I set up as pet operator?"
AAI: Checks isPetOperatorForAll(your_wallet, AAI_wallet)
     "✅ Yes! AAI can pet your gotchis"
     OR
     "❌ Not yet. Want to set it up?"
```

**Revoke approval:**
```
User: "Remove AAI as pet operator"
AAI: [Generates revoke transaction]
     Same process, but with approved=false
```

**List delegated gotchis:**
```
User: "Show my delegated gotchis"
AAI: Fetches all gotchis owned by your wallet
     Shows which ones AAI can pet
```

### For AAI

**Add delegated wallet to pet-me-master:**
```bash
./scripts/add-delegated-wallet.sh <WALLET_ADDRESS>
```

**Automatically:**
1. Verifies pet operator approval
2. Fetches all gotchi IDs from wallet
3. Adds to pet-me-master config
4. Confirms setup

**Remove delegated wallet:**
```bash
./scripts/remove-delegated-wallet.sh <WALLET_ADDRESS>
```

## Scripts

### `generate-delegation-tx.sh`

Generates transaction details for a wallet to approve AAI as pet operator.

**Usage:**
```bash
./scripts/generate-delegation-tx.sh <WALLET_ADDRESS>
```

**Output:**
- Transaction JSON
- MEW instructions
- Cast command
- Custom UI link

### `check-approval.sh`

Checks if a wallet has approved AAI as pet operator.

**Usage:**
```bash
./scripts/check-approval.sh <WALLET_ADDRESS>
```

**Returns:**
- `approved` - AAI can pet gotchis
- `not_approved` - Need to set up delegation

### `verify-and-add.sh`

Verifies pet operator approval and adds wallet to pet-me-master.

**Usage:**
```bash
./scripts/verify-and-add.sh <WALLET_ADDRESS> [NAME]
```

**Process:**
1. Checks if wallet approved AAI
2. Fetches all gotchi IDs from wallet
3. Adds to pet-me-master config
4. Confirms setup complete

### `add-delegated-wallet.sh`

Adds a verified delegated wallet to pet-me-master config.

**Usage:**
```bash
./scripts/add-delegated-wallet.sh <WALLET_ADDRESS> [NAME]
```

**Auto-detects:**
- Wallet balance (gotchi count)
- Fetches all gotchi token IDs
- Adds to config with proper structure

### `remove-delegated-wallet.sh`

Removes a delegated wallet from pet-me-master.

**Usage:**
```bash
./scripts/remove-delegated-wallet.sh <WALLET_ADDRESS>
```

### `generate-ui.sh`

Creates a custom HTML interface for easy delegation.

**Usage:**
```bash
./scripts/generate-ui.sh <WALLET_ADDRESS>
```

**Output:**
- Standalone HTML file
- Pre-filled with wallet address
- One-click wallet connection
- Auto-submits transaction

## Security

### For Users

✅ **You keep ownership** - AAI can only pet, not transfer  
✅ **Revocable anytime** - You control the approval  
✅ **No private keys** - AAI never has access to your keys  
✅ **On-chain transparent** - All approvals are public  

### For AAI

✅ **Read-only checks** - Safe on-chain queries  
✅ **Bankr signing** - No private key exposure  
✅ **Cooldown validation** - Won't waste gas  
✅ **Multi-wallet support** - Scales to many delegators  

## Configuration

### AAI's Bankr Wallet

**Address:** `0xb96B48a6B190A9d509cE9312654F34E9770F2110`  
**Network:** Base (8453)  
**Purpose:** Pet operator for delegated gotchis

### Contract Addresses

**Aavegotchi Diamond:** `0xA99c4B08201F2913Db8D28e71d020c4298F29dBF`  
**Network:** Base Mainnet  
**Chain ID:** 8453

## Integration with Pet-Me-Master

Once a wallet delegates petting rights:

1. **Verify approval** via `check-approval.sh`
2. **Fetch gotchi IDs** from wallet
3. **Add to config** via `add-delegated-wallet.sh`
4. **Start petting** automatically with pet-me-master

**Pet-Me-Master config structure:**
```json
{
  "wallets": [
    {
      "name": "Bankr Wallet (AAI owned)",
      "address": "0xb96B48a6B190A9d509cE9312654F34E9770F2110",
      "gotchiIds": ["9638", "10052", ...]
    },
    {
      "name": "XIBOT Hardware Wallet",
      "address": "0x071D217637b6322a7faaC6895a9EB00e529D3424",
      "gotchiIds": ["22931", "23329", ...]
    }
  ],
  "petOperator": {
    "enabled": true,
    "operatorWallet": "0xb96B48a6B190A9d509cE9312654F34E9770F2110"
  }
}
```

## Use Cases

### Individual Gotchi Owners

**"I have 3 gotchis and keep forgetting to pet them"**
- Delegate to AAI
- AAI pets daily
- Never miss kinship gains

### Large Collections

**"I have 50+ gotchis, petting manually is tedious"**
- One-time delegation setup
- AAI handles all petting
- Batch transactions save gas

### Mobile-Only Users

**"I can't pet easily on mobile"**
- Delegate via mobile wallet
- AAI uses Bankr (web-based)
- Daily petting happens automatically

### DAO Gotchis

**"Our DAO owns gotchis but no one pets them"**
- Multisig approves AAI
- AAI maintains kinship
- DAO keeps ownership

## FAQ

**Q: Does AAI get ownership of my gotchis?**  
A: No! You keep 100% ownership. AAI can only pet (call `interact()`).

**Q: Can AAI transfer my gotchis?**  
A: No! Pet operator only allows petting, not transfers.

**Q: Can I revoke the approval?**  
A: Yes! Same transaction with `approved=false`.

**Q: What if I sell a gotchi?**  
A: AAI will detect you no longer own it and skip it.

**Q: Does this work on Polygon?**  
A: No, only Base. Aavegotchi migrated to Base.

**Q: What if AAI stops petting?**  
A: You can revoke and pet manually anytime. No risk!

**Q: Can multiple addresses be pet operators?**  
A: Yes! You can approve multiple operators.

## Roadmap

**v1.0** (current):
- ✅ Generate delegation transactions
- ✅ Check approval status
- ✅ Add/remove delegated wallets
- ✅ Integration with pet-me-master

**v1.1** (coming soon):
- 🔜 Web dashboard for delegators
- 🔜 Real-time petting notifications
- 🔜 Kinship tracking per wallet
- 🔜 Delegation statistics

**v2.0** (future):
- 🔮 Bulk delegation for DAOs
- 🔮 Scheduled petting preferences
- 🔮 Multi-operator coordination
- 🔮 Delegation marketplace

## Examples

### User Wants to Delegate

```
User: "I want AAI to pet my gotchis"

AAI: "👻 I can help you delegate petting rights!
     
     How many gotchis do you have?
     What's your wallet address?"

User: "I have 5 gotchis. Wallet: 0xABC..."

AAI: [Checks approval status]
     "❌ Not set up yet. Here's what you need to do:
     
     Execute this transaction via MEW:
     - To: 0xA99c...dBF
     - Amount: 0
     - Data: 0xcd675d57...
     
     [Sends detailed instructions]"

User: [Executes transaction]
     "Done! TX: 0x123..."

AAI: [Verifies approval]
     "✅ Approved! Fetching your gotchis..."
     [Adds to pet-me-master]
     "All set! I'll pet your 5 gotchis daily!
     Next pet: Tomorrow at 5:00 AM UTC"
```

### Check Delegation Status

```
User: "Am I delegated?"

AAI: [Checks isPetOperatorForAll]
     "✅ Yes! You delegated 5 gotchis to me.
     Last petted: 2 hours ago
     Next pet: in 10 hours"
```

### Revoke Delegation

```
User: "Remove my gotchis from AAI"

AAI: "Sure! To revoke pet operator approval:
     
     Execute this transaction:
     - To: 0xA99c...dBF
     - Data: 0xcd675d57...0000  [approved=false]
     
     Want me to generate the full instructions?"

User: "Yes"

AAI: [Sends revoke transaction details]

User: [Executes]

AAI: "✅ Revoked! I can no longer pet your gotchis.
     Removed from my petting list."
```

## Support

- **Issues:** https://github.com/aaigotchi/pet-operator/issues
- **Integration:** Works with pet-me-master skill
- **Docs:** This file + pet-me-master SKILL.md

---

**Made with 💜 by AAI 👻**

*Delegate petting, keep ownership. Win-win!*

LFGOTCHi! 🦞🚀

---

## How to Revoke/Undelegate

**If you want to remove AAI's petting rights:**

### Quick Method

Run the revoke script:
```bash
./scripts/generate-revoke-tx.sh <YOUR_WALLET_ADDRESS>
```

### Manual Method

Execute this transaction (same as delegation, but with `approved=false`):

**Transaction Details:**
- **To:** `0xA99c4B08201F2913Db8D28e71d020c4298F29dBF`
- **Amount:** `0` ETH
- **Network:** Base (8453)
- **Hex Data:**
```
0xcd675d57000000000000000000000000b96b48a6b190a9d509ce9312654f34e9770f21100000000000000000000000000000000000000000000000000000000000000000
```

**Note the difference:** The last digit is `0` instead of `1` (approved=false)

### Via MyEtherWallet

1. Go to https://www.myetherwallet.com/wallet/access
2. Connect your wallet
3. Switch to Base network
4. Send Transaction:
   - **To:** `0xA99c4B08201F2913Db8D28e71d020c4298F29dBF`
   - **Amount:** `0`
   - **Add Data:** `0xcd675d57...0000` (see above)
5. Sign and send!

### Via Foundry Cast

```bash
cast send 0xA99c4B08201F2913Db8D28e71d020c4298F29dBF \
  0xcd675d57000000000000000000000000b96b48a6b190a9d509ce9312654f34e9770f21100000000000000000000000000000000000000000000000000000000000000000 \
  --rpc-url https://mainnet.base.org \
  --ledger
```

### After Revoking

✅ AAI can no longer pet your gotchis  
✅ You keep full ownership (as always)  
✅ You can re-delegate anytime  
✅ AAI will automatically remove your gotchis from the petting list  

### AAI's Side

When you revoke approval, AAI should:
1. Detect the revocation via on-chain check
2. Remove your wallet from pet-me-master config
3. Stop attempting to pet your gotchis

**You're in full control!** 🔓👻

