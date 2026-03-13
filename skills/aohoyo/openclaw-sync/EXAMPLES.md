# 多实例配置示例

## 示例一：单用户多服务器

**场景**：老板有 3 个 OpenClaw 服务器，想用同一个腾讯云 COS 存储桶备份。

### 服务器 1：主服务器
```bash
cd /home/node/.openclaw/workspace/skills/openclaw-sync
bash scripts/setup.sh

# 选择：腾讯云 COS
# 输入密钥：SecretId/SecretKey/Bucket
# 实例名称：main-server
# 同步模式：实时同步
```

**云端路径**：`openclaw-backup/main-server/`

### 服务器 2：开发服务器
```bash
cd /home/node/.openclaw/workspace/skills/openclaw-sync
bash scripts/setup.sh

# 选择：腾讯云 COS
# 输入相同密钥
# 实例名称：dev-server
# 同步模式：手动同步
```

**云端路径**：`openclaw-backup/dev-server/`

### 服务器 3：测试服务器
```bash
cd /home/node/.openclaw/workspace/skills/openclaw-sync
bash scripts/setup.sh

# 选择：腾讯云 COS
# 输入相同密钥
# 实例名称：test-server
# 同步模式：定时同步
```

**云端路径**：`openclaw-backup/test-server/`

### 云端目录结构
```
openclaw-backup (存储桶)
├── main-server/
│   ├── MEMORY.md
│   ├── memory/
│   └── USER.md
├── dev-server/
│   ├── MEMORY.md
│   └── memory/
└── test-server/
    ├── MEMORY.md
    └── memory/
```

---

## 示例二：多用户共享存储

**场景**：3 个用户共享一个云存储，每个用户有自己的 OpenClaw。

### 用户 A：烧烤店老板
```bash
bash scripts/setup.sh
# 实例名称：user-barbecue
```

### 用户 B：外卖平台
```bash
bash scripts/setup.sh
# 实例名称：user-delivery
```

### 用户 C：内部系统
```bash
bash scripts/setup.sh
# 实例名称：user-internal
```

### 云端目录结构
```
openclaw-backup
├── user-barbecue/
├── user-delivery/
└── user-internal/
```

---

## 示例三：多环境部署

**场景**：软件开发团队，有生产、测试、开发环境。

### 生产环境
```bash
bash scripts/setup.sh
# 实例名称：prod
# 同步模式：实时同步
# 云服务商：阿里云 OSS（高稳定性）
```

### 测试环境
```bash
bash scripts/setup.sh
# 实例名称：staging
# 同步模式：定时同步
# 云服务商：腾讯云 COS（有免费额度）
```

### 开发环境
```bash
bash scripts/setup.sh
# 实例名称：dev
# 同步模式：手动同步
# 云服务商：七牛云（免费额度最大）
```

---

## 配置文件示例

### backup.json（主服务器）
```json
{
  "version": "1.0.0",
  "provider": "tencent",
  "providerName": "腾讯云 COS",
  "remoteName": "openclaw-backup",
  "bucket": "openclaw-backup-1234567890",
  "region": "ap-shanghai",
  "prefix": "main-server/",
  "instanceName": "main-server",
  "workspaceDir": "/home/node/.openclaw/workspace",
  "syncList": "data/sync-list.txt",
  "syncMode": "realtime"
}
```

### backup.json（开发服务器）
```json
{
  "version": "1.0.0",
  "provider": "tencent",
  "providerName": "腾讯云 COS",
  "remoteName": "openclaw-backup",
  "bucket": "openclaw-backup-1234567890",
  "region": "ap-shanghai",
  "prefix": "dev-server/",
  "instanceName": "dev-server",
  "workspaceDir": "/home/node/.openclaw/workspace",
  "syncList": "data/sync-list.txt",
  "syncMode": "manual"
}
```

---

## 验证配置

### 查看配置
```bash
cat config/backup.json | jq .
```

### 测试同步
```bash
bash scripts/sync-now.sh
```

### 查看云端
```bash
bash scripts/list-remote.sh
```

---

## 成本分析

### 单存储桶多实例（推荐）

| 项目 | 数量 | 单价 | 月成本 |
|------|------|------|--------|
| 存储桶 | 1 个 | 免费 | ¥0 |
| 存储空间 | 50MB | ¥0.12/GB | ¥0.006 |
| 流量 | 100MB | ¥0.5/GB | ¥0.05 |
| **总计** | - | - | **¥0.056** |

### 多存储桶（不推荐）

| 项目 | 数量 | 单价 | 月成本 |
|------|------|------|--------|
| 存储桶 | 3 个 | 免费 | ¥0 |
| 存储空间 | 150MB | ¥0.12/GB | ¥0.018 |
| 流量 | 300MB | ¥0.5/GB | ¥0.15 |
| **总计** | - | - | **¥0.168** |

**结论**：使用单存储桶多实例可以节省 66% 的成本！

---

## 迁移场景

### 从单实例迁移到多实例

1. **备份当前配置**：
```bash
cp config/backup.json config/backup.json.bak
```

2. **重新运行配置向导**：
```bash
bash scripts/setup.sh
# 输入新的实例名称
```

3. **同步数据**：
```bash
bash scripts/sync-now.sh
```

4. **验证云端**：
```bash
bash scripts/list-remote.sh
```

### 从旧服务器迁移到新服务器

1. **旧服务器**：执行最后一次同步
```bash
bash scripts/sync-now.sh
```

2. **新服务器**：安装 OpenClaw 和 openclaw-sync 技能

3. **新服务器**：运行配置向导，使用**相同的实例名称**
```bash
bash scripts/setup.sh
# 输入相同的实例名称
```

4. **新服务器**：恢复数据
```bash
bash scripts/restore.sh
```

---

## 最佳实践

### ✅ 推荐做法

- ✅ 使用有意义的实例名称（如：prod、dev、staging）
- ✅ 所有实例使用相同的云服务商（统一管理）
- ✅ 定期检查云端数据，清理不需要的实例
- ✅ 重要实例使用实时同步，测试实例使用手动同步

### ❌ 避免做法

- ❌ 使用无意义的名称（如：test1、test2、test3）
- ❌ 频繁修改实例名称
- ❌ 不同实例使用不同的云服务商（增加管理成本）
- ❌ 长期不用的实例数据不清理

---

## 故障排查

### 实例名称冲突

**问题**：两个服务器使用了相同的实例名称。

**解决**：
1. 停止其中一个服务器的同步服务
2. 修改实例名称（重新运行 setup.sh）
3. 重新同步

### 数据混乱

**问题**：数据出现在错误的实例目录下。

**解决**：
1. 停止所有同步服务
2. 检查每个服务器的配置文件
3. 手动移动云端数据到正确的目录
4. 重新启动同步服务

---

## 总结

多实例功能非常适合：
- ✅ 多个 OpenClaw 服务器
- ✅ 多环境部署（生产/测试/开发）
- ✅ 多用户共享存储
- ✅ 成本敏感的场景

配置简单，使用方便，成本低廉！
