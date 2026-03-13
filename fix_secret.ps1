$content = Get-Content 'C:\Users\Administrator\.openclaw\openclaw.json' -Raw
$content = $content -replace 'qtzLpCsekUKEnH1B7n5FTbCTXODWWQjq', 'kZ3VfTIKPAMJ9xWO6YG7XocWivJ4Q1uF'
Set-Content -Path 'C:\Users\Administrator\.openclaw\openclaw.json' -Value $content -NoNewline
Write-Host "Done"
