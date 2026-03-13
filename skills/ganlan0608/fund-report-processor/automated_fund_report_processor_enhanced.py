#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动化资金日报处理器 - 增强版
包含自动去重、合并历史数据功能，支持 Bitwarden 自动凭据加载
"""

import imaplib
import email
from email.header import decode_header
import ssl
import os
import re
import pandas as pd
from datetime import datetime

# 尝试从 Bitwarden 自动加载凭据
def auto_load_credentials():
    """自动从 Bitwarden 加载凭据（如果环境变量未设置）"""
    if not os.environ.get("FUND_EMAIL") or not os.environ.get("FUND_PASSWORD"):
        print("🔐 环境变量未设置，尝试从 Bitwarden 自动加载凭据...")
        try:
            from bitwarden_loader import load_fund_credentials
            email, password = load_fund_credentials()
            if email and password:
                print("✅ 已从 Bitwarden 自动加载凭据")
                return True
            else:
                print("❌ Bitwarden 凭据加载失败，将使用默认占位符")
                return False
        except ImportError:
            print("ℹ️ Bitwarden 加载器不可用，使用环境变量")
            return False
    else:
        print("✅ 使用环境变量中的凭据")
        return True

# 在脚本开始时尝试自动加载凭据
auto_load_credentials()

def decode_mime_words(s):
    """解码MIME编码的字符串"""
    decoded_parts = decode_header(s)
    decoded_string = ""
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            if encoding:
                decoded_string += part.decode(encoding)
            else:
                decoded_string += part.decode('utf-8', errors='ignore')
        else:
            decoded_string += str(part)
    return decoded_string

def download_latest_fund_report():
    """下载最新的资金日报XLSX附件"""
    # 邮箱配置
    IMAP_SERVER = "imap.exmail.qq.com"
    IMAP_PORT = 993
    EMAIL = os.environ.get("FUND_EMAIL", "your_email@example.com")  # 从环境变量获取
    PASSWORD = os.environ.get("FUND_PASSWORD", "your_password_here")  # 从环境变量获取
    
    # 创建附件文件夹
    attachments_dir = "fund_attachments"
    if not os.path.exists(attachments_dir):
        os.makedirs(attachments_dir)
    
    print("📧 连接到邮箱服务器...")
    context = ssl.create_default_context()
    mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT, ssl_context=context)
    mail.login(EMAIL, PASSWORD)
    print("✅ 登录成功！")
    
    # 选择归档文件夹
    folder_name = "&UXZO1mWHTvZZOQ-/&jUSR0WXlYqU-"
    try:
        mail.select(folder_name)
        print(f"📁 已选择文件夹: {folder_name}")
    except:
        mail.select("INBOX")
        print("📁 已选择文件夹: INBOX")
    
    # 搜索最新邮件
    result, data = mail.search(None, 'ALL')
    
    if result == 'OK':
        email_ids = data[0].split()
        if email_ids:
            latest_email_id = email_ids[-1]
            print(f"📨 最新邮件ID: {latest_email_id.decode()}")
            
            result, data = mail.fetch(latest_email_id, '(RFC822)')
            if result == 'OK':
                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                subject = decode_mime_words(msg.get("Subject", ""))
                sender = decode_mime_words(msg.get("From", ""))
                date = msg.get("Date", "")
                
                print(f"\n📧 最新资金日报邮件详情:")
                print("=" * 50)
                print(f"主题: {subject}")
                print(f"发件人: {sender}")
                print(f"日期: {date}")
                
                # 下载XLSX附件
                for part in msg.walk():
                    if part.get_content_disposition() == 'attachment':
                        filename = part.get_filename()
                        if filename:
                            filename = decode_mime_words(filename)
                            if filename.endswith('.xlsx'):
                                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                                safe_filename = f"{filename.replace('.xlsx', '')}_{timestamp}.xlsx"
                                safe_filename = re.sub(r'[^\w\-_\.]', '_', safe_filename)
                                
                                filepath = os.path.join(attachments_dir, safe_filename)
                                with open(filepath, 'wb') as f:
                                    f.write(part.get_payload(decode=True))
                                print(f"📎 XLSX附件已下载: {safe_filename}")
                                
                                mail.close()
                                mail.logout()
                                print("👋 连接已关闭")
                                
                                return filepath
    
    mail.close()
    mail.logout()
    return None

def extract_key_data_precise(xlsx_file):
    """精确提取关键数据"""
    try:
        df = pd.read_excel(xlsx_file, header=None)
        
        yesterday_balance = None
        today_balance = None
        total_inflow = None
        total_outflow = None
        
        for index, row in df.iterrows():
            if index == 3 and len(row) > 4:
                yesterday_balance = row.iloc[4] if pd.notna(row.iloc[4]) else 0
            elif index == 4 and len(row) > 4:
                today_balance = row.iloc[4] if pd.notna(row.iloc[4]) else 0
            elif index == 12 and len(row) > 5:
                if pd.notna(row.iloc[1]) and '资金流入合计' in str(row.iloc[1]):
                    total_inflow = row.iloc[5] if pd.notna(row.iloc[5]) else 0
            elif index == 18 and len(row) > 5:
                if pd.notna(row.iloc[1]) and '资金流出合计' in str(row.iloc[1]):
                    total_outflow = row.iloc[5] if pd.notna(row.iloc[5]) else 0
        
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
        print(f"❌ 提取数据时出错: {e}")
        return None

def auto_merge_and_dedupe(new_data):
    """自动合并新数据到历史数据并去重"""
    latest_file = "fund_key_data_latest.csv"
    history_file = "fund_key_data_history.csv"
    clean_history_file = "fund_key_data_clean_history.csv"
    
    # 保存最新数据
    latest_df = pd.DataFrame([new_data])
    latest_df.to_csv(latest_file, index=False, encoding='utf-8-sig')
    print(f"✅ 最新数据已保存到: {latest_file}")
    
    # 读取或创建历史数据
    if os.path.exists(clean_history_file):
        history_df = pd.read_csv(clean_history_file)
        print(f"📚 读取干净历史数据: {len(history_df)} 条记录")
    elif os.path.exists(history_file):
        history_df = pd.read_csv(history_file)
        print(f"📚 读取原始历史数据: {len(history_df)} 条记录")
    else:
        history_df = pd.DataFrame()
        print("📝 创建新的历史数据")
    
    # 合并数据
    if not history_df.empty:
        combined_df = pd.concat([history_df, latest_df], ignore_index=True)
    else:
        combined_df = latest_df.copy()
    
    # 自动去重（基于日期，保留最新）
    combined_df = combined_df.drop_duplicates(subset=['date'], keep='last')
    combined_df = combined_df.sort_values('date')
    
    # 保存干净的历史数据
    combined_df.to_csv(clean_history_file, index=False, encoding='utf-8-sig')
    
    print(f"🔄 数据自动合并完成:")
    print(f"   📊 总记录数: {len(combined_df)}")
    print(f"   📅 日期范围: {combined_df['date'].min()} ~ {combined_df['date'].max()}")
    print(f"   💰 余额范围: {combined_df['today_balance'].min():.0f} ~ {combined_df['today_balance'].max():.0f}")
    print(f"   💾 保存到: {clean_history_file}")
    
    return len(combined_df)

def main():
    print("🚀 开始自动化资金日报处理（增强版）...")
    print("=" * 60)
    
    # 1. 下载最新资金日报
    xlsx_file = download_latest_fund_report()
    if not xlsx_file:
        print("❌ 未能下载XLSX文件，退出")
        return
    
    # 2. 提取关键数据
    print("\n📊 开始提取关键数据...")
    data = extract_key_data_precise(xlsx_file)
    if not data:
        print("❌ 数据提取失败")
        return
    
    print("✅ 提取成功:")
    print(f"   📅 报告日期: {data['date']}")
    print(f"   💰 昨日结余: {data['yesterday_balance']}")
    print(f"   💰 本日结余: {data['today_balance']}")
    print(f"   📈 资金流入合计: {data['total_inflow']}")
    print(f"   📉 资金流出合计: {data['total_outflow']}")
    
    # 3. 自动合并和去重
    print("\n🔄 自动合并历史数据...")
    total_records = auto_merge_and_dedupe(data)
    
    print(f"\n🎉 自动化处理完成！")
    print(f"📄 XLSX文件: {xlsx_file}")
    print(f"📊 历史记录总数: {total_records}")
    print(f"💾 主要文件:")
    print(f"   📋 最新数据: fund_key_data_latest.csv")
    print(f"   📚 历史数据: fund_key_data_clean_history.csv")

if __name__ == "__main__":
    main()