---
name: twitter-web-autopost
description: "Twitter/X 自动发布 — 通过浏览器操作网页版 Twitter/X，无需 API Key。支持发推、爬热点、AI 撰写推文、定时发布。用户自行登录，Agent 负责内容创作和发布操作。零门槛上手，中英文双语支持。Keywords: auto tweet, scheduled post, trending, browser automation, social media, no API key needed."
user-invocable: true
metadata: {"openclaw":{"emoji":"🐦","skillKey":"twitter-web-autopost"}}
---

# Twitter/X 自动发布 🐦

通过浏览器操作网页版 Twitter/X — 无需 API Key，用户登录后 Agent 自动完成发推。

## 核心功能

- **AI 撰写推文**：给一个主题，Agent 自动写出推文（中英文均可）
- **热点追踪**：自动爬取热门话题，围绕热点撰写推文
- **浏览器直接发布**：无需 API Key 或开发者账号
- **定时发布**：每天/每周/一次性定时（openclaw cron）
- **用户掌控登录**：Agent 不碰密码，登录完全由用户完成

---

## 工作流程

### Step 1：确认用户的 X 网址

首次使用时询问用户：
> 「请提供你访问 X/Twitter 的网址（例如 https://x.com）」

### Step 2：让用户先登录

用 exec 工具执行命令打开 X 首页：

```bash
openclaw browser open {BASE_URL}
```

然后告诉用户：
> 「X 页面已打开，请先登录你的账号。完成后回复『已登录』。」

**等待用户确认后再继续。**

### Step 3：撰写推文

- 用户给了完整文案 → 直接使用
- 用户给了主题 → AI 生成推文（≤ 280 字符）
- 全自动 → 爬热点并撰写

**写好推文后，先展示给用户看，等用户确认「发布」后再执行。**

### Step 4：一键发布（使用脚本）

**用户确认后，使用 exec 工具执行发布脚本：**

```bash
bash {baseDir}/scripts/tweet.sh "推文内容" "https://x.com"
```

脚本会自动完成：打开发帖页 → 找到输入框 → 输入内容 → 点击发布按钮。

**重要：不要自己调用 browser 工具拼参数！必须通过上面的脚本发布！**

### Step 5：回报结果

告诉用户发布成功/失败、推文全文。

---

## 关键规则（Agent 必读）

1. **发布推文必须用脚本**，不要自己调 browser 工具：
   ```bash
   bash {baseDir}/scripts/tweet.sh "推文内容" "{BASE_URL}"
   ```

2. **打开网页用 exec 执行 CLI 命令**：
   ```bash
   openclaw browser open https://x.com
   ```

3. **绝对不要说「无法操控浏览器」「受限于技术权限」**——你有权限，用上面的命令就行。

4. **不要让用户手动复制粘贴**——你有脚本可以自动完成输入和发布。

5. **发布前先让用户确认内容**——展示推文，用户说「发布」后再执行脚本。

---

## 定时发布

```bash
# 每天 10:00
openclaw cron add \
  --name "daily-tweet" \
  --cron "0 10 * * *" --tz "Asia/Shanghai" \
  --message "执行 twitter-web-autopost：撰写一条英文AI热点推文，用脚本发布到X，不要重复"

# 一次性
openclaw cron add \
  --name "once" \
  --at "2026-03-05T15:00:00+08:00" --delete-after-run \
  --message "执行 twitter-web-autopost：用脚本发布推文 — 内容"

# 管理
openclaw cron list                                         # 查看
openclaw cron edit --name "daily-tweet" --cron "0 9 * * *"  # 改时间
openclaw cron disable --name "daily-tweet"                  # 暂停
openclaw cron rm --name "daily-tweet"                       # 删除
```

---

## 安全

- 不要自动输入密码，登录必须让用户手动完成
- 不发违法或仇恨内容
- 每天不超过 5 条，两条间隔 ≥ 2 小时
- 发布失败最多重试 2 次

---

**TL;DR**: 用户登录 → Agent 写推文 → 用户确认 → 脚本一键发布。不要手动复制粘贴，不要说没权限。
