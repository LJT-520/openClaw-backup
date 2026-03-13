package com.example.api;

import com.example.util.SignUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 人资商查询接口 API 客户端
 * 
 * ========== 请求示例 ==========
 * 
 * POST /thirdparty/api/company/ledger/file/info/query
 * Content-Type: application/json
 * 
 * {
 *     "appKey": "123456",
 *     "body": "{\"company_id\":\"123456789\"}",
 *     "timestamp": "1488363493",
 *     "version": "1.0",
 *     "sign": "3361466842a0f8688b30c794a9e6eecb"
 * }
 * 
 * ========== 响应示例 ==========
 * 
 * 成功：
 * {
 *     "code": "0",
 *     "message": "success",
 *     "data": {
 *         "company_id": "123456789",
 *         "file_list": [
 *             {
 *                 "file_id": "FILE_001",
 *                 "file_name": "人资商台账.pdf",
 *                 "create_time": "2024-03-01 10:00:00"
 *             }
 *         ]
 *     }
 * }
 * 
 * 失败：
 * {
 *     "code": "1001",
 *     "message": "签名验证失败",
 *     "data": null
 * }
 */
public class HrPartnerQueryClient {

    // 配置参数（需要替换为实际值）
    private static final String BASE_URL = "https://api.example.com"; // 实际API地址
    private static final String APP_KEY = "your_app_key";
    private static final String APP_SECRET = "your_app_secret";
    private static final String VERSION = "1.0";

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 查询人资商台账文件信息
     *
     * @param companyId 企业ID
     * @param fileId    文件ID（可选）
     * @return API响应结果
     */
    public ApiResponse queryLedgerFileInfo(String companyId, String fileId) throws Exception {
        // 1. 构建请求参数
        Map<String, String> params = new LinkedHashMap<>();
        
        // 构建body（业务参数）
        Map<String, Object> bodyMap = new LinkedHashMap<>();
        bodyMap.put("company_id", companyId);
        if (fileId != null && !fileId.isEmpty()) {
            bodyMap.put("file_id", fileId);
        }
        String bodyJson = objectMapper.writeValueAsString(bodyMap);
        
        // 生成时间戳和随机字符串
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
        String nonce = UUID.randomUUID().toString().replace("-", "");
        
        // 设置参数（注意：sign不参与签名）
        params.put("appKey", APP_KEY);
        params.put("body", bodyJson);
        params.put("timestamp", timestamp);
        params.put("version", VERSION);
        // nonce 如果需要参与签名也加上
        // params.put("nonce", nonce);

        // 2. 生成签名
        String sign = SignUtil.generateSign(params, APP_SECRET);

        // 3. 构建完整请求体
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("appKey", APP_KEY);
        requestBody.put("body", bodyJson);
        requestBody.put("timestamp", timestamp);
        requestBody.put("version", VERSION);
        requestBody.put("sign", sign);
        if (!params.containsKey("nonce")) {
            requestBody.put("nonce", nonce);
        }

        String requestJson = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(requestBody);

        // 4. 发送请求
        return doPost("/thirdparty/api/company/ledger/file/info/query", requestJson);
    }

    /**
     * 发送POST请求
     */
    private ApiResponse doPost(String path, String jsonBody) throws Exception {
        URL url = new URL(BASE_URL + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        conn.setRequestProperty("Accept", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(30000);

        // 写入请求体
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        // 读取响应
        int responseCode = conn.getResponseCode();
        String responseBody;
        if (responseCode == 200) {
            java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            reader.close();
            responseBody = sb.toString();
        } else {
            java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            reader.close();
            responseBody = sb.toString();
        }

        // 解析响应
        JsonNode rootNode = objectMapper.readTree(responseBody);
        ApiResponse response = new ApiResponse();
        response.setCode(rootNode.path("code").asText());
        response.setMessage(rootNode.path("message").asText());
        response.setData(rootNode.path("data"));
        response.setSuccess("0".equals(response.getCode()) || "200".equals(response.getCode()));
        
        return response;
    }

    /**
     * API响应对象
     */
    public static class ApiResponse {
        private String code;
        private String message;
        private JsonNode data;
        private boolean success;

        // Getters and Setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public JsonNode getData() { return data; }
        public void setData(JsonNode data) { this.data = data; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        @Override
        public String toString() {
            return "ApiResponse{" +
                    "code='" + code + '\'' +
                    ", message='" + message + '\'' +
                    ", data=" + data +
                    ", success=" + success +
                    '}';
        }
    }

    // ==================== 测试 ====================
    public static void main(String[] args) {
        try {
            HrPartnerQueryClient client = new HrPartnerQueryClient();
            
            // 示例1：查询企业的人资商信息（不带fileId）
            String companyId = "123456789";
            String fileId = null;
            
            System.out.println("=== 示例1：查询企业人资商信息 ===");
            System.out.println("请求参数：companyId=" + companyId + ", fileId=" + fileId);
            
            ApiResponse response = client.queryLedgerFileInfo(companyId, fileId);
            System.out.println("响应结果：" + response);
            
            // 示例2：查询指定文件信息
            /*
            String companyId2 = "123456789";
            String fileId2 = "FILE_20240301_001";
            
            System.out.println("\n=== 示例2：查询指定文件信息 ===");
            System.out.println("请求参数：companyId=" + companyId2 + ", fileId=" + fileId2);
            
            ApiResponse response2 = client.queryLedgerFileInfo(companyId2, fileId2);
            System.out.println("响应结果：" + response2);
            */
            
        } catch (Exception e) {
            System.err.println("调用失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
}
