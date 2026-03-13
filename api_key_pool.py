import os
import time

class ApiKeyPool:
    """API Key 轮询池 - 主备切换"""
    
    def __init__(self, keys):
        """
        keys: API Key 列表，按优先级排序
        例如: ['key1', 'key2', 'key3']
        """
        self.keys = keys
        self.current_index = 0
        self.usage_count = [0] * len(keys)
        
    def get_key(self):
        """获取当前可用的 Key"""
        key = self.keys[self.current_index]
        self.usage_count[self.current_index] += 1
        return key
    
    def switch_to_next(self):
        """切换到下一个 Key"""
        if self.current_index < len(self.keys) - 1:
            self.current_index += 1
            print(f"切换到备用 Key {self.current_index + 1}")
            return True
        else:
            print("所有 Key 都已用完！")
            return False
    
    def get_current_key_name(self):
        return f"Key-{self.current_index + 1}"
    
    def get_usage_report(self):
        """获取使用报告"""
        print(f"\n========== API Key 使用报告 ==========")
        for i, (key, count) in enumerate(zip(self.keys, self.usage_count)):
            print(f"Key {i+1}: {key[:10]}... 使用次数: {count}")
        print(f"当前使用: Key {self.current_index + 1}")
        print("=========================================\n")


# ============ 配置你的 API Keys ============
# 在这里添加你的 API Keys，按优先级排序
API_KEYS = [
    "tvly-xxx-第一个key",
    "tvly-xxx-第二个key", 
    "tvly-xxx-第三个key",
]

# 初始化
api_pool = ApiKeyPool(API_KEYS)


def get_api_key():
    """获取一个 API Key"""
    return api_pool.get_key()


def test_key_rotation():
    """测试 Key 轮询"""
    print("测试 API Key 轮询...")
    
    for i in range(6):
        key = get_api_key()
        print(f"第{i+1}次获取: {key[:20]}...")
        
        # 模拟调用失败/用完
        if (i + 1) % 2 == 0:
            print(f"  → Key {api_pool.get_current_key_name()} 用完了，切换...")
            api_pool.switch_to_next()
    
    api_pool.get_usage_report()


if __name__ == "__main__":
    test_key_rotation()
