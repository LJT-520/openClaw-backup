#!/bin/bash

# OpenClaw 数据同步 - 从云端恢复数据

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
workspace_dir=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" workspaceDir)
sync_list=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" syncList)

# 构建远程路径
remote_path="$remote_name:$bucket/$prefix"

# 打印标题
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据恢复                      ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo "云服务商: $provider_name"
echo "Bucket: $bucket"
echo "实例名称: $instance_name"
echo "云端目录: $prefix"
echo ""

# 确认恢复
echo -e "${YELLOW}⚠️  警告：恢复操作将覆盖本地数据${NC}"
echo ""
read -p "是否继续？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}已取消恢复${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}正在从云端下载...${NC}"
echo ""

# 备份当前数据
backup_dir="/tmp/openclaw-backup-$(date +%Y%m%d-%H%M%S)"
echo "备份当前数据到: $backup_dir"
mkdir -p "$backup_dir"
cp -r "$workspace_dir"/* "$backup_dir/" 2>/dev/null || true

# 执行恢复
rclone sync "$remote_path" "$workspace_dir/" \
  --include-from "$sync_list" \
  --config "$RCLONE_CONF" \
  --log-level INFO

# 检查结果
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 恢复完成！${NC}"
    echo ""
    echo "本地备份位置: $backup_dir"
    echo ""
    echo "已恢复的文件："
    rclone ls "$remote_path" \
      --config "$RCLONE_CONF" \
      --include-from "$sync_list" \
      | awk '{print "  - " $2}'
else
    echo ""
    echo -e "${RED}❌ 恢复失败${NC}"
    echo ""
    echo "本地数据已备份到: $backup_dir"
    exit 1
fi
