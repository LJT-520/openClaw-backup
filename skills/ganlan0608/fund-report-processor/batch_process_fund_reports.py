#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量处理资金日报XLSX文件
从指定目录中读取所有XLSX文件，提取关键数据并保存到CSV
"""

import os
import pandas as pd
import re
from datetime import datetime

def extract_key_data_precise(xlsx_file):
    """精确提取关键数据"""
    try:
        # 读取Excel文件
        df = pd.read_excel(xlsx_file, header=None)
        
        # 查找关键数据
        yesterday_balance = None
        today_balance = None
        total_inflow = None
        total_outflow = None
        
        for index, row in df.iterrows():
            # 查找昨日结余 (第3行，第4列)
            if index == 3 and len(row) > 4:
                yesterday_balance = row.iloc[4] if pd.notna(row.iloc[4]) else 0
                
            # 查找本日结余 (第4行，第4列)
            elif index == 4 and len(row) > 4:
                today_balance = row.iloc[4] if pd.notna(row.iloc[4]) else 0
                
            # 查找资金流入合计 (第12行，第5列)
            elif index == 12 and len(row) > 5:
                if pd.notna(row.iloc[1]) and '资金流入合计' in str(row.iloc[1]):
                    total_inflow = row.iloc[5] if pd.notna(row.iloc[5]) else 0
                    
            # 查找资金流出合计 (第18行，第5列)
            elif index == 18 and len(row) > 5:
                if pd.notna(row.iloc[1]) and '资金流出合计' in str(row.iloc[1]):
                    total_outflow = row.iloc[5] if pd.notna(row.iloc[5]) else 0
        
        # 从文件名提取日期
        filename = os.path.basename(xlsx_file)
        date_match = re.search(r'(\d{4}\.\d{2}\.\d{2})', filename)
        report_date = date_match.group(1) if date_match else "Unknown"
        
        return {
            'date': report_date,
            'yesterday_balance': yesterday_balance,
            'today_balance': today_balance, 
            'total_inflow': total_inflow,
            'total_outflow': total_outflow
        }
        
    except Exception as e:
        print(f"❌ 提取数据时出错 {xlsx_file}: {e}")
        return None

def process_all_xlsx_files(directory):
    """处理指定目录中的所有XLSX文件"""
    xlsx_files = []
    for file in os.listdir(directory):
        if file.endswith('.xlsx') and '资金日报' in file:
            xlsx_files.append(os.path.join(directory, file))
    
    if not xlsx_files:
        print("❌ 未找到资金日报XLSX文件")
        return
    
    print(f"📊 找到 {len(xlsx_files)} 个资金日报文件")
    print("=" * 50)
    
    all_data = []
    for xlsx_file in sorted(xlsx_files):
        print(f"📄 处理文件: {os.path.basename(xlsx_file)}")
        data = extract_key_data_precise(xlsx_file)
        if data:
            all_data.append(data)
            print(f"   ✅ 昨日结余: {data['yesterday_balance']}")
            print(f"   ✅ 本日结余: {data['today_balance']}")
            print(f"   ✅ 资金流入合计: {data['total_inflow']}")
            print(f"   ✅ 资金流出合计: {data['total_outflow']}")
        else:
            print(f"   ❌ 提取失败")
    
    if all_data:
        # 保存到CSV
        csv_filename = "fund_key_data_history.csv"
        df = pd.DataFrame(all_data)
        df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
        print(f"\n✅ 数据已保存到: {csv_filename}")
        print(f"📊 共处理 {len(all_data)} 个文件")
    else:
        print("❌ 未成功提取任何数据")

def main():
    import sys
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = "fund_attachments"
    
    if not os.path.exists(directory):
        print(f"❌ 目录不存在: {directory}")
        return
    
    process_all_xlsx_files(directory)

if __name__ == "__main__":
    main()