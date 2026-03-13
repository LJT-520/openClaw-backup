# OpenClaw 数据同步技能

**版本**：1.0.0  
**发布日期**：2026-03-02  
**作者**：33

## 🎯 功能

将 OpenClaw 的重要数据同步到云对象存储，支持：
- ✅ 七牛云 Kodo
- ✅ 腾讯云 COS
- ✅ 阿里云 OSS

## ✨ 特性

- 🔄 实时/定时/手动同步
- 📦 多实例支持（一个存储桶，多个 OpenClaw）
- 🔐 安全可靠（本地优先，云端备份）
- 💰 几乎零成本（月成本 < ¥0.01）
- 🚀 简单易用（一个命令搞定）

## 📋 系统要求

- rclone（必需）
- Python 3（可选，用于 JSON 解析）

## 🚀 快速开始

```bash
# 1. 安装 rclone
curl https://rclone.org/install.sh | bash

# 2. 配置
cd config/
cp rclone-qiniu.conf.example rclone.conf
cp backup-qiniu.json.example backup.json
vim rclone.conf backup.json

# 3. 同步
bash scripts/sync-now.sh
```

## 📝 更新日志

### v1.0.0 (2026-03-02)
- ✅ 首次发布
- ✅ 支持七牛云/腾讯云/阿里云
- ✅ 多实例支持
- ✅ 完整文档

## 📚 文档

- [SKILL.md](SKILL.md) - 完整使用文档
- [INSTALL.md](INSTALL.md) - 安装说明
- [MULTI-INSTANCE.md](MULTI-INSTANCE.md) - 多实例配置
- [EXAMPLES.md](EXAMPLES.md) - 配置示例

## 🔗 链接

- **Clawhub**: https://clawhub.com/skill/openclaw-sync
- **GitHub**: https://github.com/openclaw/openclaw-sync
- **问题反馈**: https://github.com/openclaw/openclaw-sync/issues
