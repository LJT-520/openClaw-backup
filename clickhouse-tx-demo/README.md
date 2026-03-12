# SpringBoot + ClickHouse + MyBatis-Plus 整合 Demo

> 基于腾讯云文章：SpringBoot集成ClickHouse clickhouse+mybatis-plus配置及使用问题说明

## 项目结构

```
clickhouse-tx-demo/
├── pom.xml
├── src/main/
│   ├── java/com/example/clickhouse/
│   │   ├── ClickHouseTxDemoApplication.java   # 启动类
│   │   ├── config/DruidConfig.java            # Druid 数据源配置
│   │   ├── entity/Stat.java                  # 实体类
│   │   ├── mapper/StatMapper.java             # Mapper 接口
│   │   ├── service/IStatService.java          # Service 接口
│   │   ├── service/impl/StatServiceImpl.java # Service 实现
│   │   └── controller/StatController.java    # Controller
│   └── resources/
│       ├── application.yml                    # 配置
│       ├── mapper/StatMapper.xml             # Mapper XML
│       └── sql/init.sql                      # 建表脚本
```

## 快速开始

### 1. 启动 ClickHouse

```bash
docker run -d --name clickhouse -p 8123:8123 -p 9000:9000 \
  -e CLICKHOUSE_USER=admin -e CLICKHOUSE_PASSWORD=admin123 \
  clickhouse/clickhouse-server
```

### 2. 初始化表

执行 `src/main/resources/sql/init.sql` 或在 ClickHouse Play UI 中执行建表语句。

### 3. 修改配置

编辑 `application.yml`，确保 ClickHouse 连接信息正确：
```yaml
spring:
  datasource:
    click:
      url: jdbc:clickhouse://localhost:8123/default
      username: admin
      password: admin123
```

### 4. 启动项目

```bash
mvn spring-boot:run
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /stat/add | 添加 |
| POST | /stat/addBatch | 批量添加 |
| DELETE | /stat/del/{id} | 删除（ClickHouse风格）|
| PUT | /stat/update | 更新（ClickHouse风格）|
| GET | /stat/list | 查询列表 |
| GET | /stat/{id} | 按ID查询 |

## ClickHouse 注意事项

### 1. 关键字处理
`group` 是 SQL 关键字，需要用反引号：
```java
@TableField("`group`")
```

### 2. DELETE/UPDATE 语法
ClickHouse 不支持标准 DELETE/UPDATE，需要用：
```sql
ALTER TABLE tb_stat DELETE WHERE id = '1';
ALTER TABLE tb_stat UPDATE today = 100 WHERE id = '1';
```

### 3. 日期格式化
```java
@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
private Date statDate;
```

## 依赖版本

- Spring Boot: 2.7.18
- ClickHouse JDBC: 0.2.4
- Druid: 1.1.21
- MyBatis Plus: 3.3.2

## 参考资料

- [腾讯云原文章](https://cloud.tencent.com/developer/article/2563233)
- [ClickHouse 官方文档](https://clickhouse.com/docs/)
