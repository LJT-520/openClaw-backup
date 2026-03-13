# Daily Report Email Script
$smtpServer = "smtp.office365.com"
$smtpPort = 587
$username = "ava.lv@x2x.net"
$password = "LJT168119ljt@@"
$mailto = "xuzhu"
$mailcc = "songyuanqiao"
$subject = "Daily Report - " + (Get-Date -Format "yyyy-MM-dd")
$body = @"
Daily Report - $(Get-Date -Format 'yyyy-MM-dd')

Hi Team,

## Today Work
- [Fill in today's work]

## Tomorrow Plan
- [Fill in tomorrow's plan]

## Notes
- [Notes here]

---
Auto sent by script
"@

try {
    $securePassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $securePassword)
    Send-MailMessage -SmtpServer $smtpServer -Port $smtpPort -UseSsl -From $username -To $mailto -Cc $mailcc -Subject $subject -Body $body -Credential $credential
    Write-Host "Email sent successfully!"
} catch {
    Write-Host "Failed: $_"
}
