package com.example.zip;

import java.io.BufferedReader;
import java.io.InputStreamReader;

/**
 * 调用 7-Zip 解压加密 ZIP
 */
public class ZipWithPassword {

    /**
     * 使用 7-Zip 解压加密 ZIP
     *
     * @param zipPath   ZIP 文件路径
     * @param password  密码
     * @param outputDir 输出目录
     */
    public static void unzip(String zipPath, String password, String outputDir) throws Exception {
        // 7z x -p{password} -o{output} -y {zipPath}
        ProcessBuilder pb = new ProcessBuilder(
            "7z", "x", 
            "-p" + password, 
            "-o" + outputDir, 
            "-y", 
            zipPath
        );
        
        pb.redirectErrorStream(true);
        Process process = pb.start();
        
        // 输出解压过程
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new Exception("解压失败！退出码: " + exitCode);
        }
        
        System.out.println("解压完成！");
    }

    public static void main(String[] args) {
        try {
            unzip(
                "D:\\test\\encrypted.zip",  // ZIP 文件
                "123456",                    // 密码
                "D:\\test\\output"          // 输出目录
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
