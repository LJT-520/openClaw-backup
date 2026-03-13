#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
零交互资金日报处理器启动脚本
使用完全自动化的 Bitwarden 集成，无需任何用户输入
包含图表生成和展示功能
"""

import os
import sys
import subprocess
import shutil

def generate_chart():
    """生成资金趋势图表"""
    try:
        print("📊 生成资金趋势图表...")
        result = subprocess.run([
            sys.executable, "plot_daily_balance.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 图表生成成功")
            return True
        else:
            print(f"⚠️ 图表生成警告: {result.stderr}")
            return True  # 即使有警告也继续
    except Exception as e:
        print(f"❌ 图表生成失败: {e}")
        return False

def copy_chart_to_workspace():
    """复制图表到workspace目录"""
    try:
        workspace_path = "/Users/ganlan/.openclaw/workspace/daily_balance_chart.png"
        chart_path = "daily_balance_chart.png"
        
        if os.path.exists(chart_path):
            shutil.copy2(chart_path, workspace_path)
            print(f"✅ 图表已复制到工作区")
            return True
        else:
            print("⚠️ 本地图表文件不存在")
            return False
    except Exception as e:
        print(f"❌ 复制图表失败: {e}")
        return False

def generate_user_format_summary():
    """生成用户指定格式的资金日报总结"""
    try:
        print("📋 生成用户格式总结...")
        result = subprocess.run([
            sys.executable, "generate_user_format.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 用户格式总结生成成功")
            # 读取并输出总结内容
            if os.path.exists("fund_summary_user_format.md"):
                with open("fund_summary_user_format.md", "r", encoding="utf-8") as f:
                    summary_content = f.read()
                print("\n" + "="*50)
                print(summary_content)
                print("="*50)
            return True
        else:
            print(f"⚠️ 用户格式总结生成警告: {result.stderr}")
            return True  # 即使有警告也继续
    except Exception as e:
        print(f"❌ 用户格式总结生成失败: {e}")
        return False

def main():
    print("🚀 启动零交互资金日报处理器...")
    
    try:
        # 使用完全自动化 Bitwarden 管理器
        from fully_automated_bitwarden import fully_automated_load_fund_credentials
        
        print("🔐 自动加载凭据...")
        email, password = fully_automated_load_fund_credentials()
        
        if not email or not password:
            print("❌ 凭据加载失败，无法继续")
            return 1
        
        print("📊 启动资金日报处理...")
        
        # 导入并运行主处理脚本
        import automated_fund_report_processor_enhanced as main_processor
        
        # 执行主函数
        result = main_processor.download_latest_fund_report()
        
        if result:
            print("📈 邮件处理完成，开始生成图表...")
            
            # 生成图表
            if generate_chart():
                # 复制图表到workspace
                copy_chart_to_workspace()
            
            # 生成用户格式总结（新增）
            print("📋 生成用户格式总结...")
            generate_user_format_summary()
            
            print("🎉 资金日报处理完成！")
            return 0
        else:
            print("⚠️ 资金日报处理过程中遇到问题")
            return 1
            
    except ImportError as e:
        print(f"❌ 模块导入失败: {e}")
        return 1
    except Exception as e:
        print(f"❌ 处理过程中发生错误: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())