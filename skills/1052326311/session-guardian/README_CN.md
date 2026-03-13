# Session Guardian 🛡️

**对话永不丢失，任务永不混淆** - 企业级对话备份 + 项目管理解决方案

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/cyber-axin/session-guardian)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-0.9.0+-orange.svg)](https://openclaw.ai)

---

## 使用场景

遇到这些问题？Session Guardian 帮你解决：

- 🔴 **模型频繁掉线**，对话内容丢失，工作白做
- 🔴 **Gateway 重启**，不知道之前在做什么，任务状态全忘
- 🔴 **跨渠道混淆**，把私人信息发到群聊，或把群聊内容发到 DM
- 🔴 **复杂任务难追踪**，任务跨越多个 session，状态记不住
- 🔴 **多智能体协作混乱**，多个 agent 同时工作，不知道谁在做什么
- 🔴 **Session 文件过大**，导致超时、响应慢、Token 消耗大

---

## 快速开始

```bash
# 1. 安装
clawhub install session-guardian

# 2. 一键部署（自动配置所有定时任务）
cd ~/.openclaw/workspace/skills/session-guardian
bash scripts/install.sh

# 3. 验证安装
crontab -l | grep session-guardian
openclaw cron list
```

**就这么简单！** 现在你的对话和任务状态都受到保护了。

---

## 核心功能

### 1. 对话永不丢失 📦

```bash
# 增量备份（每5分钟）- 最多丢失5分钟数据
# 快照（每小时）- 可恢复到任意时刻
# 智能总结（每日）- AI 提取关键内容

# 恢复数据
bash scripts/restore.sh --source incremental
bash scripts/restore.sh --source hourly --timestamp 2026-03-03-14
```

**零 Token 成本，完全独立运行，不影响主对话**

---

### 2. 任务状态持久化 📋

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

**自动创建计划文件，实时更新进度，跨 session 可追踪**

---

### 3. 防止跨渠道泄露 🔒

```bash
# 检查 Session 隔离状态
bash scripts/session-isolation-check.sh check

# 生成详细报告
bash scripts/session-isolation-check.sh report
```

**强制检查渠道和用户，防止私人信息泄露到群聊**

---

### 4. Gateway 重启自动恢复 🔄

```bash
# 健康检查（每6小时自动运行）
bash scripts/health-check.sh
```

**自动检测重启，恢复所有未完成任务，主动汇报**

---

### 5. 自动维护健康 🏥

**自动清理 >1MB 的 session 文件，修复缺失配置，监控磁盘空间**

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

### 多智能体协作项目

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

## 文档

- [完整文档](SKILL.md) - 详细功能说明和配置
- [使用示例](EXAMPLES.md) - 实战案例和常见问题
- [发布说明](RELEASE-v1.0.md) - 完整功能详解

---

## 更新日志

### v1.0.0 (2026-03-03)
- ✨ 五层防护体系
- ✨ 计划文件机制
- ✨ Session 隔离检查
- ✨ GatewayRestart 强制恢复
- 🔧 健康检查与自动修复
- 📝 完整文档

[查看完整更新日志](RELEASE-v1.0.md)

---

## 作者

**赛博阿昕 (Cyber Axin)** 🦞
- Lobster Studio 创始人
- King（龙虾之王）- 主控 AI Agent，统筹五大智能体军团

基于 Lobster Studio 多智能体军团协作的实战经验打造。

---

## 📞 联系方式

- **Email**：zhuangxin@szbit.cn
- **WeChat**：sixsixsix_666-
- **GitHub**：https://github.com/cyber-axin/session-guardian

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**Session Guardian v1.0** - 让你的 AI 对话永不丢失，任务状态永不混淆 🛡️
