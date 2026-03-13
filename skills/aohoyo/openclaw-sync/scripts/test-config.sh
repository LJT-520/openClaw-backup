#!/bin/bash

# OpenClaw 数据同步 - 配置测试（无需 rclone）

CONFIG_DIR="/home/node/.openclaw/workspace/skills/openclaw-sync/config"

echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步 - 配置测试           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 检查配置文件
if [ ! -f "$CONFIG_DIR/backup.json" ]; then
    echo "❌ 配置文件不存在: $CONFIG_DIR/backup.json"
    exit 1
fi

if [ ! -f "$CONFIG_DIR/rclone.conf" ]; then
    echo "❌ 配置文件不存在: $CONFIG_DIR/rclone.conf"
    exit 1
fi

echo "✅ 配置文件存在"
echo ""

# 读取配置
BACKUP_CONF="$CONFIG_DIR/backup.json"
SCRIPT_DIR="/home/node/.openclaw/workspace/skills/openclaw-sync/scripts"

provider_name=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" providerName)
bucket=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" bucket)
region=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" region)
prefix=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" prefix)
instance_name=$(python3 "$SCRIPT_DIR/read-json.py" "$BACKUP_CONF" instanceName)

echo "配置信息："
echo "  云服务商: $provider_name"
echo "  存储桶: $bucket"
echo "  区域: $region"
echo "  实例名称: $instance_name"
echo "  云端目录: $prefix"
echo ""

# 检查密钥格式
access_key=$(grep "access_key_id" "$CONFIG_DIR/rclone.conf" | cut -d'=' -f2 | tr -d ' ')
secret_key=$(grep "secret_access_key" "$CONFIG_DIR/rclone.conf" | cut -d'=' -f2 | tr -d ' ')

if [ -z "$access_key" ] || [ -z "$secret_key" ]; then
    echo "❌ 密钥配置有误"
    exit 1
fi

echo "✅ 密钥已配置"
echo "  AccessKey: ${access_key:0:8}...${access_key: -8}"
echo "  SecretKey: ${secret_key:0:8}...${secret_key: -8}"
echo ""

# 检查同步列表
SYNC_LIST="/home/node/.openclaw/workspace/skills/openclaw-sync/data/sync-list.txt"
if [ -f "$SYNC_LIST" ]; then
    echo "✅ 同步列表存在"
    echo "  文件数: $(grep -v '^#' "$SYNC_LIST" | grep -v '^$' | wc -l)"
else
    echo "❌ 同步列表不存在"
    exit 1
fi

echo ""

# 检查 rclone
if command -v rclone &> /dev/null; then
    echo "✅ rclone 已安装: $(rclone version | head -1)"
    echo ""
    echo "可以开始同步："
    echo "  cd /home/node/.openclaw/workspace/skills/openclaw-sync"
    echo "  bash scripts/sync-now.sh"
else
    echo "⚠️  rclone 未安装"
    echo ""
    echo "安装方法："
    echo "  curl https://rclone.org/install.sh | bash"
    echo ""
    echo "或使用包管理器："
    echo "  apt-get install rclone"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   配置检查完成！                         ║"
echo "╚══════════════════════════════════════════╝"
