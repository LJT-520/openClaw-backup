Start-Process outlook -WindowStyle Minimized
Start-Sleep -Seconds 5

$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "xuzhu@x2x.net"
$mail.Cc = "songyuanqiao@x2x.net"
$mail.Subject = "Daily Report Test"
$mail.Body = "Test email from auto script"
$mail.Send()

Write-Host "Email sent!"
