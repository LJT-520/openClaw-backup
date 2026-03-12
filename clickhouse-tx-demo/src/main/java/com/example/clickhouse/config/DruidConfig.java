package com.example.clickhouse.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DruidConfig {

    /**
     * 配置 Druid 数据源（ClickHouse）
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.click")
    public DataSource druidDataSource() {
        return new DruidDataSource();
    }
}
