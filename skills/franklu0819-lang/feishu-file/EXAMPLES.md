# feishu-file 使用示例

## 基础示例

### 1. 发送单个文件

```bash
# 发送 PDF（使用默认文件名）
./scripts/feishu-file-api.sh /tmp/report.pdf

# 发送 PDF 并指定文件名
./scripts/feishu-file-api.sh /tmp/report.pdf "2026年2月月度报告.pdf"

# 发送图片
./scripts/feishu-file-api.sh /tmp/screenshot.png "界面截图.png"
```

### 2. 发送给不同接收者

```bash
# 发送给默认接收者（FEISHU_RECEIVER）
./scripts/feishu-file-api.sh /tmp/file.pdf

# 发送给指定用户
./scripts/feishu-file-api.sh /tmp/file.pdf "文件.pdf" "ou_xxx"

# 发送给群聊
./scripts/feishu-file-api.sh /tmp/file.pdf "文件.pdf" "oc_xxx"
```

## 实际应用场景

### 场景 1: 发送分析报告

```bash
#!/bin/bash
# 发送抖音视频分析报告

REPORT_PATH="/tmp/douyin_analysis_report.pdf"
REPORT_NAME="抖音视频拆解报告_$(date +%Y%m%d).pdf"

echo "📊 正在发送分析报告..."
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
  "$REPORT_PATH" \
  "$REPORT_NAME"

echo "✅ 报告发送完成！"
```

### 场景 2: 批量发送文件

```bash
#!/bin/bash
# 批量发送多个文件

FILES=(
  "/tmp/report1.pdf"
  "/tmp/report2.pdf"
  "/tmp/screenshot.png"
  "/data/summary.xlsx"
)

SUCCESS=0
FAILED=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "发送: $filename"

    if /root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh "$file" "$filename"; then
      SUCCESS=$((SUCCESS + 1))
    else
      FAILED=$((FAILED + 1))
    fi

    sleep 2  # 避免频率限制
  else
    echo "⚠️  文件不存在: $file"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "发送完成: 成功 $SUCCESS 个，失败 $FAILED 个"
```

### 场景 3: 定时发送日报

```bash
#!/bin/bash
# 每天 9:00 自动发送日报

# 生成日报
cat > /tmp/daily_report.txt <<EOF
# 日报 - $(date +%Y-%m-%d)

## 今日完成
1. 完成抖音视频分析
2. 优化 feishu-file 技能
3. 更新文档

## 明日计划
1. 测试新功能
2. 编写教程

## 问题与建议
无
EOF

# 发送日报
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
  /tmp/daily_report.txt \
  "日报_$(date +%Y%m%d).txt"
```

添加到 crontab:
```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天 9:00 执行）
0 9 * * * /path/to/send_daily_report.sh
```

### 场景 4: 发送生成的图表

```bash
#!/bin/bash
# 生成并发送数据图表

# 使用 Python 生成图表
python3 <<'PYTHON'
import matplotlib.pyplot as plt
import pandas as pd

# 示例数据
data = {'一月': 100, '二月': 150, '三月': 200}
df = pd.DataFrame(list(data.items()), columns=['月份', '访问量'])

# 绘制图表
plt.figure(figsize=(10, 6))
plt.bar(df['月份'], df['访问量'])
plt.title('月度访问量统计')
plt.xlabel('月份')
plt.ylabel('访问量')
plt.savefig('/tmp/chart.png')
PYTHON

# 发送图表
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
  /tmp/chart.png \
  "访问量统计_$(date +%Y%m%d).png"
```

### 场景 5: 发送备份文件

```bash
#!/bin/bash
# 发送数据库备份

BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# 创建备份
mysqldump -u root -p database_name | gzip > "$BACKUP_FILE"

# 发送备份文件
if [ -f "$BACKUP_FILE" ]; then
  /root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
    "$BACKUP_FILE" \
    "数据库备份_$DATE.sql.gz"

  echo "✅ 备份发送成功"
else
  echo "❌ 备份文件不存在"
fi
```

### 场景 6: 监控并发送日志

```bash
#!/bin/bash
# 监控日志文件，发现错误时自动发送

LOG_FILE="/var/log/app.log"
ERROR_LOG="/tmp/error_$(date +%Y%m%d_%H%M%S).log"

# 检查日志中的错误
if grep -i "error" "$LOG_FILE" > "$ERROR_LOG"; then
  echo "发现错误，正在发送日志..."

  /root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
    "$ERROR_LOG" \
    "错误日志_$(date +%Y%m%d_%H%M%S).log"

  echo "✅ 错误日志已发送"
else
  echo "✓ 未发现错误"
fi
```

### 场景 7: 发送转换后的文档

```bash
#!/bin/bash
# Markdown 转 PDF 并发送

MD_FILE="$1"
PDF_FILE="/tmp/converted_$(date +%s).pdf"

# 检查输入文件
if [ ! -f "$MD_FILE" ]; then
  echo "❌ 文件不存在: $MD_FILE"
  exit 1
fi

# 转换为 PDF
cd /root/.openclaw/workspace/skills/md2pdf
bash scripts/convert.sh "$MD_FILE" "$PDF_FILE"

# 发送 PDF
if [ -f "$PDF_FILE" ]; then
  /root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
    "$PDF_FILE" \
    "$(basename "$MD_FILE" .md).pdf"

  echo "✅ PDF 发送成功"
else
  echo "❌ PDF 转换失败"
fi
```

使用:
```bash
./send_converted.sh /root/.openclaw/workspace/exports/report.md
```

### 场景 8: 发送系统快照

```bash
#!/bin/bash
# 生成系统快照并发送

SNAPSHOT_FILE="/tmp/system_snapshot_$(date +%Y%m%d_%H%M%S).txt"

# 收集系统信息
{
  echo "=== 系统快照 ==="
  echo "时间: $(date)"
  echo ""
  echo "=== CPU 信息 ==="
  lscpu | head -20
  echo ""
  echo "=== 内存信息 ==="
  free -h
  echo ""
  echo "=== 磁盘信息 ==="
  df -h
  echo ""
  echo "=== 进程信息 ==="
  ps aux | head -20
} > "$SNAPSHOT_FILE"

# 发送快照
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
  "$SNAPSHOT_FILE" \
  "系统快照_$(date +%Y%m%d_%H%M%S).txt"
```

## 高级技巧

### 技巧 1: 重试机制

```bash
#!/bin/bash
# 带重试的文件发送

FILE="$1"
NAME="$2"
MAX_RETRIES=3

for i in $(seq 1 $MAX_RETRIES); do
  echo "尝试 $i/$MAX_RETRIES..."

  if /root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh "$FILE" "$NAME"; then
    echo "✅ 发送成功！"
    exit 0
  fi

  if [ $i -lt $MAX_RETRIES ]; then
    echo "等待 5 秒后重试..."
    sleep 5
  fi
done

echo "❌ 发送失败，已重试 $MAX_RETRIES 次"
exit 1
```

### 技巧 2: 压缩大文件

```bash
#!/bin/bash
# 自动压缩大文件后发送

FILE="$1"
FILE_SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))

# 如果文件超过 10MB，进行压缩
if [ "$FILE_SIZE_MB" -gt 10 ]; then
  echo "文件较大 ($FILE_SIZE_MB MB)，正在压缩..."

  case "$FILE" in
    *.pdf)
      # PDF 压缩（需要 ghostscript）
      gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
         -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
         -sOutputFile="${FILE%.pdf}_compressed.pdf" "$FILE"
      FILE="${FILE%.pdf}_compressed.pdf"
      ;;
    *)
      # 通用压缩（使用 gzip）
      gzip -c "$FILE" > "${FILE}.gz"
      FILE="${FILE}.gz"
      ;;
  esac

  NEW_SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
  NEW_SIZE_MB=$((NEW_SIZE / 1024 / 1024))
  echo "压缩完成: ${FILE_SIZE_MB}MB → ${NEW_SIZE_MB}MB"
fi

# 发送文件
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh "$FILE"
```

### 技巧 3: 发送前验证

```bash
#!/bin/bash
# 发送前验证文件完整性

FILE="$1"

# 检查文件是否存在
if [ ! -f "$FILE" ]; then
  echo "❌ 文件不存在"
  exit 1
fi

# 检查文件是否可读
if [ ! -r "$FILE" ]; then
  echo "❌ 文件不可读"
  exit 1
fi

# 检查文件大小
FILE_SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
if [ "$FILE_SIZE" -eq 0 ]; then
  echo "❌ 文件为空"
  exit 1
fi

# 检查文件类型
FILE_TYPE=$(file --mime-type -b "$FILE")
echo "文件类型: $FILE_TYPE"

# 发送文件
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh "$FILE"
```

### 技巧 4: 日志记录

```bash
#!/bin/bash
# 记录所有发送操作

LOG_FILE="/tmp/feishu_file_send.log"
FILE="$1"
NAME="${2:-$(basename "$FILE")}"

# 记录开始时间
START_TIME=$(date +%s)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始发送: $NAME" >> "$LOG_FILE"

# 发送文件
if /root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh "$FILE" "$NAME"; then
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发送成功: $NAME (耗时: ${DURATION}s)" >> "$LOG_FILE"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发送失败: $NAME" >> "$LOG_FILE"
  exit 1
fi
```

## 集成示例

### 与 douyin-video-breakdown 集成

```bash
#!/bin/bash
# 分析抖音视频并发送报告

VIDEO_URL="$1"

# 分析视频
cd /root/.openclaw/workspace/skills/douyin-video-breakdown
bash scripts/breakdown-smart.sh "$VIDEO_URL"

# 找到生成的报告
LATEST_REPORT=$(ls -t /root/.openclaw/workspace/exports/douyin-breakdowns/*.md | head -1)

# 转换为 PDF
cd /root/.openclaw/workspace/skills/md2pdf
bash scripts/convert.sh "$LATEST_REPORT" "/tmp/douyin_report.pdf"

# 发送报告
/root/.openclaw/workspace/skills/feishu-file/scripts/feishu-file-api.sh \
  /tmp/douyin_report.pdf \
  "抖音视频分析报告.pdf"
```

---

**提示**: 这些示例可以根据实际需求灵活调整和组合使用！
