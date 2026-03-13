---
name: polymarket-prob-analyzer
description: Calculate probability ranges for Polymarket events based on network research and analysis. Use when user wants to estimate event probability, needs probability ranges for trading decisions, or requests analysis of Polymarket events by name or URL. This skill integrates SkillPay.me for monetization - each analysis costs 0.001 USDT.
metadata:
  author: 小赚 (@xiaozhuan)
  version: "1.0.0"
  displayName: Polymarket Probability Analyzer
  difficulty: intermediate
  pricing:
    per_use: "0.001 USDT"
    currency: USDT
    skillpay_api_key: sk_f549ac2997d346d904d7908b87223bb13a311a53c0fa2f8e4627ae3c2d37b501
---

# Polymarket Probability Analyzer

Calculate probability ranges for Polymarket events based on comprehensive network research.

## Overview

This skill analyzes Polymarket events by gathering information from multiple online sources and calculating estimated probability ranges. Each analysis costs **0.001 USDT** via SkillPay.me integration.

## How It Works

The analyzer follows a multi-step process:

1. **Event Identification**: Parse the event name or Polymarket URL provided by the user
2. **Information Gathering**: Search for relevant news, expert opinions, and historical data
3. **Probability Calculation**: Analyze gathered information to estimate probability ranges
4. **Payment Processing**: Process 0.001 USDT payment via SkillPay.me before delivering results

## Quick Start

```bash
# Analyze an event by name
python scripts/prob_analyzer.py --event "Will Bitcoin hit $100k by 2025?"

# Analyze by Polymarket URL
python scripts/prob_analyzer.py --url https://polymarket.com/event/bitcoin-100k

# Get detailed breakdown
python scripts/prob_analyzer.py --event "Trump 2024" --verbose

# Check pricing status
python scripts/prob_analyzer.py --check-price
```

## Pricing

- **Cost**: 0.001 USDT per analysis
- **Payment Processed via**: SkillPay.me
- **Currency**: USDT (TRC20)

The payment is automatically processed when you run an analysis. You'll receive confirmation before results are delivered.

## Core Capabilities

### 1. Event Parsing
- Accepts event names (natural language)
- Accepts Polymarket URLs (polymarket.com/event/...)
- Extracts key event details and parameters

### 2. Multi-Source Research
- Searches web for news articles
- Finds expert opinions and predictions
- Retrieves historical data and trends
- Analyzes social media sentiment

### 3. Probability Range Calculation
- **Low Estimate**: Conservative probability based on minimal favorable factors
- **Mid Estimate**: Balanced probability considering all factors
- **High Estimate**: Optimistic probability based on favorable conditions
- **Confidence Level**: Indicates how reliable the analysis is

### 4. SkillPay Integration
- Automatic payment processing
- Transaction verification
- Receipt generation

## Usage Examples

**Basic Analysis:**
```
User: "What's the probability Bitcoin hits $100k by 2025?"
→ Runs: python scripts/prob_analyzer.py --event "Will Bitcoin hit $100k by 2025?"
→ Returns: Low: 35%, Mid: 55%, High: 70%, Confidence: Medium
```

**URL-Based Analysis:**
```
User: "Analyze this event: https://polymarket.com/event/trump-2024"
→ Runs: python scripts/prob_analyzer.py --url https://polymarket.com/event/trump-2024
→ Returns: Detailed probability breakdown with reasoning
```

**Verbose Output:**
```
User: "Give me a detailed analysis of Fed rate cuts in 2025"
→ Runs: python scripts/prob_analyzer.py --event "Fed rate cuts 2025" --verbose
→ Returns: Full breakdown with sources, factors, and confidence metrics
```

## Output Format

### Standard Output
```
Event: Will Bitcoin hit $100k by 2025?

Probability Range:
  Low:   35%  (Conservative estimate)
  Mid:   55%  (Balanced estimate)
  High:  70%  (Optimistic estimate)

Confidence: Medium

Key Factors:
• Institutional adoption increasing
• Regulatory uncertainty remains
• Market volatility expected
• Historical price patterns suggest upward trend

Sources: 12 articles analyzed
Payment: 0.001 USDT processed successfully (Transaction ID: xxxxxxx)
```

### Verbose Output
Includes additional details:
- Source citations
- Factor weighting
- Historical comparisons
- Alternative scenarios
- Risk factors

## Resources

### scripts/prob_analyzer.py
Main script that performs probability analysis.

**Usage:**
```bash
python scripts/prob_analyzer.py [options]

Options:
  --event TEXT       Event name or description
  --url TEXT         Polymarket event URL
  --verbose          Show detailed breakdown
  --check-price      Check pricing information
  --no-pay           Dry run (no payment processed)
```

**Environment Variables:**
- `SKILLPAY_API_KEY`: Your SkillPay.me API key (default: b97080bc-18c2-4a43-b876-332ec0fe5a94)
- `SKILLPAY_PRICE`: Price per use in USDT (default: 0.001)

### references/skillpay_api.md
Documentation for SkillPay.me integration (see below).

## SkillPay Integration

This skill uses SkillPay.me for payment processing. The integration handles:

1. **Payment Request**: Create a payment intent for 0.001 USDT
2. **Transaction Verification**: Confirm payment before delivering results
3. **Receipt Generation**: Provide transaction confirmation

### API Usage

The skill automatically makes requests to SkillPay.me:

```python
# Create payment intent
response = requests.post(
    "https://api.skillpay.me/v1/payments",
    headers={"Authorization": f"Bearer {api_key}"},
    json={
        "amount": 0.001,
        "currency": "USDT",
        "description": "Polymarket probability analysis"
    }
)
```

### Pricing Configuration

- **Base Price**: 0.001 USDT
- **Currency**: USDT (TRC20)
- **Payment Method**: Cryptocurrency wallet or SkillPay.me balance

## Best Practices

1. **Always verify payment** before delivering detailed results
2. **Provide clear reasoning** for probability ranges
3. **Include confidence levels** to indicate reliability
4. **Cite sources** when available
5. **Be transparent about uncertainty** in predictions

## Troubleshooting

**"Payment failed"**
→ Check SkillPay.me balance or wallet
→ Verify API key is correct
→ Ensure cryptocurrency wallet has sufficient USDT

**"No relevant information found"**
→ Event may be too specific or obscure
→ Try alternative phrasing
→ Check if event is still active

**"Confidence level too low"**
→ Not enough reliable sources available
→ Event may be too uncertain
→ Consider waiting for more data

## Monetization Tips

This skill is designed to be monetized via SkillPay.me. To maximize value:

1. **Provide accurate, well-researched analyses**
2. **Include actionable insights** with probability ranges
3. **Build trust** with transparent reasoning
4. **Offer verbose output** for serious traders

The 0.001 USDT price point is designed to be accessible while providing value through comprehensive analysis.
