package com.example.api;

import com.example.util.SignUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 人资商台账文件信息查询API
 * 
 * ========== 请求示例 ==========
 * POST /thirdparty/api/company/ledger/file/info/query
 * Content-Type: application/json
 * 
 * {
 *     "appKey": "123456",
 *     "body": "{\"companyId\":1,\"fileTypeList\":[1,2],\"ledgerDate\":\"2026-03-09\",\"operateTime\":1626936216}",
 *     "timestamp": "1709260800",
 *     "version": "1.0",
 *     "sign": "3361466842a0f8688b30c794a9e6eecb"
 * }
 * 
 * ========== 响应示例 ==========
 * 
 * 成功：
 * {
 *     "status": "ok",
 *     "content": {
 *         "fileType": "1",
 *         "ledgerDate": "2026-03-09",
 *         "fileUrl": "https://example.com/file.pdf",
 *         "filePwd": "123456"
 *     }
 * }
 * 
 * 失败：
 * {
 *     "status": "fail",
 *     "errorCode": "1001",
 *     "errorMsg": "文件暂未生成"
 * }
 */
public class HrLedgerQueryClient {

    // 配置参数（需要替换为实际值）
    private static final String BASE_URL = "https://api.example.com"; // 实际API地址
    private static final String APP_KEY = "your_app_key";
    private static final String APP_SECRET = "your_app_secret";
    private static final String VERSION = "1.0";

    private final ObjectMapper objectMapper;

    public HrLedgerQueryClient() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    /**
     * 查询人资商台账文件信息
     */
    public ApiResponse queryLedgerFileInfo(
            Long companyId,
            String ledgerDate,
            java.util.List<Integer> fileTypeList,
            String extendInfo,
            Long operateTime) throws Exception {

        // 1. 构建业务参数 (body)
        Map<String, Object> bodyMap = new LinkedHashMap<>();
        bodyMap.put("companyId", companyId);           // 人资商id (必需)
        bodyMap.put("ledgerDate", ledgerDate);         // 账单日期 (必需), 格式: yyyy-MM-dd
        bodyMap.put("fileTypeList", fileTypeList);     // 文件类型列表 (必需)
        bodyMap.put("extendInfo", extendInfo);         // 扩展信息 (可选)
        bodyMap.put("operateTime", operateTime);       // 业务操作时间戳 (必需)

        String bodyJson = objectMapper.writeValueAsString(bodyMap);

        // 2. 生成时间戳
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);

        // 3. 构建签名参数（注意：sign不参与签名，body是JSON字符串）
        Map<String, String> signParams = new LinkedHashMap<>();
        signParams.put("appKey", APP_KEY);
        signParams.put("body", bodyJson);
        signParams.put("timestamp", timestamp);
        signParams.put("version", VERSION);

        // 4. 生成签名
        String sign = SignUtil.generateSign(signParams, APP_SECRET);

        // 5. 构建完整请求体
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("appKey", APP_KEY);
        requestBody.put("body", bodyJson);
        requestBody.put("timestamp", timestamp);
        requestBody.put("version", VERSION);
        requestBody.put("sign", sign);

        String requestJson = objectMapper.writeValueAsString(requestBody);

        // 6. 发送请求
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

        // 响应格式: {"status":"ok/fail", "errorCode":"xxx", "errorMsg":"xxx", "content":{}}
        response.setStatus(rootNode.path("status").asText());
        response.setErrorCode(rootNode.path("errorCode").asText());
        response.setErrorMsg(rootNode.path("errorMsg").asText());
        response.setContent(rootNode.path("content"));
        response.setSuccess("ok".equals(response.getStatus()));

        return response;
    }

    /**
     * API响应对象
     */
    public static class ApiResponse {
        private String status;       // "ok" 或 "fail"
        private String errorCode;    // 错误码
        private String errorMsg;     // 错误信息
        private JsonNode content;    // 响应结果
        private boolean success;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getErrorCode() { return errorCode; }
        public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
        public String getErrorMsg() { return errorMsg; }
        public void setErrorMsg(String errorMsg) { this.errorMsg = errorMsg; }
        public JsonNode getContent() { return content; }
        public void setContent(JsonNode content) { this.content = content; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        @Override
        public String toString() {
            return "ApiResponse{status='" + status + "', errorCode='" + errorCode +
                   "', errorMsg='" + errorMsg + "', content=" + content + ", success=" + success + "}";
        }
    }

    // ==================== 测试 ====================
    public static void main(String[] args) {
        try {
            // 示例参数
            Long companyId = 1L;                          // 人资商id
            String ledgerDate = "2026-03-09";             // 账单日期
            java.util.List<Integer> fileTypeList = java.util.Arrays.asList(1, 2);  // 文件类型：1-人资商付款交易，2-骑士收入账单
            String extendInfo = null;                     // 扩展信息（可选）
            Long operateTime = 1626936216L;               // 业务操作时间戳

            System.out.println("========== 请求参数 ==========");
            System.out.println("companyId: " + companyId);
            System.out.println("ledgerDate: " + ledgerDate);
            System.out.println("fileTypeList: " + fileTypeList);
            System.out.println("operateTime: " + operateTime);

            // 构建body
            Map<String, Object> bodyMap = new LinkedHashMap<>();
            bodyMap.put("companyId", companyId);
            bodyMap.put("ledgerDate", ledgerDate);
            bodyMap.put("fileTypeList", fileTypeList);
            bodyMap.put("extendInfo", extendInfo);
            bodyMap.put("operateTime", operateTime);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            String bodyJson = mapper.writeValueAsString(bodyMap);

            System.out.println("\n========== body (业务参数) ==========");
            System.out.println(bodyJson);

            // 生成签名
            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            String appKey = "123456";  // 示例appKey
            String version = "1.0";
            String appSecret = "abcdefg123";  // 示例secret

            Map<String, String> signParams = new LinkedHashMap<>();
            signParams.put("appKey", appKey);
            signParams.put("body", bodyJson);
            signParams.put("timestamp", timestamp);
            signParams.put("version", version);

            String sign = SignUtil.generateSign(signParams, appSecret);

            // 完整请求体
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("appKey", appKey);
            requestBody.put("body", bodyJson);
            requestBody.put("timestamp", timestamp);
            requestBody.put("version", version);
            requestBody.put("sign", sign);

            String requestJson = mapper.writeValueAsString(requestBody);

            System.out.println("\n========== 完整请求JSON ==========");
            System.out.println(requestJson);

            System.out.println("\n========== 签名过程 ==========");
            System.out.println("1. 排序后的参数: " + signParams);
            System.out.println("2. 拼接字符串: " + appSecret + appKey + bodyJson + timestamp + version + appSecret);
            System.out.println("3. 签名: " + sign);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
