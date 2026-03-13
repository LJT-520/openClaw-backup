cmd_export() {
  local filter_status="" filter_project=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --status=*)  filter_status="${1#*=}" ;;
      --project=*) filter_project="${1#*=}" ;;
      -*)          die "Unknown flag: $1" ;;
    esac
    shift
  done

  local where="WHERE 1=1"

  if [ -n "$filter_status" ]; then
    case "$filter_status" in
      pending|in_progress|blocked|done) ;;
      *) die "Unknown status: '$filter_status'. Use: pending, in_progress, blocked, done" ;;
    esac
    where="$where AND status = '$filter_status'"
  fi

  if [ -n "$filter_project" ]; then
    local safe_proj
    safe_proj=$(printf '%s' "$filter_project" | sed "s/'/''/g")
    where="$where AND project = '$safe_proj'"
  fi

  # Use raw sqlite3 output, format with awk to build Github markdown table
  local raw_data
  raw_data=$(sqlite3 -batch "$DB" "SELECT id, IFNULL(project, '-'), status, priority, request_text FROM tasks $where ORDER BY priority DESC, created_at ASC;")

  if [ -z "$raw_data" ]; then
    echo "No tasks found to export."
    exit 0
  fi

  echo "| ID | Project | Status | Priority | Description |"
  echo "|---|---|---|---|---|"
  echo "$raw_data" | awk -F '|' '{ printf "| %s | %s | %s | %s | %s |\n", $1, $2, $3, $4, $5 }'
}
