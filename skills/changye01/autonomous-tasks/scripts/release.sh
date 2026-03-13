#!/bin/bash
# autonomous-tasks 发布脚本
# 用于自动发布新版本到 ClawHub

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SKILL_DIR="$PROJECT_DIR"

# 读取当前版本
CURRENT_VERSION=$(cat "$SKILL_DIR/_meta.json" | grep -o '"version": "[^"]*"' | cut -d'"' -f4)

# 计算新版本
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# 默认增量 patch 版本
NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"

# 可以通过参数指定版本
if [ -n "$1" ]; then
    NEW_VERSION="$1"
fi

echo "当前版本: $CURRENT_VERSION"
echo "新版本: $NEW_VERSION"

# 更新版本号
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$SKILL_DIR/_meta.json"

# 发布到 ClawHub
echo "正在发布到 ClawHub..."
clawhub publish "$SKILL_DIR" --version "$NEW_VERSION"

echo "✅ 发布完成: autonomous-tasks@$NEW_VERSION"

# 输出新版本号供后续使用
echo "NEW_VERSION=$NEW_VERSION" > "$PROJECT_DIR/.release-info"
