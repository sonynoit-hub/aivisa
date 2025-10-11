import { EP } from "../endpoints";
import { apiGetWithMeta, apiPost, apiPostWithMeta } from "../client";

export type EnsureAnonResponse = { anonId: string };
export async function ensureAnon() {
  // 必须保留 Set-Cookie: aid
  return apiPost<EnsureAnonResponse>(EP.analytics.anonEnsure, undefined);
}

export async function sha256Hex(input: string): Promise<string> {
  if (typeof window === "undefined" || !(window as any).crypto?.subtle) {
    // 非浏览器或不支持 subtle，fallback 简易 hash（非安全，仅占位）
    let h = 0;
    for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0").padEnd(64, "0");
  }
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const buf = await ((window as any).crypto.subtle.digest("SHA-256", data) as Promise<ArrayBuffer>);
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

export async function registerDevice(anonId: string, tokenHash: string, uaHash?: string) {
  return apiPostWithMeta(EP.analytics.devices, { anonId, tokenHash, uaHash });
}

export async function createWebSession(payload: { anonId: string; deviceId: string; locale: string; tz: string; }) {
  return apiPostWithMeta(EP.analytics.webSessions, payload);
}

export async function upsertAnalyticsSession(payload: {
  anonId: string; sessionId: string; deviceId: string; deviceTokenHash: string;
  userAgent: string; deviceType: "desktop" | "mobile" | "tablet";
  screenWidth: number; screenHeight: number; screenDpr: number;
  lang: string; timezone: string; geoCountry?: string;
}) {
  return apiPostWithMeta(EP.analytics.sessions, payload);
}

export async function sendEvent(payload: {
  type: string;
  payload: Record<string, any>;
  anonId: string; sessionId: string; deviceId: string; deviceTokenHash: string;
  route: string; referrer?: string; isBot?: boolean;
}) {
  return apiPostWithMeta(EP.analytics.events, payload);
}
