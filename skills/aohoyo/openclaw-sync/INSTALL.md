# OpenClaw 数据同步技能 - 安装说明

## 前置要求

在运行配置向导之前，需要安装以下工具：

### 1. rclone（必需）

rclone 是云存储同步工具，支持 40+ 云服务商。

**安装方法**：

```bash
# 方法一：官方安装脚本（推荐）
curl https://rclone.org/install.sh | sudo bash

# 方法二：包管理器
sudo apt-get install rclone  # Debian/Ubuntu
sudo yum install rclone      # CentOS/RHEL
```

**验证安装**：

```bash
rclone version
```

### 2. jq（必需）

jq 是 JSON 处理工具，用于读取配置文件。

**安装方法**：

```bash
# Debian/Ubuntu
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq

# Alpine
sudo apk add jq
```

**验证安装**：

```bash
jq --version
```

## 安装步骤

### 1. 安装前置工具

```bash
# 安装 rclone
curl https://rclone.org/install.sh | sudo bash

# 安装 jq
sudo apt-get install jq
```

### 2. 运行配置向导

```bash
cd /home/node/.openclaw/workspace/skills/openclaw-sync
bash scripts/setup.sh
```

### 3. 按提示操作

配置向导会引导你：
1. 选择云存储服务商
2. 输入访问密钥
3. 选择同步模式
4. 测试连接
5. 完成配置

## 云服务商配置

### 腾讯云 COS

1. 访问 https://console.cloud.tencent.com/cam/capi
2. 创建或复制 SecretId 和 SecretKey
3. 访问 https://console.cloud.tencent.com/cos/bucket
4. 创建 Bucket 或使用现有 Bucket

**免费额度**：6个月 50GB

### 七牛云 Kodo

1. 访问 https://portal.qiniu.com/user/key
2. 复制 AccessKey 和 SecretKey
3. 创建 Bucket 或使用现有 Bucket

**免费额度**：每月 10GB

### 阿里云 OSS

1. 访问 https://ram.console.aliyun.com/manage/ak
2. 创建 AccessKey
3. 访问 https://oss.console.aliyun.com/
4. 创建 Bucket 或使用现有 Bucket

**价格**：按量付费，约 ¥0.12/GB/月

## 验证安装

安装完成后，验证技能是否正常：

```bash
# 查看配置
cat config/backup.json

# 测试同步
bash scripts/sync-now.sh

# 查看云端文件
bash scripts/list-remote.sh
```

## 故障排查

### rclone 安装失败

```bash
# 手动下载
wget https://downloads.rclone.org/rclone-current-linux-amd64.zip
unzip rclone-current-linux-amd64.zip
cd rclone-*-linux-amd64
sudo cp rclone /usr/bin/
sudo chown root:root /usr/bin/rclone
sudo chmod 755 /usr/bin/rclone
```

### jq 安装失败

```bash
# 手动下载
wget https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64
sudo mv jq-linux64 /usr/bin/jq
sudo chmod +x /usr/bin/jq
```

### 连接测试失败

1. 检查密钥是否正确
2. 检查 Bucket 名称是否正确（腾讯云需要包含 appid）
3. 检查 Region 是否正确
4. 检查网络连接

## 下一步

安装完成后：

1. 运行配置向导：`bash scripts/setup.sh`
2. 手动测试同步：`bash scripts/sync-now.sh`
3. 查看云端文件：`bash scripts/list-remote.sh`
4. 配置定时任务或实时同步（根据选择的模式）

## 需要帮助？

如果遇到问题，可以：

1. 查看 README.md
2. 查看日志：`tail -f /var/log/openclaw-sync.log`
3. 运行诊断：`rclone config show --config config/rclone.conf`
