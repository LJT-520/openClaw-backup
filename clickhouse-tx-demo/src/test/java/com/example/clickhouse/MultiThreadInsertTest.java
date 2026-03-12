package com.example.clickhouse;

import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.service.IStatService;
import com.example.clickhouse.service.impl.StatServiceImpl.BatchInsertResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ClickHouse 多线程批量插入测试
 */
@SpringBootTest
public class MultiThreadInsertTest {

    @Autowired
    private IStatService statService;

    /**
     * 测试1：使用 Thread 插入 10万条（4线程）
     */
    @Test
    public void testThreadInsert100K() {
        System.out.println("========== 测试：Thread 插入 10万条 ==========");
        
        // 生成10万条测试数据
        List<Stat> dataList = statService.generateTestData(100_000);
        
        // 使用 Thread 插入（4线程）
        BatchInsertResult result = statService.batchInsertWithThread(dataList, 4);
        
        System.out.println("结果: " + result);
        assertTrue(result.successCount > 0, "插入失败");
    }

    /**
     * 测试2：使用 Thread 插入 20万条（4线程）
     */
    @Test
    public void testThreadInsert200K() {
        System.out.println("========== 测试：Thread 插入 20万条 ==========");
        
        List<Stat> dataList = statService.generateTestData(200_000);
        
        BatchInsertResult result = statService.batchInsertWithThread(dataList, 4);
        
        System.out.println("结果: " + result);
        assertTrue(result.successCount > 0, "插入失败");
    }

    /**
     * 测试3：使用 Thread 插入 50万条（8线程）
     */
    @Test
    public void testThreadInsert500K() {
        System.out.println("========== 测试：Thread 插入 50万条 ==========");
        
        List<Stat> dataList = statService.generateTestData(500_000);
        
        BatchInsertResult result = statService.batchInsertWithThread(dataList, 8);
        
        System.out.println("结果: " + result);
        assertTrue(result.successCount > 0, "插入失败");
    }

    /**
     * 测试4：使用 Thread 插入 100万条（8线程）
     */
    @Test
    public void testThreadInsert1M() {
        System.out.println("========== 测试：Thread 插入 100万条 ==========");
        
        List<Stat> dataList = statService.generateTestData(1_000_0000);
        
        BatchInsertResult result = statService.batchInsertWithThread(dataList, 8);
        
        System.out.println("结果: " + result);
        assertTrue(result.successCount > 0, "插入失败");
    }

    /**
     * 测试5：默认线程数（4线程）
     */
    @Test
    public void testThreadInsertDefault() {
        System.out.println("========== 测试：Thread 默认线程 ==========");
        
        // 生成20万条
        List<Stat> dataList = statService.generateTestData(200_000);
        
        // 不指定线程数（默认4）
        BatchInsertResult result = statService.batchInsertWithThread(dataList,4);
        
        System.out.println("结果: " + result);
        assertTrue(result.successCount > 0, "插入失败");
    }

    /**
     * 测试6：生成测试数据
     */
    @Test
    public void testGenerateData() {
        System.out.println("========== 测试：生成测试数据 ==========");
        
        List<Stat> dataList = statService.generateTestData(100);
        
        assertNotNull(dataList);
        assertEquals(100, dataList.size());
        
        System.out.println("生成100条测试数据：");
        for (int i = 0; i < 5; i++) {
            System.out.println("  " + dataList.get(i));
        }
    }
}
