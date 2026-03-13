# 多实例配置说明

## 什么是多实例？

如果你有多个 OpenClaw 服务器，可以让它们共享同一个云存储桶（Bucket），但数据互不干扰。

## 工作原理

每个 OpenClaw 实例在云存储中有独立的目录：

```
云存储桶 (openclaw-backup)
├── 1panel-openclaw/        # 主服务器实例
│   ├── MEMORY.md
│   ├── memory/
│   └── ...
├── dev-server/             # 开发服务器实例
│   ├── MEMORY.md
│   └── ...
└── 烧烤店服务器/            # 业务服务器实例
    ├── MEMORY.md
    └── ...
```

## 配置方法

### 步骤一：运行配置向导

在每个 OpenClaw 服务器上运行：

```bash
cd /home/node/.openclaw/workspace/skills/openclaw-sync
bash scripts/setup.sh
```

### 步骤二：输入实例名称

配置向导会提示：

```
配置实例名称（用于区分多个 OpenClaw 实例）

如果你有多个 OpenClaw 服务器，可以为每个实例设置不同的名称。
数据会存储在：bucket/<实例名称>/ 目录下

示例：
  - main（主服务器）
  - dev（开发服务器）
  - 烧烤店（业务服务器）
  - 服务器主机名（自动）

请输入实例名称 (默认: 1panel-openclaw): 
```

### 步骤三：完成配置

每个实例配置完成后，数据会自动存储到对应的目录下。

## 实例命名建议

### 按用途命名

```
- main        # 主生产服务器
- dev         # 开发测试服务器
- staging     # 预发布服务器
- backup      # 备份服务器
```

### 按业务命名

```
- 烧烤店      # 烧烤店业务
- 外卖平台    # 外卖业务
- 内部系统    # 内部管理系统
```

### 按位置命名

```
- beijing     # 北京服务器
- shanghai    # 上海服务器
- shenzhen    # 深圳服务器
```

### 按主机名命名（默认）

```
- 1panel-openclaw-NZfe  # 自动使用主机名
- server-01
- prod-web-01
```

## 使用场景

### 场景一：多业务隔离

```
公司有多个业务线，每个业务线有自己的 OpenClaw：
- 业务A：使用实例名 "business-a"
- 业务B：使用实例名 "business-b"
- 业务C：使用实例名 "business-c"

所有业务共享一个云存储桶，但数据完全隔离。
```

### 场景二：开发环境隔离

```
开发团队有多个环境：
- 生产环境：使用实例名 "prod"
- 测试环境：使用实例名 "test"
- 开发环境：使用实例名 "dev"

便于测试新功能，不影响生产数据。
```

### 场景三：多地点部署

```
公司在多个城市有服务器：
- 北京服务器：使用实例名 "beijing"
- 上海服务器：使用实例名 "shanghai"
- 广州服务器：使用实例名 "guangzhou"

统一备份到一个云存储桶。
```

## 查看实例数据

### 查看当前实例

```bash
bash scripts/list-remote.sh
```

输出示例：
```
云服务商: 腾讯云 COS
Bucket: openclaw-backup
实例名称: 1panel-openclaw
云端目录: 1panel-openclaw/

文件列表：
  MEMORY.md                                          3.8KB
  memory/2026-03-01.md                               3.7KB
  USER.md                                            576B
```

### 查看所有实例（需要 rclone 工具）

```bash
# 列出存储桶根目录
rclone ls openclaw-backup:openclaw-backup --config config/rclone.conf --max-depth 1
```

输出示例：
```
    3890 1panel-openclaw/MEMORY.md
    3711 1panel-openclaw/memory/2026-03-01.md
     576 1panel-openclaw/USER.md
    3890 dev-server/MEMORY.md
    3711 dev-server/memory/2026-03-01.md
     576 dev-server/USER.md
```

## 迁移数据

### 从一个实例迁移到另一个实例

1. 在源服务器上执行最后一次同步：
```bash
bash scripts/sync-now.sh
```

2. 在目标服务器上配置**相同的实例名称**：
```bash
bash scripts/setup.sh
# 输入相同的实例名称
```

3. 恢复数据：
```bash
bash scripts/restore.sh
```

## 注意事项

### ✅ 好处

- ✅ 节省成本（共享一个存储桶）
- ✅ 统一管理（一个地方查看所有实例）
- ✅ 数据隔离（每个实例独立目录）
- ✅ 灵活扩展（随时添加新实例）

### ⚠️ 注意

- ⚠️ 实例名称一旦设置，不要轻易修改
- ⚠️ 每个实例必须使用**不同的名称**
- ⚠️ 恢复数据时，确认实例名称正确
- ⚠️ 删除实例数据时，只删除对应的目录

## 删除实例数据

### 删除单个实例的数据

```bash
# 警告：此操作不可恢复！
rclone purge openclaw-backup:openclaw-backup/实例名称 --config config/rclone.conf
```

### 删除整个存储桶（所有实例）

```bash
# 警告：此操作会删除所有实例的数据！
rclone purge openclaw-backup:openclaw-backup --config config/rclone.conf
```

## 常见问题

### Q: 可以修改实例名称吗？

A: 可以，但需要：
1. 备份当前数据
2. 修改配置文件中的 prefix 和 instanceName
3. 手动移动云端数据到新目录
4. 或重新运行 setup.sh 配置新实例

### Q: 不同实例可以用不同的云服务商吗？

A: 可以，每个实例独立配置，可以使用不同的云服务商或不同的存储桶。

### Q: 实例数量有限制吗？

A: 没有硬性限制，但建议根据实际需要配置，避免浪费存储空间。

### Q: 如何查看某个实例的配置？

A: 查看配置文件：
```bash
cat config/backup.json | jq .
```

输出示例：
```json
{
  "instanceName": "1panel-openclaw",
  "prefix": "1panel-openclaw/",
  "bucket": "openclaw-backup",
  "provider": "tencent"
}
```

## 总结

多实例功能让多个 OpenClaw 服务器可以：
- ✅ 共享一个云存储桶
- ✅ 数据完全隔离
- ✅ 灵活命名和管理
- ✅ 节省成本

使用时记得为每个实例设置**有意义的名称**，方便识别和管理！
