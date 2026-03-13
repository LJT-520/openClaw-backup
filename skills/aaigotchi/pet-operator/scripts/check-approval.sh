#!/bin/bash
# Check if a wallet has approved AAI as pet operator

set -e

WALLET="${1:?Error: Missing wallet address}"
CONTRACT="0xA99c4B08201F2913Db8D28e71d020c4298F29dBF"
AAI_OPERATOR="0xb96B48a6B190A9d509cE9312654F34E9770F2110"
RPC_URL="https://mainnet.base.org"

# Call isPetOperatorForAll(address owner, address operator)
RESULT=$(cast call "$CONTRACT" "isPetOperatorForAll(address,address)" "$WALLET" "$AAI_OPERATOR" --rpc-url "$RPC_URL" 2>/dev/null)

if [ "$RESULT" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
  echo "approved"
  exit 0
else
  echo "not_approved"
  exit 1
fi
