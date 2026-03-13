cmd_create() {
  local desc="" priority="" parent="" project=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --priority=*) priority="${1#*=}" ;;
      --parent=*)   parent="${1#*=}" ;;
      --project=*)  project="${1#*=}" ;;
      -*)           die "Unknown flag: $1" ;;
      *)            desc="$1" ;;
    esac
    shift
  done

  [ -z "$desc" ] && die "Usage: task create \"description\" [--priority=N] [--parent=ID] [--project=NAME]"

  if [ -n "$parent" ]; then
    require_int "$parent" "--parent"
  fi

  if [ -n "$parent" ] && [ -z "$priority" ]; then
    priority=$(sql "SELECT priority FROM tasks WHERE id = $parent;")
  elif [ -z "$priority" ]; then
    priority=5
  fi

  require_int "$priority" "--priority"
  if [ "$priority" -lt 1 ] || [ "$priority" -gt 10 ]; then
    die "Priority must be 1-10"
  fi

  if [ -n "$parent" ]; then
    local pcount
    pcount=$(sql "SELECT count(*) FROM tasks WHERE id = $parent;")
    [ "$pcount" -eq 0 ] && die "Parent task $parent does not exist"
  fi

  local parent_val="NULL"
  [ -n "$parent" ] && parent_val="$parent"
  
  local project_val="NULL"
  [ -n "$project" ] && project_val="'$(printf '%s' "$project" | sed "s/'/''/g")'"

  local safe_desc
  safe_desc=$(printf '%s' "$desc" | sed "s/'/''/g")

  local task_id
  task_id=$(sql "INSERT INTO tasks (request_text, project, status, priority, parent_id, created_at, last_updated)
    VALUES ('$safe_desc', $project_val, 'pending', $priority, $parent_val, datetime('now'), datetime('now'));
    SELECT last_insert_rowid();")

  ok "Created task #$task_id: $desc (priority=$priority${project:+, project=$project})"
  echo "$task_id"
}
