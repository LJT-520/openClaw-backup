#!/bin/bash

# OpenClaw 数据同步 - 使用 qiniu-kodo 技能

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
QINIU_SKILL="/home/node/.openclaw/workspace/skills/qiniu-kodo"
WORKSPACE_DIR="/home/node/.openclaw/workspace"
PREFIX="silas-nas-openclaw"

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步                      ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}正在同步到七牛云...${NC}"
echo "实例: $PREFIX"
echo ""

# 读取同步列表
SYNC_LIST="$SKILL_DIR/data/sync-list.txt"
if [ ! -f "$SYNC_LIST" ]; then
    echo "❌ 同步列表不存在: $SYNC_LIST"
    exit 1
fi

# 上传文件
upload_count=0
failed_count=0

while IFS= read -r line || [ -n "$line" ]; do
    # 跳过注释和空行
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue

    # 处理文件或目录
    if [ -f "$WORKSPACE_DIR/$line" ]; then
        # 单个文件
        echo "上传: $line"
        node "$QINIU_SKILL/scripts/qiniu_node.mjs" upload \
          --file "$WORKSPACE_DIR/$line" \
          --key "$PREFIX/$line" \
          --config "$QINIU_SKILL/config/qiniu-config.json" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            ((upload_count++))
            echo -e "  ${GREEN}✓${NC} $line"
        else
            ((failed_count++))
            echo "  ✗ $line"
        fi
    elif [ -d "$WORKSPACE_DIR/$line" ]; then
        # 目录 - 递归上传
        echo "上传目录: $line"
        find "$WORKSPACE_DIR/$line" -type f | while read -r file; do
            relative_path="${file#$WORKSPACE_DIR/}"
            echo "  上传: $relative_path"
            node "$QINIU_SKILL/scripts/qiniu_node.mjs" upload \
              --file "$file" \
              --key "$PREFIX/$relative_path" \
              --config "$QINIU_SKILL/config/qiniu-config.json" > /dev/null 2>&1
            
            if [ $? -eq 0 ]; then
                ((upload_count++))
                echo -e "    ${GREEN}✓${NC} $relative_path"
            else
                ((failed_count++))
                echo "    ✗ $relative_path"
            fi
        done
    fi
done < "$SYNC_LIST"

echo ""
echo -e "${GREEN}✅ 同步完成！${NC}"
echo "成功: $upload_count 个文件"
echo "失败: $failed_count 个文件"
echo ""
echo "查看云端："
echo "  node $QINIU_SKILL/scripts/qiniu_node.mjs list --prefix $PREFIX --config $QINIU_SKILL/config/qiniu-config.json"
