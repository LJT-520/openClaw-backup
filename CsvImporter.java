import java.io.*;
import java.sql.*;
import java.nio.charset.StandardCharsets;

/**
 * 批量导入CSV到MySQL - 支持断点续传
 * 
 * 使用方法:
 * java CsvImporter [csv文件路径] [表名] [字段数]
 * 
 * 例如:
 * java CsvImporter D:/data/test.csv my_table 3
 */
public class CsvImporter {
    
    // ==================== 配置 ====================
    // 数据库配置
    private static final String DB_URL = "jdbc:mysql://localhost:3306/your_database";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "your_password";
    
    // 批量插入大小
    private static final int BATCH_SIZE = 5000;
    
    // 断点记录文件
    private static final String OFFSET_FILE = "import_offset.txt";
    // ==================== 配置结束 ====================
    
    private Connection conn;
    private PreparedStatement ps;
    private BufferedReader reader;
    private int totalInserted = 0;
    
    public static void main(String[] args) {
        if (args.length < 3) {
            System.out.println("用法: java CsvImporter [csv文件] [表名] [字段数]");
            System.out.println("例如: java CsvImporter D:/data/test.csv my_table 3");
            return;
        }
        
        String csvFile = args[0];
        String tableName = args[1];
        int fieldCount = Integer.parseInt(args[2]);
        
        new CsvImporter().importCsv(csvFile, tableName, fieldCount);
    }
    
    public void importCsv(String csvFile, String tableName, int fieldCount) {
        try {
            // 初始化数据库连接
            initDb();
            
            // 读取断点
            int startRow = readOffset();
            
            // 打开文件
            reader = new BufferedReader(new InputStreamReader(
                new FileInputStream(csvFile), StandardCharsets.UTF_8));
            
            // 跳过已导入的行
            for (int i = 0; i < startRow; i++) {
                reader.readLine();
            }
            
            // 跳过CSV表头(如果有)
            // reader.readLine();
            
            System.out.println("从第 " + startRow + " 行开始导入...");
            
            // 准备SQL: INSERT INTO table VALUES (?,?,...)
            StringBuilder sql = new StringBuilder("INSERT INTO ");
            sql.append(tableName).append(" VALUES (");
            for (int i = 0; i < fieldCount; i++) {
                sql.append(i > 0 ? ",?" : "?");
            }
            sql.append(")");
            
            ps = conn.prepareStatement(sql.toString());
            
            // 逐行读取并插入
            String line;
            int batchCount = 0;
            
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                
                String[] fields = parseCsvLine(line);
                
                for (int i = 0; i < fields.length && i < fieldCount; i++) {
                    ps.setString(i + 1, fields[i]);
                }
                ps.addBatch();
                batchCount++;
                totalInserted++;
                
                // 执行批量插入
                if (batchCount >= BATCH_SIZE) {
                    executeBatch(batchCount);
                    batchCount = 0;
                    
                    // 保存断点
                    saveOffset(startRow + totalInserted);
                }
            }
            
            // 处理剩余数据
            if (batchCount > 0) {
                executeBatch(batchCount);
            }
            
            // 完成
            System.out.println("========== 导入完成 ==========");
            System.out.println("总共导入: " + totalInserted + " 行");
            
            // 删除断点文件
            deleteOffset();
            
        } catch (Exception e) {
            e.printStackTrace();
            // 保存断点
            try {
                saveOffset(readOffset() + totalInserted);
            } catch (Exception ex) {}
        } finally {
            close();
        }
    }
    
    private void initDb() throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        conn.setAutoCommit(false);
        
        // 优化参数
        Statement stmt = conn.createStatement();
        stmt.execute("SET unique_checks = 0");
        stmt.execute("SET foreign_key_checks = 0");
        stmt.execute("SET interactive_timeout = 604800");
        stmt.execute("SET net_read_timeout = 600");
        stmt.execute("SET net_write_timeout = 600");
    }
    
    private void executeBatch(int count) throws SQLException {
        ps.executeBatch();
        conn.commit();
        
        int currentRow = readOffset() + totalInserted;
        System.out.println("已导入 " + currentRow + " 行 (" + count + "条/批)");
    }
    
    /**
     * 解析CSV行(处理带引号的字段)
     */
    private String[] parseCsvLine(String line) {
        // 简单处理: 直接按逗号分割
        // 实际生产环境建议使用开源库如 OpenCSV
        return line.split(",(?=([^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)", -1);
    }
    
    // ==================== 断点续传 ====================
    
    private int readOffset() {
        File f = new File(OFFSET_FILE);
        if (!f.exists()) return 0;
        
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String line = br.readLine();
            return line != null ? Integer.parseInt(line.trim()) : 0;
        } catch (Exception e) {
            return 0;
        }
    }
    
    private void saveOffset(int row) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(OFFSET_FILE))) {
            bw.write(String.valueOf(row));
            bw.flush();
        } catch (Exception e) {
            System.err.println("保存断点失败: " + e.getMessage());
        }
    }
    
    private void deleteOffset() {
        new File(OFFSET_FILE).delete();
    }
    
    // ==================== 清理资源 ====================
    
    private void close() {
        try {
            if (ps != null) ps.close();
            if (conn != null) conn.close();
            if (reader != null) reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
