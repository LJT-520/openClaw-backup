#!/bin/bash
#=============================================================================
# at-cli.sh - Autonomous Tasks 命令行工具
# 功能：提供标准化的 autonomous-tasks 命令接口
# 用法：./at-cli.sh <command> [options]
#=============================================================================

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 错误处理
error_exit() {
    echo "❌ 错误: $1" >&2
    exit "${2:-1}"
}

error_log() {
    echo "⚠️ 警告: $1" >&2
}

# 检查必要文件
check_required_files() {
    local required_files=("SKILL.md" "AUTONOMOUS.md" "_meta.json")
    for file in "${required_files[@]}"; do
        if [ ! -f "$PROJECT_DIR/$file" ]; then
            error_exit "缺少必要文件: $file"
        fi
    done
}

# 显示帮助
show_help() {
    echo "🐕 Autonomous Tasks CLI - 自主任务命令行工具"
    echo ""
    echo "用法: at <command> [options]"
    echo ""
    echo "可用命令:"
    echo "  status     显示当前目标进度 (支持 --json 输出)"
    echo "  execute    手动执行自主任务"
    echo "  log        查看最近执行日志 (支持 --today, -n <num>)"
    echo "  list       列出待完成任务"
    echo "  milestone  显示里程碑进度详细信息"
    echo "  version    显示版本信息"
    echo "  health     运行健康检查"
    echo "  stats      显示任务统计信息"
    echo "  diagnose   运行系统诊断检查 (别名: diag)"
    echo "  dashboard  查看可视化仪表板 (别名: dash)"
    echo "  decision   获取智能执行建议 (别名: dec)"
    echo "  help       显示帮助信息"
    echo ""
    echo "选项:"
    echo "  --json     JSON 格式输出 (status 命令)"
    echo "  -n <num>   指定显示条数 (log 命令)"
    echo "  --today    仅显示今日日志 (log 命令)"
    echo ""
    echo "快速开始:"
    echo "  1. 设置定时任务: openclaw cron add --name autonomous-tasks --every 1h"
    echo "  2. 查看状态: at status"
    echo "  3. 手动执行: at execute"
    echo ""
    echo "示例:"
    echo "  at status          # 显示状态"
    echo "  at status --json   # JSON 格式输出"
    echo "  at execute         # 执行任务"
    echo "  at log --today     # 查看今日日志"
    echo "  at log -n 20       # 查看最近 20 条"
    echo "  at list            # 列出待办任务"
    echo "  at milestone       # 查看里程碑进度"
    echo "  at version         # 查看版本"
    echo "  at health          # 健康检查"
    echo "  at stats           # 任务统计"
    echo "  at diagnose        # 系统诊断"
    echo "  at dashboard       # 可视化仪表板"
    echo "  at decision        # 智能执行建议"
    echo ""
    echo "快捷安装 (添加到 ~/.zshrc):"
    echo "  alias at=\"bash \\$HOME/.openclaw/workspace/skills/autonomous-tasks/scripts/at-cli.sh\""
    echo ""
    echo "查看文档: cat ~/.openclaw/workspace/skills/autonomous-tasks/SKILL.md"
}

# 显示版本
cmd_version() {
    local meta_file="$PROJECT_DIR/_meta.json"
    if [ -f "$meta_file" ]; then
        local version=$(grep -o '"version": *"[^"]*"' "$meta_file" | cut -d'"' -f4)
        echo "🐕 Autonomous Tasks v$version"
    else
        echo "🐕 Autonomous Tasks (version unknown)"
    fi
}

# 显示里程碑进度
cmd_milestone() {
    local autonomous_file="$PROJECT_DIR/AUTONOMOUS.md"
    
    if [ ! -f "$autonomous_file" ]; then
        echo "❌ AUTONOMOUS.md 文件不存在"
        return 1
    fi
    
    echo "🎯 里程碑进度"
    echo ""
    
    # 提取里程碑部分
    local milestone_section=$(grep -A 50 "## 里程碑" "$autonomous_file" 2>/dev/null | head -30)
    
    # 计算完成数量
    local total=$(echo "$milestone_section" | grep -c "^\- " 2>/dev/null || echo "0")
    local completed=$(echo "$milestone_section" | grep -c "^\- \[x\]" 2>/dev/null || echo "0")
    
    if [ "$total" -gt 0 ]; then
        local pct=$((completed * 100 / total))
        echo "  进度: $completed / $total ($pct%)"
    else
        echo "  进度: 暂无里程碑"
    fi
    
    echo ""
    echo "  里程碑列表:"
    echo "$milestone_section" | grep "^\- " | head -10
}

# 列出待完成任务
cmd_list() {
    local autonomous_file="$PROJECT_DIR/AUTONOMOUS.md"
    local backlog_file="$PROJECT_DIR/memory/backlog.md"
    
    echo "📋 待完成任务列表:"
    echo ""
    
    if [ -f "$autonomous_file" ]; then
        echo "【AUTONOMOUS.md 待改进项】"
        grep -A 10 "### 当前待改进项" "$autonomous_file" 2>/dev/null | grep -E "^\s*-\s*\[" | head -5
    fi
    
    echo ""
    
    if [ -f "$backlog_file" ]; then
        echo "【Backlog 待办想法】"
        grep -E "^\s*-\s*\[\s*\]" "$backlog_file" 2>/dev/null | head -5
    fi
    
    if [ ! -f "$autonomous_file" ] && [ ! -f "$backlog_file" ]; then
        echo "暂无待办任务"
    fi
}

# 显示状态
cmd_status() {
    local format="${1:-text}"
    if [ "$format" = "--json" ] || [ "$format" = "-j" ]; then
        "$SCRIPT_DIR/status-json.sh"
    else
        "$SCRIPT_DIR/status-display.sh"
    fi
}

# 执行任务
cmd_execute() {
    echo "🚀 自主任务执行助手"
    echo ""
    
    local autonomous_file="$PROJECT_DIR/AUTONOMOUS.md"
    local backlog_file="$PROJECT_DIR/memory/backlog.md"
    local tasks_log="$PROJECT_DIR/memory/tasks-log.md"
    
    # 读取当前版本
    local version="unknown"
    if [ -f "$PROJECT_DIR/_meta.json" ]; then
        version=$(grep -o '"version": *"[^"]*"' "$PROJECT_DIR/_meta.json" | cut -d'"' -f4)
    fi
    
    echo "📌 当前版本: v$version"
    echo ""
    
    # 读取当前阶段
    if [ -f "$autonomous_file" ]; then
        local current_phase=$(grep -A 2 "## 当前阶段" "$autonomous_file" 2>/dev/null | tail -1 | sed 's/^## //' | tr -d '\n')
        if [ -n "$current_phase" ]; then
            echo "📍 当前阶段: $current_phase"
        fi
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 显示待改进项
    echo "📋 当前待改进项:"
    echo ""
    
    if [ -f "$autonomous_file" ]; then
        local todo_items=$(grep -A 20 "### 当前待改进项" "$autonomous_file" 2>/dev/null | grep -E "^\s*-\s*\[" | head -5)
        if [ -n "$todo_items" ]; then
            echo "$todo_items"
        else
            echo "  ✓ 所有待改进项已完成"
        fi
    fi
    
    echo ""
    
    # 显示最近完成任务
    if [ -f "$tasks_log" ]; then
        echo "✅ 最近完成的任务:"
        echo ""
        tail -n 5 "$tasks_log" | grep "^- ✅ TASK-" | sed 's/^/   /'
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 统计信息
    if [ -f "$tasks_log" ]; then
        local total=$(grep -c "^- ✅ TASK-" "$tasks_log" 2>/dev/null || echo "0")
        local today=$(grep -c "$(date +%Y-%m-%d)" "$tasks_log" 2>/dev/null || echo "0")
        echo "📊 统计: 总完成 $total 个任务，今日完成 $today 个"
    fi
    
    echo ""
    echo "💡 建议: 通过 OpenClaw 完整执行自主任务工作流："
    echo "   openclaw agent --message '执行自主任务'"
    echo ""
}

# 查看日志
cmd_log() {
    local lines="${1:-10}"
    local log_file="$PROJECT_DIR/memory/tasks-log.md"
    
    if [ ! -f "$log_file" ]; then
        echo "❌ 日志文件不存在"
        return 1
    fi
    
    echo "📋 最近 $lines 条任务记录:"
    echo ""
    tail -n "$lines" "$log_file"
}

# 健康检查
cmd_health() {
    echo "🏥 运行健康检查..."
    echo ""
    "$SCRIPT_DIR/health-check.sh"
}

# 统计信息
cmd_stats() {
    local log_file="$PROJECT_DIR/memory/tasks-log.md"
    
    if [ ! -f "$log_file" ]; then
        echo "❌ 日志文件不存在"
        return 1
    fi
    
    local total=$(grep -c "^- ✅ TASK-" "$log_file" 2>/dev/null || echo "0")
    local today=$(grep -c "$(date +%Y-%m-%d)" "$log_file" 2>/dev/null || echo "0")
    
    echo "📊 任务统计"
    echo ""
    echo "  总完成任务: $total"
    echo "  今日完成: $today"
    echo ""
    
    if [ -f "$PROJECT_DIR/_meta.json" ]; then
        local version=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$PROJECT_DIR/_meta.json" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
        if [ -n "$version" ]; then
            echo "  当前版本: v$version"
        fi
    fi
}

# 诊断检查
cmd_diagnose() {
    echo "🔍 运行系统诊断..."
    echo ""
    if [ -f "$SCRIPT_DIR/diagnose.sh" ]; then
        "$SCRIPT_DIR/diagnose.sh"
    else
        echo "❌ 诊断脚本不存在"
        return 1
    fi
}

# 仪表板
cmd_dashboard() {
    echo "📈 加载仪表板..."
    echo ""
    if [ -f "$SCRIPT_DIR/dashboard.sh" ]; then
        "$SCRIPT_DIR/dashboard.sh"
    else
        echo "❌ 仪表板脚本不存在"
        return 1
    fi
}

# 决策引擎
cmd_decision() {
    echo "🧠 运行智能决策引擎..."
    echo ""
    if [ -f "$SCRIPT_DIR/decision-engine-v2.sh" ]; then
        "$SCRIPT_DIR/decision-engine-v2.sh"
    elif [ -f "$SCRIPT_DIR/decision-engine.sh" ]; then
        "$SCRIPT_DIR/decision-engine.sh"
    else
        echo "❌ 决策引擎脚本不存在"
        return 1
    fi
}

# 主函数
main() {
    # 检查必要文件
    check_required_files
    
    local command="${1:-help}"
    shift || true
    
    if [ -z "$command" ]; then
        show_help
        exit 0
    fi
    
    case "$command" in
        status)
            cmd_status "$@"
            ;;
        execute|run)
            cmd_execute "$@"
            ;;
        log)
            cmd_log "$@"
            ;;
        list|ls)
            cmd_list "$@"
            ;;
        milestone|ml)
            cmd_milestone "$@"
            ;;
        version|ver|v)
            cmd_version "$@"
            ;;
        health|check)
            cmd_health "$@"
            ;;
        stats)
            cmd_stats "$@"
            ;;
        diagnose|diag)
            cmd_diagnose "$@"
            ;;
        dashboard|dash)
            cmd_dashboard "$@"
            ;;
        decision|dec)
            cmd_decision "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo "❌ 未知命令: $command"
            echo "使用 'at help' 查看可用命令"
            exit 1
            ;;
    esac
}

main "$@"
