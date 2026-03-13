# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Knowfun Skills team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**[support@knowfun.io]** (Please update with actual email)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

This information will help us triage your report more quickly.

### What to Expect

After you submit a report, we will:

1. **Acknowledge Receipt**: Within 48 hours
2. **Initial Assessment**: Within 5 business days
3. **Regular Updates**: At least every 5 business days
4. **Resolution Timeline**: Depends on severity
   - Critical: 1-7 days
   - High: 7-30 days
   - Medium: 30-90 days
   - Low: Best effort

### Disclosure Policy

We follow the principle of **Coordinated Disclosure**:

- We'll work with you to understand and address the issue
- We'll keep you informed about the progress
- We'll credit you in the security advisory (unless you prefer to remain anonymous)
- We'll publicly disclose the vulnerability after a patch is released

Please give us a reasonable time to respond to your report before making any information public.

## Security Best Practices for Users

### Protecting Your API Keys

1. **Never commit API keys to version control**
   ```bash
   # Always use .env files (already in .gitignore)
   echo "KNOWFUN_API_KEY=kf_your_key" > .env
   ```

2. **Use environment variables**
   ```bash
   export KNOWFUN_API_KEY="kf_your_key"
   ```

3. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys immediately if compromised

4. **Monitor API usage**
   - Check your API usage at https://www.knowfun.io/api-platform
   - Report any suspicious activity

### Secure Usage

1. **Keep the skill updated**
   ```bash
   cd ~/.claude/skills/knowfun
   git pull origin main
   ```

2. **Review scripts before running**
   - Check `scripts/*.sh` for any suspicious commands
   - Verify API endpoints are correct

3. **Use HTTPS only**
   - All API calls should use `https://api.knowfun.io`
   - Never disable SSL verification

4. **Limit permissions**
   - Run scripts with minimal necessary permissions
   - Don't use `sudo` unless absolutely required

### Known Security Considerations

1. **API Key Exposure**
   - Risk: API keys in environment variables are visible to all processes
   - Mitigation: Use OS-level key management when available

2. **Network Security**
   - All API communication is over HTTPS
   - Certificate verification is enabled by default

3. **Script Execution**
   - Scripts run with user permissions
   - Review `allowed-tools` in SKILL.md

## Security Features

### Current Security Measures

- ✅ API authentication via Bearer tokens
- ✅ HTTPS-only communication
- ✅ `.gitignore` configured to prevent credential leaks
- ✅ No storage of sensitive data in logs
- ✅ Request ID for idempotent operations

### Future Security Enhancements

- [ ] API key encryption at rest
- [ ] Support for API key rotation without downtime
- [ ] Webhook signature verification
- [ ] Rate limiting on client side
- [ ] Security audit logs

## Vulnerability Disclosure

Past vulnerabilities will be listed here once disclosed:

- **None disclosed yet**

## Security Updates

To stay informed about security updates:

1. Watch this repository for security advisories
2. Subscribe to security announcements (coming soon)
3. Check CHANGELOG.md for security-related updates

## Contact

- **Security Email**: [support@knowfun.io] (Please update)
- **General Support**: https://www.knowfun.io/support

## Acknowledgments

We would like to thank the following individuals for their responsible disclosure of security vulnerabilities:

- *List will be updated as vulnerabilities are reported and fixed*

---

**Note**: This security policy is subject to updates. Please check back regularly.

Last updated: 2026-03-01
