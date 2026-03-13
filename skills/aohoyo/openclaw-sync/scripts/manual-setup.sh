#!/bin/bash

# OpenClaw 数据同步 - 手动配置工具
# 在没有 jq 的情况下使用

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

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步 - 手动配置           ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo "此工具将帮你手动创建配置文件"
echo ""

# 检查 rclone
if ! command -v rclone &> /dev/null; then
    echo -e "${YELLOW}⚠️  rclone 未安装${NC}"
    echo ""
    echo "请先安装 rclone："
    echo "  方法一：apt-get install rclone（需要 root）"
    echo "  方法二：curl https://rclone.org/install.sh | bash"
    echo "  方法三：从 https://rclone.org/downloads/ 下载"
    echo ""
    read -p "是否继续创建配置文件？（稍后再安装 rclone）(y/n): " continue_without_rclone
    if [ "$continue_without_rclone" != "y" ]; then
        exit 1
    fi
fi

mkdir -p "$CONFIG_DIR"

# 选择云服务商
echo -e "${BLUE}请选择云存储服务商：${NC}"
echo "1) 腾讯云 COS"
echo "2) 七牛云 Kodo"
echo "3) 阿里云 OSS"
echo ""
read -p "请输入选择 (1-3): " provider_choice

case $provider_choice in
    1)
        PROVIDER="tencent"
        PROVIDER_NAME="腾讯云 COS"
        PROVIDER_TYPE="s3"
        PROVIDER_EXTRA="provider = TencentCOS"
        ;;
    2)
        PROVIDER="qiniu"
        PROVIDER_NAME="七牛云 Kodo"
        PROVIDER_TYPE="qiniu"
        PROVIDER_EXTRA="provider = Qiniu"
        ;;
    3)
        PROVIDER="aliyun"
        PROVIDER_NAME="阿里云 OSS"
        PROVIDER_TYPE="s3"
        PROVIDER_EXTRA="provider = AlibabaOSS"
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ 已选择：$PROVIDER_NAME${NC}"
echo ""

# 输入密钥
echo -e "${BLUE}请输入云存储配置：${NC}"
read -p "Access Key: " ACCESS_KEY
read -p "Secret Key: " SECRET_KEY
read -p "Bucket 名称: " BUCKET
read -p "Region (如 ap-shanghai): " REGION
REGION=${REGION:-ap-shanghai}

# 实例名称
echo ""
echo -e "${BLUE}配置实例名称${NC}"
echo "用于区分多个 OpenClaw 实例"
DEFAULT_INSTANCE=$(hostname | cut -d. -f1)
read -p "实例名称 (默认: $DEFAULT_INSTANCE): " INSTANCE_NAME
INSTANCE_NAME=${INSTANCE_NAME:-$DEFAULT_INSTANCE}
PREFIX="$INSTANCE_NAME/"

echo -e "${GREEN}✅ 实例名称: $INSTANCE_NAME${NC}"
echo -e "${GREEN}✅ 云端目录: $PREFIX${NC}"
echo ""

# 生成 rclone 配置
RCLONE_CONF="$CONFIG_DIR/rclone.conf"
cat > "$RCLONE_CONF" <<EOF
[openclaw-backup]
type = $PROVIDER_TYPE
$PROVIDER_EXTRA
env_auth = false
access_key_id = $ACCESS_KEY
secret_access_key = $SECRET_KEY
EOF

# 根据云服务商添加额外配置
case $PROVIDER in
    tencent)
        echo "endpoint = cos.${REGION}.myqcloud.com" >> "$RCLONE_CONF"
        echo "acl = private" >> "$RCLONE_CONF"
        ;;
    qiniu)
        echo "endpoint = https://storage.${REGION}.qiniu.com" >> "$RCLONE_CONF"
        ;;
    aliyun)
        echo "endpoint = ${REGION}.aliyuncs.com" >> "$RCLONE_CONF"
        echo "acl = private" >> "$RCLONE_CONF"
        ;;
esac

chmod 600 "$RCLONE_CONF"
echo -e "${GREEN}✅ rclone 配置已生成${NC}"

# 生成备份配置
BACKUP_CONF="$CONFIG_DIR/backup.json"
cat > "$BACKUP_CONF" <<EOF
{
  "version": "1.0.0",
  "provider": "$PROVIDER",
  "providerName": "$PROVIDER_NAME",
  "remoteName": "openclaw-backup",
  "bucket": "$BUCKET",
  "region": "$REGION",
  "prefix": "$PREFIX",
  "instanceName": "$INSTANCE_NAME",
  "workspaceDir": "/home/node/.openclaw/workspace",
  "syncList": "data/sync-list.txt",
  "syncMode": "manual",
  "createdAt": "$(date -Iseconds)",
  "updatedAt": "$(date -Iseconds)"
}
EOF

chmod 600 "$BACKUP_CONF"
echo -e "${GREEN}✅ 备份配置已生成${NC}"
echo ""

# 完成
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        配置完成！                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "配置信息："
echo "  - 云服务商: $PROVIDER_NAME"
echo "  - Bucket: $BUCKET"
echo "  - Region: $REGION"
echo "  - 实例名称: $INSTANCE_NAME"
echo "  - 云端目录: $PREFIX"
echo ""
echo "配置文件："
echo "  - rclone: $RCLONE_CONF"
echo "  - backup: $BACKUP_CONF"
echo ""

if ! command -v rclone &> /dev/null; then
    echo -e "${YELLOW}⚠️  下一步：安装 rclone${NC}"
    echo ""
    echo "安装方法："
    echo "  curl https://rclone.org/install.sh | bash"
    echo ""
    echo "安装后运行："
    echo "  bash $SCRIPT_DIR/sync-now.sh"
else
    echo "下一步："
    echo "  bash $SCRIPT_DIR/sync-now.sh  # 立即同步"
    echo "  bash $SCRIPT_DIR/list-remote.sh  # 查看云端"
fi
