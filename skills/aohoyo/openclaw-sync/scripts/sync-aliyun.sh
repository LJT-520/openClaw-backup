#!/bin/bash

# OpenClaw 数据同步 - 使用阿里云 OSS

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_DIR="/home/node/.openclaw/workspace"
RCLONE_CONF="$SKILL_DIR/config/rclone-aliyun.conf"
BACKUP_CONF="$SKILL_DIR/config/backup-aliyun.json"

# 读取配置
bucket=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" bucket)
prefix=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" prefix)
sync_list="$SKILL_DIR/data/sync-list.txt"

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步 - 阿里云 OSS         ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}正在同步到阿里云 OSS...${NC}"
echo "存储桶: $bucket"
echo "实例: $prefix"
echo ""

# 执行同步
/home/node/bin/rclone sync "$WORKSPACE_DIR/" "openclaw-backup:$bucket/$prefix" \
  --include-from "$sync_list" \
  --config "$RCLONE_CONF" \
  --log-level INFO \
  --stats-one-line \
  --stats 5s

echo ""
echo -e "${GREEN}✅ 同步完成！${NC}"
echo ""
echo "查看云端："
echo "  /home/node/bin/rclone ls openclaw-backup:$bucket/$prefix --config $RCLONE_CONF"
