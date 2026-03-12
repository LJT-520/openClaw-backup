package com.example.clickhouse.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 统计实体类
 * 对应 ClickHouse 表: tb_stat
 */
@Data
@TableName("tb_stat")
public class Stat implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ID - ClickHouse 不支持自增，需要手动设置
     */
    @TableId(value = "id", type = IdType.INPUT)
    private String id;

    /**
     * 区域
     */
    @TableField("region")
    private String region;

    /**
     * 分组 - group 是 SQL 关键字，需要加反引号
     */
    @TableField("`group`")
    private String group;

    /**
     * 昨天
     */
    @TableField("yesterday")
    private Integer yesterday;

    /**
     * 今天
     */
    @TableField("today")
    private Integer today;

    /**
     * 统计时间
     */
    @TableField("stat_date")
    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date statDate;
}
