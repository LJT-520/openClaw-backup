# Test email script
$smtpServer = "smtp.office365.com"
$smtpPort = 587
$username = "test@test.com"
$password = "test"

Send-MailMessage -SmtpServer $smtpServer -Port $smtpPort -UseSsl -From $username -To "test@test.com" -Subject "Test" -Body "Test email"
