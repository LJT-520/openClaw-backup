#!/bin/bash
# autonomous-tasks 健康检查脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Autonomous-Tasks 健康检查 ==="
echo "检查时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

ERRORS=0
WARNINGS=0

# 1. 检查核心文件
echo "📁 检查核心文件..."
CORE_FILES=(
    "$SKILL_DIR/SKILL.md"
    "$SKILL_DIR/AUTONOMOUS.md"
    "$SKILL_DIR/_meta.json"
    "$SKILL_DIR/memory/tasks-log.md"
    "$SKILL_DIR/memory/backlog.md"
)

for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $(basename $file)"
    else
        echo "  ❌ $(basename $file) 不存在"
        ((ERRORS++))
    fi
done

# 2. 检查目录结构
echo ""
echo "📂 检查目录结构..."
DIRS=("scripts" "memory")
for dir in "${DIRS[@]}"; do
    if [ -d "$SKILL_DIR/$dir" ]; then
        echo "  ✅ $dir/"
    else
        echo "  ❌ $dir/ 不存在"
        ((ERRORS++))
    fi
done

# 3. 检查任务日志
echo ""
echo "📋 检查任务日志..."
TASK_LOG="$SKILL_DIR/memory/tasks-log.md"
if [ -f "$TASK_LOG" ]; then
    DONE_COUNT=$(grep -c "✅ TASK-" "$TASK_LOG" 2>/dev/null || true)
    DONE_COUNT=${DONE_COUNT:-0}
    echo "  ✅ 任务日志正常 (已完成 $DONE_COUNT 个任务)"
else
    echo "  ❌ 任务日志不存在"
    ((ERRORS++))
fi

# 4. 检查版本一致性
echo ""
echo "🏷️ 检查版本一致性..."
VERSION_SKILL=$(grep -o 'version: [0-9]*\.[0-9]*\.[0-9]*' "$SKILL_DIR/SKILL.md" | head -1 | awk '{print $2}')
VERSION_META=$(grep -o '"version": *"[^"]*"' "$SKILL_DIR/_meta.json" | cut -d'"' -f4)
if [ "$VERSION_SKILL" = "$VERSION_META" ]; then
    echo "  ✅ 版本一致: v$VERSION_SKILL"
else
    echo "  ⚠️  版本不一致: SKILL.md=$VERSION_SKILL, _meta.json=$VERSION_META"
    ((WARNINGS++))
fi

# 5. 检查脚本语法
echo ""
echo "🔍 检查脚本语法..."
SCRIPT_ERRORS=0
for script in "$SCRIPT_DIR"/*.sh; do
    if [ -f "$script" ]; then
        if ! bash -n "$script" 2>/dev/null; then
            echo "  ❌ 语法错误: $(basename $script)"
            ((SCRIPT_ERRORS++))
        fi
    fi
done
if [ $SCRIPT_ERRORS -eq 0 ]; then
    SCRIPT_COUNT=$(ls "$SCRIPT_DIR"/*.sh 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ 所有脚本语法正确 ($SCRIPT_COUNT 个)"
else
    echo "  ❌ 发现 $SCRIPT_ERRORS 个脚本语法错误"
    ((ERRORS+=SCRIPT_ERRORS))
fi

# 总结
echo ""
echo "=== 健康检查总结 ==="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 系统状态: 优秀"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "✅ 系统状态: 正常 (警告: $WARNINGS 项)"
    exit 0
else
    echo "❌ 系统状态: 需要关注 (错误: $ERRORS, 警告: $WARNINGS)"
    exit 1
fi
