#!/usr/bin/env python3
# 简化的 JSON 读取工具（替代 jq）

import json
import sys

if len(sys.argv) < 3:
    print("用法: python3 read-json.py <json文件> <字段路径>")
    print("示例: python3 read-json.py config.json providerName")
    sys.exit(1)

json_file = sys.argv[1]
field = sys.argv[2]

try:
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 支持嵌套字段（用点分隔）
    keys = field.split('.')
    value = data
    for key in keys:
        if isinstance(value, dict):
            value = value.get(key, '')
        else:
            value = ''
            break
    
    print(value)
except Exception as e:
    print(f"错误: {e}", file=sys.stderr)
    sys.exit(1)
