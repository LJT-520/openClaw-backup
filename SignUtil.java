package com.example.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;

/**
 * 签名生成工具类
 * 
 * 签名算法：
 * 1. 将参与签名的参数按key字典排序
 * 2. 将排序后的参数进行key=value字符串拼接
 * 3. 首尾加上appSecret
 * 4. MD5加密生成32位字符串
 */
public class SignUtil {

    /**
     * 生成签名
     *
     * @param params    参与签名的参数Map
     * @param appSecret 秘钥
     * @return 签名字符串(32位MD5)
     */
    public static String generateSign(Map<String, String> params, String appSecret) {
        // 第一步：按key字典排序
        TreeMap<String, String> sortedParams = new TreeMap<>(params);

        // 第二步：key+value字符串拼接
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null) {
                sb.append(key).append(value);
            }
        }

        // 第三步：首尾加上appSecret
        String signString = appSecret + sb.toString() + appSecret;

        // 第四步：MD5加密
        return md5(signString);
    }

    /**
     * 生成签名（使用可变参数）
     *
     * @param appSecret 秘钥
     * @param keyValues 参与签名的key-value对，必须是key1, value1, key2, value2...
     * @return 签名字符串(32位MD5)
     */
    public static String generateSign(String appSecret, String... keyValues) {
        if (keyValues == null || keyValues.length % 2 != 0) {
            throw new IllegalArgumentException("keyValues必须是成对的key-value");
        }

        Map<String, String> params = new TreeMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            params.put(keyValues[i], keyValues[i + 1]);
        }

        return generateSign(params, appSecret);
    }

    /**
     * MD5加密
     *
     * @param input 输入字符串
     * @return 32位MD5小写字符串
     */
    public static String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5加密失败", e);
        }
    }

    /**
     * byte数组转16进制字符串
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    // ==================== 测试 ====================
    public static void main(String[] args) {
        // 示例参数（对应文档中的例子）
        String appKey = "123456";
        String body = "{\"order_id\":\"20170301000001\"}";
        String timestamp = "1488363493";
        String version = "1.0";
        String appSecret = "abcdefg123";

        // 方式1：使用Map
        Map<String, String> params = new TreeMap<>();
        params.put("appKey", appKey);
        params.put("body", body);
        params.put("timestamp", timestamp);
        params.put("version", version);

        String sign1 = generateSign(params, appSecret);
        System.out.println("方式1 - Map方式生成签名: " + sign1);

        // 方式2：使用可变参数
        String sign2 = generateSign(appSecret, 
            "appKey", appKey, 
            "body", body, 
            "timestamp", timestamp, 
            "version", version);
        System.out.println("方式2 - 可变参数生成签名: " + sign2);

        // 验证：按照文档步骤手动拼接
        // 排序：appKey, body, timestamp, version
        // 拼接：appKey123456body{"order_id":"20170301000001"}timestamp1488363493version1.0
        // 首尾加secret：abcdefg123appKey123456body{"order_id":"20170301000001"}timestamp1488363493version1.0abcdefg123
        String manualString = "abcdefg123" + 
            "appKey" + appKey + 
            "body" + body + 
            "timestamp" + timestamp + 
            "version" + version + 
            "abcdefg123";
        String manualSign = md5(manualString);
        System.out.println("手动验证签名: " + manualSign);
    }
}
