package com.example.clickhouse.task;

import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.service.IStatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 定时插入任务
 * 每5秒插入1000条数据
 */
@Component
public class InsertTask {

    @Autowired
    private IStatService statService;

    /**
     * 每5秒插入1000条
     * fixedRate = 5000 毫秒 = 5秒
     */
    @Scheduled(fixedRate = 1000)
    public void insert1000Per5Seconds() {
        System.out.println("========== 定时任务：开始插入1000条 ==========");
        
        long start = System.currentTimeMillis();
        
        // 生成1000条数据
        List<Stat> dataList = statService.generateTestData(1000);
        
        // 插入
        boolean success = statService.saveBatch(dataList);
        
        long cost = System.currentTimeMillis() - start;
        
        System.out.println("========== 定时任务完成 ==========");
        System.out.println("插入数量: " + dataList.size());
        System.out.println("耗时: " + cost + " ms");
        System.out.println("结果: " + (success ? "成功" : "失败"));
    }
}
