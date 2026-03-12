package com.example.clickhouse.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.service.IStatService;
import com.example.clickhouse.service.impl.StatServiceImpl.BatchInsertResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 统计 Controller - 完整 CRUD 示例
 */
@RestController
@RequestMapping("/stat")
public class StatController {

    @Autowired
    private IStatService statService;

    // ========== 插入操作 ==========

    /**
     * 添加单条数据
     */
    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody Stat stat) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = statService.save(stat);
            result.put("success", success);
            result.put("message", success ? "添加成功" : "添加失败");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "添加失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 批量添加（优化版，自动合并）
     */
    @PostMapping("/addBatch")
    public Map<String, Object> addBatch(@RequestBody List<Stat> list) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = statService.saveBatchAndOptimize(list);
            result.put("success", success);
            result.put("count", list.size());
            result.put("message", success ? "批量添加成功" : "批量添加失败");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "批量添加失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 大批量插入（每20万条提交一次）
     */
    @PostMapping("/addLarge")
    public Map<String, Object> addLarge(@RequestBody List<Stat> list) {
        Map<String, Object> result = new HashMap<>();
        try {
            long start = System.currentTimeMillis();
            int batches = statService.batchInsertLargeData(list);
            long cost = System.currentTimeMillis() - start;
            
            result.put("success", true);
            result.put("totalCount", list.size());
            result.put("batches", batches);
            result.put("costTime", cost + "ms");
            result.put("message", "大批量插入完成");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "大批量插入失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 多线程大批量插入
     * @param count 数据量
     * @param threads 线程数
     */
    @PostMapping("/addMultiThread")
    public Map<String, Object> addMultiThread(
            @RequestParam(defaultValue = "200000") int count,
            @RequestParam(defaultValue = "4") int threads) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 生成测试数据
            List<Stat> dataList = statService.generateTestData(count);
            
            // 多线程插入
            BatchInsertResult insertResult = (BatchInsertResult) statService.batchInsertMultiThread(dataList, threads);
            
            result.put("success", true);
            result.put("totalCount", count);
            result.put("threads", threads);
            result.put("successCount", insertResult.successCount);
            result.put("failCount", insertResult.failCount);
            result.put("costTime", insertResult.costTimeMs + "ms");
            result.put("message", "多线程插入完成");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "多线程插入失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 生成测试数据并插入
     */
    @PostMapping("/generateAndInsert")
    public Map<String, Object> generateAndInsert(@RequestParam(defaultValue = "100") int count) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 生成测试数据
            List<Stat> dataList = statService.generateTestData(count);
            
            // 插入
            boolean success = statService.saveBatchAndOptimize(dataList);
            
            result.put("success", success);
            result.put("generatedCount", count);
            result.put("message", success ? "生成并插入成功" : "插入失败");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "生成并插入失败: " + e.getMessage());
        }
        return result;
    }

    // ========== 查询操作 ==========

    /**
     * 查询所有（带分页）
     */
    @GetMapping("/list")
    public Map<String, Object> list(
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "1") int current) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 先强制合并，确保查询一致性
            statService.optimizeTable();
            
            // 等待合并完成
            Thread.sleep(500);
            
            // 查询
            LambdaQueryWrapper<Stat> wrapper = new LambdaQueryWrapper<>();
            wrapper.orderByDesc(Stat::getStatDate).last("LIMIT " + size);
            
            List<Stat> list = statService.list(wrapper);
            
            result.put("success", true);
            result.put("data", list);
            result.put("count", list.size());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 根据ID查询
     */
    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        Map<String, Object> result = new HashMap<>();
        try {
            Stat stat = statService.getById(id);
            result.put("success", true);
            result.put("data", stat);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 统计查询
     */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 先合并
            statService.optimizeTable();
            Thread.sleep(500);
            
            List<Stat> all = statService.list();
            
            // 统计
            int total = all.size();
            int totalYesterday = all.stream().mapToInt(s -> s.getYesterday() != null ? s.getYesterday() : 0).sum();
            int totalToday = all.stream().mapToInt(s -> s.getToday() != null ? s.getToday() : 0).sum();
            
            result.put("success", true);
            result.put("totalCount", total);
            result.put("totalYesterday", totalYesterday);
            result.put("totalToday", totalToday);
            result.put("message", "统计完成");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "统计失败: " + e.getMessage());
        }
        return result;
    }

    // ========== 更新操作 ==========

    /**
     * 更新数据（ClickHouse 风格）
     * 注意：不能更新排序键字段 (stat_date, region, group)
     */
    @PutMapping("/update")
    public Map<String, Object> update(@RequestBody Stat stat) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = statService.alterUpdate(stat);
            result.put("success", success);
            result.put("message", success ? "更新成功" : "更新失败");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }

    // ========== 删除操作 ==========

    /**
     * 删除数据（ClickHouse 风格）
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean success = statService.alterDelete(id);
            result.put("success", success);
            result.put("message", success ? "删除成功" : "删除失败");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }

    // ========== 维护操作 ==========

    /**
     * 强制合并（确保查询一致性）
     */
    @PostMapping("/optimize")
    public Map<String, Object> optimize() {
        Map<String, Object> result = new HashMap<>();
        try {
            long start = System.currentTimeMillis();
            statService.optimizeTable();
            long cost = System.currentTimeMillis() - start;
            
            result.put("success", true);
            result.put("costTime", cost + "ms");
            result.put("message", "合并完成");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "合并失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("service", "ClickHouse Demo");
        return result;
    }
}
