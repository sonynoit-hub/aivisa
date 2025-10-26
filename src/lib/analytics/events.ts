import { dbg, newRequestId } from "@/lib/analytics/debug";
const API = "/api/analytics";

function baseHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Tracking-Consent": "true",
    "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
  } as const;
}
type EventBody = {
  eventType: string;
  payload: string;
  anonUserId?: string;
  sessionId: number;
  route?: string;
  referrer?: string;
  isBot?: boolean;
  receivedAt: string;
  deviceId?: number;
  deviceTokenHash?: string;
};

export async function logEvent(eventType: string, payloadObj?: Record<string, unknown>, extra?: { category?: string; label?: string; value?: number }) {
  // sessionId for /events = Analytics Session ID
  const sidRaw = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return (w.__ANALYTICS_SESSION_ID__ ?? (w.__ANALYTICS_IDS__ as Record<string, unknown> | undefined)?.sessionId) as unknown;
  })()) || undefined;
  const sid = typeof sidRaw === 'string' ? Number(sidRaw) : (typeof sidRaw === 'number' ? sidRaw : undefined);
  if (!sid) return; // 无 Analytics Session 则跳过

  const anonUserId = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return (w.__ANON_USER_ID__ as string | undefined) || window.localStorage.getItem("aid") || undefined;
  })()) || undefined;
  const deviceIdRaw = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return w.__DEVICE_ID__ as number | string | undefined;
  })()) || undefined;
  const deviceTokenHash = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return w.__DEVICE_TOKEN_HASH__ as string | undefined;
  })()) || undefined;

  const nowIso = new Date().toISOString();
  const payload = JSON.stringify({ ...(payloadObj || {}), category: extra?.category, label: extra?.label, value: extra?.value });
  const deviceIdVal = typeof deviceIdRaw === 'string' ? Number(deviceIdRaw) : (typeof deviceIdRaw === 'number' ? deviceIdRaw : undefined);
  const body: EventBody = {
    eventType,
    payload,
    anonUserId,
    sessionId: sid,
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" ? (document.referrer || undefined) : undefined,
    isBot: typeof navigator !== "undefined" ? /bot|crawl|spider/i.test(navigator.userAgent) : undefined,
    receivedAt: nowIso,
  };
  if (deviceIdVal != null && !Number.isNaN(deviceIdVal)) body.deviceId = deviceIdVal;
  if (deviceTokenHash != null) body.deviceTokenHash = String(deviceTokenHash);

  try {
  const h: Record<string, string> = { ...baseHeaders(), "X-Request-Id": newRequestId() };
    dbg("POST", `${API}/events`, { headers: h, body });
    const res = await fetch(`${API}/events`, { method: "POST", headers: h, credentials: "omit", body: JSON.stringify(body) });
    dbg("RES", `${API}/events`, res.status);
    if (!res.ok) {
      let txt = "";
      try { txt = await res.text(); } catch {}
      dbg("ERR", `${API}/events`, res.status, txt);
    } else {
      try { const j = await res.json(); dbg("JSON", `${API}/events`, j); } catch {}
    }
  } catch (e) {
    dbg("ERR", `${API}/events`, String(e));
  }
}

// Reliable path: try keepalive fetch, fallback to sendBeacon
export async function logEventReliable(eventType: string, payloadObj?: Record<string, unknown>, extra?: { category?: string; label?: string; value?: number }) {
  // sessionId for /events = Analytics Session ID
  const sidRaw = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return (w.__ANALYTICS_SESSION_ID__ ?? (w.__ANALYTICS_IDS__ as Record<string, unknown> | undefined)?.sessionId) as unknown;
  })()) || undefined;
  const sid = typeof sidRaw === 'string' ? Number(sidRaw) : (typeof sidRaw === 'number' ? sidRaw : undefined);
  if (!sid) return;

  const anonUserId = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return (w.__ANON_USER_ID__ as string | undefined) || window.localStorage.getItem("aid") || undefined;
  })()) || undefined;
  const deviceIdRaw = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return w.__DEVICE_ID__ as number | string | undefined;
  })()) || undefined;
  const deviceTokenHash = (typeof window !== "undefined" && (() => {
    const w = window as unknown as Record<string, unknown>;
    return w.__DEVICE_TOKEN_HASH__ as string | undefined;
  })()) || undefined;

  const nowIso = new Date().toISOString();
  const payload = JSON.stringify({ ...(payloadObj || {}), category: extra?.category, label: extra?.label, value: extra?.value });
  const deviceIdVal = typeof deviceIdRaw === 'string' ? Number(deviceIdRaw) : (typeof deviceIdRaw === 'number' ? deviceIdRaw : undefined);
  const body: EventBody = {
    eventType,
    payload,
    anonUserId,
    sessionId: sid,
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" ? (document.referrer || undefined) : undefined,
    isBot: typeof navigator !== "undefined" ? /bot|crawl|spider/i.test(navigator.userAgent) : undefined,
    receivedAt: nowIso,
  };
  if (deviceIdVal != null && !Number.isNaN(deviceIdVal)) body.deviceId = deviceIdVal;
  if (deviceTokenHash != null) body.deviceTokenHash = String(deviceTokenHash);

  const url = `${API}/events`;
  const headers: Record<string, string> = { ...baseHeaders(), "X-Request-Id": newRequestId() };
  const jsonBody = JSON.stringify(body);
  try {
    dbg("POST(reliable)", url, { headers, body });
    const res = await fetch(url, { method: "POST", headers, credentials: "omit", body: jsonBody, keepalive: true });
    dbg("RES(reliable)", url, res.status);
    if (!res.ok) {
      let txt = "";
      try { txt = await res.text(); } catch {}
      dbg("ERR(reliable)", url, res.status, txt);
    }
    return;
  } catch (e) {
    dbg("ERR(reliable)", url, String(e));
    // Fallback to sendBeacon if available
    try {
      const blob = new Blob([jsonBody], { type: "application/json" });
      const ok = navigator.sendBeacon?.(url, blob);
      dbg("BEACON", url, ok === true ? "sent" : String(ok));
    } catch (e2) {
      dbg("ERR(beacon)", url, String(e2));
    }
  }
}
