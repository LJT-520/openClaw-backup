#!/bin/bash
# Generate pet operator delegation transaction details

WALLET="${1:?Error: Missing wallet address}"

echo "🔑 Pet Operator Delegation"
echo "=========================="
echo ""
echo "Wallet: $WALLET"
echo "Operator: 0xb96B48a6B190A9d509cE9312654F34E9770F2110 (AAI)"
echo ""
echo "Transaction Details:"
echo "===================="
echo "To: 0xA99c4B08201F2913Db8D28e71d020c4298F29dBF"
echo "Amount: 0 ETH"
echo "Network: Base (8453)"
echo ""
echo "Hex Data:"
echo "0xcd675d57000000000000000000000000b96b48a6b190a9d509ce9312654f34e9770f21100000000000000000000000000000000000000000000000000000000000000001"
echo ""
echo "What this does: Approves AAI to pet your gotchis (you keep ownership!)"
