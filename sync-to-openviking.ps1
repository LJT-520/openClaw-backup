# OpenClaw to OpenViking Sync Script
# 将 OpenClaw memory 文件同步到 OpenViking

param(
    [string]$MemoryFile,
    [string]$Content
)

$ErrorActionPreference = "Stop"

function Sync-ToOpenViking {
    param([string]$Text)
    
    $body = @{
        account = "default"
        user = "default" 
        agent = "default"
    } | ConvertTo-Json
    
    # Create session
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:1933/api/v1/sessions" -Method Post -Body $body -ContentType "application/json"
    $sessionId = $resp.result.session_id
    
    # Add message
    $msgBody = @{
        role = "user"
        content = $Text
    } | ConvertTo-Json
    
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:1933/api/v1/sessions/$sessionId/messages" -Method Post -Body $msgBody -ContentType "application/json"
    
    # Commit
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:1933/api/v1/sessions/$sessionId/commit" -Method Post
    
    Write-Host "Synced to session: $sessionId"
}

if ($MemoryFile) {
    $content = Get-Content $MemoryFile -Raw -Encoding UTF8
    if ($content) {
        Write-Host "Syncing $MemoryFile..."
        Sync-ToOpenViking -Text $content
    }
}
elseif ($Content) {
    Sync-ToOpenViking -Text $Content
}
else {
    # Sync today's memory files
    $memoryDir = "D:\OpenClaw\workspace\memory"
    $today = Get-Date -Format "yyyy-MM-dd"
    $files = Get-ChildItem $memoryDir -Filter "*.md" | Where-Object { $_.LastWriteTime.Date -eq (Get-Date).Date }
    
    foreach ($file in $files) {
        Write-Host "Syncing $($file.Name)..."
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        Sync-ToOpenViking -Text $content
    }
}

Write-Host "Done!"
