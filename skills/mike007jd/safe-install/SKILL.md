---
name: safe-install
description: 带安全策略的 OpenClaw Skill 安装器。安装前自动经过 ClawShield 扫描，支持策略控制（来源限制、模式阻断、风险分级审批），提供快照和回滚能力。
metadata: {"openclaw":{"emoji":"🔐"}}
---

# Safe Install

带安全策略的 OpenClaw Skill 安装器。

## 安全流程

1. **来源验证**: 检查是否在 allowedSources 白名单
2. **模式阻断**: 匹配 blockedPatterns 正则则拒绝
3. **ClawShield 扫描**: 自动扫描风险
4. **风险分级审批**:
   - Safe: 直接安装
   - Caution: 需确认 (--yes 或交互确认)
   - Avoid: 需 --force 强制安装
5. **快照存储**: 按 hash 存储版本，支持回滚

## 策略配置

`.openclaw-tools/safe-install.json`:

```json
{
  "defaultAction": "prompt",
  "blockedPatterns": ["curl\\s*\\|\\s*sh"],
  "allowedSources": ["clawhub.com", "/local/skills"],
  "forceRequiredForAvoid": true
}
```

- `defaultAction`: allow/prompt/block
- `blockedPatterns`: 拒绝安装的正则列表
- `allowedSources`: 允许的来源白名单
- `forceRequiredForAvoid`: Avoid 级别是否必须 --force

## 用法

```bash
# 安装 skill（交互确认）
node bin/safe-install.js /path/to/skill --config ./policy.json --store ./.openclaw-tools/safe-install

# 自动确认 Caution
node bin/safe-install.js /path/to/skill --yes

# 强制安装 Avoid
node bin/safe-install.js /path/to/skill --force

# 查看安装历史
node bin/safe-install.js history --format table

# 回滚到上一版本
node bin/safe-install.js rollback my-skill

# 验证策略文件
node bin/safe-install.js policy validate --file ./policy.json
```

## 存储结构

```
.openclaw-tools/safe-install/
├── snapshots/{skill}/{version}/{hash}/  # 版本快照
├── active/{skill}/                       # 当前激活版本
├── state.json                           # 激活状态
└── history.json                         # 安装历史
```

## 安全限制

- 单文件最大 100MB
- 单 skill 最多 10000 个文件
- 单 skill 最大 500MB
- 路径遍历防护
