package com.example.zip;

import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.model.enums.AesEncryption;
import net.lingala.zip4j.model.enums.CompressionMethod;
import net.lingala.zip4j.model.enums.EncryptionMethod;

import java.io.File;

/**
 * 使用 zip4j 创建加密 ZIP 压缩文件
 * 支持 AES-256 加密
 */
public class ZipEncrypt {

    /**
     * 创建加密 ZIP
     *
     * @param inputDir  要压缩的文件夹
     * @param outputZip 输出的 ZIP 文件路径
     * @param password  密码
     */
    public static void zip(String inputDir, String outputZip, String password) throws ZipException {
        File folder = new File(inputDir);
        if (!folder.exists()) {
            throw new RuntimeException("目录不存在: " + inputDir);
        }

        // 创建 ZipFile 并设置密码（AES-256）
        ZipFile zipFile = new ZipFile(outputZip);
        zipFile.setPassword(password.toCharArray());

        // 设置压缩参数
        ZipParameters parameters = new ZipParameters();
        parameters.setCompressionMethod(CompressionMethod.DEFLATE);
        parameters.setCompressionLevel(9);  // 最高压缩率 (int类型)
        parameters.setEncryptionMethod(EncryptionMethod.AES);  // AES 加密
        parameters.setAesEncryptionStrength(AesEncryption.AES_256);  // AES-256

        // 添加文件夹到 ZIP
        if (folder.isDirectory()) {
            zipFile.addFolder(folder, parameters);
        } else {
            zipFile.addFile(folder, parameters);
        }

        System.out.println("加密压缩完成: " + outputZip);
    }

    /**
     * 解压加密 ZIP
     *
     * @param zipPath   加密的 ZIP 文件
     * @param password  密码
     * @param outputDir 输出目录
     */
    public static void unzip(String zipPath, String password, String outputDir) throws ZipException {
        File zipFile = new File(zipPath);
        File output = new File(outputDir);

        ZipFile zip = new ZipFile(zipFile);
        zip.setPassword(password.toCharArray());
        zip.extractAll(output.getAbsolutePath());

        System.out.println("解压完成: " + outputDir);
    }

    // ==================== 测试 ====================
    public static void main(String[] args) {
        try {
            // 示例1：创建加密 ZIP
            System.out.println("=== 创建加密 ZIP ===");
            zip(
                "D:\\test\\folder",       // 要压缩的文件夹
                "D:\\test\\encrypted.zip", // 输出的 ZIP 文件
                "123456"                   // 密码
            );

            // 示例2：解压加密 ZIP
            // System.out.println("=== 解压加密 ZIP ===");
            // unzip(
            //     "D:\\test\\encrypted.zip",
            //     "123456",
            //     "D:\\test\\output"
            // );

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
