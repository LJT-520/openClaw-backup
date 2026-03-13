package com.example.zip;

import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;

import java.io.*;

/**
 * ZIP 文件解密/解压工具
 */
public class ZipDecryptUtil {

    /**
     * 解压普通 ZIP（无密码）
     */
    public static void unzip(String zipPath, String outputDir) throws Exception {
        File zipFile = new File(zipPath);
        if (!zipFile.exists()) {
            throw new FileNotFoundException("文件不存在: " + zipPath);
        }

        File outDir = new File(outputDir);
        if (!outDir.exists()) {
            outDir.mkdirs();
        }

        try (FileInputStream fis = new FileInputStream(zipFile);
             BufferedInputStream bis = new BufferedInputStream(fis);
             ZipArchiveInputStream zais = new ZipArchiveInputStream(bis, "UTF-8")) {
            
            ZipArchiveEntry entry;
            while ((entry = zais.getNextZipEntry()) != null) {
                File outputFile = new File(outDir, entry.getName());
                
                // 安全检查
                if (!outputFile.getCanonicalPath().startsWith(outDir.getCanonicalPath())) {
                    System.err.println("跳过危险文件: " + entry.getName());
                    continue;
                }

                if (entry.isDirectory()) {
                    outputFile.mkdirs();
                } else {
                    outputFile.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = zais.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                System.out.println("解压: " + entry.getName());
            }
        }
        
        System.out.println("解压完成！");
    }

    /**
     * 解压加密 ZIP（使用 7-Zip）
     * 需要安装 7-Zip 并添加到 PATH
     */
    public static void unzipWith7Zip(String zipPath, String password, String outputDir) throws Exception {
        // 7z x -p123456 -ooutput/ file.zip
        ProcessBuilder pb = new ProcessBuilder(
            "7z", "x", "-p" + password, "-o" + outputDir, "-y", zipPath
        );
        pb.redirectErrorStream(true);
        
        Process process = pb.start();
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new Exception("7-Zip 解压失败，退出码: " + exitCode);
        }
        
        System.out.println("解压完成！");
    }

    // ==================== 测试 ====================
    public static void main(String[] args) {
        String zipPath = "D:/test/file.zip";
        String password = "123456";  // 密码
        String outputDir = "D:/test/output/";

        try {
            System.out.println("开始解压...");
            
            if (password != null && !password.isEmpty()) {
                // 使用 7-Zip 解密
                unzipWith7Zip(zipPath, password, outputDir);
            } else {
                // 普通解压
                unzip(zipPath, outputDir);
            }
            
        } catch (Exception e) {
            System.err.println("解压失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
