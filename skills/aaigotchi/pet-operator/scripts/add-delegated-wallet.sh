#!/bin/bash
# Add a delegated wallet to pet-me-master config

set -e

WALLET="${1:?Error: Missing wallet address}"
NAME="${2:-Delegated Wallet}"

echo "📋 Adding Delegated Wallet to Pet-Me-Master"
echo "============================================"
echo ""

# Check if approved first
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! bash "$SCRIPT_DIR/check-approval.sh" "$WALLET" > /dev/null 2>&1; then
  echo "❌ Error: Wallet $WALLET has not approved AAI as pet operator!"
  echo "Run generate-delegation-tx.sh first"
  exit 1
fi

echo "✅ Wallet approved as pet operator"
echo ""

# Fetch gotchi IDs
CONTRACT="0xA99c4B08201F2913Db8D28e71d020c4298F29dBF"
RPC_URL="https://mainnet.base.org"

BALANCE=$(cast call "$CONTRACT" "balanceOf(address)" "$WALLET" --rpc-url "$RPC_URL" 2>/dev/null)
COUNT=$((16#${BALANCE:2}))

echo "Gotchis owned: $COUNT"
echo "Fetching gotchi IDs..."
echo ""

GOTCHI_IDS=()
for ((i=0; i<$COUNT; i++)); do
  TOKEN_ID=$(cast call "$CONTRACT" "tokenOfOwnerByIndex(address,uint256)" "$WALLET" "$i" --rpc-url "$RPC_URL" 2>/dev/null)
  ID=$((16#${TOKEN_ID:2}))
  GOTCHI_IDS+=("\"$ID\"")
  echo "  [$((i+1))/$COUNT] Gotchi #$ID"
  sleep 0.1
done

# Update pet-me-master config
CONFIG_FILE="$HOME/.openclaw/workspace/skills/pet-me-master/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Error: Pet-me-master config not found"
  exit 1
fi

# Add wallet to config
IDS_JSON="[$(IFS=,; echo "${GOTCHI_IDS[*]}")]"

jq --arg name "$NAME" \
   --arg addr "$WALLET" \
   --argjson ids "$IDS_JSON" \
   '.wallets += [{name: $name, address: $addr, gotchiIds: $ids}]' \
   "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && \
   mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo ""
echo "✅ Added to pet-me-master!"
echo "Wallet: $WALLET"
echo "Name: $NAME"
echo "Gotchis: $COUNT"
