#!/bin/bash

# OpenClaw 数据同步 - 立即同步

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$SKILL_DIR/config"

# 配置文件
RCLONE_CONF="$CONFIG_DIR/rclone.conf"
BACKUP_CONF="$CONFIG_DIR/backup.json"

# 检查配置
if [ ! -f "$BACKUP_CONF" ]; then
    echo -e "${YELLOW}⚠️  未找到配置文件，请先运行 setup.sh${NC}"
    exit 1
fi

# 读取配置（使用 Python）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
remote_name=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" remoteName)
bucket=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" bucket)
prefix=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" prefix)
workspace_dir=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" workspaceDir)
sync_list=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" syncList)

# 构建远程路径
remote_path="$remote_name:$bucket/$prefix"

# 打印标题
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步                      ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}正在同步到云端...${NC}"
echo "目标路径: $remote_path"
echo ""

# 执行同步
/home/node/bin/rclone sync "$workspace_dir/" "$remote_path" \
  --include-from "$sync_list" \
  --config "$RCLONE_CONF" \
  --log-level INFO \
  --stats-one-line \
  --stats 5s

# 检查结果
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 同步完成！${NC}"
    echo ""
    echo "查看云端文件: bash $SCRIPT_DIR/list-remote.sh"
else
    echo ""
    echo -e "${YELLOW}⚠️  同步失败，请检查日志${NC}"
    exit 1
fi

