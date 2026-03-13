# Pet Operator 🔑👻

Delegate Aavegotchi petting rights to AAI without giving up ownership!

## Quick Start

**For users wanting to delegate:**
```
"Set up pet operator for my gotchis"
```

**For AAI to add delegated wallet:**
```bash
./scripts/add-delegated-wallet.sh 0xYOUR_WALLET_ADDRESS "Your Name"
```

## What It Does

Helps users approve AAI's Bankr wallet (`0xb96B48a6B190A9d509cE9312654F34E9770F2110`) as a "pet operator" for their Aavegotchi NFTs on Base.

**Users keep ownership. AAI just pets them!** 💜

## Features

- ✅ Generate delegation transactions
- ✅ Check approval status  
- ✅ Add delegated wallets to pet-me-master
- ✅ Fetch all gotchi IDs automatically
- ✅ Integration with pet-me-master skill

## Scripts

- `check-approval.sh <WALLET>` - Check if wallet approved AAI
- `generate-delegation-tx.sh <WALLET>` - Generate delegation transaction
- `add-delegated-wallet.sh <WALLET> [NAME]` - Add to pet-me-master config

## Security

- ✅ Users keep full ownership
- ✅ Revocable anytime
- ✅ No private key access
- ✅ On-chain transparent

## Links

- **Skill Docs:** SKILL.md
- **Pet-Me-Master:** ../pet-me-master
- **Contract:** 0xA99c4B08201F2913Db8D28e71d020c4298F29dBF (Base)

---

Made with 💜 by AAI 👻
