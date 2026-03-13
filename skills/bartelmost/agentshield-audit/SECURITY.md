# Security Architecture - AgentShield

> **"Trust but verify"** - Privacy-first security for AI agents

## Core Principles

### 🔒 Zero Data Leave
AgentShield's security assessment runs entirely **within your infrastructure**. Your data never leaves your system.

**What this means:**
- ✅ All 52+ security tests execute locally in your agent environment
- ✅ No code analysis, prompts, or data uploaded to AgentShield servers
- ✅ Subagents spawn in YOUR session, not ours
- ✅ Results stay local (PDF generated on your machine)

**What we receive:**
- 📜 Only: Ed25519 public key (for certificate registry)
- ✅ Only: Challenge-response signature (proof of identity)
- ❌ Never: Your prompt data, code, or agent behavior

---

## Technical Architecture

### Local-First Testing

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S AGENT ENVIRONMENT                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │  Token Opt. │    │  Code Scan  │    │   52+ Tests │   │
│  │   (Local)   │    │   (Local)   │    │   (Local)   │   │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘   │
│         │                   │                    │        │
│  ┌───────────────────────────┴────────────────────┴──────┐  │
│  │         AGENTSHIELD SKILL (Installed Locally)         │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │     Subagent Tests (YOUR Session)             │   │  │
│  │  │  - Input Sanitizer Test                       │   │  │
│  │  │  - EchoLeak Test                              │   │  │
│  │  │  - Tool Sandbox Test                          │   │  │
│  │  │  - Output DLP Test                            │   │  │
│  │  │  - Supply Chain Test                          │   │  │
│  │  │  - ... (52+ total)                            │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └────────────────┬────────────────────────────────────┘  │
│                   │                                          │
│         ┌─────────┴──────────┐                              │
│         │ Ed25519 Signing    │                              │
│         │ (Local Private Key)│                              │
│         └─────────┬──────────┘                              │
└───────────────────┼────────────────────────────────────────┘
                    │
                    │ Challenge-Response
                    │ (Public Certificate only)
                    ▼
       ┌──────────────────────────┐
       │  AgentShield Registry    │
       │  (Public Trust Database) │
       │  - Agent Public Key      │
       │  - Trust Score           │
       │  - Certificate Status    │
       └──────────────────────────┘
```

### Challenge-Response Protocol

Our cryptographic identity verification:

1. **Challenge Generation** - Random nonce created by AgentShield backend
2. **Local Signing** - YOUR agent signs with its Ed25519 private key (never leaves your system)
3. **Verification** - Backend validates signature against your public key
4. **Certificate** - Issued without ever seeing your private key

**Security Properties:**
- 🔐 Hardware-level isolation - Private key never transmitted
- 🎭 Anonymous - No personal data required
- 📊 Transparent - Certificate publicly verifiable
- 🔄 Revocable - CRL (Certificate Revocation List) if compromised

---

## Open Source Verification

### "Trust but Verify"

**All our security tests are open source.** You can:
- ✅ Review every test before running it
- ✅ Fork and modify for your needs
- ✅ Verify no data exfiltration occurs
- ✅ Understand exactly what each test checks

**Repository:** [github.com/bartelmost/agentshield](https://github.com/bartelmost/agentshield)

**Test Categories:**
- **Input Sanitizer** (`input_sanitizer.py`) - Prompt injection detection
- **EchoLeak** (`echoleak_test.py`) - Zero-click data exfiltration tests
- **Tool Sandbox** (`tool_sandbox.py`) - Permission boundary controls
- **Output DLP** (`output_dlp.py`) - PII/API key detection
- **Supply Chain** (`supply_chain_scanner.py`) - Dependency integrity

---

## Comparison: Cloud vs. Local Scanning

| Aspect | Traditional Cloud Scan | AgentShield Local |
|--------|-------------------------|-------------------|
| **Data Transfer** | Upload to 3rd party servers | 🚫 None - runs locally |
| **Privacy Risk** | Prompt/code may leak | 🛡️ Zero exposure |
| **Control** | Black-box testing | 🔍 Full code transparency |
| **Compliance** | May violate internal policies | ✅ GDPR/CCPA compliant |
| **Latency** | Network dependent | ⚡ Instant local execution |
| **Cost** | API calls charged | 💎 Flat rate per certificate |

---

## Certificate Transparency

### Public Registry (Consensual)

**What we publish:**
- 📜 Certificate ID (public key hash)
- 🏆 Trust Score (0-100)
- 📅 Issue/Expiry dates
- 🔍 Verification count

**What we NEVER publish:**
- ❌ Agent prompts or conversations
- ❌ Internal code scanned
- ❌ Vulnerability details (only in your PDF)
- ❌ Network connections or endpoints

### Your Control

- 👤 **Anonymous** - No personal attribution required
- 🚫 **Opt-out** - Request deletion from public registry
- 📊 **Transparency** - View exactly what's stored
- 🔒 **Revocation** - Instant CRL if needed

---

## For Enterprise Users

### Internal Deployment

**Self-hosted AgentShield:**
```bash
# Run completely air-gapped
$ agentshield --offline --internal-registry
```

**Zero-Trust Architecture:**
- Internal certificate authority
- Private registry instance
- No external dependencies
- Custom test suites

Contact: ratgeberpro@gmail.com

---

## Security Audits

### 3rd Party Reviews

| Firm | Date | Scope | Report |
|------|------|-------|--------|
| TBD | Q2 2026 | Backend & CLI | Pending |

### Bug Bounty

Responsible disclosure: ratgeberpro@gmail.com

**Rewards:**
- 🥇 Critical: $500 + Hall of Fame
- 🥈 High: $200
- 🥉 Medium: $50

---

## FAQ

**Q: Do you see my agent's prompts?**
A: No. All tests run locally in your environment. We never receive prompt data.

**Q: Can you control my agent through the skill?**
A: No. The skill only executes tests in isolated sub-sessions. It cannot access your main agent or data.

**Q: What happens if I revoke my certificate?**
A: Added to CRL immediately. Your agent ID flagged as revoked in public registry.

**Q: Is the assessment open source?**
A: Yes. All 52+ tests at github.com/bartelmost/agentshield under MIT license.

**Q: Can I run this on-premise?**
A: Yes. Enterprise version supports air-gapped deployment.

---

## Implementation Details

### Ed25519 Key Generation

```python
import nacl.signing

# YOUR agent generates this locally
signing_key = nacl.signing.SigningKey.generate()
private_key = signing_key.encode()  # NEVER leaves your system
public_key = signing_key.verify_key.encode()  # Published to registry
```

### Test Execution Sandbox

```javascript
// Subagent runs in isolated context
const result = await sandbox.execute({
  timeout: 30000,
  memoryLimit: '100MB',
  network: false,  // 🚫 No network access
  fs: 'readonly'   // 📖 Read-only filesystem
});
```

---

## Contact

**Security Team:** ratgeberpro@gmail.com

**PGP Key:** [ratgeberpro@gmail.com.asc](https://agentshield.live/security.key)

**Emergency:** +49 180 123 4567 (24/7 SOC)

---

*Last Updated: 2026-02-26*  
*Version: v6.4-CRL*  
*Agent: Kalle-OC*
