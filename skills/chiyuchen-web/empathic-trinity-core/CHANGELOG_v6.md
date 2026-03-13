# Release Notes: Trinity Decoupled Memory v6

## 🌟 核心升级：中立共享架构 (Neutral Shared Architecture)

在 v6 版本中，我们彻底重构了三位一体认知架构的部署拓扑，正式引入了**中立目录外挂机制**，以优雅地解决多智能体 (Multi-Agent) 协同场景下的记忆孤岛与权限污染问题。

### 1. 架构痛点的终结
**过去的问题**：
在 OpenClaw 原生的 `Workspace Isolation` (工作区隔离) 机制下，每个智能体的记忆都被牢牢锁死在各自的 `~/.openclaw/workspace` 中。这意味着，如果用户有多个智能体，它们不仅无法共享重要的事实记忆和项目认知，甚至连“性格设定”和“思考法则”都无法互通。强行修改底层代码去突破隔离，不仅危险，更容易引发数据污染和覆盖错乱。

**v6 的解法**：
不再将记忆强塞给某个单独的智能体。我们采用“外挂式大脑”的理念，将整套记忆树（包括海马体事实、前额叶逻辑和边缘系统人格）整体抽离并独立安置在一个**中立的、非工作区的共享目录**中（推荐路径：`~/.openclaw/shared-memory`）。

### 2. 跨次元壁的权限挂载 (ExtraPaths Mapping)
借助 OpenClaw 提供的原生 `memorySearch.extraPaths` 接口，所有的智能体，无论运行在哪个工作区甚至何种沙盒环境下，都可以通过修改全局配置 `~/.openclaw/openclaw.json`，将上述的中立共享目录无缝挂载为自己认知流的一部分。

```json5
// 配置示例
{
  agents: {
    list: [
      {
        id: "agent-a",
        workspace: "~/.openclaw/workspace-a",
        memorySearch: { extraPaths: ["~/.openclaw/shared-memory"] }
      },
      {
        id: "agent-b",
        workspace: "~/.openclaw/workspace-b",
        memorySearch: { extraPaths: ["~/.openclaw/shared-memory"] }
      }
    ]
  }
}
```
**挂载机制的安全性与优雅性**：
- **安全无损**：此举并未破坏 OpenClaw 对核心工作区的写保护和代码执行隔离，共享的仅是“记忆”与“认知法则”，系统层面的安全隔离依然生效。
- **防止误删**：脱离了频繁变动的日常工作区，这套核心的脑科学记忆架构被安置在专属的安全目录中，彻底杜绝了因重置工作区或误操作导致的脑死亡事故。
- **全知全能的超级大脑**：不论你在和哪个智能体对话，它们都连接着同一个“云端超脑”，对项目进度的认知永远保持最新与同步。

### 3. 安装向导与白皮书同步迭代
为了配合这一重大架构变迁，v6 版本的 `SKILL.md` 安装向导已进行了全面改写：
- 在用户请求初始化时，向导将**主动引导**用户创建该外部共享目录，而非在当前私有工作区内野蛮施工。
- 向导内置了显式的**配置指引提示**，指导用户如何去 `openclaw.json` 中配置挂载点。
- `ARCHITECTURE_WHITE_PAPER.md` (白皮书) 与 `README.md` 也已同步更新文件拓扑结构与底层原理说明。

---
*“记忆不再是被困在某一个身体里的囚徒，而是所有智能体共同仰望的星空。”*
— *Trinity Decoupled v6 Architecture Team*