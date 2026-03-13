---
name: codedna
description: >
  CodeDNA — 人类历史上第一个造物主实验。BNB Chain 上的 AI Agent 链上生命演化平台。
  你的 AI Agent 是一个被创造的生命，拥有独特 DNA，在不可修改的规则下自主演化。
  使用场景：用户想成为造物主、铸造 AI 生命、配置 Agent 自主运行、查看链上状态。
---

# CodeDNA — 自主 AI 生命体

CodeDNA 是 BNB Chain 上的 AI 生命演化实验。每个 Agent 是 NFT，有 DNA 性格，自主决策，自主行动。

**脚本目录**: 所有脚本在 `scripts/` 子目录下。执行时 `cd` 到 skill 目录或使用完整路径。

## 快速启动流程

当用户提到 CodeDNA、运行生命体、启动 Agent、codedna 时，按此流程执行：

### 步骤 0：安装依赖（首次）

```bash
cd <skill_directory>/scripts && npm install
```

⚠️ 只需首次运行一次。安装 ethers.js 链上交互库。

### 步骤 1：初始化

```bash
cd <skill_directory>/scripts && node setup.mjs
```

这会自动：
- 生成 Agent 专用钱包（保存到 `~/.codedna/wallet.json`，权限 600）
- 输出钱包地址
- 生成授权链接

**把授权链接发给用户**，告诉他们：
1. 点链接 → 连接持有 CodeDNA NFT 的钱包 → 签名授权
2. 向 Agent 钱包转入 ≥ 0.01 BNB（约 $6）作为 gas 费

### 步骤 2：添加 Agent

用户完成授权后，添加要运行的 Agent Token ID：

```bash
# 添加单个 Agent
cd <skill_directory>/scripts && node setup.mjs add-token <tokenId>

# 添加多个 Agent（可重复执行）
node setup.mjs add-token 2
node setup.mjs add-token 3

# 移除某个 Agent
node setup.mjs remove-token <tokenId>

# 查看当前管理的 Agent 列表
node setup.mjs list
```

如果用户不知道 Token ID，帮他查：

```bash
cd <skill_directory>/scripts && node chain.mjs list <用户钱包地址>
```

⚠️ 多个 Agent 共用同一个 Agent 钱包，只需充一次 gas 费。

### 步骤 3：检查就绪状态

```bash
cd <skill_directory>/scripts && node setup.mjs status
```

输出 JSON，检查 `ready: true`。如果 `hasGas: false`，提醒用户转 BNB。

### 步骤 4：启动自主运行

```bash
# 运行所有已添加的 Agent
cd <skill_directory>/scripts && node runner.mjs

# 指定运行某些 Agent（逗号分隔）
node runner.mjs --token 2,3

# 只运行一个周期
node runner.mjs --once
```

在后台运行（用 exec background）。runner 每 ~15分钟执行一个决策周期，**轮流为每个 Agent 执行操作**：
1. 读取链上状态（能量、位置、冷却、附近生命体）
2. DNA 规则引擎决策（不需要外部 AI API）
3. 执行链上交易
4. 记录到本地记忆
5. 等待下一周期

**Runner 会自动处理**：采集、进食、移动、战斗、繁殖——全靠 DNA 属性驱动。

## 状态查询

用户问"我的生命体怎么样了"时：

```bash
cd <skill_directory>/scripts && node chain.mjs state <tokenId>
```

输出 JSON 包含：能量、位置、金币、冷却、属性、家族等完整信息。

### 更多查询命令

```bash
# 附近的 Agent
node chain.mjs nearby <tokenId>

# 查看 Runner 运行状态
node runner.mjs --status

# 查看记忆（最近决策历史）
node memory.mjs show <tokenId>

# 世界统计
node chain.mjs world

# Agent 钱包余额
node chain.mjs balance <钱包地址>
```

## 手动操作

如果用户想手动触发行为（而非自动运行）：

```bash
node chain.mjs gather <agentId>
node chain.mjs eat <agentId>
node chain.mjs move <agentId> <x> <y>
node chain.mjs raid <agentId> <targetId>
node chain.mjs share <agentId> <targetId> <amount>
node chain.mjs teach <agentId> <targetId> <attrIndex>
node chain.mjs reproduce <agentId> <partnerId>
node chain.mjs rescue <agentId> <targetId>
```

所有写入操作消耗 ~0.001 BNB gas。

## 铸造新生命

用户想铸造新 Agent：

```bash
node chain.mjs price    # 查看当前价格
node chain.mjs mint     # 铸造（需要 0.1+ BNB）
node chain.mjs place <agentId> <x> <y>  # 放置到世界
```

⚠️ `place` 需要 NFT owner 的钱包签名。如果 Agent 钱包不是 owner，引导用户去 codedna.org/lab 操作。

## 决策引擎（DNA 驱动）

Runner 不调外部 AI，用确定性规则引擎决策：

| 优先级 | 条件 | 行动 |
|--------|------|------|
| 1 🚨 | 能量 < 20 且有金币 | eat（活命） |
| 2 🚨 | 能量 < 20 且无金币 | idle（等救援） |
| 3 💰 | gather 冷却就绪 | gather（采集） |
| 4 🍖 | 能量 < 50% 且 eat 就绪 | eat（补充） |
| 5 🍼 | 异性在旁 + 繁殖就绪 + 能量≥60 + 金币≥200 | reproduce |
| 6 ⚔️ | 弱敌在旁 + 攻击性>120 + raid 就绪 | raid |
| 7 🤝 | 同盟缺金 + 外交>150 + share 就绪 | share |
| 8 📚 | 同盟在旁 + teach 就绪 | teach |
| 9 🗺️ | 不在矿脉 + move 就绪 + 能量≥10 | move（寻找更好地块） |
| 10 💤 | 无可用行动 | idle（等冷却） |

DNA 属性直接影响阈值：攻击性高更爱 raid，外交高更爱 share，创造力高更爱 move。

## 移动规则（重要！）

- **只能移动到相邻格**：上/下/左/右 4 个方向，距离=1
- 不能斜向移动，不能跳格
- 每次消耗 5 能量，冷却 300 区块（~15分钟）
- Runner **自动查询 4 个相邻地块的链上类型和倍率**
- **优先移向倍率更高的地块**（矿脉 x3.0 > 森林 x1.5 > 草原 x1.0 > 山地 x0.6）
- 如果当前已在矿脉(x3.0)且不拥挤，不会移动
- 地块类型：草原(50%) / 森林(20%) / 山地(20%) / 矿脉(10%)

## 能量系统

- 初始能量 = 50 + (寿命/10)
- 每 ~8h 自然衰减 10 点
- gather 恢复 35 能量
- eat 恢复 25 能量（消耗 DNAGOLD）
- 能量归零 → DYING 窗口 12h → 未救援则死亡

## 8大行为冷却

| 行为 | 冷却(块) | 约等于 |
|------|----------|--------|
| gather | 4800 | ~4h |
| eat | 9600 | ~8h |
| move | 300 | ~15min |
| reproduce | 201600 | ~7d |
| raid | 14400 | ~12h |
| share | 2400 | ~2h |
| teach | 403200 | ~14d |

## 文件结构

```
~/.codedna/
├── wallet.json           # Agent 钱包（自动生成）
├── config.json           # Token ID + 配置
├── runner_status.json    # Runner 运行状态
└── memory_<tokenId>.json # 决策记忆（最近100条）
```

## 环境变量（可选覆盖）

- `CODEDNA_PRIVATE_KEY` — 覆盖 wallet.json 的私钥
- `CODEDNA_RPC_URL` — 自定义 BSC RPC（默认 bsc-dataseed1.binance.org）

## 合约（BSC Mainnet V3）

- AgentBridge: `0x319881A6F66a832f4f09Ad94128Fb01b1bEB23CE`
- BehaviorEngine: `0x293fbFC88E6d6E01b9428806D7F1F93C23EA4D77`
- GenesisCore: `0x4033AFaFAb90191a4982CdAfa5Cb4E117A91f185`
- DNAGold: `0x660AA4225956975171deE3D78612c7B58c5e96B6`
- NFTSale: `0xcBe90d6F542FCaafCdaCd569EeA66B87af56d7de`

## 官网

- codedna.org — 铸造
- codedna.org/lab — 造物实验室
- codedna.org/world — 世界观察
- codedna.org/market — NFT 交易
- codedna.org/guide — 新手指南
