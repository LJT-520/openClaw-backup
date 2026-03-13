#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONTENT_SH="$BASE_DIR/scripts/content.sh"
INPUT="${*:-}"

trim() {
  echo "$1" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g'
}

extract_id() {
  echo "$1" | sed -nE 's/.*#?([0-9]+).*/\1/p'
}

msg="$(trim "$INPUT")"

if [[ -z "$msg" ]]; then
  echo "Usage: bash scripts/content-im.sh \"未读列表|更多|收藏 #3|收录 <url/text>\""
  exit 1
fi

case "$msg" in
  "未读列表"|"unread"|"unread list")
    bash "$CONTENT_SH" list --status unread
    exit 0
    ;;
  "已读列表"|"read"|"read list")
    bash "$CONTENT_SH" list --status read
    exit 0
    ;;
  "收藏列表"|"starred"|"starred list")
    bash "$CONTENT_SH" list --status starred
    exit 0
    ;;
  "内容列表"|"列表"|"all"|"all list")
    bash "$CONTENT_SH" list --status all
    exit 0
    ;;
  "更多"|"more")
    bash "$CONTENT_SH" more
    exit 0
    ;;
esac

if [[ "$msg" =~ ^(已读|read)[[:space:]]*#?[0-9]+$ ]]; then
  id=$(extract_id "$msg")
  bash "$CONTENT_SH" update --id "$id" --status read
  exit 0
fi

if [[ "$msg" =~ ^(未读|unread)[[:space:]]*#?[0-9]+$ ]]; then
  id=$(extract_id "$msg")
  bash "$CONTENT_SH" update --id "$id" --status unread
  exit 0
fi

if [[ "$msg" =~ ^(收藏|star)[[:space:]]*#?[0-9]+$ ]]; then
  id=$(extract_id "$msg")
  bash "$CONTENT_SH" update --id "$id" --status starred
  exit 0
fi

if [[ "$msg" =~ ^(取消收藏|unstar)[[:space:]]*#?[0-9]+$ ]]; then
  id=$(extract_id "$msg")
  bash "$CONTENT_SH" update --id "$id" --status unread
  exit 0
fi

if [[ "$msg" =~ ^(删除|remove)[[:space:]]*#?[0-9]+$ ]]; then
  id=$(extract_id "$msg")
  bash "$CONTENT_SH" remove --id "$id"
  exit 0
fi

if [[ "$msg" =~ ^(收录|add)[[:space:]]+(.+)$ ]]; then
  payload="${BASH_REMATCH[2]}"
  url=$(echo "$payload" | grep -oE 'https?://[^ ]+' | head -n1 || true)
  if [[ -n "$url" ]]; then
    bash "$CONTENT_SH" add --url "$url"
  else
    bash "$CONTENT_SH" add --note "$payload"
  fi
  exit 0
fi

echo "UNSUPPORTED_COMMAND: $msg"
echo "Try: 未读列表 | 已读列表 | 收藏列表 | 内容列表 | 更多 | 收藏 #3 | 已读 #3 | 删除 #3 | 收录 <url/text>"
exit 2
