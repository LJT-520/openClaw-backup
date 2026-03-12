package com.example.clickhouse.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.clickhouse.entity.Stat;
import org.apache.ibatis.annotations.Mapper;

/**
 * Stat Mapper 接口
 * 注意：ClickHouse 不支持真正的 UPDATE/DELETE，需要用 ALTER 语句
 */
@Mapper
public interface StatMapper extends BaseMapper<Stat> {

    /**
     * ClickHouse 风格的删除（通过 ALTER）
     */
    int alterDelete(String id);

    /**
     * ClickHouse 风格的更新（通过 ALTER）
     */
    int alterUpdate(Stat stat);
}
