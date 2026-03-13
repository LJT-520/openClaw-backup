#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成资金日报每日结余图表
从CSV文件读取数据，生成美观的中文图表，单位为万元（整数）
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
from datetime import datetime
import os

def plot_daily_balance():
    """生成每日结余图表"""
    # 读取CSV文件
    csv_file = "fund_key_data_clean_history.csv"
    if not os.path.exists(csv_file):
        csv_file = "fund_key_data_history.csv"
    if not os.path.exists(csv_file):
        print("❌ 未找到CSV文件，请先运行数据提取脚本")
        return
    
    df = pd.read_csv(csv_file)
    
    # 转换日期格式
    df['date'] = pd.to_datetime(df['date'], format='%Y.%m.%d')
    df = df.sort_values('date')
    
    # 提取本日结余数据（转换为万元，整数）
    dates = df['date'].dt.strftime('%m-%d').tolist()
    balances = (df['today_balance'] / 10000).round(0).astype(int).tolist()
    
    # 尝试使用系统中文字体
    font_path = None
    possible_fonts = [
        '/System/Library/Fonts/Supplemental/Songti.ttc',
        '/System/Library/Fonts/STHeiti Medium.ttc',
        '/System/Library/Fonts/STHeiti Light.ttc'
    ]
    
    for font in possible_fonts:
        if os.path.exists(font):
            font_path = font
            break
    
    if font_path:
        prop = fm.FontProperties(fname=font_path)
        plt.rcParams['font.sans-serif'] = [prop.get_name()]
        plt.rcParams['axes.unicode_minus'] = False
    
    # 创建图表
    plt.figure(figsize=(14, 8))
    
    # 绘制线条（蓝色渐变）
    line = plt.plot(dates, balances, linewidth=3, marker='o', markersize=8, 
                    color='#2E86AB', markerfacecolor='#A23B72', markeredgecolor='#A23B72')
    
    # 添加数据点数值（整数万元）
    for i, (date, balance) in enumerate(zip(dates, balances)):
        plt.annotate(f'{balance:,}', (date, balance), 
                    textcoords="offset points", xytext=(0,10), 
                    ha='center', fontsize=10, fontweight='bold')
    
    # 设置标题和标签
    plt.title('资金日报每日结余趋势图', fontsize=18, pad=20, fontweight='bold')
    plt.xlabel('日期', fontsize=14, labelpad=10)
    plt.ylabel('结余金额（万元）', fontsize=14, labelpad=10)
    
    # 设置网格
    plt.grid(True, alpha=0.3, linestyle='-', linewidth=0.5)
    
    # 优化布局
    plt.xticks(rotation=45, ha='right', fontsize=12)
    plt.yticks(fontsize=12)
    plt.tight_layout()
    
    # 保存图表
    output_file = "daily_balance_chart.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ 图表已生成: {output_file}")
    
    # 显示统计信息
    min_balance = min(balances)
    max_balance = max(balances)
    avg_balance = int(np.mean(balances))
    start_date = df['date'].min().strftime('%Y-%m-%d')
    end_date = df['date'].max().strftime('%Y-%m-%d')
    
    print(f"\n📊 数据统计:")
    print(f"   起始日期: {start_date}")
    print(f"   结束日期: {end_date}")
    print(f"   最低结余: {min_balance:,} 万元")
    print(f"   最高结余: {max_balance:,} 万元")
    print(f"   平均结余: {avg_balance:,} 万元")

if __name__ == "__main__":
    plot_daily_balance()