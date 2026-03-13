cmd_list() {
  local filter_status="" filter_parent="" filter_project=""

  while [ $# -gt 0 ]; do
    case "$1" in
      --status=*)  filter_status="${1#*=}" ;;
      --parent=*)  filter_parent="${1#*=}" ;;
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

  if [ -n "$filter_parent" ]; then
    require_int "$filter_parent" "--parent"
    where="$where AND parent_id = $filter_parent"
  fi

  if [ -n "$filter_project" ]; then
    local safe_proj
    safe_proj=$(printf '%s' "$filter_project" | sed "s/'/''/g")
    where="$where AND project = '$safe_proj'"
  fi

  local q="
  SELECT
    id,
    CASE
      WHEN status = 'done' THEN '✔ '
      WHEN status = 'in_progress' THEN '▶ '
      WHEN status = 'blocked' THEN '⛔ '
      ELSE '  '
    END || substr(request_text, 1, 50) AS task,
    status,
    priority,
    IFNULL(project, '-') AS project
  FROM tasks
  $where
  ORDER BY status = 'done', priority DESC, created_at ASC;
  "

  sql_table "4 54 12 8 15" "$q"
}
