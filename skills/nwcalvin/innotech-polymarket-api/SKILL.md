---
name: innotech-polymarket-api
description: Polymarket API and data access guide. Learn how to connect, find markets, get real-time data via WebSocket, and use polling methods.
---

# Polymarket API & Data Access Guide

**Purpose**: General reference for connecting to and using Polymarket APIs  
**Last Updated**: 2026-03-03

---

## 🎯 What This Skill Covers

This skill teaches you **how to**:

1. ✅ **Connect to Polymarket** - API endpoints, authentication
2. ✅ **Find Markets** - Search, filter, list active markets
3. ✅ **Get Real-time Data** - WebSocket and Socket.IO usage
4. ✅ **Polling Methods** - When real-time isn't available
5. ✅ **Access Market Data** - Prices, order books, volumes

**This skill does NOT include**:
- ❌ Specific trading strategies
- ❌ Arbitrage logic
- ❌ Automated trading bots

Use this knowledge to build your own applications!

---

## 📋 Quick Start

### **Step 1: Understanding Polymarket Architecture**

Polymarket has 3 main components:

1. **Gamma API** (`https://gamma-api.polymarket.com`)
   - Market information
   - Prices and odds
   - Market metadata

2. **Data API** (`https://data-api.polymarket.com`)
   - Order books
   - Trade history
   - User data (requires auth)

3. **WebSocket** (`wss://ws-subscriptions.polymarket.com`)
   - Real-time price updates
   - Live order book changes
   - Trade notifications

### **Step 2: Basic API Call**

```python
import requests

# Get all active markets
response = requests.get("https://gamma-api.polymarket.com/markets")
markets = response.json()

# Find a specific market
response = requests.get("https://gamma-api.polymarket.com/markets?slug=bitcoin-100k-2024")
market = response.json()
```

### **Step 3: Get Real-time Data**

```python
# See examples/realtime_data.py for full implementation
import socketio

sio = socketio.Client()
sio.connect('wss://ws-subscriptions.polymarket.com')

@sio.on('connect')
def on_connect():
    sio.emit('subscribe', {'market': 'market_id_here'})

@sio.on('price_change')
def on_price(data):
    print(f"New price: {data}")
```

---

## 🔌 API Endpoints

### **Gamma API** (Public, No Auth)

**Base URL**: `https://gamma-api.polymarket.com`

#### **Get All Markets**
```http
GET /markets
```

**Parameters**:
- `limit`: Number of results (default: 100)
- `offset`: Pagination offset
- `active`: Filter active markets (true/false)
- `closed`: Filter closed markets (true/false)

**Example**:
```python
# Get first 100 active markets
response = requests.get(
    "https://gamma-api.polymarket.com/markets",
    params={"active": "true", "limit": 100}
)
```

#### **Get Market by ID**
```http
GET /markets/{market_id}
```

**Example**:
```python
market_id = "abc123"
response = requests.get(f"https://gamma-api.polymarket.com/markets/{market_id}")
```

#### **Get Market by Slug**
```http
GET /markets?slug={slug}
```

**Example**:
```python
slug = "bitcoin-100k-2024"
response = requests.get(
    "https://gamma-api.polymarket.com/markets",
    params={"slug": slug}
)
```

#### **Search Markets**
```http
GET /markets?_s={search_term}
```

**Example**:
```python
search_term = "bitcoin"
response = requests.get(
    "https://gamma-api.polymarket.com/markets",
    params={"_s": search_term}
)
```

#### **Get Market Prices**
```http
GET /markets/{market_id}/price
```

**Returns**:
```json
{
  "outcomes": ["Yes", "No"],
  "outcomePrices": ["0.67", "0.33"],
  "volume": "1234567.89"
}
```

---

### **Data API** (Requires Auth for Some Endpoints)

**Base URL**: `https://data-api.polymarket.com`

#### **Get Order Book**
```http
GET /orderbook/{market_id}
```

**Example**:
```python
market_id = "abc123"
response = requests.get(f"https://data-api.polymarket.com/orderbook/{market_id}")
orderbook = response.json()

# Access bids and asks
bids = orderbook['bids']  # Buy orders
asks = orderbook['asks']  # Sell orders
```

#### **Get Trade History**
```http
GET /trades/{market_id}
```

**Parameters**:
- `limit`: Number of trades
- `before`: Trade ID for pagination

---

## 🔄 Real-time Data with WebSocket

### **Connection Methods**

Polymarket supports **3 connection methods** (in order of preference):

1. **Native WebSocket** (Fastest, most reliable)
2. **Socket.IO** (Good fallback)
3. **Polling** (Slowest, use when others fail)

### **Method 1: Native WebSocket**

**Endpoint**: `wss://ws-subscriptions.polymarket.com`

```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"Received: {data}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_open(ws):
    print("Connected!")
    # Subscribe to market
    ws.send(json.dumps({
        "type": "subscribe",
        "market": "market_id_here"
    }))

# Connect
ws = websocket.WebSocketApp(
    "wss://ws-subscriptions.polymarket.com",
    on_message=on_message,
    on_error=on_error,
    on_open=on_open
)
ws.run_forever()
```

### **Method 2: Socket.IO**

**Library**: `python-socketio`

```python
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print("Connected!")
    sio.emit('subscribe', {'markets': ['market_id_1', 'market_id_2']})

@sio.event
def price_change(data):
    print(f"Price update: {data}")

@sio.event
def disconnect():
    print("Disconnected")

# Connect
sio.connect('wss://ws-subscriptions.polymarket.com')
sio.wait()
```

### **Method 3: Polling (Fallback)**

When WebSocket/Socket.IO not available:

```python
import requests
import time

def poll_market_prices(market_id, interval=5):
    """
    Poll market prices at regular intervals
    
    Args:
        market_id: Market to poll
        interval: Seconds between polls
    """
    while True:
        response = requests.get(
            f"https://gamma-api.polymarket.com/markets/{market_id}/price"
        )
        prices = response.json()
        
        print(f"Prices: {prices['outcomePrices']}")
        
        time.sleep(interval)

# Use
poll_market_prices("market_id_here", interval=5)
```

**Polling Best Practices**:
- ✅ Use interval >= 5 seconds (don't spam API)
- ✅ Implement exponential backoff on errors
- ✅ Cache responses when possible
- ✅ Use conditional requests (If-Modified-Since header)

---

## 📊 Market Data Structure

### **Market Object**

```json
{
  "id": "abc123",
  "slug": "bitcoin-100k-2024",
  "question": "Will Bitcoin reach $100K by end of 2024?",
  "description": "...",
  "outcomes": ["Yes", "No"],
  "outcomePrices": ["0.67", "0.33"],
  "volume": "1234567.89",
  "active": true,
  "closed": false,
  "expirationDate": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### **Price Object**

```json
{
  "market": "abc123",
  "outcomePrices": ["0.67", "0.33"],
  "timestamp": "2024-03-15T12:34:56Z"
}
```

### **Order Book Object**

```json
{
  "market": "abc123",
  "bids": [
    {"price": "0.66", "size": "1000"},
    {"price": "0.65", "size": "500"}
  ],
  "asks": [
    {"price": "0.68", "size": "800"},
    {"price": "0.69", "size": "300"}
  ]
}
```

---

## 🔍 Finding Markets

### **Method 1: Browse All Markets**

```python
def get_all_active_markets(limit=100, offset=0):
    """Get all active markets"""
    response = requests.get(
        "https://gamma-api.polymarket.com/markets",
        params={
            "active": "true",
            "closed": "false",
            "limit": limit,
            "offset": offset
        }
    )
    return response.json()

# Use
markets = get_all_active_markets(limit=100)
for market in markets:
    print(f"{market['question']}: {market['outcomePrices']}")
```

### **Method 2: Search by Keyword**

```python
def search_markets(keyword):
    """Search markets by keyword"""
    response = requests.get(
        "https://gamma-api.polymarket.com/markets",
        params={"_s": keyword}
    )
    return response.json()

# Use
bitcoin_markets = search_markets("bitcoin")
```

### **Method 3: Filter by Criteria**

```python
def filter_markets(min_volume=10000, max_spread=0.05):
    """
    Filter markets by criteria
    
    Args:
        min_volume: Minimum trading volume
        max_spread: Maximum spread (UP+DOWN difference from 1.0)
    """
    response = requests.get(
        "https://gamma-api.polymarket.com/markets",
        params={"active": "true", "limit": 1000}
    )
    markets = response.json()
    
    filtered = []
    for market in markets:
        # Check volume
        if float(market.get('volume', 0)) < min_volume:
            continue
        
        # Check spread
        prices = market.get('outcomePrices', [])
        if len(prices) == 2:
            spread = abs(float(prices[0]) + float(prices[1]) - 1.0)
            if spread <= max_spread:
                filtered.append(market)
    
    return filtered
```

---

## 💡 Usage Examples

### **Example 1: Monitor Price Changes**

```python
import requests
import time

def monitor_prices(market_id, interval=10):
    """Monitor price changes over time"""
    while True:
        response = requests.get(
            f"https://gamma-api.polymarket.com/markets/{market_id}/price"
        )
        prices = response.json()
        
        print(f"[{time.strftime('%H:%M:%S')}] "
              f"Yes: {prices['outcomePrices'][0]}, "
              f"No: {prices['outcomePrices'][1]}")
        
        time.sleep(interval)

# Use
monitor_prices("market_id_here", interval=10)
```

### **Example 2: Get Order Book Depth**

```python
def get_order_book_depth(market_id):
    """Get order book depth for a market"""
    response = requests.get(
        f"https://data-api.polymarket.com/orderbook/{market_id}"
    )
    orderbook = response.json()
    
    total_bid_volume = sum(float(bid['size']) for bid in orderbook['bids'])
    total_ask_volume = sum(float(ask['size']) for ask in orderbook['asks'])
    
    return {
        'bid_volume': total_bid_volume,
        'ask_volume': total_ask_volume,
        'spread': float(orderbook['asks'][0]['price']) - float(orderbook['bids'][0]['price'])
    }
```

### **Example 3: Track Multiple Markets**

```python
def track_markets(market_ids, interval=5):
    """Track multiple markets simultaneously"""
    while True:
        for market_id in market_ids:
            response = requests.get(
                f"https://gamma-api.polymarket.com/markets/{market_id}"
            )
            market = response.json()
            
            print(f"{market['question']}: {market['outcomePrices']}")
        
        time.sleep(interval)
```

---

## 🔧 Common Use Cases

### **Use Case 1: Market Scanner**

```python
def scan_for_new_markets(check_interval=300):
    """
    Periodically scan for new markets
    
    Args:
        check_interval: Seconds between scans
    """
    known_markets = set()
    
    while True:
        response = requests.get(
            "https://gamma-api.polymarket.com/markets",
            params={"active": "true", "limit": 100}
        )
        markets = response.json()
        
        for market in markets:
            if market['id'] not in known_markets:
                print(f"🆕 New market: {market['question']}")
                known_markets.add(market['id'])
        
        time.sleep(check_interval)
```

### **Use Case 2: Price Alert System**

```python
def price_alert(market_id, target_price, outcome_index=0):
    """
    Alert when price reaches target
    
    Args:
        market_id: Market to watch
        target_price: Target price (e.g., 0.50)
        outcome_index: 0 for Yes, 1 for No
    """
    while True:
        response = requests.get(
            f"https://gamma-api.polymarket.com/markets/{market_id}/price"
        )
        prices = response.json()
        current_price = float(prices['outcomePrices'][outcome_index])
        
        if current_price >= target_price:
            print(f"🎯 PRICE ALERT: {current_price} (target: {target_price})")
            break
        
        time.sleep(10)
```

### **Use Case 3: Volume Tracker**

```python
def track_volume(market_id, interval=60):
    """Track trading volume over time"""
    while True:
        response = requests.get(
            f"https://gamma-api.polymarket.com/markets/{market_id}"
        )
        market = response.json()
        
        print(f"Volume: ${float(market['volume']):,.2f}")
        
        time.sleep(interval)
```

---

## 📚 API Reference

### **Gamma API Endpoints**

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/markets` | GET | Get all markets | No |
| `/markets/{id}` | GET | Get market by ID | No |
| `/markets/{id}/price` | GET | Get current prices | No |
| `/markets?slug={slug}` | GET | Get market by slug | No |
| `/markets?_s={term}` | GET | Search markets | No |

### **Data API Endpoints**

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/orderbook/{id}` | GET | Get order book | No |
| `/trades/{id}` | GET | Get trade history | No |
| `/positions` | GET | Get user positions | Yes |

### **WebSocket Events**

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Connect to WebSocket |
| `subscribe` | Client → Server | Subscribe to market updates |
| `price_change` | Server → Client | Price update notification |
| `order_book_update` | Server → Client | Order book change |

---

## ⚠️ Important Notes

### **Rate Limits**
- Gamma API: ~100 requests/minute
- Data API: ~50 requests/minute
- WebSocket: No limit (but don't spam subscriptions)

### **Best Practices**
1. ✅ Use WebSocket for real-time data (preferred)
2. ✅ Implement exponential backoff on errors
3. ✅ Cache responses when possible
4. ✅ Use polling intervals >= 5 seconds
5. ✅ Handle disconnections gracefully

### **Error Handling**

```python
def safe_api_call(url, max_retries=3):
    """Make API call with retry logic"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise
```

---

## 📖 Further Reading

- **API Documentation**: Check `references/API_REFERENCE.md`
- **WebSocket Guide**: Check `references/WEBSOCKET_GUIDE.md`
- **Examples**: Check `examples/` directory

---

## 🎯 Summary

This skill teaches you **how to access Polymarket data**:

1. ✅ **Connect**: Use Gamma API, Data API, or WebSocket
2. ✅ **Find Markets**: Browse, search, or filter
3. ✅ **Real-time Data**: WebSocket (preferred) or Socket.IO
4. ✅ **Polling**: Fallback when real-time unavailable
5. ✅ **Market Data**: Prices, order books, volumes

**Use this knowledge to build your own applications!**

---

**Note**: This is a **general reference guide**. For specific trading strategies, build separate programs using these APIs.
