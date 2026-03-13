# PixVerse API Key Guide

## How to Get an API Key

### Method 1: Register on Official Website (Recommended)

1. Visit [PixVerse Platform](https://platform.pixverse.ai)
2. Sign up or log in to your account
3. Click **"API Key"** in the left sidebar
4. Click **"+ Create Key"** button in the top right to generate a new API key
5. Copy the complete key (format: sk-xxxxxxxx...)
6. Store your API key securely (some characters will be hidden after creation)

### Method 2: Contact PixVerse Team

For enterprise customers or high-volume usage:
- Email: support@pixverse.ai
- Describe your use case and expected usage volume

## API Key Format

Valid PixVerse API keys follow this format:
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Common Errors

### Error Code 10005: "apiKey is not registered"

**Causes:**
1. Incorrect API key format
2. API key not activated
3. Account not verified (email/phone)
4. API key expired or revoked

**Solutions:**
1. Check that the key is copied completely (no extra spaces)
2. Log in to the platform to verify account status
3. Generate a new API key
4. Ensure your account has available credits

### Error Codes 10001-10004

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 10001 | API key missing | Set PIXVERSE_API_KEY environment variable |
| 10002 | API key invalid | Check key format |
| 10003 | Insufficient permissions | Upgrade account or contact support |
| 10004 | Insufficient credits | Add credits or wait for quota refresh |

## Configure API Key

### Method 1: Environment Variable (Recommended)

```bash
# macOS/Linux
export PIXVERSE_API_KEY="sk-your-key-here"

# Windows
set PIXVERSE_API_KEY=sk-your-key-here
```

### Method 2: .env File

Create a `.env` file in project root:
```env
PIXVERSE_API_KEY=sk-your-key-here
```

### Method 3: Pass Directly in Code (Not Recommended)

```typescript
const client = new PixVerseClient('sk-your-key-here');
```

⚠️ **Security Warning:** Never commit API keys to Git or share them publicly!

## Test Your API Key

Run a quick test to verify your API key works:

```bash
pixverse gen_video --prompt "a white cat sitting on a table" --duration 5
```

If the command prints a task ID and starts polling for status, your API key is valid.

## Get More Help

- Official Documentation: https://docs.pixverse.ai
- GitHub Issues: https://github.com/PixVerseAI/PixVerse-Skills/issues
- Support: support@pixverse.ai
