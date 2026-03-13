#!/bin/bash

# 日志查询脚本
# 用法: ./log-search.sh [选项]

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认参数
LOG_DIR="${LOG_DIR:-.}"
PATTERN=""
LINES=50
CASE_INSENSITIVE=false

# 帮助信息
show_help() {
    echo -e "${BLUE}用法:${NC} $0 [选项]"
    echo ""
    echo -e "${BLUE}选项:${NC}"
    echo "  -d, --dir DIR       日志目录 (默认: 当前目录)"
    echo "  -p, --pattern PAT   搜索关键词"
    echo "  -n, --lines N       显示行数 (默认: 50)"
    echo "  -i, --ignore-case   忽略大小写"
    echo "  -e, --error         只显示错误"
    echo "  -w, --warn          只显示警告"
    echo "  -t, --today         只看今天的日志"
    echo "  -l, --list          列出所有日志文件"
    echo "  -h, --help          显示帮助"
    echo ""
    echo -e "${BLUE}示例:${NC}"
    echo "  $0 -p \"ERROR\" -n 100"
    echo "  $0 -e -d /var/log"
    echo "  $0 --today -p \"Exception\""
}

# 列出日志文件
list_logs() {
    echo -e "${GREEN}日志文件列表:${NC}"
    find "$LOG_DIR" -type f \( -name "*.log" -o -name "*.out" -o -name "*log.*" \) 2>/dev/null | while read -r f; do
        size=$(du -h "$f" | cut -f1)
        date=$(stat -c %y "$f" 2>/dev/null | cut -d' ' -f1)
        echo "  $date  $size  $f"
    done
}

# 查看今天的日志
today_logs() {
    local today=$(date +%Y-%m-%d)
    find "$LOG_DIR" -type f -name "*.log" 2>/dev/null | while read -r f; do
        if grep -q "$today" "$f" 2>/dev/null; then
            echo -e "${GREEN}=== $f ===${NC}"
            grep "$today" "$f" | tail -n "$LINES"
        fi
    done
}

# 主逻辑
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            LOG_DIR="$2"
            shift 2
            ;;
        -p|--pattern)
            PATTERN="$2"
            shift 2
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -i|--ignore-case)
            CASE_INSENSITIVE=true
            shift
            ;;
        -e|--error)
            PATTERN="ERROR|Exception|FATAL"
            CASE_INSENSITIVE=true
            shift
            ;;
        -w|--warn)
            PATTERN="WARN|WARNING"
            CASE_INSENSITIVE=true
            shift
            ;;
        -t|--today)
            today_logs
            exit 0
            ;;
        -l|--list)
            list_logs
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 搜索日志
if [ -n "$PATTERN" ]; then
    echo -e "${YELLOW}搜索: $PATTERN${NC}"
    echo -e "${YELLOW}目录: $LOG_DIR${NC}"
    echo -e "${YELLOW}行数: $LINES${NC}"
    echo ""

    if [ "$CASE_INSENSITIVE" = true ]; then
        find "$LOG_DIR" -type f -name "*.log" 2>/dev/null | xargs grep -i "$PATTERN" 2>/dev/null | tail -n "$LINES"
    else
        find "$LOG_DIR" -type f -name "*.log" 2>/dev grep "$PATTERN/null | xargs" 2>/dev/null | tail -n "$LINES"
    fi
else
    # 没有关键词，显示最新的日志
    echo -e "${GREEN}显示最新 $LINES 行日志:${NC}"
    find "$LOG_DIR" -type f -name "*.log" 2>/dev/null -exec tail -n "$LINES" {} \;
fi
