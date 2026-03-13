#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
用户指定格式资金日报总结生成器
严格按照用户提供的格式模板生成
"""

import json
import os
from datetime import datetime
import re

def load_enhanced_data():
    """加载增强数据"""
    try:
        with open('fund_enhanced_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ 找不到 fund_enhanced_data.json，请先运行 extract_enhanced_data.py")
        return None

def format_number(value):
    """格式化数字为万元显示"""
    if isinstance(value, (int, float)):
        return f"{value/10000:.2f}"
    return "0.00"

def get_top_transactions(data):
    """获取前5大交易"""
    transactions = []
    
    # 从交易明细中提取所有交易
    if 'transaction_details' in data:
        for trans in data['transaction_details']:
            income_amount = trans.get('income_amount', 0)
            if income_amount > 0:  # 只考虑收入交易
                transactions.append({
                    'counterparty': trans.get('counterparty', '未知'),
                    'amount': income_amount
                })
    
    # 按金额排序并取前5
    transactions.sort(key=lambda x: x['amount'], reverse=True)
    return transactions[:5]

def get_bank_account_info(data):
    """获取银行账户信息，找出投资理财和USDT"""
    bank_accounts = data.get('bank_accounts', {})
    
    investment_amount = 0
    usdt_amount = 0
    
    for account_name, account_data in bank_accounts.items():
        balance = account_data.get('closing_balance', 0)
        
        if '投资理财' in account_name or '理财' in account_name or 'investment' in account_name.lower():
            investment_amount += balance
        elif 'usdt' in account_name.lower() or '泰达币' in account_name or 'USDT' in account_name:
            usdt_amount += balance
    
    return investment_amount, usdt_amount

def calculate_summary_stats(data):
    """计算汇总统计"""
    summary = data.get('summary', {})
    
    yesterday_balance = summary.get('yesterday_balance', 0)
    today_balance = summary.get('today_balance', 0)
    total_inflow = summary.get('total_inflow', 0)
    total_outflow = summary.get('total_outflow', 0)
    
    net_inflow = today_balance - yesterday_balance
    growth_rate = (net_inflow / yesterday_balance * 100) if yesterday_balance > 0 else 0
    
    return {
        'yesterday_balance': yesterday_balance,
        'today_balance': today_balance,
        'total_inflow': total_inflow,
        'total_outflow': total_outflow,
        'net_inflow': net_inflow,
        'growth_rate': growth_rate
    }

def generate_user_format_summary():
    """生成用户指定格式的资金日报总结"""
    
    # 加载数据
    data = load_enhanced_data()
    if not data:
        return
    
    # 提取文件信息
    file_info = data.get('file_info', {})
    filename = file_info.get('filename', '未知文件')
    
    # 提取日期
    date_match = re.search(r'(\d{4}\.\d{2}\.\d{2})', filename)
    report_date = date_match.group(1) if date_match else '未知日期'
    
    # 计算汇总统计
    stats = calculate_summary_stats(data)
    
    # 获取投资理财和USDT信息
    investment_amount, usdt_amount = get_bank_account_info(data)
    investment_ratio = (investment_amount / stats['today_balance'] * 100) if stats['today_balance'] > 0 else 0
    
    # 获取前5大交易
    top_transactions = get_top_transactions(data)
    
    # 计算大额交易统计（>=3万元）
    large_transactions = [t for t in top_transactions if t['amount'] >= 30000]
    large_transactions_total = sum(t['amount'] for t in large_transactions)
    large_transactions_count = len(large_transactions)
    other_income = stats['total_inflow'] - large_transactions_total
    large_ratio = (large_transactions_total / stats['total_inflow'] * 100) if stats['total_inflow'] > 0 else 0
    other_ratio = 100 - large_ratio
    
    # 估算总交易笔数
    total_transactions = data.get('transaction_count', len(data.get('transaction_details', [])))
    
    # 生成当前时间
    current_time = datetime.now().strftime("%Y.%m.%d %H:%M")
    
    # 按照用户指定的格式生成内容（分行格式，易读）
    summary_content = f"""📊 资金日报总结 - {report_date}

💰 核心财务指标

💼 资金变化
• 昨日结余：{format_number(stats['yesterday_balance'])}万元
• 本日结余：{format_number(stats['today_balance'])}万元 ↗️
• 净增长：+{format_number(stats['net_inflow'])}万元 ({stats['growth_rate']:.2f}%)

📈 流入流出
• 资金流入：{format_number(stats['total_inflow'])}万元 ✅
• 资金流出：{format_number(stats['total_outflow'])}万元 ✅

💎 资产配置
• 投资理财：{format_number(investment_amount)}万元 ({investment_ratio:.1f}%)
• USDT资产：{format_number(usdt_amount)}万元

───
💼 主要交易明细 (≥3万元)"""

    # 添加>=3万元的交易
    transaction_emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
    large_transaction_index = 0
    for transaction in top_transactions:
        if transaction['amount'] >= 30000 and large_transaction_index < 5:
            emoji = transaction_emojis[large_transaction_index]
            # 清理交易对手方名称，去除邮箱等额外信息
            counterparty = transaction['counterparty']
            # 特殊处理：萌创公司名称
            if '广州市萌创网络科技有限公司' in counterparty:
                counterparty = '广州市萌创网络科技有限公司'
            elif '@' in counterparty and not counterparty.endswith('.com'):
                counterparty = counterparty.split('@')[0]
            
            summary_content += f"""
{emoji} {counterparty}
💰 {format_number(transaction['amount'])}万元
"""
            large_transaction_index += 1
    
    # 收入构成和趋势总结
    summary_content += f"""
📊 收入构成
• 大额交易(≥3万)：{format_number(large_transactions_total)}万元 ({large_ratio:.1f}%)
• 其他收入：{format_number(other_income)}万元 ({other_ratio:.1f}%)
• 总交易笔数：{total_transactions}笔

───
📅 趋势总结
✅ 资金增长：单日增长{stats['growth_rate']:.2f}%
✅ 风险控制：支出{format_number(stats['total_outflow'])}万元
✅ 收入多元：{large_transactions_count}个主要收入源
✅ 理财配置：{investment_ratio:.1f}%资产理财化

🔄 更新：{current_time}"""

    # 保存到文件
    with open('fund_summary_user_format.md', 'w', encoding='utf-8') as f:
        f.write(summary_content)
    
    # 输出到控制台
    print(summary_content)
    print(f"\n✅ 用户格式总结已保存到: fund_summary_user_format.md")

if __name__ == "__main__":
    generate_user_format_summary()