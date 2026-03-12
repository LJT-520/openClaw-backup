package com.example.clickhouse;

import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.service.IStatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ClickHouse 大批量插入测试
 */
@SpringBootTest
public class LargeBatchInsertTest {

    @Autowired
    private IStatService statService;

    /**
     * 测试：每20万条提交一次
     * 
     * 调用方式：
     * statService.batchInsertLargeData(数据列表);
     */
    @Test
    public void testBatchInsert200K() {
        // 生成20万条测试数据
        System.out.println("正在生成20万条测试数据...");
        List<Stat> dataList = statService.generateTestData(200_0000);
        
        // 每20万条插入一次
        System.out.println("开始插入20万条数据...");
        int batches = statService.batchInsertLargeData(dataList);
        
        assertTrue(batches > 0, "插入失败");
        System.out.println("✅ 测试通过！共插入 " + batches + " 批");
    }

    /**
     * 测试：插入100万条（分5批）
     */
    @Test
    public void testBatchInsert1M() {
        System.out.println("正在生成100万条测试数据...");
        List<Stat> dataList = statService.generateTestData(1_000_000);
        
        System.out.println("开始插入100万条数据...");
        int batches = statService.batchInsertLargeData(dataList);
        
        assertTrue(batches > 0, "插入失败");
        System.out.println("✅ 测试通过！共插入 " + batches + " 批");
    }

    /**
     * 测试：生成数据
     */
    @Test
    public void testGenerateData() {
        List<Stat> dataList = statService.generateTestData(100);
        
        assertNotNull(dataList);
        assertEquals(100, dataList.size());
        
        System.out.println("生成100条测试数据：");
        for (int i = 0; i < 5; i++) {
            System.out.println("  " + dataList.get(i));
        }
    }
}
