---
name: baseline-kit
description: OpenClaw 安全配置基线生成器和审计工具。生成开发/团队/企业/隔离环境的安全配置模板，并审计现有配置的安全问题（网络暴露、认证限流、技能来源限制、审计日志、备份策略、密钥卫生）。
metadata: {"openclaw":{"emoji":"🧱"}}
---

# Baseline Kit

OpenClaw 安全配置基线生成器和审计工具。

## 功能

- **generate**: 按场景生成安全配置模板
- **audit**: 审计现有配置的安全合规性

## 配置场景

| 场景 | 特点 |
|------|------|
| development | 宽松限流(20次/分钟)，7天日志保留 |
| team | 中等限流(10次/分钟)，30天日志保留 |
| enterprise | 严格限流(5次/5分钟)，90天日志，含灾备 |
| airgapped | 仅本地回环，本地镜像源，180天日志 |

## 用法

### 生成安全配置

```bash
# 生成企业级配置
node bin/baseline-kit.js generate --profile enterprise --out ./openclaw.secure.json

# 生成开发环境配置
node bin/baseline-kit.js generate --profile development --out ./openclaw.dev.json
```

### 审计当前配置

```bash
# 表格输出
node bin/baseline-kit.js audit --config ~/.openclaw/openclaw.json --format table

# JSON 输出
node bin/baseline-kit.js audit --config ./openclaw.secure.json --format json
```

## 审计检查项

- `NET_EXPOSURE`: gateway.bind 是否仅限本地回环
- `AUTH_RATE_LIMIT`: 认证限流是否配置完整
- `SOURCE_RESTRICTION`: 技能来源限制是否过宽
- `AUDIT_LOGGING`: 审计日志是否启用
- `BACKUP_HINT`: 备份是否配置
- `SECRET_HYGIENE`: 配置中是否存在明文密钥

## 合规标签

每个发现项都标注了相关合规框架：SOC2、ISO27001、NIST CSF
