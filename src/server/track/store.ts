import crypto from "node:crypto";

export type Anon = { aid: string; createdAt: string; lastSeenAt: string };
export type Device = {
  deviceId: string;
  aid: string;
  fingerprint: string;
  userAgent: string;
  deviceToken?: string;
  firstSeenAt: string;
  lastSeenAt: string;
};
export type Session = {
  sessionId: string;
  aid: string;
  deviceId: string;
  locale?: string;
  referrer?: string;
  utm?: Record<string, unknown>;
  landingPath: string;
  startedAt: string;
  isBot: boolean;
  endedAt?: string;
};

// In-memory stores (best-effort; suitable for dev/BFF without persistence)
const anonStore = new Map<string, Anon>();
const deviceStore = new Map<string, Device>();
const sessionStore = new Map<string, Session>();

export function nowIso(): string {
  return new Date().toISOString(); // ISO 8601 UTC with Z
}

export function uuid(): string {
  return crypto.randomUUID();
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function ensureAnonRecord(_opts?: { userAgent?: string; fingerprint?: string }): Anon {
  // No cookie: generate a new aid always; client should persist it in localStorage
  const aid = uuid();
  const createdAt = nowIso();
  const rec: Anon = { aid, createdAt, lastSeenAt: createdAt };
  anonStore.set(aid, rec);
  return rec;
}

export function touchAnon(aid: string): Anon | undefined {
  const rec = anonStore.get(aid);
  if (rec) {
    rec.lastSeenAt = nowIso();
  }
  return rec;
}

export function upsertDeviceRecord(input: {
  aid: string;
  fingerprint: string;
  userAgent: string;
  deviceToken?: string;
}): Device {
  const tokenBasis = input.deviceToken || input.fingerprint;
  const deviceId = sha256Hex(`${input.aid}|${tokenBasis}`).slice(0, 32);
  const existing = deviceStore.get(deviceId);
  if (existing) {
    existing.lastSeenAt = nowIso();
    // Keep the latest UA/fingerprint for reference
    existing.userAgent = input.userAgent;
    existing.fingerprint = input.fingerprint;
    if (input.deviceToken) existing.deviceToken = input.deviceToken;
    return existing;
  }
  const ts = nowIso();
  const rec: Device = {
    deviceId,
    aid: input.aid,
    fingerprint: input.fingerprint,
    userAgent: input.userAgent,
    deviceToken: input.deviceToken,
    firstSeenAt: ts,
    lastSeenAt: ts,
  };
  deviceStore.set(deviceId, rec);
  return rec;
}

export function createSessionRecord(input: {
  aid: string;
  deviceId: string;
  locale?: string;
  referrer?: string;
  utm?: Record<string, unknown>;
  landingPath: string;
  userAgent?: string;
}): Session {
  const sessionId = uuid();
  const startedAt = nowIso();
  const ua = input.userAgent || "";
  const isBot = /bot|crawl|spider|slurp|bing|duckduck|baidu|sogou/i.test(ua);
  const rec: Session = {
    sessionId,
    aid: input.aid,
    deviceId: input.deviceId,
    locale: input.locale,
    referrer: input.referrer,
    utm: input.utm,
    landingPath: input.landingPath,
    startedAt,
    isBot,
  };
  sessionStore.set(sessionId, rec);
  // touch anon lastSeen
  touchAnon(input.aid);
  return rec;
}

export function endSessionRecord(sessionId: string): { sessionId: string; endedAt: string; duration: number } | undefined {
  const rec = sessionStore.get(sessionId);
  if (!rec) return undefined;
  const endedAt = nowIso();
  rec.endedAt = endedAt;
  const duration = Math.max(0, new Date(endedAt).getTime() - new Date(rec.startedAt).getTime());
  return { sessionId, endedAt, duration };
}
