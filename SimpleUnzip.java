package com.example.zip;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * 最简单的 ZIP 解压工具
 */
public class SimpleUnzip {

    public static void unzip(String zipPath, String outputDir) throws Exception {
        File zipFile = new File(zipPath);
        File outDir = new File(outputDir);
        outDir.mkdirs();

        try (ZipFile zf = new ZipFile(zipFile)) {
            ZipEntry entry;
            java.util.Enumeration<? extends ZipEntry> entries = zf.entries();
            
            while (entries.hasMoreElements()) {
                entry = entries.nextElement();
                File outFile = new File(outDir, entry.getName());
                
                if (entry.isDirectory()) {
                    outFile.mkdirs();
                } else {
                    outFile.getParentFile().mkdirs();
                    try (InputStream is = zf.getInputStream(entry);
                         FileOutputStream fos = new FileOutputStream(outFile)) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = is.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                System.out.println("解压: " + entry.getName());
            }
        }
        System.out.println("完成！");
    }

    public static void main(String[] args) {
        try {
            unzip("D:/test/file.zip", "D:/test/output/");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
