-- =====================================================
-- ClickHouse 建表脚本（腾讯云文章版）
-- =====================================================

-- 建表语句
CREATE TABLE IF NOT EXISTS tb_stat (
    id String,
    region String,
    `group` String,
    yesterday Int32,
    today Int32,
    stat_date DateTime
) ENGINE = Memory;

-- 插入测试数据
INSERT INTO tb_stat (id, region, `group`, yesterday, today, stat_date) VALUES 
('1', '1232364', '111', 32, 2, '2021-07-09 12:56:00'),
('2', '1232364', '111', 34, 44, '2021-07-09 12:21:00'),
('3', '1232364', '111', 54, 12, '2021-07-09 12:20:00'),
('4', '1232364', '222', 45, 11, '2021-07-09 12:13:00'),
('5', '1232364', '222', 32, 33, '2021-07-09 12:44:00'),
('6', '1232364', '222', 12, 23, '2021-07-09 12:22:00'),
('7', '1232364', '333', 54, 54, '2021-07-09 12:11:00'),
('8', '1232364', '333', 22, 74, '2021-07-09 12:55:00'),
('9', '1232364', '333', 12, 15, '2021-07-09 12:34:00');

-- 查询
SELECT * FROM tb_stat ORDER BY stat_date DESC;

-- ClickHouse 特有的删除语法
ALTER TABLE tb_stat DELETE WHERE id = '10';

-- ClickHouse 特有的更新语法
ALTER TABLE tb_stat UPDATE today = 222 WHERE id = '4';
