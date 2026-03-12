package com.example.clickhouse.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.clickhouse.entity.Stat;
import com.example.clickhouse.service.impl.StatServiceImpl;

import java.util.List;

/**
 * Stat Service 接口
 */
public interface IStatService extends IService<Stat> {

    /**
     * ClickHouse 风格删除
     */
    boolean alterDelete(String id);

    /**
     * ClickHouse 风格更新
     */
    boolean alterUpdate(Stat stat);

    /**
     * 强制合并
     */
    void optimizeTable();

    /**
     * 批量插入后强制合并
     */
    boolean saveBatchAndOptimize(List<Stat> list);

    /**
     * 大批量插入 - 每20万条提交一次
     */
    int batchInsertLargeData(List<Stat> allData);

    StatServiceImpl.BatchInsertResult batchInsertWithThread(List<Stat> allData, int threadCount);

    /**
     * 多线程大批量插入
     * @param allData 全部数据
     * @param threadCount 线程数
     */
    Object batchInsertMultiThread(List<Stat> allData, int threadCount);

    /**
     * 多线程大批量插入（默认4线程）
     */
    Object batchInsertMultiThread(List<Stat> allData);

    /**
     * 生成测试数据
     */
    List<Stat> generateTestData(int count);
}
