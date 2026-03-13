#!/bin/bash

# OpenClaw 数据同步 - 安装依赖

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   安装 OpenClaw 数据同步依赖             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 检测系统
if [ -f /etc/debian_version ]; then
    PKG_MANAGER="apt-get"
elif [ -f /etc/redhat-release ]; then
    PKG_MANAGER="yum"
else
    echo "⚠️  未检测到支持的包管理器"
    exit 1
fi

echo "检测到包管理器: $PKG_MANAGER"
echo ""

# 安装 rclone
if ! command -v rclone &> /dev/null; then
    echo "安装 rclone..."
    curl https://rclone.org/install.sh | sudo bash
    echo "✅ rclone 安装完成"
else
    echo "✅ rclone 已安装: $(rclone version | head -1)"
fi

echo ""

# 安装 jq
if ! command -v jq &> /dev/null; then
    echo "安装 jq..."
    sudo $PKG_MANAGER update -qq
    sudo $PKG_MANAGER install -y jq
    echo "✅ jq 安装完成"
else
    echo "✅ jq 已安装: $(jq --version)"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   依赖安装完成！                         ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "下一步："
echo "  bash scripts/setup.sh"
