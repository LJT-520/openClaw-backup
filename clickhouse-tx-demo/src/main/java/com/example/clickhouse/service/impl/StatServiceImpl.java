package com.example.clickhouse.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.mapper.StatMapper;
import com.example.clickhouse.service.IStatService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Stat Service 实现类 - Memory 引擎，无需合并
 */
@Service
public class StatServiceImpl extends ServiceImpl<StatMapper, Stat> implements IStatService {

    @Resource
    private JdbcTemplate jdbcTemplate;

    // 每线程处理数量
    private static final int THREAD_BATCH_SIZE = 50_000;
    
    // 默认线程数
    private static final int DEFAULT_THREADS = 4;

    /**
     * 使用 Thread 多线程插入（无需合并）
     */
    public BatchInsertResult batchInsertWithThread(List<Stat> allData, int threadCount) {
        if (allData == null || allData.isEmpty()) {
            return new BatchInsertResult(0, 0, 0);
        }

        long startTime = System.currentTimeMillis();
        int totalCount = allData.size();
        int threads = threadCount > 0 ? threadCount : DEFAULT_THREADS;
        
        int batchSize = Math.max(THREAD_BATCH_SIZE, totalCount / threads);
        
        System.out.println("========== Thread 多线程插入开始 ==========");
        System.out.println("总数据量: " + totalCount);
        System.out.println("Thread数: " + threads);

        final int[] successCount = {0};
        final int[] failCount = {0};
        
        List<Thread> threadList = new ArrayList<>();
        
        for (int i = 0; i < totalCount; i += batchSize) {
            final int start = i;
            final int end = Math.min(i + batchSize, totalCount);
            final int batchIndex = i / batchSize + 1;
            
            Thread thread = new Thread(() -> {
                try {
                    List<Stat> batch = allData.subList(start, end);
                    boolean success = super.saveBatch(batch);
                    
                    if (success) {
                        successCount[0] += batch.size();
                        System.out.println(Thread.currentThread().getName() + " - 第" + batchIndex + "批完成 (" + batch.size() + "条)");
                    } else {
                        failCount[0] += batch.size();
                    }
                } catch (Exception e) {
                    failCount[0] += (end - start);
                    System.err.println(Thread.currentThread().getName() + " - 异常: " + e.getMessage());
                }
            });
            
            threadList.add(thread);
            thread.start();
        }

        try {
            for (Thread thread : threadList) {
                thread.join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        long costTime = System.currentTimeMillis() - startTime;
        
        System.out.println("========== 插入完成 ==========");
        System.out.println("成功: " + successCount[0] + " 条");
        System.out.println("失败: " + failCount[0] + " 条");
        System.out.println("耗时: " + costTime + " ms");
        
        // Memory 引擎不需要合并！
        
        return new BatchInsertResult(successCount[0], failCount[0], costTime);
    }

    public BatchInsertResult batchInsertWithThread(List<Stat> allData) {
        return batchInsertWithThread(allData, DEFAULT_THREADS);
    }

    public BatchInsertResult batchInsertMultiThread(List<Stat> allData, int threadCount) {
        return batchInsertWithThread(allData, threadCount);
    }

    public BatchInsertResult batchInsertMultiThread(List<Stat> allData) {
        return batchInsertWithThread(allData);
    }

    @Override
    public boolean alterDelete(String id) {
        int result = baseMapper.alterDelete(id);
        return result >= 0;
    }

    @Override
    public boolean alterUpdate(Stat stat) {
        int result = baseMapper.alterUpdate(stat);
        return result >= 0;
    }

    /**
     * Memory 引擎不需要合并，但保留方法兼容
     */
    @Override
    public void optimizeTable() {
        // Memory 引擎不需要合并，什么都不做
        System.out.println("Memory 引擎无需合并");
    }

    @Override
    public boolean saveBatchAndOptimize(List<Stat> list) {
        // 直接保存，不需要合并
        return super.saveBatch(list);
    }

    @Override
    public int batchInsertLargeData(List<Stat> allData) {
        if (allData == null || allData.isEmpty()) {
            return 0;
        }
        
        int totalBatches = 0;
        int totalCount = allData.size();
        
        for (int i = 0; i < totalCount; i += THREAD_BATCH_SIZE) {
            int end = Math.min(i + THREAD_BATCH_SIZE, totalCount);
            List<Stat> batch = allData.subList(i, end);
            boolean success = super.saveBatch(batch);
            if (success) totalBatches++;
        }
        
        // 无需合并
        return totalBatches;
    }

    @Override
    public List<Stat> generateTestData(int count) {
        List<Stat> list = new ArrayList<>(count);
        String[] regions = {"北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "西安"};
        String[] groups = {"A组", "B组", "C组", "D组", "E组"};
        
        for (int i = 0; i < count; i++) {
            Stat stat = new Stat();
            stat.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 12));
            stat.setRegion(regions[i % regions.length]);
            stat.setGroup(groups[i % groups.length]);
            stat.setYesterday((int) (Math.random() * 1000));
            stat.setToday((int) (Math.random() * 1000));
            stat.setStatDate(new java.util.Date());
            list.add(stat);
        }
        
        return list;
    }

    /**
     * 批量插入结果
     */
    public static class BatchInsertResult {
        public int successCount;
        public int failCount;
        public long costTimeMs;

        public BatchInsertResult(int success, int fail, long time) {
            this.successCount = success;
            this.failCount = fail;
            this.costTimeMs = time;
        }

        @Override
        public String toString() {
            return "成功: " + successCount + "条, 失败: " + failCount + "条, 耗时: " + costTimeMs + "ms";
        }
    }
}
