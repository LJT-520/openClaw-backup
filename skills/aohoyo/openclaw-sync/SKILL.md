# OpenClaw 数据同步技能

将 OpenClaw 的记忆数据、配置文件、技能配置等重要数据实时同步到云对象存储。

## 🎯 支持的云服务商

| 云服务商 | 免费额度 | 配置难度 | 推荐指数 |
|---------|---------|---------|---------|
| **七牛云 Kodo** | 每月 10GB | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **腾讯云 COS** | 6个月 50GB | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **阿里云 OSS** | 无 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 rclone（必需）
curl https://rclone.org/install.sh | bash

# 或使用包管理器
apt-get install rclone  # Debian/Ubuntu
yum install rclone      # CentOS/RHEL
```

### 2. 配置云存储

选择一个云服务商，复制配置模板：

**七牛云**：
```bash
cd config/
cp rclone-qiniu.conf.example rclone.conf
cp backup-qiniu.json.example backup.json

# 编辑配置文件，填入你的密钥
vim rclone.conf
vim backup.json
```

**腾讯云**：
```bash
cd config/
cp rclone-tencent.conf.example rclone.conf
cp backup-tencent.json.example backup.json

# 编辑配置文件
vim rclone.conf
vim backup.json
```

**阿里云**：
```bash
cd config/
cp rclone-aliyun.conf.example rclone.conf
cp backup-aliyun.json.example backup.json

# 编辑配置文件
vim rclone.conf
vim backup.json
```

### 3. 测试连接

```bash
# 测试配置
bash scripts/test-config.sh

# 测试上传
bash scripts/sync-now.sh
```

### 4. 开始使用

```bash
# 立即同步
bash scripts/sync-now.sh

# 查看云端文件
bash scripts/list-remote.sh

# 恢复数据
bash scripts/restore.sh
```

## 📝 配置说明

### 七牛云 Kodo

**配置参数**：
- `access_key_id` - 七牛云 AccessKey
- `secret_access_key` - 七牛云 SecretKey
- `bucket` - 存储桶名称
- `region` - 区域（z0=华东, z1=华北, z2=华南）
- `instanceName` - 实例名称（用于区分多个 OpenClaw）

**Endpoint**：`https://s3.cn-east-1.qiniucs.com`

### 腾讯云 COS

**配置参数**：
- `access_key_id` - 腾讯云 SecretId
- `secret_access_key` - 腾讯云 SecretKey
- `bucket` - 存储桶名称（格式：bucket-appid）
- `region` - 区域（如：ap-shanghai, ap-guangzhou）
- `instanceName` - 实例名称

**Endpoint**：`cos.{region}.myqcloud.com`

### 阿里云 OSS

**配置参数**：
- `access_key_id` - 阿里云 AccessKey ID
- `secret_access_key` - 阿里云 AccessKey Secret
- `bucket` - 存储桶名称
- `region` - 区域（如：oss-cn-shanghai, oss-cn-hangzhou）
- `instanceName` - 实例名称

**Endpoint**：`oss-{region}.aliyuncs.com`

## 📁 同步的数据

默认同步以下数据（可在 `data/sync-list.txt` 中修改）：

- **核心数据**：MEMORY.md, memory/, USER.md, IDENTITY.md, SOUL.md, AGENTS.md, TOOLS.md, HEARTBEAT.md
- **技能配置**：skills/*/config.json, skills/*/_meta.json
- **自定义工具**：tools/, *.sh

## 🎨 多实例支持

支持多个 OpenClaw 实例共享一个存储桶，数据完全隔离。

**示例**：
```
云存储桶
├── instance-main/        # 主服务器
├── instance-dev/         # 开发服务器
└── instance-烧烤店/       # 业务服务器
```

详见 [MULTI-INSTANCE.md](MULTI-INSTANCE.md)

## 💰 成本估算

数据量通常 < 1MB，成本几乎为零：

| 云服务商 | 月成本 |
|---------|--------|
| 七牛云 | ¥0（免费 10GB）|
| 腾讯云 | ¥0（6个月免费 50GB）|
| 阿里云 | < ¥0.01 |

## 🔧 高级功能

### 定时同步

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 3 点同步
0 3 * * * /path/to/openclaw-sync/scripts/sync-now.sh >> /var/log/openclaw-sync.log 2>&1
```

### 多云备份

同时备份到多个云服务商：

```bash
# 备份到七牛云
bash scripts/sync-now.sh

# 备份到腾讯云
bash scripts/sync-tencent.sh

# 备份到阿里云
bash scripts/sync-aliyun.sh
```

## 🔐 安全提示

- ✅ 配置文件权限为 600，保护密钥安全
- ✅ 不要将 `config/*.conf` 和 `config/*.json` 提交到 Git
- ✅ 定期检查同步日志，确保备份正常
- ✅ 重要修改后建议立即手动同步一次

## 📚 文档

- [安装说明](INSTALL.md)
- [多实例配置](MULTI-INSTANCE.md)
- [配置示例](EXAMPLES.md)
- [使用说明](README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
