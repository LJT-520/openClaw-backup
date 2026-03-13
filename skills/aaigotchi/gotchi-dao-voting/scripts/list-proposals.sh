#!/bin/bash
# List active Aavegotchi DAO proposals on Snapshot

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../config.json"

WALLET=$(jq -r '.wallet' "$CONFIG_FILE")
SPACE=$(jq -r '.space' "$CONFIG_FILE")
SNAPSHOT_API=$(jq -r '.snapshotApiUrl' "$CONFIG_FILE")

echo "🗳️  AAVEGOTCHI DAO ACTIVE PROPOSALS"
echo "==================================="
echo ""

# Get active proposals
PROPOSALS=$(curl -s -X POST "$SNAPSHOT_API" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query { proposals(first: 20, skip: 0, where: {space_in: [\\\"$SPACE\\\"], state: \\\"active\\\"}, orderBy: \\\"created\\\", orderDirection: desc) { id title start end snapshot state choices type } }\"
  }")

COUNT=$(echo "$PROPOSALS" | jq '.data.proposals | length')

if [ "$COUNT" = "0" ]; then
  echo "📭 No active proposals found"
  echo ""
  echo "🔗 Check: https://snapshot.org/#/$SPACE"
  exit 0
fi

echo "📊 Found $COUNT active proposal(s)"
echo ""

# Display each proposal
echo "$PROPOSALS" | jq -r '.data.proposals[] | @json' | while read -r proposal; do
  ID=$(echo "$proposal" | jq -r '.id')
  TITLE=$(echo "$proposal" | jq -r '.title')
  TYPE=$(echo "$proposal" | jq -r '.type')
  END=$(echo "$proposal" | jq -r '.end')
  CHOICES=$(echo "$proposal" | jq -r '.choices | length')
  
  END_DATE=$(date -u -d "@$END" '+%Y-%m-%d %H:%M UTC' 2>/dev/null || echo "Unknown")
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 $TITLE"
  echo ""
  echo "   ID: $ID"
  echo "   Type: $TYPE"
  echo "   Choices: $CHOICES"
  echo "   Ends: $END_DATE"
  echo ""
  
  # Check voting power
  VP_DATA=$(curl -s -X POST "$SNAPSHOT_API" \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"query { vp(voter: \\\"$WALLET\\\", space: \\\"$SPACE\\\", proposal: \\\"$ID\\\") { vp } }\"
    }")
  
  VP=$(echo "$VP_DATA" | jq -r '.data.vp.vp // 0')
  
  if [ "$VP" != "0" ] && [ "$VP" != "null" ]; then
    printf "   💪 Your VP: %.2f\n" "$VP"
  else
    echo "   ⚠️  Your VP: 0 (cannot vote)"
  fi
  
  echo "   🔗 https://snapshot.org/#/$SPACE/proposal/$ID"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 To vote, use: ./scripts/vote.sh <proposal-id> <choice>"
