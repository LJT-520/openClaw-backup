$headers = @{'User-Agent'='Mozilla/5.0'}
$response = Invoke-WebRequest -Uri 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f1,f2,f3,f4,f12,f13&secids=1.000001,0.399001,1.399006' -Headers $headers
$response.Content
