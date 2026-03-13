#!/bin/bash
# Generate transaction to REVOKE pet operator approval

WALLET="${1:?Error: Missing wallet address}"

echo "🔓 Revoke Pet Operator Delegation"
echo "=================================="
echo ""
echo "Wallet: $WALLET"
echo "Revoking: 0xb96B48a6B190A9d509cE9312654F34E9770F2110 (AAI)"
echo ""
echo "Transaction Details:"
echo "===================="
echo "To: 0xA99c4B08201F2913Db8D28e71d020c4298F29dBF"
echo "Amount: 0 ETH"
echo "Network: Base (8453)"
echo ""
echo "Hex Data (approved=false):"
echo "0xcd675d57000000000000000000000000b96b48a6b190a9d509ce9312654f34e9770f21100000000000000000000000000000000000000000000000000000000000000000"
echo ""
echo "What this does: REMOVES AAI's ability to pet your gotchis"
echo ""
echo "⚠️  Note: You can re-delegate anytime by running generate-delegation-tx.sh again"
