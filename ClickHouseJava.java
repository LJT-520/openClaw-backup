package com.example.clickhouse;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ClickHouse Java 客户端工具类
 * 使用 JDBC 连接 ClickHouse
 */
public class ClickHouseClient {

    private final String url;
    private final String user;
    private final String password;

    /**
     * 构造方法
     * @param host ClickHouse 主机地址
     * @param port 端口（默认8123）
     * @param database 数据库名
     * @param user 用户名（默认default）
     * @param password 密码
     */
    public ClickHouseClient(String host, int port, String database, String user, String password) {
        this.url = String.format("jdbc:clickhouse://%s:%d/%s", host, port, database);
        this.user = user;
        this.password = password;
    }

    /**
     * 获取数据库连接
     */
    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    /**
     * 执行查询，返回结果集
     */
    public List<Map<String, Object>> executeQuery(String sql) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();
            
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnLabel(i), rs.getObject(i));
                }
                results.add(row);
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("查询执行失败: " + e.getMessage(), e);
        }
        
        return results;
    }

    /**
     * 执行更新（INSERT/UPDATE/DELETE）
     */
    public int executeUpdate(String sql) {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            
            return stmt.executeUpdate(sql);
            
        } catch (SQLException e) {
            throw new RuntimeException("更新执行失败: " + e.getMessage(), e);
        }
    }

    /**
     * 批量插入
     */
    public void batchInsert(String tableName, List<Map<String, Object>> dataList) {
        if (dataList == null || dataList.isEmpty()) {
            return;
        }

        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO ").append(tableName).append(" (");

        // 获取列名
        Map<String, Object> firstRow = dataList.get(0);
        String[] columns = firstRow.keySet().toArray(new String[0]);
        
        for (int i = 0; i < columns.length; i++) {
            sql.append(columns[i]);
            if (i < columns.length - 1) {
                sql.append(", ");
            }
        }
        sql.append(") VALUES ");

        // 构建 VALUES 部分
        for (int i = 0; i < dataList.size(); i++) {
            Map<String, Object> row = dataList.get(i);
            sql.append("(");
            for (int j = 0; j < columns.length; j++) {
                Object value = row.get(columns[j]);
                if (value == null) {
                    sql.append("NULL");
                } else if (value instanceof Number) {
                    sql.append(value);
                } else {
                    sql.append("'").append(value.toString().replace("'", "''")).append("'");
                }
                if (j < columns.length - 1) {
                    sql.append(", ");
                }
            }
            sql.append(")");
            if (i < dataList.size() - 1) {
                sql.append(", ");
            }
        }

        executeUpdate(sql.toString());
    }

    /**
     * 创建表（示例）
     */
    public void createTable(String sql) {
        executeUpdate(sql);
    }

    /**
     * 关闭连接（其实用 try-with-resources 就不需要了）
     */
    public void close() {
        // 如果有连接池，在这里归还连接
    }

    // ========== 主方法测试 ==========
    public static void main(String[] args) {
        // 配置 ClickHouse 连接信息
        ClickHouseClient client = new ClickHouseClient(
            "localhost",      // 主机
            8123,             // 端口
            "default",        // 数据库
            "default",        // 用户
            ""                // 密码（默认无密码）
        );

        // 1. 创建表
        String createSql = """
            CREATE TABLE IF NOT EXISTS user_activity (
                id Int32,
                username String,
                event_type String,
                event_time DateTime,
                score Float32
            ) ENGINE = MergeTree()
            ORDER BY id
            """;
        
        try {
            client.createTable(createSql);
            System.out.println("✅ 表创建成功");
        } catch (Exception e) {
            System.out.println("表可能已存在: " + e.getMessage());
        }

        // 2. 插入数据
        String insertSql = "INSERT INTO user_activity VALUES " +
            "(1, '张三', 'login', '2026-03-10 10:00:00', 10.5), " +
            "(2, '李四', 'purchase', '2026-03-10 10:05:00', 100.0), " +
            "(3, '王五', 'logout', '2026-03-10 10:10:00', 5.0)";
        
        client.executeUpdate(insertSql);
        System.out.println("✅ 数据插入成功");

        // 3. 查询数据
        String querySql = "SELECT * FROM user_activity ORDER BY id";
        List<Map<String, Object>> results = client.executeQuery(querySql);
        
        System.out.println("\n📊 查询结果：");
        for (Map<String, Object> row : results) {
            System.out.println(row);
        }

        // 4. 聚合查询
        String aggSql = """
            SELECT 
                event_type, 
                count() as cnt, 
                avg(score) as avg_score 
            FROM user_activity 
            GROUP BY event_type
            """;
        
        List<Map<String, Object>> aggResults = client.executeQuery(aggSql);
        System.out.println("\n📈 聚合结果：");
        for (Map<String, Object> row : aggResults) {
            System.out.println(row);
        }
    }
}
