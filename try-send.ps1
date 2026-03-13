# Try Outlook COM
try {
    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    $mail.To = "xuzhu@x2x.net"
    $mail.Cc = "songyuanqiao@x2x.net"
    $mail.Subject = "Daily Report Test"
    $mail.Body = "Test email from script"
    $mail.Send()
    Write-Host "Sent via Outlook!"
} catch {
    Write-Host "Outlook failed: $_"
}

# Try SMTP
try {
    $smtp = New-Object System.Net.Mail.SmtpClient("smtp.office365.com", 587)
    $smtp.EnableSsl = $true
    $smtp.Credentials = New-Object System.Net.NetworkCredential("ava.lv@x2x.net", "LJT168119ljt@@")
    $msg = New-Object System.Net.Mail.MailMessage
    $msg.From = "ava.lv@x2x.net"
    $msg.To.Add("xuzhu@x2x.net")
    $msg.Cc.Add("songyuanqiao@x2x.net")
    $msg.Subject = "Daily Report Test 2"
    $msg.Body = "Test email via SMTP"
    $smtp.Send($msg)
    Write-Host "Sent via SMTP!"
} catch {
    Write-Host "SMTP failed: $_"
}
