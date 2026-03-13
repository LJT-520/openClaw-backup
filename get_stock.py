# -*- coding: utf-8 -*-
import baostock as bs
from datetime import datetime, timedelta

# 登录baostock
lg = bs.login()
print('登录成功')

# 尝试获取最近5个交易日的数据
end_date = datetime.now()
start_date = end_date - timedelta(days=10)

start_str = start_date.strftime('%Y-%m-%d')
end_str = end_date.strftime('%Y-%m-%d')

print(f"查询日期范围: {start_str} 到 {end_str}")

# 获取上证指数数据
rs = bs.query_history_k_data_plus(
    "sh.000001",
    "date,code,open,high,low,close,volume,amount,pctChg",
    start_date=start_str,
    end_date=end_str,
    frequency="d"
)

data_list = []
while (rs.error_code == '0') & rs.next():
    data_list.append(rs.get_row_data())

print('上证指数数据:')
for d in data_list:
    print(d)

# 获取深证成指
rs2 = bs.query_history_k_data_plus(
    "sz.399001",
    "date,code,open,high,low,close,volume,amount,pctChg",
    start_date=start_str,
    end_date=end_str,
    frequency="d"
)

data_list2 = []
while (rs2.error_code == '0') & rs2.next():
    data_list2.append(rs2.get_row_data())

print('\n深证成指数据:')
for d in data_list2:
    print(d)

# 获取创业板指
rs3 = bs.query_history_k_data_plus(
    "sz.399006",
    "date,code,open,high,low,close,volume,amount,pctChg",
    start_date=start_str,
    end_date=end_str,
    frequency="d"
)

data_list3 = []
while (rs3.error_code == '0') & rs3.next():
    data_list3.append(rs3.get_row_data())

print('\n创业板指数据:')
for d in data_list3:
    print(d)

# 登出
bs.logout()
