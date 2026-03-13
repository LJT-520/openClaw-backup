# Aliyun OSS Skill

阿里云对象存储技能 - 通过 Node.js SDK + ossutil 管理阿里云存储

## 🚀 快速开始

### 1. 检查环境

```bash
bash scripts/setup.sh --check-only
```

### 2. 配置凭证

如果环境检查未通过，运行：

```bash
bash scripts/setup.sh \
  --access-key-id "<你的AccessKey ID>" \
  --access-key-secret "<你的AccessKey Secret>" \
  --region "oss-cn-hangzhou" \
  --bucket "<你的存储桶名称>" \
  --domain "https://你的域名.com"
```

**获取凭证：**
- 密钥管理：https://ram.console.aliyun.com/manage/ak
- 存储桶列表：https://oss.console.aliyun.com/bucket

### 3. 开始使用

**命令行：**

```bash
# 上传文件
node scripts/oss_node.mjs upload --local /path/to/file.txt --key uploads/file.txt

# 下载文件
node scripts/oss_node.mjs download --key uploads/file.txt --local /path/to/file.txt

# 列出文件
node scripts/oss_node.mjs list --prefix uploads/

# 获取 URL
node scripts/oss_node.mjs url --key uploads/file.txt
```

**在 OpenClaw 中：**

```
帮我上传 /backups/daily.tar.gz 到阿里云 OSS
```

## 📚 完整文档

查看 [SKILL.md](./SKILL.md) 获取完整文档。

## 🔗 相关链接

- [阿里云 OSS 官方文档](https://help.aliyun.com/product/31815.html)
- [阿里云 OSS Node.js SDK](https://help.aliyun.com/document_detail/32068.html)
- [ossutil 命令行工具](https://help.aliyun.com/document_detail/120075.html)
