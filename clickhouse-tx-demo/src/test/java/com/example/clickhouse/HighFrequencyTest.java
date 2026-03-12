package com.example.clickhouse;

import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.service.IStatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 小批量插入 + 高频查询测试
 */
@SpringBootTest
public class HighFrequencyTest {

    @Autowired
    private IStatService statService;

    /**
     * 生成测试数据
     */
    private Stat generateOne() {
        Stat stat = new Stat();
        stat.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        stat.setRegion("北京");
        stat.setGroup("A组");
        stat.setYesterday((int)(Math.random() * 100));
        stat.setToday((int)(Math.random() * 100));
        stat.setStatDate(new java.util.Date());
        return stat;
    }

    /**
     * 测试1：小批量插入后立即查询
     */
    @Test
    public void testSmallBatchInsert() {
        System.out.println("=== 小批量插入后立即查询 ===");
        
        // 插入10条
        for (int i = 0; i < 10; i++) {
            statService.save(generateOne());
        }
        
        // 立即查询
        List<Stat> result = statService.list();
        System.out.println("插入10条后，立即查询到: " + result.size() + " 条");
        
        assertTrue(result.size() >= 10);
    }

    /**
     * 测试2：高频插入，每秒多次
     */
    @Test
    public void testHighFrequency() {
        System.out.println("=== 高频插入测试 ===");
        
        for (int i = 0; i < 20; i++) {
            // 插入
            statService.save(generateOne());
            System.out.println("第 " + (i+1) + " 次插入");
            
            // 立即查询
            List<Stat> result = statService.list();
            System.out.println("  查询到: " + result.size() + " 条");
        }
    }

    /**
     * 测试3：循环插入，频繁查询
     */
    @Test
    public void testLoopInsertQuery() {
        System.out.println("=== 循环插入频繁查询 ===");
        
        for (int batch = 0; batch < 5; batch++) {
            // 每批5条
            for (int i = 0; i < 5; i++) {
                statService.save(generateOne());
            }
            
            // 立即查询
            List<Stat> result = statService.list();
            System.out.println("第 " + (batch+1) + " 批，查询到: " + result.size() + " 条");
        }
    }
}
