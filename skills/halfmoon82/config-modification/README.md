# 配置文件修改安全流程 — 双层守护架构

*Config Modification Safety — Dual-Layer Guard Architecture*

---

## 这个技能解决什么问题

AI 代理拥有修改自己配置文件的权力。这既是能力，也是风险。

一个写错的 JSON 花括号，一个拼错的模型名称，一次"反正是测试"的侥幸心理——都可能让整个系统瘫痪。更糟糕的是，如果代理自己把配置搞坏了，它也随之失去了修复的能力（因为 Gateway 起不来了，代理也就不存在了）。

这就像一个外科医生在给自己做手术——你需要一个独立于你的安全网。

**核心矛盾**是：

- 你需要代理能自主修改配置（否则每次调参都要人类介入，太慢）
- 你又不能完全信任代理的每次修改都是正确的（模型会犯错，会走捷径）
- 你还不能依赖代理"记住"要走安全流程（它会忘，会觉得"这次特殊"）

所以防护机制不能建立在代理的自觉性上。它必须是**独立于代理的、始终在线的、自动触发的**。

---

## 设计思想

### 铜墙铁壁，不是规章制度

传统思路是给代理写规则："修改配置前必须备份，修改后必须验证。"

问题是，规则是写给遵守规则的人看的。代理在专注于完成任务时，很容易跳过它认为"不必要"的步骤——尤其是当它判断"这次只是个小改动"或者"这只是测试"的时候。

我们在 2026-03-01 的真实事故中验证了这一点：代理在做配置回滚测试时，跳过了启用健康检查守卫的步骤，理由是"反正是故意搞坏的"。结果 Gateway 崩溃后没有任何自动恢复机制介入，需要人类手动执行回滚命令。

**教训**：规则是第三道防线，不是第一道。第一道防线必须是不需要任何人记住、不需要任何人执行、不需要任何人同意就能工作的东西。

### 两层防御，各司其职

灵感来自工业安全中的"纵深防御"（Defense in Depth）原则：

**第一层：fswatch — 铜墙**

- 基于 macOS 内核的 kqueue 事件机制
- 配置文件每次被写入，都会在**同一秒内**检测到
- 纯 JSON 语法校验，不需要模型参与，零 token 消耗
- 语法错误？立即回滚到上一个快照。不问代理，不等确认
- 通过 LaunchAgent 注册为系统服务，进程崩溃自动重启

**第二层：cron 健康巡检 — 铁壁**

- 每 5 分钟检查一次 Gateway 是否健康
- 用最轻量的模型（Haiku），每次约 500 token
- 不健康？执行回滚脚本 → 恢复备份 → 重启 Gateway
- 连续 3 次健康？配置稳定确认，**自动禁用自身**（不浪费后续 token）
- 总成本：约 1500 token，然后归零

两层的分工是精确的：

| 故障类型 | fswatch 能防 | cron 能防 |
|----------|:---:|:---:|
| JSON 语法错误 | ✅ | 不需要 |
| 配置值错误导致 Gateway 崩溃 | 语法层看不出 | ✅ |
| 代理忘记走安全流程 | ✅（它始终在线） | 需要被启用 |

### 自动禁用：用完即走

cron 健康巡检不是永久运行的。它在配置修改后被激活，确认稳定后自动关闭。这解决了一个常见的运维问题：监控太多 → 噪音太大 → 所有人都忽略告警。

健康巡检就像手术后的 ICU 观察——你不会让病人在 ICU 住一辈子，确认恢复良好就转普通病房。

---

## 快速开始

### 安装

```bash
# 1. 复制技能文件
clawhub install config-modification

# 2. 安装 fswatch 守护（macOS LaunchAgent）
cp ~/.openclaw/workspace/.lib/com.openclaw.config-fswatch-guard.plist \
   ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.openclaw.config-fswatch-guard.plist

# 3. 验证
ps aux | grep config-fswatch-guard | grep -v grep
# 应该看到 python3 ... config-fswatch-guard.py
```

### 使用

代理修改配置时，自动触发 SKILL.md 中的 6 步流程。你只需要在第二步回答 "y"。

如果代理跳过了流程直接改文件——没关系，fswatch 在那里。

### 应急（给人类）

如果一切都崩了，打开终端：

```bash
python3 ~/.openclaw/workspace/.lib/config-rollback-guard.py rollback
openclaw gateway restart
```

两行命令，10 秒恢复。

---

## 实战记录

### 事故一：代理跳过流程（2026-03-01 18:31）

- **经过**：代理在做回滚测试时，跳过了启用 cron 健康检查的步骤
- **后果**：注入语法错误 → Gateway 反复崩溃 → 无自动恢复 → 人工介入
- **停机时间**：约 27 分钟
- **教训**：催生了 fswatch 第一层守护的设计

### 测试一：双保险竞速（2026-03-01 19:16）

- **操作**：fswatch + cron 同时在线，注入 JSON 语法错误
- **结果**：fswatch 在同一秒内检测并回滚，cron 15 分钟后确认稳定并自动关闭
- **恢复时间**：< 1 秒

### 测试二：非法注入（2026-03-01 19:31）

- **操作**：故意绕过所有安全流程，直接写坏配置
- **结果**：fswatch 在同一秒内检测并回滚
- **恢复时间**：< 1 秒
- **结论**：即使代理完全不配合，fswatch 仍然独立工作

---

## 成本分析

| 场景 | token 消耗 |
|------|-----------|
| 不修改配置（日常） | 0 |
| fswatch 拦截语法错误 | 0 |
| 修改配置后 cron 确认（3 次） | ~1500 |
| cron 检测到不健康并回滚 | ~500 |

fswatch 的运行成本是零——它是纯 Python 进程，不调用任何 LLM API。

---

## 文件清单

| 文件 | 用途 |
|------|------|
| `SKILL.md` | 完整技能规范（代理必读） |
| `README.md` | 本文档（设计思想 + 使用指南） |
| `.lib/config-fswatch-guard.py` | 第一层守护脚本（kqueue） |
| `.lib/config-rollback-guard.py` | 快照/回滚工具 |
| `.lib/gateway-auto-rollback.sh` | Gateway 自动回滚脚本 |
| `.lib/gateway-health-cron-manager.sh` | cron 健康巡检管理器 |
| `.lib/com.openclaw.config-fswatch-guard.plist` | macOS LaunchAgent 配置 |

---

## 与 Observability / Schema 能力的兼容边界（v2.1 新增）

为了避免“观测层”误接管“配置治理层”，新增如下硬边界：

- config-modification 继续持有配置主权（授权检查 + 快照 + 校验 + 回滚）
- Observability/Schema 类能力只允许：`read_only + advisory_only`
- Observability/Schema 类能力明确禁止：
  - `config.apply` / `config.patch` / `gateway.config.*`
  - 写入 `~/.openclaw/**/*.json`
  - 写入 `agents/**/models.json`

一句话：**观测负责发现问题，配置技能负责安全改配置。**

## 哲学

> 信任，但要验证。
> 
> 不，更准确地说：**不管信不信任，都要验证。**
> 
> 因为最危险的时刻，恰恰是你觉得"这次不需要验证"的时刻。

---

*Config Modification Safety Skill v2.1 — Dual-Layer Guard + Compatibility Boundary*
*Tested in production. Born from a real incident.*
