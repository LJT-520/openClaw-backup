#!/bin/bash

# 测试恢复功能（安全模式，只测试不覆盖）

echo "╔══════════════════════════════════════════╗"
echo "║   测试恢复功能                          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 测试下载单个文件到临时目录
TEST_DIR="/tmp/openclaw-restore-test-$(date +%s)"
mkdir -p "$TEST_DIR"

echo "测试：从云端下载 MEMORY.md 到临时目录"
echo "目标：$TEST_DIR/MEMORY.md"
echo ""

/home/node/bin/rclone copy openclaw-backup:silas-openclaw/silas-nas-openclaw/MEMORY.md "$TEST_DIR/" --config /home/node/.openclaw/workspace/skills/openclaw-sync/config/rclone.conf -v 2>&1

if [ -f "$TEST_DIR/MEMORY.md" ]; then
    echo ""
    echo "✅ 恢复测试成功！"
    echo "文件大小：$(du -h "$TEST_DIR/MEMORY.md" | cut -f1)"
    echo "文件位置：$TEST_DIR/MEMORY.md"
    echo ""
    echo "文件内容预览（前5行）："
    head -5 "$TEST_DIR/MEMORY.md"
    echo ""
    echo "清理测试文件..."
    rm -rf "$TEST_DIR"
    echo "✅ 清理完成"
else
    echo "❌ 恢复测试失败"
    exit 1
fi
