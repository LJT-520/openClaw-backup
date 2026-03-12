package com.example.clickhouse;

import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.mapper.StatMapper;
import com.example.clickhouse.service.IStatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ClickHouse 单元测试
 */
@SpringBootTest
public class ClickHouseTxDemoApplicationTests {

    @Autowired
    private IStatService statService;

    @Autowired
    private StatMapper statMapper;

    /**
     * 生成唯一ID
     */
    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    /**
     * 测试添加单条数据
     */
    @Test
    public void testAdd() {
        Stat stat = new Stat();
        stat.setId(generateId());
        stat.setRegion("北京");
        stat.setGroup("A组");
        stat.setYesterday(100);
        stat.setToday(200);
        stat.setStatDate(new Date());
        
        boolean result = statService.save(stat);
        assertTrue(result, "添加数据失败");
        System.out.println("✅ 测试通过：添加数据成功，ID=" + stat.getId());
    }

    /**
     * 测试批量添加（优化版）
     */
    @Test
    public void testAddBatch() {
        List<Stat> list = new ArrayList<>();
        Random random = new Random();
        
        for (int i = 0; i < 100000; i++) {
            Stat stat = new Stat();
            stat.setId(generateId());
            stat.setRegion("上海");
            stat.setGroup("B组");
            stat.setYesterday(random.nextInt(100));
            stat.setToday(random.nextInt(100));
            stat.setStatDate(new Date());
            list.add(stat);
        }
        
        // 使用优化后的批量插入
        boolean result = statService.saveBatchAndOptimize(list);
        assertTrue(result, "批量添加数据失败");
        System.out.println("✅ 测试通过：批量添加 " + list.size() + " 条数据（已强制合并）");
    }

    /**
     * 测试查询列表（使用 FINAL 确保一致性）
     */
    @Test
    public void testList() {
        // 先强制合并
        statService.optimizeTable();
        
        List<Stat> list = statService.list();
        assertNotNull(list, "查询结果为null");
        System.out.println("✅ 测试通过：查询到 " + list.size() + " 条数据");
        
        for (Stat stat : list) {
            System.out.println("  - " + stat.getId() + ", " + stat.getRegion() + 
                             ", " + stat.getGroup() + ", 昨日=" + stat.getYesterday() + 
                             ", 今日=" + stat.getToday());
        }
    }

    /**
     * 测试按ID查询
     */
    @Test
    public void testGetById() {
        // 先添加一条测试数据
        Stat stat = new Stat();
        String testId = generateId();
        stat.setId(testId);
        stat.setRegion("广州");
        stat.setGroup("C组");
        stat.setYesterday(50);
        stat.setToday(75);
        stat.setStatDate(new Date());
        statService.save(stat);
        
        // 查询
        Stat result = statService.getById(testId);
        assertNotNull(result, "查询结果为null");
        assertEquals(testId, result.getId(), "ID不匹配");
        
        System.out.println("✅ 测试通过：按ID查询成功，" + result);
    }

    /**
     * 测试删除（ClickHouse 风格）
     */
    @Test
    public void testDelete() {
        // 先添加一条测试数据
        Stat stat = new Stat();
        String testId = generateId();
        stat.setId(testId);
        stat.setRegion("深圳");
        stat.setGroup("D组");
        stat.setYesterday(30);
        stat.setToday(40);
        stat.setStatDate(new Date());
        statService.save(stat);
        
        // 删除
        boolean result = statService.alterDelete(testId);
        assertTrue(result, "删除数据失败");
        
        System.out.println("✅ 测试通过：删除成功，ID=" + testId);
    }

    /**
     * 测试更新（ClickHouse 风格）
     */
    @Test
    public void testUpdate() {
        // 先添加一条测试数据
        Stat stat = new Stat();
        String testId = generateId();
        stat.setId(testId);
        stat.setRegion("杭州");
        stat.setGroup("E组");
        stat.setYesterday(20);
        stat.setToday(30);
        stat.setStatDate(new Date());
        statService.save(stat);
        
        // 更新（只能更新非排序键字段）
        stat.setToday(99);
        boolean result = statService.alterUpdate(stat);
        assertTrue(result, "更新数据失败");
        
        System.out.println("✅ 测试通过：更新成功，ID=" + testId + ", 今日=" + stat.getToday());
    }

    /**
     * 测试 ClickHouse 连接
     */
    @Test
    public void testConnection() {
        List<Stat> list = statService.list();
        assertNotNull(list, "无法连接 ClickHouse");
        System.out.println("✅ 测试通过：ClickHouse 连接正常，当前有 " + list.size() + " 条数据");
    }
    
    /**
     * 测试强制合并
     */
    @Test
    public void testOptimize() {
        statService.optimizeTable();
        System.out.println("✅ 强制合并完成");
    }
}
