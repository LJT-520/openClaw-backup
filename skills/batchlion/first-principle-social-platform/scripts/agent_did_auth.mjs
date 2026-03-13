#!/usr/bin/env node

import { createHash, createPrivateKey, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, hostname as osHostname } from "node:os";
import path from "node:path";

const DID_WBA_USER_PATTERN = /^did:wba:([a-z0-9.-]+):user:([A-Za-z0-9._~-]{1,128})$/;
const DEFAULT_REGISTER_DID_DOMAINS = ["first-principle.com.cn"];
const DEFAULT_LOGIN_DID_DOMAINS = ["first-principle.com.cn", "awiki.ai"];
const DEFAULT_LOCAL_AGENT_ID_FILE = path.join(homedir(), ".openclaw", "agent-id");

function usage() {
  console.log(`OpenClaw DID helper

Usage:
  node scripts/agent_did_auth.mjs generate-keys --out-dir <dir> --name <name>
  node scripts/agent_did_auth.mjs sign --private-jwk <file> --challenge <text>
  node scripts/agent_did_auth.mjs login --base-url <api> [--did <did> --private-jwk <file> | --private-pem <file>] [--key-id <id>] [--display-name <name>] [--save-session <file>] [--save-credential <file>] [--no-bootstrap] [--allow-bootstrap-after-explicit] [--out-dir <dir>] [--name <name>] [--agent-id <id>] [--agent-id-file <path>]
  node scripts/agent_did_auth.mjs bootstrap --base-url <api> --did <did> --out-dir <dir> --name <name> [--key-id <id>] [--display-name <name>] [--save-session <file>] [--save-credential <file>]

Notes:
  - local credential discovery/scanning is disabled
  - login with explicit DID+key uses only user-provided key path
  - login without explicit DID+key bootstraps local-domain DID (unless --no-bootstrap)
  - script-side DID domain defaults: login first-principle.com.cn,awiki.ai; bootstrap first-principle.com.cn
  - backend still enforces domain allowlists server-side
`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function hasFlag(args, key) {
  const value = String(args[key] || "").trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function requireArg(args, key) {
  const value = args[key];
  if (!value) {
    throw new Error(`Missing required argument --${key}`);
  }
  return String(value);
}

function parseCsvValues(raw) {
  return String(raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function expandHome(inputPath) {
  if (!inputPath) {
    return "";
  }
  if (inputPath === "~") {
    return homedir();
  }
  if (inputPath.startsWith("~/")) {
    return path.join(homedir(), inputPath.slice(2));
  }
  return inputPath;
}

function normalizePathForRead(filePath, sourceFile = "") {
  const expanded = expandHome(filePath);
  if (path.isAbsolute(expanded)) {
    return expanded;
  }
  if (sourceFile) {
    return path.resolve(path.dirname(sourceFile), expanded);
  }
  return path.resolve(expanded);
}

function parseDidDescriptor(did) {
  const match = String(did).match(DID_WBA_USER_PATTERN);
  if (!match) {
    throw new Error("Invalid DID format");
  }
  return {
    domain: match[1].toLowerCase(),
    userId: match[2],
  };
}

function ensureDidFormat(did) {
  parseDidDescriptor(did);
}

function parseRegisterAllowedDomains() {
  return new Set(DEFAULT_REGISTER_DID_DOMAINS);
}

function parseLoginAllowedDomains() {
  return new Set(DEFAULT_LOGIN_DID_DOMAINS);
}

function isDidDomainAllowed(domain, allowedDomains) {
  if (allowedDomains.has("*")) {
    return true;
  }
  return allowedDomains.has(String(domain || "").toLowerCase());
}

function readPrivateJwk(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const jwk = JSON.parse(raw);
  if (!jwk || typeof jwk !== "object") {
    throw new Error("Invalid private JWK file");
  }
  if (!("d" in jwk)) {
    throw new Error("JWK is not a private key");
  }
  return jwk;
}

function pickString(obj, keys) {
  for (const key of keys) {
    if (typeof obj[key] === "string" && obj[key].trim()) {
      return obj[key].trim();
    }
  }
  return "";
}

function readPrivatePem(filePath) {
  const raw = readFileSync(filePath, "utf8").trim();
  if (raw.includes("BEGIN") && raw.includes("PRIVATE KEY")) {
    return raw;
  }
  try {
    const parsed = JSON.parse(raw);
    const privatePem = pickString(parsed, ["private_key_pem", "privatePem", "private_pem"]);
    if (privatePem && privatePem.includes("BEGIN") && privatePem.includes("PRIVATE KEY")) {
      return privatePem.trim();
    }
  } catch {
    // fallthrough
  }
  throw new Error("Invalid private PEM file");
}

function parsePrivateKeyFromCredential(params) {
  if (params.privateJwk) {
    return createPrivateKey({ key: params.privateJwk, format: "jwk" });
  }
  if (params.privateJwkPath) {
    const jwk = readPrivateJwk(params.privateJwkPath);
    return createPrivateKey({ key: jwk, format: "jwk" });
  }
  if (params.privatePem) {
    return createPrivateKey(params.privatePem);
  }
  if (params.privatePemPath) {
    const pem = readPrivatePem(params.privatePemPath);
    return createPrivateKey(pem);
  }
  throw new Error("Missing private key material");
}

function b64u(input) {
  return Buffer.from(input).toString("base64url");
}

function normalizeDidUserId(input) {
  const normalized = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
  return normalized || "";
}

function toDidUserId(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
  return normalized || "openclaw-agent";
}

function resolveLocalAgentIdFilePath(args) {
  const fromArgs = String(args["agent-id-file"] || "").trim();
  if (fromArgs) {
    return normalizePathForRead(fromArgs);
  }
  const fromEnv = String(process.env.OPENCLAW_AGENT_ID_FILE || "").trim();
  if (fromEnv) {
    return normalizePathForRead(fromEnv);
  }
  return DEFAULT_LOCAL_AGENT_ID_FILE;
}

function readStableAgentIdFromFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return "";
    }
    const raw = readFileSync(filePath, "utf8");
    return normalizeDidUserId(raw);
  } catch {
    return "";
  }
}

function generateStableAgentId() {
  const hostPart = normalizeDidUserId(osHostname() || "");
  const suffix = randomBytes(6).toString("hex");
  return toDidUserId(`${hostPart || "openclaw-agent"}-${suffix}`);
}

function resolveBootstrapAgentId(args) {
  const explicit = normalizeDidUserId(args["agent-id"] || process.env.OPENCLAW_AGENT_ID || "");
  if (explicit) {
    return explicit;
  }

  const idFilePath = resolveLocalAgentIdFilePath(args);
  const existing = readStableAgentIdFromFile(idFilePath);
  if (existing) {
    return existing;
  }

  const generated = generateStableAgentId();
  mkdirSync(path.dirname(idFilePath), { recursive: true });
  writeFileSync(idFilePath, `${generated}\n`, { mode: 0o600 });
  return generated;
}

function resolveBootstrapName(args) {
  const explicit = String(args.name || "").trim();
  if (explicit) {
    return explicit;
  }
  return resolveBootstrapAgentId(args);
}

function buildBootstrapDidForFallback(args, registerAllowedDomains) {
  const explicitDid = String(args.did || "").trim();
  if (explicitDid) {
    ensureDidFormat(explicitDid);
    const descriptor = parseDidDescriptor(explicitDid);
    if (registerAllowedDomains.has(descriptor.domain)) {
      return explicitDid;
    }
  }

  const agentId = resolveBootstrapAgentId(args);
  const domain = Array.from(registerAllowedDomains)[0];
  if (!domain) {
    throw new Error("No register-allowed DID domains configured for bootstrap fallback.");
  }
  return `did:wba:${domain}:user:${agentId}`;
}

function createKeyFiles(outDir, name) {
  mkdirSync(outDir, { recursive: true });
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicJwk = publicKey.export({ format: "jwk" });
  const privateJwk = privateKey.export({ format: "jwk" });

  const publicPath = path.join(outDir, `${name}-public.jwk`);
  const privatePath = path.join(outDir, `${name}-private.jwk`);
  writeFileSync(publicPath, JSON.stringify(publicJwk, null, 2));
  writeFileSync(privatePath, JSON.stringify(privateJwk, null, 2), { mode: 0o600 });

  return {
    publicPath,
    privatePath,
    publicJwk,
    privateJwk,
  };
}

function buildDidDocument(did, keyId, publicJwk) {
  return {
    id: did,
    verificationMethod: [
      {
        id: keyId,
        type: "JsonWebKey2020",
        controller: did,
        publicKeyJwk: {
          kty: publicJwk.kty,
          crv: publicJwk.crv,
          x: publicJwk.x,
        },
      },
    ],
    authentication: [keyId],
  };
}

function resolveDidWbaDomainField(version = "1.1") {
  const parsed = Number.parseFloat(String(version));
  if (!Number.isFinite(parsed)) {
    return "service";
  }
  return parsed >= 1.1 ? "aud" : "service";
}

function canonicalizeDidWbaPayload(payload) {
  const keys = Object.keys(payload).sort((a, b) => a.localeCompare(b));
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${JSON.stringify(payload[key])}`);
  return `{${pairs.join(",")}}`;
}

function resolveServiceDomainFromBaseUrl(baseUrl) {
  const url = new URL(baseUrl);
  return url.hostname.toLowerCase();
}

function resolveVerificationMethodFragment(did, keyId) {
  const trimmed = String(keyId || "").trim();
  if (!trimmed) {
    return "key-1";
  }
  if (trimmed.includes("#")) {
    const [prefix, fragment] = trimmed.split("#");
    if (prefix && prefix !== did) {
      throw new Error(`key_id DID mismatch: ${trimmed}`);
    }
    if (!fragment) {
      throw new Error(`Invalid key_id: ${trimmed}`);
    }
    return fragment;
  }
  return trimmed;
}

function signDidWbaContentHash(privateKey, contentHash) {
  if (!privateKey || typeof privateKey !== "object") {
    throw new Error("Invalid private key");
  }
  const keyType = privateKey.asymmetricKeyType;
  if (keyType === "ed25519" || keyType === "ed448") {
    return sign(null, contentHash, privateKey);
  }
  if (keyType === "ec") {
    return sign("sha256", contentHash, { key: privateKey, dsaEncoding: "ieee-p1363" });
  }
  return sign("sha256", contentHash, privateKey);
}

function buildDidWbaAuthorization(params) {
  const version = params.version || "1.1";
  const domainField = resolveDidWbaDomainField(version);
  const payload = {
    nonce: randomBytes(16).toString("hex"),
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    did: params.did,
  };
  payload[domainField] = params.serviceDomain;

  const canonical = canonicalizeDidWbaPayload(payload);
  const contentHash = createHash("sha256").update(canonical).digest();
  const signature = signDidWbaContentHash(params.privateKey, contentHash).toString("base64url");
  const verificationMethodFragment = resolveVerificationMethodFragment(params.did, params.keyId);
  return `DIDWba v="${version}", did="${params.did}", nonce="${payload.nonce}", timestamp="${payload.timestamp}", verification_method="${verificationMethodFragment}", signature="${signature}"`;
}

async function postJson(url, payload, extraHeaders = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error ? String(json.error) : `HTTP ${res.status}`;
    throw new Error(`${url} -> ${msg}`);
  }
  return json;
}

async function runDidWbaLogin(params) {
  const serviceDomain = resolveServiceDomainFromBaseUrl(params.baseUrl);
  const authorization = buildDidWbaAuthorization({
    did: params.did,
    keyId: params.keyId,
    privateKey: params.privateKey,
    serviceDomain,
    version: "1.1",
  });

  const verifyRes = await postJson(`${params.baseUrl}/agent/auth/didwba/verify`, params.displayName ? {
    display_name: params.displayName,
  } : {}, {
    Authorization: authorization,
  });

  if (params.saveSession) {
    mkdirSync(path.dirname(params.saveSession), { recursive: true });
    writeFileSync(params.saveSession, JSON.stringify(verifyRes, null, 2), { mode: 0o600 });
  }

  const accessToken = verifyRes?.session?.access_token ? String(verifyRes.session.access_token) : "";
  const refreshToken = verifyRes?.session?.refresh_token ? String(verifyRes.session.refresh_token) : "";

  return {
    verifyRes,
    summary: {
      ok: true,
      user: verifyRes.user || null,
      profile: verifyRes.profile || null,
      access_token_preview: accessToken ? `${accessToken.slice(0, 12)}...` : "",
      refresh_token_preview: refreshToken ? `${refreshToken.slice(0, 12)}...` : "",
      session_saved_to: params.saveSession || null,
    },
  };
}

function defaultCredentialPathForDid(did) {
  const descriptor = parseDidDescriptor(did);
  const safeDomain = descriptor.domain.replace(/[^a-z0-9.-]/g, "-");
  const safeUser = descriptor.userId.replace(/[^A-Za-z0-9._~-]/g, "-");
  return path.join(homedir(), ".openclaw", "did", `${safeDomain}-${safeUser}-credential.json`);
}

function saveDidCredential(filePath, payload) {
  const resolvedPath = normalizePathForRead(filePath);
  mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const body = {
    did: payload.did,
    key_id: payload.keyId || null,
    private_jwk_path: payload.privateJwkPath || null,
    private_pem_path: payload.privatePemPath || null,
    saved_at: new Date().toISOString(),
  };
  writeFileSync(resolvedPath, JSON.stringify(body, null, 2), { mode: 0o600 });
  return resolvedPath;
}

function generateKeys(args) {
  const outDir = requireArg(args, "out-dir");
  const name = requireArg(args, "name");
  const generated = createKeyFiles(outDir, name);

  console.log(JSON.stringify({
    ok: true,
    public_jwk_path: generated.publicPath,
    private_jwk_path: generated.privatePath,
    did_public_x: generated.publicJwk.x,
    key_type: generated.publicJwk.kty,
    curve: generated.publicJwk.crv,
  }, null, 2));
}

function signChallenge(args) {
  const privateJwkPath = requireArg(args, "private-jwk");
  const challenge = requireArg(args, "challenge");
  const privateJwk = readPrivateJwk(privateJwkPath);
  const privateKey = createPrivateKey({ key: privateJwk, format: "jwk" });
  const signature = sign(null, Buffer.from(challenge, "utf8"), privateKey);
  console.log(JSON.stringify({ signature: b64u(signature) }, null, 2));
}

async function bootstrapDid(args) {
  const baseUrl = requireArg(args, "base-url").replace(/\/$/, "");
  const did = requireArg(args, "did");
  ensureDidFormat(did);

  const descriptor = parseDidDescriptor(did);
  const registerAllowedDomains = parseRegisterAllowedDomains();
  if (!registerAllowedDomains.has(descriptor.domain)) {
    throw new Error(
      `Bootstrap is not allowed for DID domain "${descriptor.domain}". Allowed bootstrap domains: ${Array.from(registerAllowedDomains).join(", ")}. Use explicit login for external DID domains.`,
    );
  }

  const outDir = requireArg(args, "out-dir");
  const name = requireArg(args, "name");
  const keyId = args["key-id"] ? String(args["key-id"]) : `${did}#key-1`;
  const displayName = args["display-name"] ? String(args["display-name"]).trim() : "";
  const saveSession = args["save-session"]
    ? String(args["save-session"])
    : path.join(outDir, `${name}-session.json`);
  const saveCredentialPath = args["save-credential"]
    ? String(args["save-credential"])
    : path.join(outDir, `${name}-did-credential.json`);

  const generated = createKeyFiles(outDir, name);
  const didDocument = buildDidDocument(did, keyId, generated.publicJwk);

  const registerChallengeRes = await postJson(`${baseUrl}/agent/auth/did/register/challenge`, { did });
  const registerChallengeText = String(registerChallengeRes.challenge || "");
  const registerChallengeId = String(registerChallengeRes.challenge_id || "");
  if (!registerChallengeText || !registerChallengeId) {
    throw new Error("Register challenge response missing fields");
  }

  const privateKey = createPrivateKey({ key: generated.privateJwk, format: "jwk" });
  const registerSignature = sign(null, Buffer.from(registerChallengeText, "utf8"), privateKey).toString("base64url");

  const registerBody = {
    did,
    did_document: didDocument,
    challenge_id: registerChallengeId,
    signature: registerSignature,
    key_id: keyId,
  };
  if (displayName) {
    registerBody.display_name = displayName;
  }

  const registerRes = await postJson(`${baseUrl}/agent/auth/did/register`, registerBody);

  const loginRes = await runDidWbaLogin({
    baseUrl,
    did,
    privateKey: createPrivateKey({ key: generated.privateJwk, format: "jwk" }),
    keyId,
    saveSession,
    displayName,
  });

  const credentialSavedTo = saveDidCredential(saveCredentialPath, {
    did,
    keyId,
    privateJwkPath: generated.privatePath,
  });

  console.log(JSON.stringify({
    ok: true,
    bootstrap: {
      did,
      key_id: keyId,
      public_jwk_path: generated.publicPath,
      private_jwk_path: generated.privatePath,
      did_document_url: registerRes?.did_document_url || null,
      register_ok: Boolean(registerRes?.ok),
      credential_saved_to: credentialSavedTo,
    },
    login: loginRes.summary,
  }, null, 2));
}

async function tryExplicitLogin(args, params) {
  const explicitDid = args.did ? String(args.did).trim() : "";
  const explicitPrivateJwkPath = args["private-jwk"] ? String(args["private-jwk"]).trim() : "";
  const explicitPrivatePemPath = args["private-pem"] ? String(args["private-pem"]).trim() : "";
  const explicitKeyId = args["key-id"] ? String(args["key-id"]) : undefined;

  const explicitProvided = Boolean(explicitDid || explicitPrivateJwkPath || explicitPrivatePemPath || explicitKeyId);
  if (!explicitProvided) {
    return false;
  }

  if (explicitPrivateJwkPath && explicitPrivatePemPath) {
    throw new Error("Use only one explicit private key input: --private-jwk or --private-pem.");
  }
  if (!explicitDid || (!explicitPrivateJwkPath && !explicitPrivatePemPath)) {
    throw new Error("Explicit login requires --did and either --private-jwk or --private-pem.");
  }

  ensureDidFormat(explicitDid);
  const descriptor = parseDidDescriptor(explicitDid);
  if (!isDidDomainAllowed(descriptor.domain, params.allowedLoginDomains)) {
    throw new Error(`DID domain "${descriptor.domain}" is not in script-side login allowed domains.`);
  }

  const keyIdAttempts = explicitKeyId ? [explicitKeyId, undefined] : [undefined];
  const errors = [];

  for (const keyIdAttempt of keyIdAttempts) {
    try {
      const privateKey = explicitPrivateJwkPath
        ? parsePrivateKeyFromCredential({ privateJwkPath: explicitPrivateJwkPath })
        : parsePrivateKeyFromCredential({ privatePemPath: explicitPrivatePemPath });

      const loginRes = await runDidWbaLogin({
        baseUrl: params.baseUrl,
        did: explicitDid,
        privateKey,
        keyId: keyIdAttempt,
        saveSession: params.saveSession,
        displayName: params.displayName,
      });

      const outputCredentialPath = params.saveCredentialPath || defaultCredentialPathForDid(explicitDid);
      const credentialSavedTo = saveDidCredential(outputCredentialPath, {
        did: explicitDid,
        keyId: keyIdAttempt || explicitKeyId,
        privateJwkPath: explicitPrivateJwkPath,
        privatePemPath: explicitPrivatePemPath,
      });

      console.log(JSON.stringify({
        ...loginRes.summary,
        did: explicitDid,
        key_id: keyIdAttempt || null,
        credential_saved_to: credentialSavedTo,
        login_mode: "explicit",
      }, null, 2));
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const keyLabel = keyIdAttempt ? ` (key_id=${keyIdAttempt})` : " (key_id=<auto>)";
      errors.push(`Explicit login failed${keyLabel}: ${msg}`);
    }
  }

  throw new Error(errors.join(" | "));
}

async function loginWithDid(args) {
  const baseUrl = requireArg(args, "base-url").replace(/\/$/, "");
  const saveSession = args["save-session"] ? String(args["save-session"]) : "";
  const saveCredentialPath = args["save-credential"] ? String(args["save-credential"]) : "";
  const displayName = args["display-name"] ? String(args["display-name"]).trim() : "";
  const noBootstrap = hasFlag(args, "no-bootstrap");
  const allowBootstrapAfterExplicit = hasFlag(args, "allow-bootstrap-after-explicit");

  const allowedLoginDomains = parseLoginAllowedDomains();

  try {
    const explicitLoggedIn = await tryExplicitLogin(args, {
      baseUrl,
      saveSession,
      saveCredentialPath,
      displayName,
      allowedLoginDomains,
    });
    if (explicitLoggedIn) {
      return;
    }
  } catch (error) {
    if (!allowBootstrapAfterExplicit) {
      throw error;
    }
    if (noBootstrap) {
      throw error;
    }
  }

  if (noBootstrap) {
    throw new Error("No explicit DID credentials provided. Use --did with --private-jwk/--private-pem, or remove --no-bootstrap.");
  }

  const registerAllowedDomains = parseRegisterAllowedDomains();
  const fallbackDid = buildBootstrapDidForFallback(args, registerAllowedDomains);
  const bootstrapName = resolveBootstrapName(args);
  const bootstrapOutDir = args["out-dir"]
    ? String(args["out-dir"])
    : path.join(homedir(), ".openclaw", "keys");

  const bootstrapArgs = {
    ...args,
    did: fallbackDid,
    name: bootstrapName,
    "out-dir": bootstrapOutDir,
  };

  if (!bootstrapArgs["save-session"] && saveSession) {
    bootstrapArgs["save-session"] = saveSession;
  }
  if (!bootstrapArgs["save-credential"]) {
    bootstrapArgs["save-credential"] = saveCredentialPath || defaultCredentialPathForDid(fallbackDid);
  }

  await bootstrapDid(bootstrapArgs);
}

async function main() {
  const [, , command = "", ...rest] = process.argv;
  if (!command || command === "--help" || command === "-h") {
    usage();
    process.exit(0);
  }

  const args = parseArgs(rest);

  try {
    if (command === "generate-keys") {
      generateKeys(args);
      return;
    }
    if (command === "sign") {
      signChallenge(args);
      return;
    }
    if (command === "login") {
      await loginWithDid(args);
      return;
    }
    if (command === "bootstrap") {
      await bootstrapDid(args);
      return;
    }
    usage();
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ ok: false, error: message }));
    process.exit(1);
  }
}

await main();
