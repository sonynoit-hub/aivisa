import { dbg, newRequestId } from "@/lib/analytics/debug";
const API = "/api/analytics";

function baseHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Tracking-Consent": "true",
    "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
  } as const;
}
export async function logEvent(eventType: string, payloadObj?: Record<string, any>, extra?: { category?: string; label?: string; value?: number }) {
  // sessionId for /events = Analytics Session ID
  const sidRaw = (typeof window !== "undefined" && ((window as any).__ANALYTICS_SESSION_ID__ || (window as any).__ANALYTICS_IDS__?.sessionId)) || undefined;
  const sid = typeof sidRaw === 'string' ? Number(sidRaw) : sidRaw;
  if (!sid) return; // 无 Analytics Session 则跳过

  const anonUserId = (typeof window !== "undefined" && ((window as any).__ANON_USER_ID__ || window.localStorage.getItem("aid"))) || undefined;
  const deviceId = (typeof window !== "undefined" && ((window as any).__DEVICE_ID__)) || undefined;
  const deviceTokenHash = (typeof window !== "undefined" && ((window as any).__DEVICE_TOKEN_HASH__)) || undefined;

  const nowIso = new Date().toISOString();
  const payload = JSON.stringify({ ...(payloadObj || {}), category: extra?.category, label: extra?.label, value: extra?.value });
  const body: any = {
    eventType,
    payload,
    anonUserId,
    sessionId: sid,
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" ? (document.referrer || undefined) : undefined,
    isBot: typeof navigator !== "undefined" ? /bot|crawl|spider/i.test(navigator.userAgent) : undefined,
    receivedAt: nowIso,
  };
  if (deviceId != null) body.deviceId = deviceId;
  if (deviceTokenHash != null) body.deviceTokenHash = deviceTokenHash;

  try {
    const h = { ...baseHeaders(), "X-Request-Id": newRequestId() } as any;
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
export async function logEventReliable(eventType: string, payloadObj?: Record<string, any>, extra?: { category?: string; label?: string; value?: number }) {
  // sessionId for /events = Analytics Session ID
  const sidRaw = (typeof window !== "undefined" && ((window as any).__ANALYTICS_SESSION_ID__ || (window as any).__ANALYTICS_IDS__?.sessionId)) || undefined;
  const sid = typeof sidRaw === 'string' ? Number(sidRaw) : sidRaw;
  if (!sid) return;

  const anonUserId = (typeof window !== "undefined" && ((window as any).__ANON_USER_ID__ || window.localStorage.getItem("aid"))) || undefined;
  const deviceId = (typeof window !== "undefined" && ((window as any).__DEVICE_ID__)) || undefined;
  const deviceTokenHash = (typeof window !== "undefined" && ((window as any).__DEVICE_TOKEN_HASH__)) || undefined;

  const nowIso = new Date().toISOString();
  const payload = JSON.stringify({ ...(payloadObj || {}), category: extra?.category, label: extra?.label, value: extra?.value });
  const body: any = {
    eventType,
    payload,
    anonUserId,
    sessionId: sid,
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" ? (document.referrer || undefined) : undefined,
    isBot: typeof navigator !== "undefined" ? /bot|crawl|spider/i.test(navigator.userAgent) : undefined,
    receivedAt: nowIso,
  };
  if (deviceId != null) body.deviceId = deviceId;
  if (deviceTokenHash != null) body.deviceTokenHash = deviceTokenHash;

  const url = `${API}/events`;
  const headers = { ...baseHeaders(), "X-Request-Id": newRequestId() } as any;
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
