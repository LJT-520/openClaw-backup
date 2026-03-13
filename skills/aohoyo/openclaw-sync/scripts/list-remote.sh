#!/bin/bash

# OpenClaw 数据同步 - 列出云端文件

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
provider_name=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" providerName)
remote_name=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" remoteName)
bucket=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" bucket)
prefix=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" prefix)
instance_name=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" instanceName)

# 构建远程路径
remote_path="$remote_name:$bucket/$prefix"

# 打印标题
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 云端文件列表                  ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo "云服务商: $provider_name"
echo "Bucket: $bucket"
echo "实例名称: $instance_name"
echo "云端目录: $prefix"
echo ""

# 列出文件
echo -e "${BLUE}文件列表：${NC}"
echo ""

/home/node/bin/rclone ls "$remote_path" \
  --config "$RCLONE_CONF" \
  --max-depth 5 \
  | awk '{printf "  %-50s %10s\n", $2, $1" bytes"}' \
  | head -50

echo ""
echo -e "${GREEN}✅ 列表完成${NC}"
