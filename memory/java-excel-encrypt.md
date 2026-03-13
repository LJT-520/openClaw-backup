# Java 生成加密 Excel 文件完整指南

## 流程步骤

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 创建 Excel | 使用 Apache POI 库 |
| 2 | 加密 Excel | 用 POI 加密功能 |
| 3 | 保存加密文件 | 文件写入操作 |
| 4 | 解密 Excel | 输入密码解密 |
| 5 | 验证内容 | 读取并验证数据 |

## 1. Maven 依赖

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>
<dependency>
    <groupId>org.apache.xmlbeans</groupId>
    <artifactId>xmlbeans</artifactId>
    <version>5.1.1</version>
</dependency>
```

## 2. 创建 Excel 文件

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.FileOutputStream;
import java.io.IOException;

public class ExcelGenerator {
    public static void createExcel(String filePath) throws IOException {
        // 创建工作簿
        Workbook workbook = new XSSFWorkbook();
        
        // 创建工作表
        Sheet sheet = workbook.createSheet("Sample Sheet");
        
        // 创建行和单元格
        Row row = sheet.createRow(0);
        Cell cell = row.createCell(0);
        cell.setCellValue("Hello, Excel!");
        
        // 写入文件
        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        }
        
        // 关闭工作簿
        workbook.close();
    }
}
```

## 3. 加密 Excel 文件 (修复版)

```java
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.crypt.EncryptionInfo.EncryptionMode;
import org.apache.poi.poifs.crypt.Encryptor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class ExcelEncryptor {
    public static void encryptExcel(String inputFilePath, String outputFilePath, String password) 
            throws IOException {
        try (
            FileInputStream fis = new FileInputStream(inputFilePath);
            FileOutputStream fos = new FileOutputStream(outputFilePath)
        ) {
            // 创建加密配置，使用 AES
            EncryptionInfo info = new EncryptionInfo(EncryptionMode.aes);
            Encryptor encryptor = info.getEncryptor();
            encryptor.confirmPassword(password);
            
            // 使用 POIFSFileSystem 写入加密数据
            try (POIFSFileSystem fs = new POIFSFileSystem()) {
                fs.createDocument(fis, "Workbook");
                encryptor.writeFilesystem(fos);
            }
        }
    }
}
```

## 4. 解密 Excel 文件 (修复版)

```java
import org.apache.poi.poifs.crypt.Decryptor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import java.io.FileInputStream;
import java.io.IOException;

public class ExcelDecryptor {
    public static void decryptExcel(String encryptedFilePath, String password) throws IOException {
        try (
            FileInputStream fis = new FileInputStream(encryptedFilePath);
            POIFSFileSystem ps = new POIFSFileSystem(fis)
        ) {
            Decryptor decryptor = Decryptor.getInstance(ps);
            
            if (!decryptor.verifyPassword(password)) {
                throw new IOException("密码不正确!");
            }
            
            // 读取解密后的内容
            try (Workbook workbook = new XSSFWorkbook(decryptor.getDataStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                Row row = sheet.getRow(0);
                Cell cell = row.getCell(0);
                String data = cell.getStringCellValue();
                System.out.println("解密后的内容: " + data);
            }
        }
    }
}

## 5. 状态图

```
创建Excel → 加密Excel → 保存加密后的Excel → 解密Excel → 读取数据
```

## 注意事项

1. **加密算法**：使用 AES 加密（EncryptionInfo.ENCRYPTION_AES）
2. **密码验证**：解密时需要验证密码是否正确
3. **流关闭**：确保在使用完后关闭所有流
4. **POI 版本**：建议使用最新版本 5.2.3

## 完整使用示例

```java
public class Main {
    public static void main(String[] args) {
        String excelFile = "test.xlsx";
        String encryptedFile = "test_encrypted.xlsx";
        String password = "123456";
        
        try {
            // 1. 创建 Excel
            ExcelGenerator.createExcel(excelFile);
            System.out.println("Excel 创建成功");
            
            // 2. 加密 Excel
            ExcelEncryptor.encryptExcel(excelFile, encryptedFile, password);
            System.out.println("Excel 加密成功");
            
            // 3. 解密 Excel（验证）
            ExcelDecryptor.decryptExcel(encryptedFile, password);
            System.out.println("Excel 解密成功");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
