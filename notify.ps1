Add-Type -AssemblyName System.Windows.Forms
$n = New-Object System.Windows.Forms.NotifyIcon
$n.Icon = [System.Drawing.SystemIcons]::Info
$n.Visible = $true
$n.ShowBalloonTip(5000, "涛哥", "有消息来了！", "Info")
Start-Sleep -Seconds 3
$n.Dispose()
