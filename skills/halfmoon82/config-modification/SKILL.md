# Skill: config-modification v2.3
# 配置文件修改安全流程（拦截矩阵 + 四联校验 + 自动回滚）

## 触发条件
当需要修改以下配置文件时**强制触发**：
- `openclaw.json`
- `agents/*/models.json`
- `agents/*/config.json`
- skills 配置
- 任何 `~/.openclaw/` 下的 JSON 配置文件

**⚠️ 无例外原则**：不管是正式修改还是测试，只要动配置文件，都必须走完整流程。

---

## v2.3 架构

```
配置文件修改操作 (edit/write/delete)
              |
              ▼
    ┌─────────────────┐
    │  拦截矩阵       │
    │ (风险评估)      │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │  校验级别      │
    │ full/verify/   │
    │ check/snapshot │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │  四联校验       │
    │ Schema → Diff  │
    │ → Rollback     │
    │ → Health       │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │  失败?          │
    └────────┬────────┘
       │           │
      Yes          No
       │           │
       ▼           ▼
   自动回滚     ✅ 完成
   + 告警
```

---

## 核心模块

### 1. 拦截矩阵 (intercept_matrix.py)
- 定义配置风险等级: critical / medium / low
- 动作触发规则: edit/write/delete/config.patch
- 敏感路径识别

```python
from intercept_matrix import should_intercept, get_check_level

# 检查是否需要拦截
if should_intercept("edit", "/path/to/config.json"):
    level = get_check_level("edit", "/path/to/config.json")
    # level: "full" | "verify" | "check" | "snapshot"
```

### 2. 四联校验 (quad_check.py)
- Schema: JSON 语法 + 必需字段
- Diff: 与快照对比变更
- Rollback: 回滚能力验证
- Health: Gateway 健康检查

```python
from quad_check import QuadCheckStateMachine

qc = QuadCheckStateMachine("/path/to/config.json")
results = qc.run_all()
# results: [CheckResult, CheckResult, CheckResult, CheckResult]
```

### 3. 自动回滚 (auto_rollback.py)
- 失败检测 → 自动回滚 → 告警通知
- 告警渠道: telegram / log / signal

```python
from auto_rollback import check_and_rollback

success = check_and_rollback(results, "/path/to/config.json")
# success: True (全部通过) / False (已回滚)
```

---

## 使用方法

### CLI 接口

```bash
# 检查是否需要拦截
python3 config_modification_v2.py intercept <action> <config_path>
# 例: python3 config_modification_v2.py edit ~/.openclaw/openclaw.json

# 执行四联校验
python3 config_modification_v2.py check <config_path>

# 完整修改周期 (推荐)
python3 config_modification_v2.py full-cycle <config_path>

# 手动回滚
python3 config_modification_v2.py rollback
```

### 集成到工作流

```python
# 在任何配置修改前调用
import sys
sys.path.insert(0, "~/.openclaw/workspace/skills/config-modification/")

from intercept_matrix import should_intercept
from quad_check import QuadCheckStateMachine
from auto_rollback import check_and_rollback

config_path = "~/.openclaw/openclaw.json"
action = "edit"

# 1. 拦截检查
if should_intercept(action, config_path):
    # 2. 四联校验
    qc = QuadCheckStateMachine(config_path)
    results = qc.run_all()
    
    # 3. 失败回滚
    if not check_and_rollback(results, config_path):
        print("❌ 配置修改已回滚")
        sys.exit(1)

print("✅ 配置修改安全")
```

---

## 告警规则

| 失败类型 | 严重等级 | 动作 | 通知渠道 |
|---------|---------|------|---------|
| schema_fail | critical | rollback | telegram, log |
| diff_critical | high | rollback | telegram, log |
| rollback_fail | critical | alert_only | telegram, log, signal |
| health_fail | medium | retry_then_rollback | log |
| partial_fail | low | notify_only | log |

---

## 文件结构

```
config-modification/
├── SKILL.md                 # 本文件
├── intercept_matrix.py      # 拦截矩阵
├── quad_check.py           # 四联校验
├── auto_rollback.py        # 自动回滚 + 告警
├── config_modification_v2.py # 统一入口 CLI
└── __init__.py             # 包初始化
```

---

## 版本历史

- **v2.3** (2026-03-04): 拦截矩阵 + 四联校验 + 自动回滚完整实现
- **v2.0** (2026-03-01): 双层守护架构 (fswatch + cron)
- **v1.0**: 基础回滚脚本

---

## 注意事项

1. **路径**: 所有脚本位于 `~/.openclaw/workspace/skills/config-modification/`
2. **依赖**: Python 3.9+, curl
3. **快照**: 自动保存到 `~/.openclaw/backup/snapshots/`
4. **日志**: `~/.openclaw/logs/quad-check.log`, `alerts.log`

---

*版本: 2.3.0 | 更新: 2026-03-04*
