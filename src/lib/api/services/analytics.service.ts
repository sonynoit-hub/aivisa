import { EP } from "../endpoints";
import { apiPost, apiPostWithMeta } from "../client";

export type EnsureAnonResponse = { anonId: string };
export async function ensureAnon() {
  // 必须保留 Set-Cookie: aid
  return apiPost<EnsureAnonResponse>(EP.analytics.anonEnsure, undefined);
}

export async function sha256Hex(input: string): Promise<string> {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (typeof window === "undefined" || !cryptoObj?.subtle) {
    // 非浏览器或不支持 subtle，fallback 简易 hash（非安全，仅占位）
    let h = 0;
    for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0").padEnd(64, "0");
  }
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const buf = await cryptoObj.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function getOrCreateDeviceToken(): Promise<string> {
  try {
    const k = "vp_device_token";
    const found = window.localStorage.getItem(k);
    if (found) return found;
    const token = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
    window.localStorage.setItem(k, token);
    return token;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

// /devices expects: { anonUserId, token?, fingerprint?, uaRaw }
export async function registerDevice(anonUserId: string, token?: string, fingerprint?: string) {
  return apiPostWithMeta(EP.analytics.devices, {
    anonUserId,
    token: token || undefined,
    fingerprint: fingerprint || undefined,
    uaRaw: typeof navigator !== "undefined" ? navigator.userAgent : "",
  });
}

// /web-sessions expects: { anonUserId, deviceId, locale?, ipAddr?, referrer?, utmJson?, landingPath, isBot? }
export async function createWebSession(payload: { anonUserId: string; deviceId: number; locale?: string; ipAddr?: string; referrer?: string; utmJson?: string; landingPath: string; isBot?: boolean; }) {
  return apiPostWithMeta(EP.analytics.webSessions, payload);
}

// /sessions (Analytics Session) expects flattened DTO. sessionId here is Web Session ID
export async function upsertAnalyticsSession(payload: {
  anonUserId: string; sessionId: number; deviceId: number; deviceTokenHash?: string;
  userAgent: string; deviceType: "desktop" | "mobile" | "tablet";
  screenWidth: number; screenHeight: number; screenDpr: number;
  lang: string; timezone: string; geoCountry?: string; lastSeenAt?: string;
}) {
  return apiPostWithMeta(EP.analytics.sessions, payload);
}

// /events expects: { eventType, payload(JSON string), anonUserId, sessionId(Analytics), deviceId?, deviceTokenHash?, route?, referrer?, isBot?, receivedAt? }
export async function sendEvent(payload: {
  eventType: string;
  payload: string;
  anonUserId: string; sessionId: number; deviceId?: number; deviceTokenHash?: string;
  route?: string; referrer?: string; isBot?: boolean; receivedAt?: string;
}) {
  return apiPostWithMeta(EP.analytics.events, payload);
}
