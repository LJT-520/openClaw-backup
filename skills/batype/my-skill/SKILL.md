名称：《每日新闻摘要》
描述：《获取并总结今日科技新闻》
版本：1.0.0
triggers:
  - "今日新闻"
  - "科技新闻"

steps:
  - action: web_search
    query: "latest tech news today"
    max_results: 5
    
  - action: summarize
    content: "{{search_results}}"
    style: "bullet_points"
    
  - action: respond
    message: "📰 今日科技新闻摘要：

{{summary}}"
