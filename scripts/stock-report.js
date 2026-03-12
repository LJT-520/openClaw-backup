// A股行情每小时播报
const { execSync } = require('child_process');

const TAVILY_KEY = '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';

async function getStockInfo() {
  const { default: fetch } = await import('node-fetch');
  
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query: 'A股今日行情 上证指数 深证成指',
      search_depth: 'basic',
      max_results: 3
    })
  });
  
  const data = await response.json();
  
  // 从结果中提取关键信息
  const results = data.results || [];
  let info = '📊 **A股实时行情**\n\n';
  
  if (results.length > 0) {
    // 简单返回搜索结果的摘要
    info += results.map(r => `• ${r.content?.substring(0, 150) || '暂无详细数据'}`).join('\n\n');
  }
  
  return info + '\n\n数据来源: Tavily';
}

getStockInfo().then(console.log).catch(console.error);
