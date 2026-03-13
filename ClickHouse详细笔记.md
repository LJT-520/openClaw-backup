# 📚 ClickHouse 完整详细笔记

> 基于博客园文章整理

---

## 一、ClickHouse 概述

### 1.1 什么是 ClickHouse？

**ClickHouse** 是一个用于**在线分析处理查询（OLAP）**的**列式数据库管理系统（DBMS）**。

- 由 **Altinity** 公司开发
- 支持**线性扩展**
- 高性能**数据压缩**
- 以卓越的**数据处理速度**闻名
- 适合**大规模数据集**的实时查询和分析

### 1.2 OLTP vs OLAP

| 特性 | OLTP (MySQL) | OLAP (ClickHouse) |
|------|---------------|-------------------|
| 用途 | 事务处理 | 数据分析 |
| 数据量 | 小数据量 | 大规模数据 |
| 操作 | 频繁增删改 | 批量写入，很少修改 |
| 查询 | 简单快速 | 复杂分析查询 |
| 事务 | 强事务 | 无事务 |

### 1.3 OLAP 数据库特点

```
✓ 绝大多数是读请求
✓ 数据以大批次更新（不是单行）
✓ 已添加的数据不能修改
✓ 读取时取大量行，但只取少量列
✓ 宽表（大量列）
✓ 查询较少（每秒数百次）
✓ 允许延迟约50毫秒
✓ 列中数据较小（数字、短字符串）
✓ 需要高吞吐量（每秒数十亿行）
✓ 事务非必须
✓ 对数据一致性要求低
✓ 一个查询一个大表
✓ 查询结果远小于源数据
```

---

## 二、数据类型详解

### 2.1 整数类型

#### 有符号整数
| 类型 | 字节 | 范围 |
|------|------|------|
| Int8 | 1 | -128 ~ 127 |
| Int16 | 2 | -32,768 ~ 32,767 |
| Int32 | 4 | -2,147,483,648 ~ 2,147,483,647 |
| Int64 | 8 | -9223372036854775808 ~ 9223372036854775807 |
| Int128 | 16 | 非常大 |
| Int256 | 32 | 非常大 |

#### 无符号整数
| 类型 | 字节 | 范围 |
|------|------|------|
| UInt8 | 1 | 0 ~ 255 |
| UInt16 | 2 | 0 ~ 65,535 |
| UInt32 | 4 | 0 ~ 4,294,967,295 |
| UInt64 | 8 | 0 ~ 18,446,744,073,709,551,615 |
| UInt128 | 16 | 非常大 |
| UInt256 | 32 | 非常大 |

### 2.2 字符串类型

#### String
- 可变长字符串
- 类似于 SQL 中的 VARCHAR
- 可存储任意长度字符串
- 缺点：长度不同时可能影响性能

#### FixedString(N)
- 固定长度字符串
- N 是字节长度
- 如果字符串短于 N：用空格填充
- 如果字符串长于 N：截断
- **优点**：大小固定，易于缓存和处理，性能更好

### 2.3 日期时间类型

| 类型 | 格式 | 占用空间 |
|------|------|----------|
| Date | YYYY-MM-DD | 3字节 |
| Date32 | YYYY-MM-DD | 4字节（支持闰秒） |
| DateTime | YYYY-MM-DD HH:MM:SS | 8字节 |
| DateTime64 | 纳秒级精度 | 12字节 |

#### 插入示例

```sql
-- 建表
CREATE TABLE date_test (
    date1 Date,
    date2 Date32,
    date3 DateTime,
    date4 DateTime64
) ENGINE = TinyLog;

-- 插入日期（字符串格式）
INSERT INTO date_test VALUES (
    '2023-11-21',  -- Date
    '2023-11-21',  -- Date32
    '2023-11-21',  -- DateTime 默认 00:00:00
    '2023-11-21'   -- DateTime64 默认 00:00:00.000
);

-- 插入时间戳
INSERT INTO date_test VALUES (
    1729751474,    -- Date (秒/86400)
    1729751474,    -- Date32 (秒/86400)
    1729751474,    -- DateTime (秒)
    1729751474903  -- DateTime64 (毫秒)
);
```

**注意**：
- Date 和 Date32 以**天**计算时间戳
- DateTime 以**秒**计算时间戳
- DateTime64 以**毫秒**计算时间戳

### 2.4 UUID 类型

```sql
-- UUID 用于存储通用唯一识别码，占用16字节
CREATE TABLE t (id UUID) ENGINE = TinyLog;
INSERT INTO t VALUES ('550e8400-e29b-41d4-a716-446655440000');
```

### 2.5 可为空类型

```sql
-- Nullable(T) 表示可以存储 NULL 值
CREATE TABLE student (
    id Nullable(Int32),
    name FixedString(12),
    age Int16
) ENGINE = TinyLog;

INSERT INTO student VALUES (null, 'bob', 20);
```

### 2.6 数组类型

```sql
-- Array(T) 存储同一类型的多个值
CREATE TABLE stu3 (
    id Int32,
    name String,
    age Nullable(Int32),
    gender FixedString(8),
    clazz String,
    likes Array(String)
) ENGINE = TinyLog;

INSERT INTO stu3 VALUES (
    1001, 
    '老六', 
    18, 
    '男', 
    '数加32期', 
    array('唱', '跳', 'rap')
);
```

### 2.7 小数类型

| 类型 | 说明 |
|------|------|
| Decimal(P, S) | 有符号定点数，P=总位数，S=小数位数 |
| Decimal32(S) | 32位，S=0~18 |
| Decimal64(S) | 64位，S=0~18 |
| Decimal128(S) | 128位，S=0~38 |

```sql
-- 示例
CREATE TABLE decimal_test (
    d1 Decimal(10, 2),   -- 总10位，小数2位
    d2 Decimal32(2),
    d3 Decimal64(2),
    d4 Decimal128(2)
) ENGINE = TinyLog;
```

---

## 三、表操作

### 3.1 建表语法

```sql
CREATE TABLE user3 (
    id Int64,                          -- 64位整数
    name FixedString(12),              -- 固定12字节
    gender Nullable(FixedString(3)),    -- 可空的固定字符串
    clazz String                        -- 可变字符串
) ENGINE = TinyLog;
```

### 3.2 插入数据

```sql
-- 单条插入
INSERT INTO user3 VALUES (1001, '小刚子', '男', '特训营32期');

-- 批量插入
INSERT INTO user3 VALUES 
    (1001, '小刚子', '男', '特训营32期'),
    (1002, '大老虎', '男', '特训营32期');
```

---

## 四、表引擎（重点！）

### 4.1 日志引擎家族

#### 特点
- 实现简单，易于理解
- **无索引**（查询需全表扫描）
- 写入性能高
- 读取性能低

#### Log 引擎
- 每个插入的数据块存储为一个文件
- **不支持并发写入**
- 读取按文件顺序（线程安全）
- 无索引，全表扫描

#### TinyLog 引擎
- 所有列存储在**单个文件**中
- 比 Log 引擎更简单
- 处理小表高效
- 不支持索引
- 适合数据量不大、写入不频繁的场景

#### StripeLog 引擎
- 所有列数据存一个文件
- 每个数据块是一个条带（stripe）
- 写入高效
- 读取可并行
- **不支持** ALTER UPDATE/DELETE

#### 使用场景
| 场景 | 推荐引擎 |
|------|---------|
| 临时数据存储 | TinyLog |
| 测试开发 | TinyLog |
| 审计日志 | StripeLog |
| 生产环境 | ❌ 不推荐 |

### 4.2 MergeTree 家族（生产主流）

#### 核心特点

```
✓ 数据片段快速写入
✓ 后台自动合并
✓ 主键排序存储
✓ 支持分区（Partition）
✓ 支持副本（Replication）
✓ 支持高并发写入
✓ 支持数据采样
```

#### 建表示例

```sql
CREATE TABLE goods_orders (
    id String,
    uname String,
    goods_name String,
    price Int64,
    date Date32
) ENGINE = MergeTree()
ORDER BY date
PARTITION BY date;
```

#### 插入数据

```sql
INSERT INTO goods_orders VALUES 
    ('1001', '光头强', 'oppo手机', 7000, '2024-10-24'),
    ('1002', '熊大', '机械革命电脑', 10000, '2024-10-22'),
    ('1003', '熊二', 'iphone14', 5000, '2024-10-24'),
    ('1004', '翠花', 'AI吸尘器', 17000, '2024-10-22');
```

#### 家族成员

| 引擎 | 用途 |
|------|------|
| MergeTree | 基础版 |
| ReplicatedMergeTree | 多副本部署 |
| CollapsingMergeTree | 处理事件累积量 |
| SummingMergeTree | 自动求和 |
| AggregatingMergeTree | 预聚合 |
| VersionedCollapsingMergeTree | 版本控制折叠 |
| GraphiteMergeTree | Graphite时间序列 |

#### MergeTree vs 日志引擎

| 特性 | 日志引擎 | MergeTree |
|------|---------|-----------|
| 索引 | 无 | 稀疏索引 |
| 分区 | 不支持 | 支持 |
| 副本 | 不支持 | 支持 |
| 并发写入 | Log不支持 | 支持 |
| 查询性能 | 低 | 高 |
| 适用场景 | 测试/临时 | 生产环境 |

---

## 五、常用函数

### 5.1 算术函数

| 函数 | 说明 |
|------|------|
| plus(a, b) | 加法 |
| minus(a, b) | 减法 |
| multiply(a, b) | 乘法 |
| divide(a, b) | 除法 |
| intDiv(a, b) | 整除 |

### 5.2 比较函数

| 符号 | 说明 |
|------|------|
| =, == | 等于 |
| !=, <> | 不等于 |
| > | 大于 |
| >= | 大于等于 |
| < | 小于 |
| <= | 小于等于 |

### 5.3 类型转换函数

```sql
-- 日期时间转换
SELECT toYear('2023-11-21');       -- 2023
SELECT toMonth('2023-11-21');      -- 11
SELECT toDay('2023-11-21');        -- 21

-- 字符串转换
SELECT toString(123);              -- '123'

-- 数字转换
SELECT toDecimal32(123.456, 2);   -- 123.46
```

---

## 六、实践案例

### 案例1：创建表并插入数据

```sql
CREATE TABLE example_table (
    id Int32,
    name String,
    birth_date Date
) ENGINE = MergeTree() ORDER BY id;

INSERT INTO example_table VALUES 
    (1, 'John Doe', '1990-01-01'),
    (2, 'Jane Doe', '1992-05-15');
```

### 案例2：使用函数

```sql
SELECT 
    id,
    name,
    toYear(birth_date) AS birth_year,
    plus(id, 100) AS new_id
FROM example_table;
```

### 案例3：类型转换

```sql
SELECT toDecimal32(12345678901234567890, 2) AS decimal_value;
```

---

## 七、连接方式

### 7.1 命令行客户端

```bash
# 本地连接
clickhouse-client

# 远程连接
clickhouse-client -h 192.168.1.100 -u username --password password

# 指定端口
clickhouse-client --port 9000
```

### 7.2 HTTP 接口

```bash
# GET 请求
curl 'http://localhost:8123/?query=SELECT+1'

# POST 请求
echo "SELECT * FROM users LIMIT 5" | curl --data-binary @- \
  'http://localhost:8123/'
```

---

## 八、总结

### 8.1 为什么选择 ClickHouse？

| 优势 | 说明 |
|------|------|
| 🚀 快 | 列式存储 + 向量化的执行 |
| 💾 省 | 高压缩比 |
| 📊 OLAP | 专为分析设计 |
| 🌐 分布式 | 支持集群部署 |
| 💰 开源 | 免费使用 |

### 8.2 局限性

```
❌ 不支持事务
❌ 不支持强一致性（弱一致性）
❌ 不支持真正的更新/删除（通过后台合并）
❌ 不适合 OLTP 场景
```

### 8.3 选型建议

| 场景 | 推荐引擎 |
|------|---------|
| 测试/临时表 | TinyLog |
| 小数据分析 | TinyLog |
| 生产环境 | MergeTree |
| 高可用 | ReplicatedMergeTree |
| 实时分析 | MergeTree + 物化视图 |

---

*整理时间：2026-03-09*
*来源：博客园 - bjynjj*
