---
name: costlens
description: OpenClaw 成本和 Token 使用监控工具。从事件日志计算模型调用成本，支持预算告警和多维度报表（按模型/按天）。
metadata: {"openclaw":{"emoji":"💸"}}
---

# CostLens

OpenClaw 成本和 Token 使用监控工具。

## 功能

- **monitor**: 实时监控成本和预算状态
- **report**: 导出成本报表
- **budget check**: 预算检查，超支时返回非零退出码

## 支持模型费率

| 模型 | Input/1k | Output/1k |
|------|----------|-----------|
| gpt-4.1 | $0.01 | $0.03 |
| gpt-4o-mini | $0.00015 | $0.0006 |
| claude-3-5-sonnet | $0.003 | $0.015 |
| default | $0.002 | $0.008 |

事件可覆盖默认费率：`inputCostPer1k`, `outputCostPer1k`

## 事件格式

```json
[
  {
    "model": "gpt-4.1",
    "promptTokens": 1500,
    "completionTokens": 800,
    "timestamp": "2026-02-26T10:00:00Z"
  }
]
```

## 用法

```bash
# 监控（表格输出）
node bin/costlens.js monitor --events ./events.json --budget 10.00 --threshold 80

# 预算检查（超支时退出码 2）
node bin/costlens.js budget check --events ./events.json --budget 5.00 --format json

# 导出报表
node bin/costlens.js report --events ./events.json --out ./reports/cost-report.json
```

## 输出字段

- 总调用次数、总 Token 数、总成本
- 按模型分组（调用次数、Token、成本）
- 按天分组的成本趋势
- 预算使用率、告警级别（ok/warning/critical）
