#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$BASE_DIR/data"
DATA_FILE="$DATA_DIR/items.json"
VIEW_STATE_FILE="$DATA_DIR/view-state.json"

mkdir -p "$DATA_DIR"

if [[ ! -f "$DATA_FILE" ]]; then
  cat > "$DATA_FILE" <<JSON
{
  "nextId": 1,
  "items": []
}
JSON
fi

if [[ ! -f "$VIEW_STATE_FILE" ]]; then
  cat > "$VIEW_STATE_FILE" <<JSON
{
  "lastStatus": "all",
  "lastOffset": 0,
  "lastLimit": 10
}
JSON
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install: brew install jq"
  exit 1
fi

cmd="${1:-}"
shift || true

now_utc() { date -u +%Y-%m-%dT%H:%M:%SZ; }
extract_host() { echo "$1" | sed -E 's#^[a-zA-Z]+://##' | cut -d/ -f1; }
derive_title() {
  local url="${1:-}" note="${2:-}"
  if [[ -n "$note" ]]; then
    echo "$note" | awk '{print substr($0,1,80)}'
  elif [[ -n "$url" ]]; then
    extract_host "$url"
  else
    echo "Untitled"
  fi
}

save_view_state() {
  local status="$1" offset="$2" limit="$3"
  cat > "$VIEW_STATE_FILE" <<JSON
{
  "lastStatus": "$status",
  "lastOffset": $offset,
  "lastLimit": $limit
}
JSON
}

add_item() {
  local url="" note=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --url) url="$2"; shift 2 ;;
      --note) note="$2"; shift 2 ;;
      *) echo "Unknown arg: $1"; exit 1 ;;
    esac
  done
  [[ -n "$url" || -n "$note" ]] || { echo "Usage: content.sh add --url <url> | --note <text>"; exit 1; }

  local ts="$(now_utc)" title source=""
  title="$(derive_title "$url" "$note")"
  [[ -n "$url" ]] && source="$(extract_host "$url")"
  local next_id
  next_id=$(jq -r '.nextId' "$DATA_FILE")

  local tmp
  tmp=$(mktemp)
  jq --arg title "$title" --arg url "$url" --arg note "$note" --arg source "$source" --arg ts "$ts" --argjson id "$next_id" '
    .items += [{
      id: $id,
      title: $title,
      url: (if $url == "" then null else $url end),
      note: (if $note == "" then null else $note end),
      source: (if $source == "" then null else $source end),
      status: "unread",
      tags: [],
      createdAt: $ts,
      updatedAt: $ts,
      readAt: null
    }] | .nextId = (.nextId + 1)
  ' "$DATA_FILE" > "$tmp"
  mv "$tmp" "$DATA_FILE"
  echo "ADDED: #${next_id} $title"
}

list_items() {
  local status="all" limit="10" offset="0"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --status) status="$2"; shift 2 ;;
      --limit) limit="$2"; shift 2 ;;
      --offset) offset="$2"; shift 2 ;;
      *) echo "Unknown arg: $1"; exit 1 ;;
    esac
  done

  local output count
  if [[ "$status" == "all" ]]; then
    output=$(jq -r --argjson offset "$offset" --argjson limit "$limit" '
      .items
      | sort_by(.createdAt) | reverse
      | .[$offset:($offset+$limit)]
      | .[]
      | "[\(.status)] #\(.id) \(.title)" + (if .url then "\nlink: \(.url)" else "" end)
    ' "$DATA_FILE")

    count=$(jq -r --argjson offset "$offset" --argjson limit "$limit" '
      .items | sort_by(.createdAt) | reverse | .[$offset:($offset+$limit)] | length
    ' "$DATA_FILE")
  else
    output=$(jq -r --arg status "$status" --argjson offset "$offset" --argjson limit "$limit" '
      .items
      | map(select(.status == $status))
      | sort_by(.createdAt) | reverse
      | .[$offset:($offset+$limit)]
      | .[]
      | "[\(.status)] #\(.id) \(.title)" + (if .url then "\nlink: \(.url)" else "" end)
    ' "$DATA_FILE")

    count=$(jq -r --arg status "$status" --argjson offset "$offset" --argjson limit "$limit" '
      .items | map(select(.status == $status)) | sort_by(.createdAt) | reverse | .[$offset:($offset+$limit)] | length
    ' "$DATA_FILE")
  fi

  if [[ "$count" -eq 0 ]]; then
    echo "NO_ITEMS"
    return
  fi

  echo "$output"

  local next_offset=$((offset + count))
  save_view_state "$status" "$next_offset" "$limit"
}

more_items() {
  local status offset limit
  status=$(jq -r '.lastStatus // "all"' "$VIEW_STATE_FILE")
  offset=$(jq -r '.lastOffset // 0' "$VIEW_STATE_FILE")
  limit=$(jq -r '.lastLimit // 10' "$VIEW_STATE_FILE")

  list_items --status "$status" --offset "$offset" --limit "$limit"
}

update_item() {
  local id="" status=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --id) id="$2"; shift 2 ;;
      --status) status="$2"; shift 2 ;;
      *) echo "Unknown arg: $1"; exit 1 ;;
    esac
  done
  [[ -n "$id" && -n "$status" ]] || { echo "Usage: content.sh update --id <id> --status unread|read|starred"; exit 1; }
  case "$status" in unread|read|starred) ;; *) echo "Invalid status: $status"; exit 1 ;; esac

  local ts="$(now_utc)" tmp
  tmp=$(mktemp)
  jq --argjson id "$id" --arg status "$status" --arg ts "$ts" '
    .items |= map(if .id == $id then .status = $status | .updatedAt = $ts | .readAt = (if $status == "read" then $ts else .readAt end) else . end)
  ' "$DATA_FILE" > "$tmp"
  mv "$tmp" "$DATA_FILE"
  echo "UPDATED: #$id -> $status"
}

remove_item() {
  local id=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --id) id="$2"; shift 2 ;;
      *) echo "Unknown arg: $1"; exit 1 ;;
    esac
  done
  [[ -n "$id" ]] || { echo "Usage: content.sh remove --id <id>"; exit 1; }
  local tmp
  tmp=$(mktemp)
  jq --argjson id "$id" '.items |= map(select(.id != $id))' "$DATA_FILE" > "$tmp"
  mv "$tmp" "$DATA_FILE"
  echo "REMOVED: #$id"
}

case "$cmd" in
  add) add_item "$@" ;;
  list) list_items "$@" ;;
  more) more_items "$@" ;;
  update) update_item "$@" ;;
  remove) remove_item "$@" ;;
  *)
    cat <<USAGE
Usage:
  bash scripts/content.sh add --url <url>
  bash scripts/content.sh add --note <text>
  bash scripts/content.sh list --status unread|read|starred|all [--limit 10] [--offset 0]
  bash scripts/content.sh more
  bash scripts/content.sh update --id <id> --status unread|read|starred
  bash scripts/content.sh remove --id <id>
USAGE
    exit 1
    ;;
esac
