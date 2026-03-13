---
name: session-guardian
description: 对话永不丢失，任务永不混淆。解决模型掉线、Gateway重启、跨渠道混淆、任务难追踪等痛点。五层防护：增量备份（5分钟）+ 快照（1小时）+ 智能总结（每日）+ 健康检查（6小时）+ 项目管理。零Token成本，一键安装。
version: 1.0.0
author: 赛博阿昕 (Cyber Axin)
license: MIT
tags:
  - backup
  - session
  - project-management
  - multi-agent
  - data-protection
  - automation
metadata:
  openclaw:
    emoji: "🛡️"
    minVersion: "0.9.0"
---

# Session Guardian 🛡️

**对话守护者** - 企业级对话备份 + 项目管理解决方案

## 使用场景

- 🔴 **模型频繁掉线**，对话内容丢失，工作白做
- 🔴 **Gateway 重启**，不知道之前在做什么，任务状态全忘
- 🔴 **跨渠道混淆**，把私人信息发到群聊，或把群聊内容发到 DM
- 🔴 **复杂任务难追踪**，任务跨越多个 session，状态记不住
- 🔴 **多智能体协作混乱**，多个 agent 同时工作，不知道谁在做什么
- 🔴 **Session 文件过大**，导致超时、响应慢、Token 消耗大

## 快速开始

```bash
# 安装
clawhub install session-guardian

# 一键部署（自动配置所有定时任务）
cd ~/.openclaw/workspace/skills/session-guardian
bash scripts/install.sh

# 验证
crontab -l | grep session-guardian
openclaw cron list
```

## 核心功能

### 1. 对话永不丢失 📦

**问题**：模型掉线、Gateway 重启、连接器崩溃，对话丢失

**解决**：
```bash
# 增量备份（每5分钟）- 最多丢失5分钟数据
bash scripts/incremental-backup.sh

# 快照（每小时）- 可恢复到任意时刻
bash scripts/hourly-snapshot.sh

# 智能总结（每日）- AI 提取关键内容
# 自动通过 OpenClaw cron 运行
```

**效果**：零 Token 成本，完全独立运行，不影响主对话

---

### 2. 任务状态持久化 📋

**问题**：复杂任务跨越多个 session，状态记不住，进度乱套

**解决**：
```bash
# 创建任务计划
bash scripts/plan-manager.sh create "开发新功能"

# 更新进度
bash scripts/plan-manager.sh update "开发新功能" "1.1"

# 查看所有任务
bash scripts/plan-manager.sh list

# 归档已完成任务
bash scripts/plan-manager.sh archive "开发新功能"
```

**效果**：
- 自动创建 `temp/任务名-plan.md`
- 实时更新进度，不依赖 LLM 记忆
- 跨 session 可追踪，完成后自动归档

---

### 3. 防止跨渠道泄露 🔒

**问题**：把私人信息发到群聊，或把群聊内容发到 DM

**解决**：
```bash
# 检查所有 agent 的 Session 隔离状态
bash scripts/session-isolation-check.sh check

# 验证单个 agent
bash scripts/session-isolation-check.sh validate main

# 生成详细报告
bash scripts/session-isolation-check.sh report
```

**效果**：
- 强制检查 `inbound_meta`（渠道、用户、session）
- 自动检测跨 session 引用，立即告警
- 保护隐私安全，防止信息泄露

---

### 4. Gateway 重启自动恢复 🔄

**问题**：Gateway 重启后不知道之前在做什么，任务状态全忘

**解决**：
```bash
# 健康检查（包含 GatewayRestart 检查）
bash scripts/health-check.sh
```

**效果**：
- 自动检测 Gateway 重启
- 检查恢复文件（`temp/recovery-*.json`）
- 检查所有未完成任务
- 主动汇报，不静默

---

### 5. 自动维护健康 🏥

**问题**：session 文件过大（几 MB），导致超时、响应慢

**解决**：
```bash
# 自动运行（每6小时）
# 或手动运行
bash scripts/health-check.sh
```

**效果**：
- 自动清理 >1MB 的 session 文件
- 自动修复缺失的 defaultModel 配置
- 磁盘空间监控，提前预警
- 自动推送告警

---

## 五层防护体系

| 层级 | 频率 | 功能 | Token 成本 |
|------|------|------|-----------|
| 增量备份 | 每5分钟 | 最多丢失5分钟数据 | 0 |
| 快照 | 每小时 | 可恢复到任意时刻 | 0 |
| 智能总结 | 每日 | AI 提取关键内容 | 少量 |
| 健康检查 | 每6小时 | 清理、修复、监控 | 0 |
| 项目管理 | 实时 | 任务追踪、Session 隔离 | 0 |

---

## 实战案例

### 案例1：多智能体协作项目

**场景**：建设智能巡检产品，涉及多个 agent 协作

```bash
# 1. 创建项目计划
bash scripts/plan-manager.sh create "智能巡检产品v1.0"

# 2. 分配任务给不同 agent
# - 安防AI产品军团：流程设计
# - 开发军团UI设计师：界面设计
# - 开发军团全栈开发：代码实现

# 3. 每个 agent 完成任务后更新进度
bash scripts/plan-manager.sh update "智能巡检产品v1.0" "1.1"

# 4. 定期检查 Session 隔离
bash scripts/session-isolation-check.sh check

# 5. 项目完成后归档
bash scripts/plan-manager.sh archive "智能巡检产品v1.0"
```

---

### 案例2：多渠道运营

**场景**：同时使用 Web 和钉钉，需要防止跨渠道泄露

```bash
# 1. 定期检查 Session 隔离
bash scripts/session-isolation-check.sh check

# 2. 生成报告（每周一次）
bash scripts/session-isolation-check.sh report

# 3. 健康检查会自动清理过大的 session 文件
bash scripts/health-check.sh
```

---

## 恢复数据

### 从增量备份恢复（最新数据）

```bash
bash scripts/restore.sh --source incremental
```

### 从快照恢复（1小时前）

```bash
bash scripts/restore.sh --source hourly --timestamp 2026-03-03-14
```

### 恢复特定 agent

```bash
bash scripts/restore.sh --source incremental --agent track-lead
```

---

## 配置选项

### 备份频率

编辑 `scripts/config.sh`：

```bash
# 增量备份间隔（分钟）
INCREMENTAL_INTERVAL=5

# 快照间隔（小时）
HOURLY_INTERVAL=1

# 健康检查间隔（小时）
HEALTH_CHECK_INTERVAL=6
```

### 保留策略

```bash
# 增量备份保留时间（天）
INCREMENTAL_KEEP_DAYS=7

# 快照保留时间（小时）
HOURLY_KEEP_HOURS=24

# 每日总结保留时间（天，0=永久）
DAILY_KEEP_DAYS=0
```

---

## 核心优势

- ✅ **零 Token 成本** - 备份和快照不调用 LLM
- ✅ **不影响主对话** - 使用系统 crontab，完全独立运行
- ✅ **自动清理** - 智能管理磁盘空间
- ✅ **一键恢复** - 快速回滚到任意时刻
- ✅ **完整文档** - 使用示例、实战案例、故障排除

---

## 适用场景

| 场景 | 痛点 | 解决方案 |
|------|------|----------|
| 多智能体协作 | 任务状态难追踪 | 计划文件机制 |
| 多渠道运营 | 跨渠道混淆 | Session 隔离检查 |
| 长期项目 | 数据丢失风险 | 五层防护体系 |
| 模型不稳定 | 频繁掉线 | 增量备份 + 快照 |
| Gateway 重启 | 任务状态丢失 | 自动恢复机制 |

---

### 1. 计划文件机制 📋
- 复杂任务自动创建计划文件（`temp/任务名-plan.md`）
- 每完成一步自动更新进度
- Context 压缩时依赖文件而非记忆
- 完成后自动归档到 `Assets/Projects/`

**为什么重要**：复杂任务跨越多个 session 时，计划文件是唯一可靠的状态记录。

### 2. Session 隔离规则 🔒
- 每次回复前检查 `inbound_meta`（渠道、用户、session）
- 只基于当前 session 的聊天记录和文件
- 禁止跨 session 查找 context（除非明确指定）
- 防止把私人信息发到群聊，或把群聊信息发到 DM

**为什么重要**：防止跨 session/跨渠道混淆，保护隐私和数据安全。

### 3. GatewayRestart 强制恢复 🔄
- 检测到 Gateway 重启时立即汇报
- 自动检查恢复文件（`temp/recovery-*.json`）
- 检查所有 session 的最后一条消息
- 继续推进未完成任务，不静默

**为什么重要**：Gateway 重启后不能静默，必须恢复所有未完成的工作。

---

## 为什么需要这个 Skill？

### 真实场景
- 🔴 **模型 API 掉线**：对话进行到一半，API 超时，未保存的对话丢失
- 🔴 **Gateway 重启**：手动重启或崩溃，内存中的数据未写入磁盘
- 🔴 **连接器崩溃**：Telegram/钉钉/飞书等连接器频繁重启，消息可能丢失
- 🔴 **误删文件**：手动清理时不小心删除了重要对话记录
- 🔴 **需要复盘**：准备分享材料，但历史对话已经找不到了
- 🔴 **跨 Session 混淆**：把私人信息发到群聊，或把群聊信息发到 DM
- 🔴 **任务状态丢失**：复杂任务跨多个 session，状态难以追踪

### 传统方案的问题
- ❌ **每天备份一次**：模型可能一天掉线多次，最多丢失24小时数据
- ❌ **手动备份**：容易忘记，不可靠
- ❌ **只备份不总结**：有原始数据但难以快速回顾
- ❌ **没有恢复机制**：备份了但不知道怎么恢复
- ❌ **没有 Session 隔离**：容易跨 session 混淆
- ❌ **没有任务管理**：复杂任务状态难以追踪

### Session Guardian v1.0 的解决方案

**五层防护体系**：
1. **增量备份**（每5分钟）：最多丢失5分钟数据
2. **快照**（每小时）：可恢复到任意时刻
3. **智能总结**（每日）：AI 提取关键对话、决策、成果
4. **健康检查**（每6小时）：自动清理过大 session、检查配置、恢复任务
5. **项目管理**（新增）：计划文件 + Session 隔离 + GatewayRestart 恢复

**核心优势**：
- ✅ **零 Token 成本**：备份和快照是纯脚本，不调用 LLM
- ✅ **不影响主对话**：使用系统 crontab，完全独立运行
- ✅ **自动清理**：智能管理磁盘空间，不会无限增长
- ✅ **一键恢复**：提供恢复脚本，快速回滚到任意时刻
- ✅ **Session 隔离**：防止跨 session/跨渠道混淆
- ✅ **任务管理**：计划文件机制，复杂任务状态可追踪
- ✅ **跨平台**：支持 macOS、Linux、Windows（WSL）

## 快速开始

### 1. 安装

```bash
# 从 ClawHub 安装
clawhub install session-guardian

# 或从 GitHub 安装
git clone https://github.com/lobster-studio/session-guardian.git ~/.openclaw/workspace/skills/session-guardian
```

### 2. 一键部署

```bash
cd ~/.openclaw/workspace/skills/session-guardian
bash scripts/install.sh
```

**安装脚本会自动**：
1. ✅ 创建备份目录结构
2. ✅ 测试备份功能
3. ✅ 添加系统 crontab（增量 + 快照）
4. ✅ 添加 OpenClaw cron（每日总结）
5. ✅ 生成配置文件

### 3. 验证安装

```bash
# 查看系统 crontab
crontab -l | grep session-guardian

# 查看 OpenClaw cron
openclaw cron list

# 查看备份
ls -lh ~/.openclaw/workspace/Assets/SessionBackups/
```

## 三层防护详解

### 第1层：增量备份（每5分钟）

**原理**：使用 `rsync` 增量同步，只传输变化的部分

**特点**：
- 📊 **最小开销**：只备份有变化的文件
- ⚡ **极快速度**：通常 < 1 秒完成
- 💾 **节省空间**：不重复存储相同内容
- 🔒 **文件锁保护**：避免备份时文件正在写入

**配置**：
```bash
# 系统 crontab
*/5 * * * * bash /path/to/incremental-backup.sh >> /path/to/backup.log 2>&1
```

**查看备份**：
```bash
ls -lh Assets/SessionBackups/incremental/
# 输出示例：
# main_834d8c23.jsonl          1.8M
# track-lead_bf87873a.jsonl   4.9M
# dev-lead_302f8efe.jsonl     4.2M
```

### 第2层：快照（每小时）

**原理**：完整备份所有对话，压缩存储，带时间戳

**特点**：
- 📸 **时光机**：可恢复到任意小时
- 🗜️ **高压缩比**：通常压缩到原大小的 10-20%
- 🔄 **自动清理**：保留最近24小时，自动删除旧快照
- 📦 **独立归档**：每个快照是独立的 tar.gz 文件

**配置**：
```bash
# 系统 crontab
0 * * * * bash /path/to/hourly-snapshot.sh >> /path/to/backup.log 2>&1
```

**查看快照**：
```bash
ls -lh Assets/SessionBackups/hourly/
# 输出示例：
# 2026-03-02-13.tar.gz  8.7M
# 2026-03-02-14.tar.gz  9.1M
# 2026-03-02-15.tar.gz  9.3M
```

### 第3层：智能总结（每日凌晨2点）

**原理**：使用 LLM 分析当天所有对话，生成结构化总结

**特点**：
- 🤖 **AI 驱动**：自动提取关键对话、决策、成果
- 📝 **Markdown 格式**：易于阅读和分享
- 💰 **成本优化**：使用阿里云 qwen-max（便宜且稳定）
- 📤 **自动推送**：可选推送到用户最后使用的渠道（Web/Telegram/钉钉/飞书等）

**配置**：
```bash
# OpenClaw cron（隔离模式，不影响主对话）
openclaw cron add \
  --name "Session Guardian 每日总结" \
  --cron "0 2 * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "生成今天的对话总结" \
  --model "claude-opus-4-6" \
  --announce
```

**推送说明**：
- 默认使用 `--announce`（不指定 `--channel`），自动推送到用户最后使用的渠道
- 无论用户用 Web、Telegram、钉钉、飞书还是其他渠道，都能收到通知
- 如果需要指定渠道，可以添加 `--channel telegram --to "123456789"`

**总结内容**：
```markdown
# 2026-03-02 每日总结

## 统计
- 总消息数: 1,422
- 参与 Agent: 5 个（King, track-lead, dev-lead, dev-ui-designer, finance-lead）
- 活跃时段: 09:00-18:00

## 主要成果
1. ✅ 创建 yolo-local skill（完全本地目标检测）
2. ✅ 测试 YOLO 准确率（100%，5/5 场景）
3. ✅ 下载 YOLOv8s 和 YOLOv8m 模型
4. ✅ 部署 session-guardian skill

## 关键决策
1. 决策：使用 YOLOv8m 作为默认模型（高精度）
   - 依据：准确率 97%+，速度可接受（200-300ms）
   - 执行：已下载并配置

2. 决策：备份策略采用三层防护
   - 依据：模型不稳定，需要多重保险
   - 执行：增量（5分钟）+ 快照（1小时）+ 总结（每日）

## 军团协作
- **安防AI产品军团**：完成 YOLO 测试，发送带检测框图片到钉钉
- **开发军团**：设计指挥中枢（数字孪生风格）
- **King**：路由任务，验收成果，沉淀资产

## 技术亮点
- YOLO 检测速度：50-80ms（M2 CPU）
- 备份压缩比：8.7MB（压缩后）/ 45MB（原始）≈ 19%
- 增量备份速度：< 1 秒（12 个文件）

## 待办事项
- [ ] 下午 2-5 点测试 YOLO（办公高峰期）
- [ ] 集成 YOLO 到自动巡检流程
- [ ] 优化融合 prompt（YOLO + 多模态）
```

### 第4层：健康检查（每6小时）⭐ 新增

**原理**：自动检测并修复 session 和配置问题

**特点**：
- 🔍 **Session 文件监控**：自动清理 >1MB 的过大文件（防止上下文爆炸）
- ⚙️ **配置完整性检查**：自动修复缺失的 defaultModel 配置
- 💾 **磁盘空间监控**：提前预警空间不足（< 1GB）
- 🏥 **Gateway 状态检查**：确保 Gateway 正常运行
- 🚨 **自动告警推送**：发现问题立即通知

**解决的真实问题**：
```
❌ 问题：dev-lead 的 session 文件达到 4.8MB
   → 每次调用都要加载巨大的历史记录
   → 导致超时、响应慢、Token 消耗大

✅ 解决：自动清理 >1MB 的 session 文件
   → 备份到专门目录后删除
   → 恢复正常响应速度（4秒内）

❌ 问题：dev-lead 缺少 defaultModel 配置
   → 使用了不确定的默认模型
   → 导致频繁超时

✅ 解决：自动检查并添加 defaultModel
   → 确保所有 agent 使用稳定的 provider
```

**配置**：
```bash
# 系统 crontab（每6小时）
0 */6 * * * bash /path/to/health-check.sh >> /path/to/health-check.log 2>&1
```

**手动执行**：
```bash
bash scripts/health-check.sh
```

**健康报告示例**：
```
# Session Guardian 健康检查报告
生成时间: 2026-03-03 12:00:00

## 检查项目
1. Session 文件大小
2. Agent 配置完整性
3. 磁盘空间
4. Gateway 状态

## 告警信息
[ALERT] [dev-lead] 发现 1 个过大的 session 文件 (>1MB)
  清理: 302f8efe-99c6-43a0-a1d7-05a095b24a5d.jsonl (4.8M)
[ALERT] [dev-lead] 缺少 defaultModel 配置
  自动添加 defaultModel: opencode/claude-opus-4-6
[ALERT] 总计清理 1 个过大的 session 文件
```

**配置项**（config.sh）：
```bash
# Session 文件大小限制（MB）
SESSION_SIZE_LIMIT_MB=1

# 默认模型（用于自动修复）
DEFAULT_MODEL="opencode/claude-opus-4-6"

# 健康检查间隔（小时）
HEALTH_CHECK_INTERVAL=6

# 推送告警
PUSH_CHANNEL="last"  # 自动推送到用户最后使用的渠道
PUSH_TARGET=""       # 留空即可
```

---

## 核心功能详解 ⭐

### 第5层：计划文件机制 📋

**原理**：为复杂任务创建独立的计划文件，记录任务状态、进度、风险

**特点**：
- 📝 **自动创建**：复杂任务（预计>30分钟或跨多个session）自动创建计划文件
- 📊 **实时更新**：每完成一个子任务，自动更新进度
- 🗂️ **自动归档**：任务完成后归档到 `Assets/Projects/`
- 🔍 **健康检查**：自动检测过期计划文件（>7天未更新）

**使用方法**：

```bash
# 创建计划文件
bash scripts/plan-manager.sh create "智能巡检产品演示材料"

# 更新子任务状态
bash scripts/plan-manager.sh update "智能巡检产品演示材料" "1.1"

# 列出所有计划文件
bash scripts/plan-manager.sh list

# 显示计划文件内容
bash scripts/plan-manager.sh show "智能巡检产品演示材料"

# 归档已完成的计划文件
bash scripts/plan-manager.sh archive "智能巡检产品演示材料"

# 清理旧的计划文件（>30天）
bash scripts/plan-manager.sh clean
```

**计划文件示例**：

```markdown
# 智能巡检产品演示材料 - 任务计划

**创建时间**: 2026-03-03 13:50
**预计完成**: 2026-03-03 15:00
**负责人**: King
**状态**: 进行中

---

## 任务目标

整合多个核心机制，提供完整的备份和项目管理能力

---

## 子任务清单

### 阶段1：核心功能开发
- [x] 1.1 新增 scripts/plan-manager.sh
- [x] 1.2 新增 templates/task-plan-template.md
- [x] 1.3 修改 scripts/health-check.sh
- [x] 1.4 新增 scripts/session-isolation-check.sh

### 阶段2：文档更新
- [ ] 2.1 更新 SKILL.md
- [ ] 2.2 新增"计划文件机制"章节
...

---

## 当前进度

**状态**: 进行中
**当前阶段**: 阶段2
**完成度**: 4/26

---

## 下一步行动

1. 更新 SKILL.md 文档
2. 测试所有新功能
3. 自测并汇报

---

**最后更新**: 2026-03-03 14:30
```

**为什么重要**：
- 复杂任务跨越多个 session 时，计划文件是唯一可靠的状态记录
- Context 压缩时依赖文件而非记忆，避免信息丢失
- 团队协作时，计划文件是共享任务状态的最佳方式

---

### Session 隔离规则 🔒

**原理**：强制检查 session 上下文，防止跨 session/跨渠道混淆

**核心规则**：
1. 每次回复前必须检查 `inbound_meta`（渠道、用户、session）
2. 只基于当前 session 的聊天记录和文件
3. 禁止跨 session 查找 context（除非明确指定）
4. 禁止假设 context（如"你之前说过..."）
5. 跨渠道推送必须明确指定 target

**使用方法**：

```bash
# 检查当前 Session 隔离状态
bash scripts/session-isolation-check.sh check

# 验证指定 agent 的 Session 隔离
bash scripts/session-isolation-check.sh validate main

# 生成 Session 隔离报告
bash scripts/session-isolation-check.sh report
```

**检查报告示例**：

```markdown
# Session隔离检查报告

**生成时间**: 2026-03-03 14:00:00

---

## 检查结果

### [main]
- ✅ AGENTS.md包含Session隔离规则
- ✅ Session文件数量: 3
- ✅ Session文件大小正常

### [track-lead]
- ❌ AGENTS.md缺少Session隔离规则
- ⚠️ Session文件数量: 12（建议清理）
- ✅ Session文件大小正常

---

## 总结

- 总计检查: 16 个agent
- 通过检查: 14 个agent
- 通过率: 87.5%

---

## 建议

1. 为所有agent的AGENTS.md添加Session隔离规则
2. 定期清理过大的Session文件（>1MB）
3. 定期清理旧的Session文件（>30天）
```

**为什么重要**：
- 防止把私人信息发到群聊
- 防止把群聊信息发到 DM
- 保护用户隐私和数据安全
- 避免 agent 混淆不同 session 的上下文

---

### GatewayRestart 强制恢复 🔄

**原理**：检测 Gateway 重启，自动恢复未完成任务

**恢复流程**：
1. 检测到 Gateway 重启（session 历史断层）
2. 立即汇报重启原因和时间
3. 检查恢复文件（`temp/recovery-*.json`）
4. 检查 `memory/YYYY-MM-DD.md` 中的未完成任务
5. 检查所有 session 的最后一条消息
6. 继续推进任务，不静默

**自动检查**：

健康检查脚本会自动检测 Gateway 重启：

```bash
# 每6小时自动运行
0 */6 * * * bash /path/to/health-check.sh
```

**手动检查**：

```bash
# 运行健康检查（包含 GatewayRestart 检查）
bash scripts/health-check.sh
```

**恢复文件格式**：

```json
{
  "timestamp": "2026-03-03T14:00:00+08:00",
  "reason": "manual_restart",
  "pending_tasks": [
    {
      "task_name": "智能巡检产品演示材料",
      "status": "进行中",
      "progress": "4/26",
      "last_update": "2026-03-03 13:50"
    }
  ],
  "sessions": [
    {
      "agent": "main",
      "last_message": "开始使用 session-guardian",
      "timestamp": "2026-03-03 13:45"
    }
  ]
}
```

**为什么重要**：
- Gateway 重启后不能静默，必须恢复所有未完成的工作
- 自动检查恢复文件和任务状态，避免遗漏
- 主动汇报重启原因，让用户知道发生了什么

---

## 目录结构

```
Assets/SessionBackups/
├── incremental/              # 增量备份（每5分钟）
│   ├── main_834d8c23.jsonl
│   ├── track-lead_bf87873a.jsonl
│   └── ...
├── hourly/                   # 快照（每小时）
│   ├── 2026-03-02-13.tar.gz
│   ├── 2026-03-02-14.tar.gz
│   └── ...
├── daily/                    # 每日总结（永久保留）
│   ├── 2026-03-02/
│   │   ├── raw/             # 原始 JSONL
│   │   ├── summary/         # AI 总结
│   │   │   ├── daily-summary.md
│   │   │   ├── key-decisions.md
│   │   │   └── achievements.md
│   │   └── 2026-03-02.tar.gz
│   └── ...
├── large-sessions/           # 过大的 session 文件备份
│   └── 20260303/
│       └── dev-lead_302f8efe.jsonl
├── session-isolation-report-*.md  # Session 隔离报告
├── health-report-*.txt       # 健康检查报告
├── backup.log                # 备份日志
└── health-check.log          # 健康检查日志

temp/                         # 计划文件目录
├── 智能巡检产品演示材料-plan.md
├── session-guardian-upgrade-plan.md
└── recovery-*.json           # 恢复文件

Assets/Projects/              # 已完成任务归档
├── 智能巡检产品演示材料-plan-20260303.md
└── ...
```

## 恢复数据

### 场景1：恢复最新数据（增量备份）

```bash
# 恢复所有 agent 的最新对话
bash scripts/restore.sh --source incremental --target all

# 或手动恢复
cp Assets/SessionBackups/incremental/*.jsonl ~/.openclaw/agents/*/sessions/
```

### 场景2：恢复到特定时刻（快照）

```bash
# 恢复到今天 14:00
bash scripts/restore.sh --source hourly --timestamp 2026-03-02-14

# 或手动恢复
tar -xzf Assets/SessionBackups/hourly/2026-03-02-14.tar.gz -C /tmp/
cp /tmp/2026-03-02-14/*/*.jsonl ~/.openclaw/agents/*/sessions/
```

### 场景3：恢复特定 Agent

```bash
# 只恢复 track-lead 的对话
bash scripts/restore.sh --source incremental --agent track-lead

# 或手动恢复
cp Assets/SessionBackups/incremental/track-lead_*.jsonl ~/.openclaw/agents/track-lead/sessions/
```

### 场景4：恢复到特定日期（每日总结）

```bash
# 恢复 2026-03-01 的所有对话
bash scripts/restore.sh --source daily --date 2026-03-01

# 或手动恢复
tar -xzf Assets/SessionBackups/daily/2026-03-01/2026-03-01.tar.gz -C /tmp/
cp /tmp/2026-03-01/raw/*.jsonl ~/.openclaw/agents/*/sessions/
```

## 配置选项

### 备份频率

编辑 `scripts/config.sh`：

```bash
# 增量备份间隔（分钟）
INCREMENTAL_INTERVAL=5

# 快照间隔（小时）
HOURLY_INTERVAL=1

# 每日总结时间（cron 表达式）
DAILY_SUMMARY_CRON="0 2 * * *"
```

### 保留策略

编辑 `scripts/config.sh`：

```bash
# 增量备份保留时间（天）
INCREMENTAL_KEEP_DAYS=7

# 快照保留时间（小时）
HOURLY_KEEP_HOURS=24

# 每日总结保留时间（天，0=永久）
DAILY_KEEP_DAYS=0
```

### 备份路径

编辑 `scripts/config.sh`：

```bash
# 默认路径
BACKUP_ROOT="$HOME/.openclaw/workspace/Assets/SessionBackups"

# 可改为外部磁盘（推荐）
BACKUP_ROOT="/Volumes/ExternalDrive/OpenClawBackups"
```

### 总结模型

编辑 `scripts/config.sh`：

```bash
# 默认使用 Claude Opus 4.6（效果最好）
SUMMARY_MODEL="claude-opus-4-6"

# 可选其他模型
# SUMMARY_MODEL="qwen-max"         # 阿里云（便宜）
# SUMMARY_MODEL="gpt-4o"           # OpenAI
# SUMMARY_MODEL="deepseek-chat"    # DeepSeek（便宜）
# SUMMARY_MODEL="gemini-2.0-flash" # Google（快速）
```

### 推送渠道

编辑 `scripts/config.sh`：

```bash
# 推荐：自动推送到用户最后使用的渠道
DELIVERY_CHANNEL="last"
DELIVERY_TARGET=""

# 或指定具体渠道：
# DELIVERY_CHANNEL="telegram"
# DELIVERY_TARGET="-1001234567890"

# DELIVERY_CHANNEL="webchat"  # Web 控制台（所有用户都有）
# DELIVERY_TARGET=""

# DELIVERY_CHANNEL="discord"
# DELIVERY_TARGET="channel:123456789"

# DELIVERY_CHANNEL="dingtalk-connector"  # 钉钉
# DELIVERY_TARGET="user:2729293505776209"

# DELIVERY_CHANNEL="feishu"  # 飞书
# DELIVERY_TARGET="user:ou_xxx"
```

**推送说明**：
- `"last"` 渠道会自动推送到用户最后使用的渠道（推荐）
- 适配所有用户，无论用 Web、Telegram、钉钉、飞书还是其他渠道
- 如果需要固定推送到某个渠道，可以指定具体渠道

## 监控与告警

### 查看备份状态

```bash
# 查看日志
tail -f Assets/SessionBackups/backup.log

# 查看最近的备份
bash scripts/status.sh

# 输出示例：
# === Session Guardian 状态 ===
# 增量备份: 最后运行 2 分钟前, 成功 12 个文件
# 快照备份: 最后运行 15 分钟前, 大小 8.7M
# 每日总结: 最后运行 14 小时前, 已发送钉钉
# 磁盘使用: 234M / 10G (2.3%)
```

### 健康检查

```bash
# 运行健康检查
bash scripts/health-check.sh

# 检查项：
# ✅ 备份目录存在
# ✅ 增量备份文件数量正常（> 3）
# ✅ 快照文件存在
# ✅ 磁盘空间充足（> 1GB）
# ✅ crontab 配置正确
# ✅ OpenClaw cron 任务存在
```

### 告警配置（可选）

编辑 `scripts/config.sh`：

```bash
# 启用告警（推送到用户最后使用的渠道）
ALERT_ENABLED=true
ALERT_CHANNEL="last"  # 或指定具体渠道

# 告警条件
ALERT_ON_BACKUP_FAIL=true      # 备份失败
ALERT_ON_LOW_SPACE=true        # 磁盘空间不足（< 1GB）
ALERT_ON_FILE_COUNT_LOW=true   # 备份文件数量异常（< 3）
```

## 性能优化

### 增量备份优化

- **rsync 增量传输**：只传输变化的部分，不是整个文件
- **文件锁机制**：避免并发备份，防止数据损坏
- **超时保护**：单个文件备份超时 10 秒自动跳过
- **错误重试**：失败后 5 秒重试，最多 3 次

### 快照优化

- **多线程压缩**：使用 `pigz` 替代 `gzip`（快 3-4 倍）
- **增量压缩**：使用 `tar --listed-incremental` 只压缩变化
- **硬链接**：相同文件不重复存储（节省 50-70% 空间）

### 磁盘空间管理

- **自动清理**：超过保留期的备份自动删除
- **压缩比优化**：通常压缩到原大小的 10-20%
- **外部存储**：支持挂载外部磁盘或 NAS

**预估空间占用**（以 50MB 原始数据为例）：
- 增量备份：50MB（最新版本）
- 快照（24小时）：24 × 10MB（压缩后）= 240MB
- 每日总结（30天）：30 × 10MB = 300MB
- **总计**：约 600MB

## 故障场景测试

### 场景1：模型 API 掉线

**模拟**：
```bash
# 模拟 API 超时
curl -X POST http://localhost:18789/api/test-timeout
```

**防护**：
- 增量备份每 5 分钟同步已写入的数据
- 最大损失：5 分钟内的对话

**恢复**：
```bash
bash scripts/restore.sh --source incremental
```

### 场景2：Gateway 重启

**模拟**：
```bash
# 重启 Gateway
openclaw gateway restart
```

**防护**：
- `.jsonl` 文件已持久化，重启后自动加载
- 最大损失：0（OpenClaw 自动恢复）

**验证**：
```bash
# 检查会话是否恢复
openclaw sessions list
```

### 场景3：连接器崩溃

**模拟**：
```bash
# 模拟连接器崩溃（以钉钉为例）
kill -9 $(ps aux | grep dingtalk-connector | awk '{print $2}')
```

**防护**：
- 增量备份 + 快照双重保险
- 最大损失：5 分钟内的消息

**恢复**：
```bash
bash scripts/restore.sh --source hourly --timestamp $(date +%Y-%m-%d-%H)
```

### 场景4：误删文件

**模拟**：
```bash
# 误删 track-lead 的对话
rm ~/.openclaw/agents/track-lead/sessions/*.jsonl
```

**防护**：
- 增量备份 + 快照 + 每日总结三重保险

**恢复**：
```bash
# 从增量备份恢复
bash scripts/restore.sh --source incremental --agent track-lead

# 或从快照恢复（1小时前）
bash scripts/restore.sh --source hourly --timestamp 2026-03-02-14 --agent track-lead
```

## 高级功能

### 1. 按军团分类总结

```bash
# 生成按军团分类的总结
bash scripts/daily-summary.sh --by-legion

# 输出：
# Assets/SessionBackups/daily/2026-03-02/summary/
# ├── strategic-legion.md      # 战略军团总结
# ├── track-legion.md          # 安防AI产品军团总结
# ├── finance-legion.md        # 金融军团总结
# └── ...
```

### 2. 生成分享材料

```bash
# 生成适合分享的 Markdown 文档
bash scripts/generate-share.sh 2026-03-02

# 输出：
# Assets/SessionBackups/daily/2026-03-02/share/
# ├── 如何通过对话建设军团.md
# ├── 如何通过对话建设巡检产品.md
# └── 关键对话片段.md
```

### 3. 导出为 PDF

```bash
# 导出每日总结为 PDF
bash scripts/export-pdf.sh 2026-03-02

# 输出：
# Assets/SessionBackups/daily/2026-03-02/
# └── 2026-03-02-summary.pdf
```

### 4. 远程备份

```bash
# 同步到远程服务器（rsync over SSH）
bash scripts/remote-sync.sh --host backup.example.com --user backup

# 或同步到云存储（rclone）
bash scripts/remote-sync.sh --rclone-remote "s3:my-bucket/openclaw-backups"
```

### 5. 备份加密

```bash
# 启用 GPG 加密
bash scripts/install.sh --enable-encryption --gpg-key "your@email.com"

# 加密后的备份：
# 2026-03-02-13.tar.gz.gpg
```

## 故障排除

### 问题1：备份失败

**症状**：
```
[ERROR] 增量备份失败: rsync: failed to connect
```

**解决**：
```bash
# 检查权限
ls -ld ~/.openclaw/agents/*/sessions/

# 检查磁盘空间
df -h Assets/SessionBackups/

# 手动运行测试
bash scripts/incremental-backup.sh --verbose
```

### 问题2：crontab 未执行

**症状**：
```
crontab -l  # 显示任务存在
# 但备份日志没有更新
```

**解决**：
```bash
# 检查 cron 服务是否运行（macOS）
sudo launchctl list | grep cron

# 检查日志
tail -f /var/log/cron.log  # Linux
tail -f /var/log/system.log | grep cron  # macOS

# 测试 crontab 路径
which bash  # 确保路径正确
```

### 问题3：OpenClaw cron 未运行

**症状**：
```
openclaw cron list  # 显示任务存在
# 但每日总结没有生成
```

**解决**：
```bash
# 检查 Gateway 是否运行
openclaw status

# 手动运行任务
openclaw cron run <job-id> --force

# 查看运行历史
openclaw cron runs --id <job-id>
```

### 问题4：磁盘空间不足

**症状**：
```
[ERROR] 快照备份失败: No space left on device
```

**解决**：
```bash
# 手动清理旧备份
bash scripts/cleanup.sh --force

# 调整保留策略
vim scripts/config.sh
# HOURLY_KEEP_HOURS=12  # 从 24 改为 12

# 移动到外部磁盘
vim scripts/config.sh
# BACKUP_ROOT="/Volumes/ExternalDrive/OpenClawBackups"
```

### 问题5：恢复失败

**症状**：
```
[ERROR] 恢复失败: 找不到备份文件
```

**解决**：
```bash
# 检查备份是否存在
ls -lh Assets/SessionBackups/incremental/
ls -lh Assets/SessionBackups/hourly/

# 验证备份完整性
bash scripts/verify-backup.sh

# 尝试从不同时间点恢复
bash scripts/restore.sh --source hourly --list  # 列出所有快照
bash scripts/restore.sh --source hourly --timestamp 2026-03-02-13
```

## 最佳实践

### 1. 定期验证备份

```bash
# 每周运行一次验证
bash scripts/verify-backup.sh

# 添加到 crontab
0 0 * * 0 bash /path/to/verify-backup.sh
```

### 2. 测试恢复流程

```bash
# 每月测试一次恢复（使用测试环境）
bash scripts/restore.sh --source hourly --timestamp latest --dry-run
```

### 3. 监控磁盘空间

```bash
# 设置告警阈值
vim scripts/config.sh
# ALERT_DISK_THRESHOLD_GB=1  # 低于 1GB 告警
```

### 4. 外部存储

```bash
# 推荐使用外部磁盘或 NAS
vim scripts/config.sh
# BACKUP_ROOT="/Volumes/ExternalDrive/OpenClawBackups"
```

### 5. 加密敏感数据

```bash
# 如果对话包含敏感信息，启用加密
bash scripts/install.sh --enable-encryption
```

## 与其他 Skills 的集成

### 与 openclaw-backup 的区别

| 特性 | session-guardian | openclaw-backup |
|------|------------------|-----------------|
| 备份对象 | 对话记录（.jsonl） | 整个 ~/.openclaw/ |
| 备份频率 | 每5分钟 + 每小时 + 每日 | 手动或每日 |
| 恢复粒度 | 按 agent、按时刻 | 全量恢复 |
| AI 总结 | ✅ 支持 | ❌ 不支持 |
| 适用场景 | 对话数据保护 | 完整系统备份 |

**推荐**：两者配合使用
- `session-guardian`：保护对话数据（高频）
- `openclaw-backup`：保护系统配置（低频）

### 与 session-logs 的区别

| 特性 | session-guardian | session-logs |
|------|------------------|--------------|
| 功能 | 备份 + 恢复 + 总结 | 搜索 + 分析 |
| 数据来源 | 实时备份 | 读取现有日志 |
| 防护能力 | ✅ 防止数据丢失 | ❌ 不防护 |
| 适用场景 | 数据保护 | 历史查询 |

**推荐**：两者配合使用
- `session-guardian`：保护数据不丢失
- `session-logs`：查询历史对话

## 贡献指南

欢迎贡献代码、报告问题、提出建议！

### 开发环境

```bash
# Clone 仓库
git clone https://github.com/cyber-axin/session-guardian.git
cd session-guardian

# 运行测试
bash scripts/test.sh

# 安装
bash scripts/install.sh
```

### 提交 Pull Request

1. Fork 仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 报告问题

请在 [GitHub Issues](https://github.com/cyber-axin/session-guardian/issues) 提交问题，包含：
- OpenClaw 版本：`openclaw --version`
- 操作系统：`uname -a`
- 错误日志：`tail -50 Assets/SessionBackups/backup.log`
- 复现步骤

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 致谢

- OpenClaw 团队：提供强大的 Gateway 和 Cron 机制
- 社区贡献者：感谢所有提出建议和报告问题的用户

## 作者

**赛博阿昕 (Cyber Axin)** 🦞

Lobster Studio 创始人，通过 AI 对话建设多智能体军团，探索 AI 协作的可能性。

**King（龙虾之王）** 是赛博阿昕打造的主控 AI Agent，负责路由、拆解、派发、验收、沉淀，统筹整个 Lobster Studio 的五大智能体军团（战略、安防AI产品、金融交易、新媒体运营、开发）。

这个 skill 诞生于真实需求：在建设安防AI产品军团、金融交易军团的过程中，模型频繁掉线导致对话丢失，需要一个可靠的备份方案。

v1.0 是在实际使用中发现的需求：复杂任务跨越多个 session 时状态难以追踪，跨渠道使用时容易混淆，Gateway 重启后任务丢失。因此提供了完整的项目管理和 Session 隔离能力。

## 更新日志

### v1.0.0 (2026-03-03)
- ✨ **五层防护体系**：增量备份 + 快照 + 智能总结 + 健康检查 + 项目管理
- ✨ **计划文件机制**：复杂任务状态管理（`scripts/plan-manager.sh`）
- ✨ **Session 隔离检查**：防止跨 session/跨渠道混淆（`scripts/session-isolation-check.sh`）
- ✨ **GatewayRestart 强制恢复**：自动恢复未完成任务
- ✨ **健康检查**：自动清理、修复配置、恢复任务
- ✨ **一键安装**：完整的安装和配置脚本
- ✨ **完整文档**：使用示例、实战案例、故障排除
- 🎯 **设计理念**：基于 Lobster Studio 多智能体军团协作的实战经验

## 联系方式

- **Email**：zhuangxin@szbit.cn
- **WeChat**：sixsixsix_666-
- **GitHub**：https://github.com/cyber-axin/session-guardian

---

**Session Guardian** - 让你的 AI 对话永不丢失 🛡️
