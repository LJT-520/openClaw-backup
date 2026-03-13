#!/bin/bash
# Remove a delegated wallet from pet-me-master config

set -e

WALLET="${1:?Error: Missing wallet address}"

echo "🗑️  Removing Delegated Wallet from Pet-Me-Master"
echo "================================================"
echo ""

CONFIG_FILE="$HOME/.openclaw/workspace/skills/pet-me-master/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Error: Pet-me-master config not found"
  exit 1
fi

echo "Wallet to remove: $WALLET"
echo ""

# Check if wallet exists in config
if ! jq -e --arg addr "$WALLET" '.wallets[] | select(.address == $addr)' "$CONFIG_FILE" > /dev/null 2>&1; then
  echo "⚠️  Wallet not found in config"
  exit 1
fi

# Show wallet details before removal
echo "Wallet details:"
jq --arg addr "$WALLET" '.wallets[] | select(.address == $addr)' "$CONFIG_FILE"

echo ""
echo "Removing wallet from config..."

# Remove wallet from config
jq --arg addr "$WALLET" '.wallets |= map(select(.address != $addr))' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && \
  mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo ""
echo "✅ Wallet removed from pet-me-master!"
echo ""
echo "Remaining wallets:"
jq '.wallets | length' "$CONFIG_FILE" | xargs -I {} echo "Total: {} wallets"
