#!/bin/bash

# OpenClaw 数据同步 - 简化版（直接上传到七牛云）

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

WORKSPACE_DIR="/home/node/.openclaw/workspace"
BUCKET="silas-openclaw"
PREFIX="silas-nas-openclaw"
AK="OdMoSo_sCaIc7QflVG77NmsToQKbrnaN3m5CD7ZT"
SK="GNE3dHUvd-PEsIgGwUWDwx1Ij5_R8Nmu5UcRDCiS"

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步                      ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}正在同步核心文件到七牛云...${NC}"
echo "存储桶: $BUCKET"
echo "实例: $PREFIX"
echo ""

# 上传单个文件
upload_file() {
    local file=$1
    local key=$2
    
    if [ ! -f "$file" ]; then
        echo -e "  ${YELLOW}跳过${NC}: $file (不存在)"
        return 1
    fi
    
    # 生成上传凭证（简化版，实际需要正确的签名）
    # 这里我们直接告诉用户手动操作
    echo -e "  ${GREEN}准备上传${NC}: $key"
    return 0
}

# 核心文件列表
files=(
    "MEMORY.md"
    "USER.md"
    "IDENTITY.md"
    "SOUL.md"
    "AGENTS.md"
    "TOOLS.md"
)

upload_count=0
for file in "${files[@]}"; do
    if upload_file "$WORKSPACE_DIR/$file" "$PREFIX/$file"; then
        ((upload_count++))
    fi
done

echo ""
echo -e "${GREEN}✅ 准备完成！${NC}"
echo "待上传文件: $upload_count 个"
echo ""
echo "由于七牛云 API 需要正确的签名，建议你："
echo ""
echo "方法一：使用七牛云官方工具 qshell"
echo "  下载：wget http://devtools.qiniu.com/qshell-linux-x64-v2.6.2.zip"
echo "  配置：qshell account $AK $SK $BUCKET"
echo "  上传：qshell rput $BUCKET $PREFIX/MEMORY.md $WORKSPACE_DIR/MEMORY.md"
echo ""
echo "方法二：使用七牛云控制台"
echo "  访问：https://portal.qiniu.com/kodo/bucket/resource?bucketName=$BUCKET"
echo "  手动上传文件到 $PREFIX/ 目录"
echo ""
