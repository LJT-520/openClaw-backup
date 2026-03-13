import urllib.request
import json

url = 'https://api.moonshot.cn/v1/chat/completions'

api_key = 'sk-qjusRhprg48e4OjU9isnqeCAnnJlqmM2d8R0ak7JYnpPWflj'

data = {
    'model': 'moonshot-v1-8k',
    'messages': [
        {'role': 'user', 'content': '你好'}
    ],
    'temperature': 0.7
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
)

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        result = response.read().decode('utf-8')
        print('Status: OK')
        print('Response:', result)
except Exception as e:
    print('Error:', e)
