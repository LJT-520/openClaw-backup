---
name: auto-ppt
description: 根据用户提供的主题、观点或文本，自动生成结构化文章并制作成 PPT（PPTX/PDF）。白底黑字，微软雅黑标题，逻辑清晰。支持流程图、对比表格、双栏布局等多种版式。
---

# Auto-PPT — 自动生成演示文稿

## 概述

这个 Skill 让你（OpenClaw Agent）能够：

1. 根据用户提供的 **主题 / 观点 / 一段话**，用大模型整理成结构化文章
2. 将文章转化为 **幻灯片 JSON**
3. 调用 Python 脚本生成 **PPTX**（可选同时导出 **PDF**）
4. 输出文件保存到用户桌面

## 何时触发

当用户出现以下意图时使用本 Skill：

- 「帮我做 PPT」「生成演示文稿」「做个 slides」
- 「把这段话变成 PPT」
- 「围绕 XXX 主题做一个报告」
- 「帮我做一个 PDF 演示」

## 设计规范

| 项目 | 规范 |
|------|------|
| 标题字体 | Microsoft YaHei（微软雅黑），40pt，加粗 |
| 标题对齐 | 左上角对齐 |
| 正文字体 | Microsoft YaHei，22pt |
| 背景 | 纯白底 `#FFFFFF` |
| 文字颜色 | 黑色 `#000000`（标题）/ 深灰 `#333333`（正文）|
| 强调色 | 微软蓝 `#0078D4` |
| 宽屏比例 | 16:9 (13.333" × 7.5") |

## 总体流程

### Step 1：理解用户需求

用户可能给出：
- **完整文章**：直接使用
- **一段话 / 几个观点**：帮用户扩展成结构化文章（3-8 个要点）
- **一个主题**：自行调研并组织内容

无论哪种输入，最终产出一份结构清晰的大纲，包含：
- 标题
- 副标题（可选）
- 3～10 页正文内容
- 总结

### Step 2：生成幻灯片 JSON

将大纲转化为如下 JSON 格式，写入临时文件：

```json
{
  "title": "演示文稿标题",
  "slides": [
    {
      "type": "cover",
      "title": "主标题",
      "subtitle": "副标题 / 日期 / 作者"
    },
    {
      "type": "content",
      "title": "第一章标题",
      "bullets": [
        "要点一：简洁清晰的描述",
        "要点二：数据或论据支撑",
        "要点三：结论或建议"
      ]
    },
    {
      "type": "flow",
      "title": "流程概览",
      "steps": ["需求分析", "方案设计", "开发实现", "测试验收"]
    },
    {
      "type": "two_column",
      "title": "方案对比",
      "left_title": "方案 A",
      "left": ["优点一", "优点二"],
      "right_title": "方案 B",
      "right": ["优点一", "优点二"]
    },
    {
      "type": "comparison",
      "title": "数据对比",
      "headers": ["指标", "2024", "2025"],
      "rows": [
        ["收入", "100M", "150M"],
        ["增长率", "20%", "50%"]
      ]
    },
    {
      "type": "summary",
      "title": "总结与展望",
      "bullets": [
        "核心结论一",
        "核心结论二",
        "下一步行动"
      ]
    },
    {
      "type": "end",
      "title": "谢谢",
      "subtitle": "Q & A"
    }
  ]
}
```

支持的 slide type：

| type | 用途 | 必填字段 |
|------|------|----------|
| `cover` | 封面 | title, subtitle |
| `content` | 常规内容（要点列表）| title, bullets |
| `flow` | 流程图（横向步骤箭头）| title, steps |
| `two_column` | 左右双栏对比 | title, left, right |
| `comparison` | 表格对比 | title, headers, rows |
| `summary` | 总结页 | title, bullets |
| `end` | 结束页 | title, subtitle |

### Step 3：调用脚本生成 PPTX

```bash
# 生成 PPTX（默认保存到桌面）
python3 {baseDir}/scripts/make_ppt.py /tmp/slides.json

# 指定输出路径
python3 {baseDir}/scripts/make_ppt.py /tmp/slides.json --out ~/Desktop/my_ppt.pptx

# 同时生成 PDF（需要 LibreOffice 或 Keynote）
python3 {baseDir}/scripts/make_ppt.py /tmp/slides.json --pdf
```

脚本会自动：
- 使用白底黑字 + 微软雅黑字体
- 标题 40pt 加粗、左上角对齐
- 添加页码
- 根据 slide type 生成对应版式

### Step 4：向用户汇报

告诉用户：
- 文件保存位置（默认 `~/Desktop/<标题>.pptx`）
- 共几页
- 如果 PDF 转换成功，也告知 PDF 路径
- 如果 PDF 转换失败，说明需要安装 LibreOffice（`brew install --cask libreoffice`）

## 内容生成要求

- **不要出现中文幻觉**：所有内容必须基于用户输入或可验证的事实，不得编造数据或引用
- **逻辑图要清晰**：flow 类型的步骤顺序要符合逻辑，不能前后矛盾
- **每页要点 3～5 个**：不要堆砌太多文字，PPT 讲究简洁
- **每个要点一行**：控制在 20 个中文字 / 40 个英文字符以内
- **避免大段文字**：如果内容多，拆分成多页

## 依赖

- Python 3 + `python-pptx`（已安装：`pip3 install python-pptx`）
- PDF 转换（可选）：LibreOffice 或 macOS Keynote

## 示例

**用户**：帮我做一个关于 AI 对全球经济影响的 PPT

**你的行为**：
1. 用大模型组织 6-8 页内容大纲
2. 生成 JSON 写入 `/tmp/slides_ai_economy.json`
3. 运行 `python3 {baseDir}/scripts/make_ppt.py /tmp/slides_ai_economy.json --pdf`
4. 告诉用户：「PPT 已生成并保存到桌面：AI_对全球经济的影响.pptx（共 8 页）」
