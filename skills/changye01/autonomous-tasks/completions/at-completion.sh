#!/bin/bash
#=============================================================================
# at-completion.sh - Autonomous Tasks 命令补全
# 功能：为 at 命令提供 zsh/bash 补全支持
# 安装: source at-completion.sh
#=============================================================================

_at() {
    local -a commands
    commands=(
        'status:显示当前目标进度'
        'execute:手动执行自主任务'
        'log:查看最近执行日志'
        'health:运行健康检查'
        'help:显示帮助信息'
    )
    
    _describe 'command' commands
}

# 注册补全函数
compdef _at at
