cmd_edit() {
  local id="${1:-}"
  local desc="" priority="" project=""
  shift

  [ -z "$id" ] && die "Usage: task edit ID [--desc=\"new text\"] [--priority=N] [--project=NAME]"
  require_int "$id" "ID"

  while [ $# -gt 0 ]; do
    case "$1" in
      --desc=*)     desc="${1#*=}" ;;
      --priority=*) priority="${1#*=}" ;;
      --project=*)  project="${1#*=}" ;;
      -*)           die "Unknown flag: $1" ;;
    esac
    shift
  done

  [ -z "$desc" ] && [ -z "$priority" ] && [ -z "$project" ] && die "Nothing to edit. Provide --desc, --priority, or --project."

  local status
  status=$(sql "SELECT status FROM tasks WHERE id = $id;" 2>/dev/null) || true
  [ -z "$status" ] && die "Task #$id not found"

  local updates=""

  if [ -n "$desc" ]; then
    local safe_desc
    safe_desc=$(printf '%s' "$desc" | sed "s/'/''/g")
    updates="request_text = '$safe_desc'"
  fi

  if [ -n "$priority" ]; then
    require_int "$priority" "--priority"
    if [ "$priority" -lt 1 ] || [ "$priority" -gt 10 ]; then
      die "Priority must be 1-10"
    fi
    [ -n "$updates" ] && updates="$updates, "
    updates="${updates}priority = $priority"
  fi

  if [ -n "$project" ]; then
    local safe_proj
    safe_proj=$(printf '%s' "$project" | sed "s/'/''/g")
    [ -n "$updates" ] && updates="$updates, "
    if [ "$project" = "none" ] || [ "$project" = "null" ] || [ "$project" = "NULL" ]; then
        updates="${updates}project = NULL"
    else
        updates="${updates}project = '$safe_proj'"
    fi
  fi

  sql "UPDATE tasks SET $updates, last_updated = datetime('now') WHERE id = $id;"
  ok "Updated task #$id"
}
