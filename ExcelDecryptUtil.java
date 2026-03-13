package com.example.excel;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.hssf.record.crypto.Biff8EncryptionKey;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Excel 密码解密工具
 * 
 * 支持格式：
 * - .xls (Excel 97-2003) - 需要密码
 * - .xlsx (Excel 2007+) - POI不支持直接解密，需手动输入密码打开后重新保存
 */
public class ExcelDecryptUtil {

    /**
     * 解密 Excel 97-2003 (.xls) 文件
     * 
     * @param filePath 文件路径
     * @param password 密码
     * @return 解密后的Workbook
     */
    public static Workbook decryptXls(String filePath, String password) 
            throws IOException, EncryptedDocumentException {
        
        // 设置密码
        Biff8EncryptionKey.setCurrentUserPassword(password);
        
        // 读取文件
        try (FileInputStream fis = new FileInputStream(filePath);
             POIFSFileSystem fs = new POIFSFileSystem(fis)) {
            
            return new HSSFWorkbook(fs);
        }
    }

    /**
     * 解密 Excel 2007+ (.xlsx) 文件
     * 
     * 注意：Apache POI 不支持直接解密 .xlsx 文件
     * 方案1：使用第三方库如 odfdom（仅支持ODF格式）
     * 方案2：调用外部工具（如 libreoffice）解密
     * 方案3：手动解密后重新保存
     * 
     * @param filePath 文件路径
     * @param password 密码
     * @return Workbooks
     */
    public static Workbook decryptXlsx(String filePath, String password) 
            throws IOException, EncryptedDocumentException {
        
        // Excel 2007+ (xlsx) 使用 Agile Encryption，无法直接解密
        // 需要使用 Microsoft Office 或 LibreOffice 解密后重新保存为无密码版本
        
        throw new UnsupportedOperationException(
            ".xlsx 格式需要手动解密。\n" +
            "方案：先用 Excel/LibreOffice 打开文件，输入密码后另存为无密码版本\n" +
            "或使用 Python openpyxl: openpyxl.load_workbook('file.xlsx', password='pwd')"
        );
    }

    /**
     * 自动识别格式并解密
     */
    public static Workbook decrypt(String filePath, String password) 
            throws IOException, EncryptedDocumentException {
        
        File file = new File(filePath);
        String extension = getFileExtension(file.getName());
        
        switch (extension.toLowerCase()) {
            case "xls":
                return decryptXls(filePath, password);
            case "xlsx":
            case "xlsm":
                return decryptXlsx(filePath, password);
            default:
                throw new IllegalArgumentException("不支持的文件格式: " + extension);
        }
    }

    /**
     * 获取文件扩展名
     */
    private static String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0) {
            return fileName.substring(lastDot + 1);
        }
        return "";
    }

    // ==================== 使用示例 ====================
    public static void main(String[] args) {
        String filePath = "D:/test/protected.xls";
        String password = "123456";

        try {
            System.out.println("尝试解密: " + filePath);
            System.out.println("密码: " + password);
            
            Workbook workbook = decrypt(filePath, password);
            
            System.out.println("解密成功！");
            System.out.println("工作表数量: " + workbook.getNumberOfSheets());
            
            // 读取数据示例
            if (workbook.getSheetAt(0) != null) {
                System.out.println("第一个工作表: " + workbook.getSheetAt(0).getSheetName());
            }
            
            workbook.close();
            
        } catch (EncryptedDocumentException e) {
            System.err.println("解密失败：密码错误或文件格式不支持");
            e.printStackTrace();
        } catch (IOException e) {
            System.err.println("文件读取失败: " + e.getMessage());
            e.printStackTrace();
        } catch (UnsupportedOperationException e) {
            System.err.println(e.getMessage());
        }
    }
}
