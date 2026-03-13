$jsonPath = "C:\Users\Administrator\.openclaw\openclaw.json"
$json = Get-Content $jsonPath -Raw -Encoding UTF8

# Replace the gateway section to add env
$old = '"gateway": {'
$new = '"gateway": {"env":{"TAVILY_API_KEY":"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"},'
$json = $json.Replace($old, $new)

Set-Content -Path $jsonPath -Value $json -Encoding UTF8
Write-Host "Done - TAVILY_API_KEY configured"
