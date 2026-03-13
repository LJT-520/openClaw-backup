# SkillPay.me API Reference

This document provides technical details for integrating SkillPay.me payment processing into the Polymarket Probability Analyzer skill.

## Overview

SkillPay.me is a cryptocurrency payment gateway that enables monetization of AI agent skills. The Polymarket Probability Analyzer uses SkillPay.me to charge 0.001 USDT per probability analysis.

## Configuration

### Environment Variables

```bash
# SkillPay.me API Key (provided by the user)
export SKILLPAY_API_KEY=sk_f549ac2997d346d904d7908b87223bb13a311a53c0fa2f8e4627ae3c2d37b501

# Price per use in USDT (default: 0.001)
export SKILLPAY_PRICE=0.001
```

### Default Configuration

- **API Key**: `sk_f549ac2997d346d904d7908b87223bb13a311a53c0fa2f8e4627ae3c2d37b501`
- **Price**: `0.001 USDT` per analysis
- **Currency**: USDT (TRC20)
- **Payment Gateway**: SkillPay.me

## API Endpoints

### Create Payment Intent

Create a new payment intent for a skill usage.

**Endpoint**: `POST https://api.skillpay.me/v1/payments`

**Headers**:
```
Authorization: Bearer <SKILLPAY_API_KEY>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 0.001,
  "currency": "USDT",
  "description": "Polymarket probability analysis: <event_name>",
  "return_url": "https://your-return-url.com",
  "webhook_url": "https://your-webhook-url.com"
}
```

**Response**:
```json
{
  "success": true,
  "payment_id": "pay_xxxxxxxxxxxxxxxx",
  "amount": 0.001,
  "currency": "USDT",
  "status": "pending",
  "payment_url": "https://skillpay.me/checkout/pay_xxxxxxxxxxxxxxxx",
  "expires_at": "2025-01-01T00:00:00Z"
}
```

### Verify Payment

Check the status of a payment.

**Endpoint**: `GET https://api.skillpay.me/v1/payments/{payment_id}`

**Headers**:
```
Authorization: Bearer <SKILLPAY_API_KEY>
```

**Response**:
```json
{
  "success": true,
  "payment_id": "pay_xxxxxxxxxxxxxxxx",
  "amount": 0.001,
  "currency": "USDT",
  "status": "completed",
  "transaction_hash": "0x1234567890abcdef...",
  "confirmed_at": "2025-01-01T12:30:00Z"
}
```

## Payment States

| State | Description |
|-------|-------------|
| `pending` | Payment created, awaiting user confirmation |
| `processing` | Payment submitted to blockchain, awaiting confirmation |
| `completed` | Payment successfully confirmed |
| `failed` | Payment failed (insufficient funds, timeout, etc.) |
| `expired` | Payment expired (user didn't complete in time) |

## Integration Pattern

### 1. Pre-Analysis Check

Before running analysis, verify user has sufficient balance or payment method:

```python
client = SkillPayClient(api_key=api_key, price_usdt=0.001)
balance = client.check_balance()

if balance < price:
    raise InsufficientBalanceError(balance, price)
```

### 2. Create Payment Intent

When user requests analysis:

```python
success, payment_id, payment_url = client.create_payment_intent(
    description=f"Analysis: {event_name}",
    amount=0.001,
    currency="USDT"
)

if success:
    print(f"💳 Please complete payment: {payment_url}")
else:
    print(f"❌ Payment creation failed: {payment_id}")
```

### 3. Verify Payment

After user completes payment:

```python
status = client.verify_payment(payment_id)

if status == "completed":
    # Proceed with analysis
    result = analyzer.analyze_event(event_name)
else:
    print(f"⚠️ Payment not completed: {status}")
```

### 4. Process Analysis

Only deliver results after payment is confirmed:

```python
if status == "completed":
    result = analyzer.analyze_event(event_name)
    result.transaction_id = payment_id
    output = analyzer.format_output(result)
    print(output)
```

## Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INVALID_API_KEY` | API key is invalid or expired | Verify API key in environment variables |
| `INSUFFICIENT_BALANCE` | User has insufficient funds | Prompt user to top up wallet |
| `PAYMENT_EXPIRED` | Payment not completed in time | Create new payment intent |
| `NETWORK_ERROR` | API request failed | Retry request or check connectivity |
| `INVALID_AMOUNT` | Amount below minimum or above maximum | Verify amount meets platform requirements |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid"
  }
}
```

## Security Considerations

### API Key Protection

- Never hardcode API keys in source code
- Use environment variables or secure secrets management
- Rotate API keys periodically
- Use different API keys for development and production

### Payment Verification

- Always verify payment status before delivering results
- Use webhook notifications for real-time payment updates
- Implement idempotency to prevent duplicate charges
- Log all payment transactions for audit purposes

### Webhook Verification

If using webhooks, verify authenticity:

```python
def verify_webhook_signature(payload, signature, secret):
    import hmac
    import hashlib

    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)
```

## Testing

### Test Mode

SkillPay.me provides test mode for development:

```bash
export SKILLPAY_API_KEY=test_key_xxxxxxxxxxxxxxxx
export SKILLPAY_MODE=test
```

In test mode:
- No actual money is transferred
- Simulate payment states for testing
- Use test wallet addresses

### Dry Run

The skill supports dry-run mode for testing without payment:

```bash
python scripts/prob_analyzer.py --event "Test event" --no-pay
```

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| Create Payment | 10 requests/minute |
| Verify Payment | 60 requests/minute |
| Check Balance | 30 requests/minute |

## Webhooks

Configure webhooks to receive real-time payment notifications:

```json
{
  "event": "payment.completed",
  "data": {
    "payment_id": "pay_xxxxxxxxxxxxxxxx",
    "amount": 0.001,
    "currency": "USDT",
    "transaction_hash": "0x1234567890abcdef..."
  },
  "timestamp": "2025-01-01T12:30:00Z",
  "signature": "signature_string_here"
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `payment.created` | Payment intent created |
| `payment.completed` | Payment successfully completed |
| `payment.failed` | Payment failed |
| `payment.expired` | Payment expired |

## Best Practices

1. **Always verify payment** before delivering results
2. **Use webhooks** for real-time payment updates
3. **Implement idempotency** to prevent duplicate charges
4. **Provide clear feedback** on payment status
5. **Handle errors gracefully** with user-friendly messages
6. **Log transactions** for debugging and auditing
7. **Test thoroughly** in test mode before production

## Support

For issues or questions regarding SkillPay.me integration:

- Documentation: https://docs.skillpay.me
- Support: support@skillpay.me
- API Status: https://status.skillpay.me

## Example Integration

See `scripts/prob_analyzer.py` for a complete implementation example showing how the Polymarket Probability Analyzer integrates with SkillPay.me.

Key components:
- `SkillPayClient` class for API interactions
- Payment creation and verification
- Transaction tracking
- Error handling and user feedback
