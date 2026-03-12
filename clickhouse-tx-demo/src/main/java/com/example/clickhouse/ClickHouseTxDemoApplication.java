package com.example.clickhouse;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.example.clickhouse.mapper")
@EnableScheduling  // 开启定时任务
public class ClickHouseTxDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClickHouseTxDemoApplication.class, args);
    }
}
