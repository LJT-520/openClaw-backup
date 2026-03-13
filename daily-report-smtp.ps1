# 每日日报 - Microsoft 365 版

# ====== 配置 ======
$smtpServer = "smtp.office365.com"
$smtpPort = 587

# 改成你的完整邮箱地址和密码
$username = "ava.lv@x2x.net"   # 你的邮箱
$password = "LJT168119ljt@@"     # 你的密码或App密码

$mailto = "Kuhn.YAO@x2x.net"          # 收件人
$mailcc = "ava.lv@x2x.net"  # 抄送人

# ====== 邮件内容 ======
$subject = "每日日报 - $(Get-Date -Format 'yyyy年MM月dd日')"

$body = @"
每日日报 - $(Get-Date -Format "yyyy年MM月dd日")

大家好，这是今日日报。

## 今日工作
- [请在这里填写今日工作内容]


## 备注
- [如有备注请填写]

---
本邮件由自动脚本发送
"@

# ====== 发送 ======
try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)
    
    Send-MailMessage -SmtpServer $smtpServer -Port $smtpPort -UseSsl `
        -From $username -To $mailto -Cc $mailcc `
        -Subject $subject -Body $body `
        -Credential $credential
    
    Write-Host "邮件发送成功！"
} catch {
    Write-Host "发送失败: $_"
}
