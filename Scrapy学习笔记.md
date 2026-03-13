# Scrapy 爬虫框架学习笔记

> Python 最流行的网页爬取框架

---

## 一、Scrapy 是什么？

**Scrapy** 是一个开源的 Python 网页爬取框架，用于高效提取结构化数据。

- ✅ **快速强大**：写好规则，Scrapy 自动爬取
- ✅ **可定制**：用 Python 定制爬虫
- ✅ **开源**：全球数百万开发者使用

**官网**：https://scrapy.org/
**文档**：https://docs.scrapy.org/

---

## 二、安装

```bash
pip install scrapy
```

或使用 conda：
```bash
conda install -c conda-forge scrapy
```

---

## 三、快速开始

### 1. 创建项目

```bash
scrapy startproject myproject
```

这会创建以下目录结构：
```
myproject/
├── scrapy.cfg              # 部署配置
└── myproject/             # 项目 Python 模块
    ├── __init__.py
    ├── items.py            # 定义数据结构
    ├── middlewares.py     # 中间件
    ├── pipelines.py       # 数据管道
    ├── settings.py        # 设置
    └── spiders/          # 爬虫目录
        └── __init__.py
```

### 2. 创建爬虫

```bash
cd myproject
scrapy genspider quotes quotes.toscrape.com
```

### 3. 编写爬虫（quotes_spider.py）

```python
import scrapy

class QuotesSpider(scrapy.Spider):
    name = "quotes"  # 爬虫名称，必须唯一
    
    # 起始 URL 列表
    start_urls = [
        "https://quotes.toscrape.com/page/1/",
        "https://quotes.toscrape.com/page/2/",
    ]
    
    def parse(self, response):
        # 提取页面中的所有名言
        for quote in response.css('div.quote'):
            yield {
                'text': quote.css('span.text::text').get(),
                'author': quote.css('small.author::text').get(),
                'tags': quote.css('div.tags a.tag::text').getall(),
            }
        
        # 翻页：跟进下一页
        next_page = response.css('li.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

### 4. 运行爬虫

```bash
scrapy crawl quotes
```

### 5. 保存数据

```bash
# 保存为 JSON
scrapy crawl quotes -o quotes.json

# 保存为 CSV
scrapy crawl quotes -o quotes.csv

# 保存为 XML
scrapy crawl quotes -o quotes.xml
```

---

## 四、核心概念

### 1. Spider（爬虫）

定义如何爬取一个网站：
- 起始请求
- 如何跟进链接
- 如何解析页面

```python
class MySpider(scrapy.Spider):
    name = "myspider"
```

### 2. Item（数据项）

定义要爬取的数据结构：

```python
# items.py
import scrapy

class QuoteItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()
```

### 3. Request/Response

- **Request**：爬虫发出的请求对象
- **Response**：服务器返回的响应

```python
# 发送请求
yield scrapy.Request(url, callback=self.parse)

# 使用 CSS 选择器
response.css('div.quote::text').get()

# 使用 XPath
response.xpath('//div[@class="quote"]/span/text()').get()
```

### 4. Selector（选择器）

**CSS 选择器**：
```python
response.css('title::text').get()
response.css('a::attr(href)').getall()
```

**XPath**：
```python
response.xpath('//title/text()').get()
response.xpath('//a/@href').getall()
```

---

## 五、完整示例

### 爬取博客文章

```python
import scrapy

class BlogSpider(scrapy.Spider):
    name = "blog"
    allowed_domains = ["example.com"]
    start_urls = ["https://www.example.com/blog/"]
    
    def parse(self, response):
        # 提取文章列表
        for article in response.css('article.post'):
            yield {
                'title': article.css('h2 a::text').get(),
                'url': article.css('h2 a::attr(href)').get(),
                'date': article.css('time::attr(datetime)').get(),
            }
        
        # 翻页
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

---

## 六、Settings 配置

在 `settings.py` 中：

```python
# 设置下载延迟（避免被封）
DOWNLOAD_DELAY = 1

# 设置 User-Agent
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...'

# 开启 Pipeline
ITEM_PIPELINES = {
    'myproject.pipelines.MyPipeline': 300,
}

# 设置并发请求数
CONCURRENT_REQUESTS = 16

# 设置代理（可选）
HTTPPROXY_ENABLED = True
```

---

## 七、实战技巧

### 1. 使用 Scrapy Shell 测试

```bash
scrapy shell "https://quotes.toscrape.com/"
```

在 shell 中测试选择器：
```python
response.css('title::text').get()
response.xpath('//span[@class="text"]/text()').getall()
```

### 2. 翻页处理

```python
def parse(self, response):
    # 提取当前页数据
    for item in response.css('div.quote'):
        yield item
    
    # 跟进下一页
    next_page = response.css('a.next::attr(href)').get()
    if next_page:
        yield response.follow(next_page, self.parse)
```

### 3. 处理 JSON API

```python
def parse_api(self, response):
    data = response.json()
    for item in data['results']:
        yield item
```

### 4. 登录处理

```python
def parse(self, response):
    return scrapy.FormRequest.from_response(
        response,
        formdata={'username': 'admin', 'password': '123456'},
        callback=self.after_login
    )

def after_login(self, response):
    # 登录成功后继续爬取
    pass
```

---

## 八、常见命令

| 命令 | 说明 |
|------|------|
| `scrapy startproject <name>` | 创建项目 |
| `scrapy genspider <name> <domain>` | 创建爬虫 |
| `scrapy crawl <name>` | 运行爬虫 |
| `scrapy shell <url>` | 交互式调试 |
| `scrapy list` | 列出所有爬虫 |
| `scrapy fetch <url>` | 获取页面 |
| `scrapy view <url>` | 查看页面（与浏览器相同）|

---

## 九、优缺点

### 优点
- ✅ 异步高效
- ✅ 完整的爬虫框架
- ✅ 自动处理 robots.txt
- ✅ 内置选择器
- ✅ 支持保存多种格式

### 缺点
- ❌ 不支持 JavaScript 渲染（需配合 Splash/Selenium）
- ❌ 学习曲线较陡
- ❌ 对于简单爬取有点重

---

## 十、参考资料

- 官方文档：https://docs.scrapy.org/
- 中文文档：https://scrapy-chs.readthedocs.io/
- 入门教程：https://docs.scrapy.org/en/latest/intro/tutorial.html

---

*整理时间：2026-03-10*
