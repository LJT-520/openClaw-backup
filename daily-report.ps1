# 定时发送邮件脚本
# 使用方法：用记事本打开，修改下面的配置，然后设置 Windows 定时任务

# ====== 配置 ======
$mailto = "xuzhu"          # 收件人
$mailcc = "songyuanqiao"  # 抄送人
$subject = "每日日报"      # 邮件主题
$smtp = "smtp.office365.com"  # SMTP服务器
$port = 587               # 端口

# ====== 邮件内容（可自定义）======
$body = @"
每日日报 - $(Get-Date -Format "yyyy年MM月dd日")

大家好，这是今日日报。

## 今日工作
- [请在这里填写今日工作内容]

## 明日计划
- [请在这里填写明日计划]

## 备注
- [如有备注请填写]

---
本邮件由自动脚本发送
"@

# ====== 发送邮件 ======
try {
    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    $mail.To = $mailto
    $mail.Cc = $mailcc
    $mail.Subject = $subject
    $mail.Body = $body
    $mail.Send()
    Write-Host "邮件发送成功！"
} catch {
    Write-Host "发送失败: $_"
}
