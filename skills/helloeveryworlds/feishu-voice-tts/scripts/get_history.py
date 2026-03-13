#!/usr/bin/env python3
"""
获取飞书群消息历史，按时间排序
"""
import requests
import json
import os
import argparse
import time

def get_token():
    """获取飞书 tenant_access_token"""
    app_id = os.getenv("FEISHU_APP_ID")
    app_secret = os.getenv("FEISHU_APP_SECRET")
    
    if not app_id or not app_secret:
        raise Exception("请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量")
    
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    resp = requests.post(url, json={
        "app_id": app_id,
        "app_secret": app_secret
    })
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"获取 token 失败: {data}")
    return data["tenant_access_token"]


def get_all_messages(token, chat_id, page_size=50):
    """获取所有消息"""
    all_messages = []
    page_token = None
    
    while True:
        url = f"https://open.feishu.cn/open-apis/im/v1/messages?container_id_type=chat&container_id={chat_id}&page_size={page_size}"
        if page_token:
            url += f"&page_token={page_token}"
        
        resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
        data = resp.json()
        
        if data.get("code") != 0:
            print(f"Error: {data}")
            break
            
        items = data["data"]["items"]
        all_messages.extend(items)
        
        if not data["data"].get("has_more"):
            break
            
        page_token = data["data"].get("page_token")
        
    return all_messages


def get_recent_messages(token, chat_id, hours=24, page_size=50):
    """获取最近一段时间的消息"""
    # 计算时间范围
    now = int(time.time())
    start_time = now - (hours * 3600)
    
    all_messages = []
    page_token = None
    
    while True:
        url = f"https://open.feishu.cn/open-apis/im/v1/messages?container_id_type=chat&container_id={chat_id}&page_size={page_size}&start_time={start_time}&end_time={now}"
        if page_token:
            url += f"&page_token={page_token}"
        
        resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
        data = resp.json()
        
        if data.get("code") != 0:
            print(f"Error: {data}")
            break
            
        items = data["data"]["items"]
        all_messages.extend(items)
        
        if not data["data"].get("has_more"):
            break
            
        page_token = data["data"].get("page_token")
        
    return all_messages


def main():
    parser = argparse.ArgumentParser(description="获取飞书群消息历史")
    parser.add_argument("--chat_id", required=True, help="飞书群 ID")
    parser.add_argument("--hours", type=int, default=24, help="获取最近几小时的消息，默认 24 小时")
    parser.add_argument("--all", action="store_true", help="获取所有消息（不使用时间过滤）")
    parser.add_argument("--limit", type=int, default=30, help="显示最近多少条消息，默认 30 条")
    parser.add_argument("--type", help="只显示指定类型的消息，如 audio, file, text, image 等")
    
    args = parser.parse_args()
    
    print("获取 token...")
    token = get_token()
    
    print(f"获取消息 (最近 {args.hours} 小时)...")
    if args.all:
        messages = get_all_messages(token, args.chat_id)
    else:
        messages = get_recent_messages(token, args.chat_id, args.hours)
    
    print(f"共获取 {len(messages)} 条消息")
    
    # 按时间排序 (降序)
    messages.sort(key=lambda x: int(x["create_time"]), reverse=True)
    
    # 过滤类型
    if args.type:
        messages = [m for m in messages if m["msg_type"] == args.type]
        print(f"过滤后 {len(messages)} 条消息")
    
    # 打印最近的消息
    print(f"\n最近 {min(args.limit, len(messages))} 条消息:")
    print("-" * 60)
    
    from datetime import datetime
    for i, m in enumerate(messages[:args.limit]):
        ts = int(m["create_time"]) / 1000
        dt = datetime.fromtimestamp(ts)
        print(f"{i+1:2}. {m['msg_type']:12} | {dt} | {m['message_id']}")
        
        # 如果是媒体类型，打印 content
        if m['msg_type'] in ['audio', 'file', 'image']:
            content = m['body']['content'][:100]
            print(f"    {content}")


if __name__ == "__main__":
    main()
