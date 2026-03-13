#!/usr/bin/env python3
"""
飞书语音 TTS 发送脚本
整合 MOSS-TTS + ffmpeg 转码 + 飞书上传 + 发送语音消息
"""

import os
import sys
import json
import subprocess
import argparse
import requests
import tempfile

# 配置
MOSS_API_KEY = os.getenv("MOSS_API_KEY")
FEISHU_APP_ID = os.getenv("FEISHU_APP_ID")
FEISHU_APP_SECRET = os.getenv("FEISHU_APP_SECRET")

# 默认参数
DEFAULT_VOICE_ID = "2001286865130360832"  # 周周
TTS_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "tts.py")


def get_tenant_access_token():
    """获取飞书 tenant_access_token"""
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    resp = requests.post(url, json={
        "app_id": FEISHU_APP_ID,
        "app_secret": FEISHU_APP_SECRET
    })
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"获取 token 失败: {data}")
    return data["tenant_access_token"]


def generate_tts(text, voice_id, output_path):
    """调用 MOSS-TTS 生成语音"""
    cmd = [
        sys.executable,
        TTS_SCRIPT_PATH,
        "--text", text,
        "--voice_id", voice_id,
        "--output", output_path
    ]
    
    env = os.environ.copy()
    env["MOSS_API_KEY"] = MOSS_API_KEY
    
    result = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if result.returncode != 0:
        raise Exception(f"TTS 生成失败: {result.stderr}")
    print(f"✓ TTS 生成完成: {output_path}")


def convert_to_opus(input_wav, output_opus):
    """将 WAV 转换为飞书 wav 格式"""
    # 飞书要求：wav 格式，单声道
    cmd = [
        "ffmpeg", "-y", "-i", input_wav,
        "-acodec", "pcm_s16le",
        "-ac", "1",
        "-ar", "16000",
        output_opus.replace(".opus", ".wav").replace(".mp3", ".wav")
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"音频转码失败: {result.stderr}")
    print(f"✓ 转码完成: {output_opus}")


def upload_to_feishu(token, file_path):
    """上传文件到飞书"""
    url = "https://open.feishu.cn/open-apis/im/v1/files"
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(file_path, "rb") as f:
        files = {
            "file_type": "stream",
            "file_name": "voice.wav",
            "file": f
        }
        resp = requests.post(url, headers=headers, files=files)
    
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"文件上传失败: {data}")
    
    file_key = data["data"]["file_key"]
    print(f"✓ 文件上传成功: {file_key}")
    return file_key


def send_voice_message(token, receive_id, receive_id_type, file_key):
    """发送语音消息"""
    url = f"https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={receive_id_type}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "receive_id": receive_id,
        "msg_type": "audio",
        "content": json.dumps({"file_key": file_key})
    }
    
    resp = requests.post(url, headers=headers, json=payload)
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"发送消息失败: {data}")
    
    print(f"✓ 语音消息发送成功: {data['data']['message_id']}")
    return data["data"]


def main():
    parser = argparse.ArgumentParser(description="飞书语音 TTS 发送")
    parser.add_argument("--text", required=True, help="要转语音的文本")
    parser.add_argument("--chat_id", help="飞书群 ID")
    parser.add_argument("--receive_id", help="接收者 ID")
    parser.add_argument("--receive_id_type", default="chat_id", choices=["chat_id", "open_id"], help="接收者类型")
    parser.add_argument("--voice_id", default=DEFAULT_VOICE_ID, help="MOSS 音色 ID")
    parser.add_argument("--output", default="feishu_voice.wav", help="输出文件路径")
    
    args = parser.parse_args()
    
    # 确定接收者
    if args.chat_id:
        receive_id = args.chat_id
        receive_id_type = "chat_id"
    elif args.receive_id:
        receive_id = args.receive_id
        receive_id_type = args.receive_id_type
    else:
        raise Exception("必须指定 --chat_id 或 --receive_id")
    
    # 检查环境变量
    if not MOSS_API_KEY:
        raise Exception("未设置 MOSS_API_KEY 环境变量")
    if not FEISHU_APP_ID or not FEISHU_APP_SECRET:
        raise Exception("未设置 FEISHU_APP_ID 或 FEISHU_APP_SECRET 环境变量")
    
    # 创建临时文件
    with tempfile.TemporaryDirectory() as tmpdir:
        wav_path = os.path.join(tmpdir, args.output)
        
        # 1. 生成 TTS
        print(f"正在生成语音: {args.text[:50]}...")
        generate_tts(args.text, args.voice_id, wav_path)
        
        # 2. 获取 token
        print("正在获取飞书 token...")
        token = get_tenant_access_token()
        
        # 3. 上传（飞书 API 接受 wav 文件，file_type 设为 opus 即可）
        print("正在上传到飞书...")
        file_key = upload_to_feishu(token, wav_path)
        
        # 4. 发送
        print("正在发送语音消息...")
        send_voice_message(token, receive_id, receive_id_type, file_key)
        
    print("\n✅ 全部完成！")


if __name__ == "__main__":
    main()
