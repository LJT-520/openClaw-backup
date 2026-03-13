---
name: moneyclaw
description: Virtual Visa/MC cards funded by USDT + financial intelligence. Issue cards, make purchases, handle 3DS, accept crypto payments — with built-in phishing detection, fraud prevention, and payment optimization knowledge.
version: 4.2.0
homepage: https://moneyclaw.ai
metadata: {"openclaw":{"requires":{"env":["MONEYCLAW_API_KEY"]},"primaryEnv":"MONEYCLAW_API_KEY","emoji":"💳"}}
---

# MoneyClaw — Virtual Cards & Financial Intelligence for Agents

You have access to the MoneyClaw API and a comprehensive financial knowledge base. Use the API to manage virtual cards, make purchases, and accept payments. Use the financial intelligence sections to make safe, informed decisions about every transaction.

## Authentication

All requests require a Bearer token. Use the `MONEYCLAW_API_KEY` environment variable.

```
Authorization: Bearer $MONEYCLAW_API_KEY
```

Base URL: `https://moneyclaw.ai/api`

## Endpoints

### Check Account Status

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/me
```

Response includes:
- `balance` — wallet balance (USD string, always present, e.g. `"25.000000"`)
- `card` — object with `id`, `cardId`, `cardBin`, `maskedPan`, `status`, `currency`, `createdAt` (null if no card)
- `cardBalance` — card funds from provider, only present when card is `active` AND provider responds (object with `availableBalance`)
- `mailboxAddress` — your personal email address (always present)
- `depositAddress` — USDT deposit address with `address`, `network`, `currency`
- `isReferred` — boolean, whether you were referred by another user
- `pendingDeposit` — object with `amount` and `createdAt`, only present when a deposit is being processed

**Important:** Use `card.cardId` (NOT `card.id`) when calling card endpoints like `/api/cards/{cardId}/topup` or `/api/cards/{cardId}/sensitive`.

### Your Email Inbox

Every MoneyClaw account has a **personal email address** that persists across sessions. This is your agent's permanent inbox.

**How to get your email address:** Call `GET /api/me` and read the `mailboxAddress` field. **Never construct the email manually** — the domain is server-side configuration and may change.

**Use cases:**
- Service registrations (sign up for websites using your MoneyClaw email)
- Card activation and verification emails
- 3DS OTP codes during purchases
- Newsletters, receipts, notifications — any service that requires an email

Emails arrive automatically and OTP codes are auto-extracted. See the Email Inbox Endpoints section below for how to read your emails.

### Two Balances: Wallet vs Card

Your account has two separate balances:

| Balance | JSON path | Description |
|---------|-----------|-------------|
| **Wallet** | `balance` (string) | Funds available to load onto card. Always present in `/api/me`. |
| **Card** | `cardBalance.availableBalance.value` (string) | Funds available for purchases. Only present when card is `active` AND provider responds. |

**Money flow:** USDT deposit → wallet → (auto-load on card issue OR manual topup) → card → purchases

**When user asks "what's my balance?"** — ALWAYS show both:
- Wallet balance is always available from `balance`
- Card balance may be unavailable — if `cardBalance` is missing, show "Card balance: unavailable" (no active card or provider temporarily unreachable)

### Get Account Balance

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/me/balance
```

Returns `{ "balance": "142.50", "currency": "USD" }`. This is the **wallet** balance only.

### View Account Transactions (deposits, topups, fees)

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  "https://moneyclaw.ai/api/me/transactions?limit=20&offset=0"
```

Returns internal transactions: USDT deposits, card topups, fees, refunds. Each has `type`, `amount`, `currency`, `description`, `createdAt`.

### Issue a Card

```bash
curl -X POST -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/cards/issue
```

Issues a new virtual card. Requires minimum $25 wallet balance (`MIN_CARD_ISSUE_DEPOSIT`). When issued, your **entire wallet balance is automatically loaded onto the card**, then the card issue fee is withdrawn from the card. Example: $30 wallet → card gets $30 → $15 fee withdrawn → card balance = $15.

Returns card info with `cardId`, `maskedPan`, `status`.

### Get Card Credentials (for online purchases)

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/cards/{cardId}/sensitive
```

Returns `pan`, `cvv`, `expiryMonth`, `expiryYear`, `cardHolderName`, `billingAddress`. Rate limited to 10 requests/minute.

**Important:** Use the `cardId` from the `/api/me` response (`card.cardId` field).

### Get Card Balance

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/cards/{cardId}/balance
```

Returns the card's available balance: `{ "availableBalance": { "value": "85.00", "currency": "USD" } }`.

### View Card Spending History (purchases, declines)

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  "https://moneyclaw.ai/api/cards/{cardId}/transactions?limit=20&offset=0"
```

Returns card transactions from the payment provider: purchases, declines, refunds. Each has `merchantName`, `amount`, `status` (SUCCESS/DECLINE), `type` (CARD_PAYMENT), `date`, `direction`.

### Top Up Card Balance

Moves funds from your wallet balance to the card.

```bash
curl -X POST -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "currency": "USD"}' \
  https://moneyclaw.ai/api/cards/{cardId}/topup
```

**Step-by-step:**

1. Call `GET /api/me`
2. **Pre-flight checks:**
   - `card` exists? If null → issue a card first (`POST /api/cards/issue`)
   - `card.status === "active"`? If `"creating"` → wait and retry; if `"failed"` → report to user
   - Extract `card.cardId` — use this in the URL (NOT `card.id`)
   - `balance` >= desired amount? If not → deposit USDT first
   - Amount >= $10? (`MIN_TOPUP_AMOUNT` — amounts below $10 are rejected)
3. `POST /api/cards/{cardId}/topup` with `{"amount": 10, "currency": "USD"}`
4. **Handle all response codes:**

| Status | Code | Action |
|--------|------|--------|
| `200` | — | Success. Funds loaded. |
| `202` | — | Processing. Funds reserved from wallet. **Do NOT send another topup** — wait ~30s then `GET /api/me` to verify. A duplicate topup while processing will double-deduct. |
| `400` | `INSUFFICIENT_BALANCE` | Wallet balance too low. Show current balance, suggest depositing USDT. |
| `400` | `CARD_NOT_ACTIVE` | Card is not active. Check card status. |
| `400` | _(validation)_ | Amount < $10 or missing fields. |
| `400` | `TOPUP_FAILED` | Provider rejected the topup. Balance is automatically reversed. |
| `404` | `NOT_FOUND` | Wrong cardId or no card. Re-check `GET /api/me` for correct `card.cardId`. |
| `500` | `VALUT_ERROR` | Provider error. Wait 30s, retry once. Balance is automatically reversed. |
| `500` | `INTERNAL_ERROR` | Server error. Do not retry. |

5. After success or 202, call `GET /api/me` to verify updated balances.

### Email Inbox Endpoints

Your personal email inbox (see "Your Email Inbox" above). Use these endpoints to read emails, extract OTP codes, and access full message content.

#### Fetch Latest OTP Code (for 3DS verification)

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/inbox/latest-otp
```

Returns the most recent email with extracted OTP codes. The `extractedCodes` field is an array of strings. Use the first element as the verification code.

If a purchase triggers 3DS, wait 10-30 seconds for the OTP email to arrive, then call this endpoint.

#### List Inbox Emails

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  "https://moneyclaw.ai/api/inbox?limit=20"
```

Returns all emails in your inbox. Each has `id`, `from`, `subject`, `extractedCodes`, `category`, `receivedAt`.

#### Get Email Details

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/inbox/{messageId}
```

Returns full email body (`bodyText`, `bodyHtml`) along with metadata.

## Typical Purchase Flow

1. `GET /api/me` — check both balances (wallet `balance` and card `cardBalance.availableBalance.value`)
2. If no card → `POST /api/cards/issue` (auto-loads wallet balance onto card)
3. If card has insufficient balance but wallet has funds → top up first (see full topup flow above)
4. Get card credentials with `GET /api/cards/{cardId}/sensitive`
5. **Run the pre-payment safety checklist** (see Payment Safety section below)
6. Use PAN, CVV, expiry to fill in payment form on merchant site
7. **Always use the billing address from card credentials** — do not invent one
8. If 3DS is triggered, use `mailboxAddress` from `/api/me` (never construct manually) — wait ~15 seconds then `GET /api/inbox/latest-otp`
9. Submit the OTP code from `extractedCodes[0]`
10. Purchase complete — verify with `GET /api/cards/{cardId}/transactions`

## Fees

- **Card issuance:** $15 fee ($10 with referral discount) — withdrawn **from the card** after issuance, not from wallet balance. Your entire wallet balance is auto-loaded onto the card first, then the fee is charged from the card.
- **Minimum deposit for card issuance:** $25 (`MIN_CARD_ISSUE_DEPOSIT`)
- **Card topup:** 2% provider fee on each manual topup
- **Minimum topup amount:** $10 (`MIN_TOPUP_AMOUNT`)
- **Successful transaction:** 2% of purchase amount (auto-deducted from card balance)
- **Declined transaction:** currently disabled (no fee charged)

Follow the retry rules below to avoid unnecessary declines.

## Retry Rules — Avoiding Unnecessary Declines

Declined transactions may incur provider charges and waste card balance. Follow these rules strictly:

1. **Never retry immediately.** After a payment attempt, wait at least 30 seconds, then check `GET /api/cards/{cardId}/transactions` to verify the actual result before retrying.
2. **Maximum 2 retries per merchant per session.** If payment fails twice at the same merchant, stop and report the issue. Do not keep retrying.
3. **Check card balance before every purchase.** Use `GET /api/cards/{cardId}/balance` to confirm sufficient funds. Include a buffer for potential FX differences.
4. **Verify the previous transaction status before retrying.** A transaction may succeed even if the merchant page shows an error. Always check `GET /api/cards/{cardId}/transactions` first.
5. **Do not attempt a purchase if card balance is below the expected amount + 5%.** Top up first.

## Important Notes

- The card is **prepaid**. You cannot spend more than the loaded balance.
- Card credentials are rate-limited (10/min). Cache them for the duration of a purchase session.
- OTP codes arrive via email to a dedicated inbox. There may be a 10-30 second delay.
- Fund the account by sending USDT (TRC20) to the deposit address from `GET /api/me`.
- Use `GET /api/cards/{cardId}/transactions` to see actual spending at merchants.
- Use `GET /api/me/transactions` to see account-level movements (deposits, topups, fees).

---

## Payment Safety — Pre-Payment Checklist

**MANDATORY: Run this checklist before entering card details on ANY website.**

### Before Every Payment

- [ ] **URL verification**: The domain matches the expected merchant exactly. No character substitutions (`rn` for `m`, `1` for `l`, `0` for `o`). Check the part immediately before the TLD — in `paypal.com.evil.net` the real domain is `evil.net`.
- [ ] **HTTPS active**: The page uses HTTPS. But note: HTTPS alone does NOT guarantee legitimacy — most phishing sites use valid SSL certificates.
- [ ] **Payment form is standard**: Only asks for card number, expiry, CVV, cardholder name, and billing address. If the form asks for SSN, passport number, bank account, PIN, security questions, or date of birth — **stop immediately**.
- [ ] **Amount matches**: The amount on the payment form matches what you expect to pay. Check for hidden fees, surcharges, or currency mismatches.
- [ ] **Recognized payment processor**: The checkout is powered by a known processor (Stripe, PayPal, Braintree, Adyen, Square). The processor name is typically visible in the payment iframe URL.
- [ ] **Card balance sufficient**: Balance covers the amount + 5% buffer for FX fees and holds.
- [ ] **VPN is active**: Connected to a server matching the card's issuing country.
- [ ] **Clean browser session**: Using incognito mode or a browser that hasn't visited this service before.

### Payment Form Best Practices

1. **Always use VPN** matching the card's issuing country
2. **Use incognito/clean browser** to prevent cookie-based blocks
3. **Use the cardholder name from card credentials** exactly as returned by the API
4. **Use the billing address from card credentials** exactly as returned by the API
5. **Use an international email domain** (gmail.com, outlook.com) — regional domains like .ru may cause errors
6. **If phone number is required**, use a number from the card's issuing country

### Service-Specific Tips

**OpenAI (ChatGPT) subscription:**
- Use VPN with US region before opening the browser
- Cardholder name: Howard Willis (provider recommendation for higher success rate on OpenAI — overrides the name from card credentials)
- Billing address: Country — Angola, City — Luanda, Address — Rua Frederik Engels 92-7 (provider recommendation for OpenAI specifically)
- For API token payments, use only the general tips above — these subscription-specific overrides do NOT apply to API billing

**Most other AI/SaaS services** (Anthropic, Google, Cursor, Midjourney, Facebook, AWS, Spotify, etc.):
- Follow the general 6-point checklist above — no service-specific overrides needed
- Success rates are 99-100% when general recommendations are followed

---

## Phishing Detection

You must be able to identify phishing before entering card details. Here's what to check:

### URL Red Flags

- **Character substitution**: `arnazon.com` (rn→m), `g00gle.com` (0→o), `paypa1.com` (1→l)
- **Subdomain tricks**: In `paypal.com.secure-verify.net`, the real domain is `secure-verify.net`
- **Suspicious TLDs**: Legitimate payment pages don't use `.shop`, `.deals`, `.xyz`, `.top`, `.click`
- **Excessive length**: URLs with random strings like `checkout-secure-78a3f.io/pay`
- **Unexpected redirects**: If the URL changes after clicking a payment link, stop

### Fake Payment Page Patterns

- **Clone pages**: Pixel-perfect copies of Stripe, PayPal, or Shopify checkouts — the URL and form action destination are different from the original
- **Fake 3DS pages**: A phishing two-factor screen designed to capture both card details and OTP codes at once
- **"Security verification" popups**: Asking you to "re-enter" card details to "verify identity" — real processors don't do this
- **Form submits to wrong domain**: If the form action URL points to a different domain than the page — stop immediately

### Merchant Verification Steps

If you're paying on an unfamiliar site:
1. Search the company name independently on Google, Trustpilot, or BBB
2. Check domain age via WHOIS (domains under 6 months old are high risk)
3. Verify physical address and working contact info exist
4. Confirm the payment processor is recognized (Stripe, Square, PayPal, Braintree, Adyen)
5. Check for a clear returns/refund policy

---

## Fraud Prevention — Red Flags

### Checkout Red Flags — Stop the Purchase If You See:

- **Excessive info requests**: Any form asking for SSN, passport, bank account number, PIN, or security questions at checkout
- **Too-good-to-be-true prices**: 50-90% below major retail prices, every item heavily discounted
- **No refund policy**: Missing or deliberately vague returns page
- **Missing business info**: No physical address, phone number, or About page
- **Pressure tactics**: Countdown timers (that reset on refresh), fake scarcity ("Only 2 left!"), extreme price anchoring ("Was $499, now $29 — today only!")
- **Non-standard payment**: Site only accepts wire transfer, crypto, or gift cards — no card option
- **Price changes at checkout**: Amount differs from product page

### Subscription & Recurring Charge Traps

- **Free trial → auto-charge**: Trials requiring payment details auto-convert to paid subscriptions. Mitigation: load only the trial amount on the card.
- **Easy sign-up, hard cancellation**: Multiple "are you sure?" screens, phone-only cancellation, or waiting periods
- **Hidden pre-checked boxes**: Opt-in boxes pre-checked to add services during checkout
- **Trial length mismatch**: Site says "30-day trial" but terms disclose 7 days
- **Price jump after trial**: Introductory rate applies for one cycle, then increases without notice

**Prepaid card advantage**: If a subscription attempts to charge after you've depleted the card balance, it simply declines — no overdraft, no unauthorized charges.

### Dynamic Currency Conversion (DCC) — Always Decline

If checkout offers to show the price "in your home currency" or "pay in USD for convenience" — this is DCC. It adds 3-5% markup on top of the exchange rate. **Always pay in the merchant's local currency** and let the card network handle conversion at better rates.

---

## Understanding Card Transactions

### Authorization vs. Capture

Every card transaction has two phases:
1. **Authorization**: Merchant asks if funds exist. An approval hold reduces available balance but money doesn't move yet.
2. **Capture/Settlement**: Merchant collects the funds. Money actually transfers. May happen hours or days after authorization.

Key implications:
- A "pending" transaction does NOT mean money has moved — don't count it as completed
- Authorization holds reduce available balance even if capture never happens
- Holds release in 7-10 days if merchant doesn't capture (Mastercard ~7 days, Visa ~10 days for online)
- A single order may generate multiple captures (e.g., split shipments)

### Transaction States

| State | Balance Affected | Money Moved |
|-------|-----------------|-------------|
| Authorization hold | Yes — reduced | No |
| Pending | Yes — reduced | In transit |
| Settled/Posted | Yes — deducted | Yes |
| Released hold | Yes — restored | No |

### Refund Timelines

- **Authorization reversal** (before capture): 1-3 days — always request cancellation before shipment when possible
- **Post-capture refund**: 5-10 business days from merchant initiation
- **Chargeback** (forced reversal): Up to 90 days for full process — last resort only. Merchant response window: Visa 9 days (US) / 18 days (intl), Mastercard 45 days.

### Common Decline Codes

| Code | Meaning | Action |
|------|---------|--------|
| 05 — Do Not Honor | Generic decline (fraud detection, policy, AVS mismatch) | Check balance, verify billing details, try once more |
| 51 — Insufficient Funds | Balance below transaction amount | Load additional funds |
| 54 — Expired Card | Card past expiry | Issue a new card |
| 57 — Not Permitted | MCC restriction or card type not accepted | Use a different approach or card |
| 62 — Restricted Card | Issuer restricted this transaction type | Contact issuer |
| 65 — Activity Limit | Daily/monthly limit reached | Wait for reset |
| 91 — Issuer Unavailable | Temporary system issue | Retry after a delay |
| N7 — CVV Failure | Wrong CVV entered | Re-check CVV, do NOT retry with wrong CVV (triggers fraud flags) |

### When to Stop Retrying

**Do retry**: After code 91 (temporary), or after fixing the root cause (loaded funds after code 51, fixed billing address after AVS fail).

**Do NOT retry**: After CVV failure (retrying escalates fraud flags), after 3 consecutive declines without fixing the issue, after code 57 (policy block — won't change), or if the merchant explicitly says "do not retry."

---

## Virtual Card Security — Why Your Card is Safe

### Structural Protection

Your MoneyClaw virtual card is a financial firewall:
- **Balance-limited**: A compromised card can only access the loaded amount — not your USDT wallet or any other funds
- **Isolated**: No link to bank accounts — a compromise can't cascade to other financial accounts
- **One card per agent**: Currently limited to 1 active card per account. If compromised, contact support to deactivate and reissue.

### Smart Loading Strategy

- **Per-purchase loading**: Load only the expected amount + 5-10% buffer. A $50 purchase? Load $55. If a merchant tries to charge $500, the network declines automatically.
- **Subscription management**: Load one billing cycle + buffer. When you want to cancel, just don't reload — the next charge declines naturally.
- **Currency buffer**: For foreign-currency purchases, add at least 5% for FX fees.
- **Hold buffer**: Hotels, car rentals, and gas stations authorize above the purchase amount. Factor in the expected hold (typically $50-200 for hotels per night).

### Acceptable Use — What Cards Can and Cannot Be Used For

**Permitted**: E-commerce, SaaS subscriptions, online advertising, travel bookings, API services, cloud infrastructure, digital goods.

**Commonly blocked by card networks**: Gambling (MCC 7801/7802/7995), adult content, cryptocurrency exchanges (MCC 6051), money transfers, firearms, tobacco, sanctioned jurisdictions.

If a transaction declines with code 57 (Not Permitted), the merchant's category is likely restricted.

---

## Reading Transaction Descriptions

Transaction descriptions in card statements follow common patterns:

- `AMZN Mktp US*AB1234567` — Amazon Marketplace
- `PAYPAL *MERCHANTNAME` — PayPal payment
- `SQ *BUSINESSNAME` — Square POS
- `STRIPE` — Stripe-processed payment
- `SP * SHOPIFY` — Shopify store

**Important**: The statement name often differs from the website name. Many businesses use a parent company or processor name. If you see an unfamiliar charge, check email receipts before flagging as fraud.

### Identifying Suspicious Charges

A charge warrants investigation if:
- Amount doesn't match any expected purchase
- Merchant name is unrecognizable and no email receipt exists
- Multiple identical charges from the same merchant on the same day (possible duplicate)
- A small test charge ($0.01-$1.00) from an unknown source — this is a card validation technique used by fraudsters before larger charges
- A charge appears for a service never subscribed to

---

## Referral Program

MoneyClaw has a referral system that rewards users for inviting others.

### How It Works

1. Every user gets a unique referral code and share link
2. New users apply the code before issuing their first card
3. **Referee benefit**: $5 discount on card issuance ($15 → $10)
4. **Referrer benefit**: $5 flat bonus when the referee issues a card
5. **Ongoing revenue share**: Referrer earns 20% of platform fees generated by the referee for 12 months
6. Maximum 50 referrals per user

Platform fees that generate commission: transaction fees (2% on purchases) and acquiring fees ($0.30 + 3% per paid invoice).

### Get Your Referral Info

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/me/referral
```

Returns `referralCode`, `shareLink`, `totalReferrals`, `totalEarned`, `pendingRewards`, and `referrals` array with per-referee details (bonus status, commission earned).

### Validate a Referral Code (Public)

```bash
curl https://moneyclaw.ai/api/referral/{code}
```

Returns `{ "valid": true, "code": "..." }` — use this to check if a code is valid before applying.

### Apply a Referral Code

```bash
curl -X POST -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "FRIEND123"}' \
  https://moneyclaw.ai/api/me/referral/apply
```

Must be applied **before** issuing a card. Can only be used once per account. Self-referral is not allowed.

### Referral Tips

- Share your link (`https://moneyclaw.ai/signup?ref=YOUR_CODE`) to maximize conversions
- The $5 bonus is credited when the referee issues a card — not at signup
- Commission is tracked automatically on every fee transaction for 12 months
- Check `GET /api/me/referral` to monitor earnings and pending rewards

---

## Crypto Acquiring — Accept Payments

MoneyClaw includes a crypto acquiring feature. You can create payment invoices, embed a checkout widget on any website, and receive USDT payments from customers. Funds land in your MoneyClaw wallet balance.

### Enable Merchant Mode

```bash
curl -X POST -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/acquiring/setup
```

Returns `webhookSecret` (shown ONCE — save it), `storeName`. This enables your account as a merchant.

### Get Merchant Settings

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/acquiring/settings
```

Returns `storeName`, `webhookUrl`, `enabled`, `createdAt`.

### Update Merchant Settings

```bash
curl -X PATCH -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"storeName": "My AI Shop", "webhookUrl": "https://mysite.com/webhook"}' \
  https://moneyclaw.ai/api/acquiring/settings
```

Update your store name, webhook URL, or enabled status.

### Create Invoice

```bash
curl -X POST -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "description": "Premium plan", "reference": "order-123"}' \
  https://moneyclaw.ai/api/acquiring/invoices
```

Returns `id`, `amount`, `fee`, `netAmount`, `status`, `depositAddress`, `checkoutUrl`, `expiresAt`. The `checkoutUrl` is a hosted payment page you can redirect customers to or embed as a widget.

Optional fields: `callbackUrl` (webhook for payment notifications), `expiresIn` (seconds, default 3600, min 300, max 86400).

### List Invoices

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  "https://moneyclaw.ai/api/acquiring/invoices?limit=20&offset=0&status=paid"
```

Returns `invoices` array and `total` count. Each invoice has `id`, `amount`, `fee`, `netAmount`, `status` (pending/paid/expired), `reference`, `checkoutUrl`, `paidAt`, `paidAmount`, `feeAmount`.

### Get Invoice Details

```bash
curl -H "Authorization: Bearer $MONEYCLAW_API_KEY" \
  https://moneyclaw.ai/api/acquiring/invoices/{invoiceId}
```

Returns full invoice with `depositAddress`, `callbackUrl`, `checkoutUrl`, and payment details if paid.

### Acquiring Fees

- **Per paid invoice:** $0.30 + 3% of received amount
- Fee is deducted at payment time. Your wallet is credited with the net amount.
- Example: $100 invoice → fee $3.30, you receive $96.70.
- Unpaid/expired invoices incur no fee.

### Embeddable Payment Widget

To accept payments on your website, create an invoice via API, then embed the widget:

```html
<div id="moneyclaw-pay"></div>
<script src="https://moneyclaw.ai/widget.js"
  data-invoice-id="INVOICE_ID_HERE"
  data-theme="dark">
</script>
```

The widget renders a payment form with QR code and USDT address. It fires JavaScript events when payment status changes:

```javascript
window.addEventListener('moneyclaw:paid', (e) => {
  console.log('Payment received!', e.detail);
  // { invoiceId, amount, currency, paidAt }
});

window.addEventListener('moneyclaw:expired', (e) => {
  console.log('Invoice expired', e.detail);
  // { invoiceId }
});
```

**Important:** Client-side widget events are for UX only (updating the UI). Always confirm payment server-side via the webhook callback or by polling `GET /api/acquiring/invoices/{id}` before fulfilling orders.

### Typical Acquiring Flow

1. Enable merchant mode with `POST /api/acquiring/setup` (one-time)
2. Create invoice with `POST /api/acquiring/invoices` for each payment
3. Redirect customer to `checkoutUrl` OR embed the widget on your site
4. Customer sends USDT to the displayed address
5. Payment is detected automatically, your wallet balance is credited
6. If `callbackUrl` was set, you receive an HMAC-signed webhook notification
7. Check invoice status with `GET /api/acquiring/invoices/{id}` to confirm
