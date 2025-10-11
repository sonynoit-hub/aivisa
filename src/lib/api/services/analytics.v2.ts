import { EP } from "../endpoints";

// Backward-compatible input, but will be sent using strict DTO fields
type EventInput = {
  // Accept any id type; we'll coerce to number when possible
  sessionId?: number | string | null; // Prefer Analytics Session ID; fallback to window globals
  name: string; // mapped to eventType
  category?: string;
  label?: string;
  value?: number;
  props?: Record<string, any>;
  ts?: string; // ISO UTC
};

function baseHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Tracking-Consent": "true",
    "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
  } as const;
}

function getWindowVal<T = any>(key: string): T | undefined {
  try { return (window as any)[key] as T; } catch { return undefined; }
}

function getAnalyticsSessionId(): number | undefined {
  const raw = getWindowVal("__ANALYTICS_SESSION_ID__") ?? getWindowVal("__ANALYTICS_IDS__")?.sessionId;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export async function logEventV2(input: EventInput) {
  // Resolve IDs and context
  const resolvedSessionId = (() => {
    if (input.sessionId != null) {
      if (typeof input.sessionId === "number") return input.sessionId;
      const n = Number(input.sessionId);
      if (Number.isFinite(n)) return n;
    }
    return getAnalyticsSessionId();
  })();
  if (!resolvedSessionId) return; // no session available, skip silently

  const anonUserId = getWindowVal<string>("__ANON_USER_ID__") || (typeof window !== "undefined" && window.localStorage.getItem("aid")) || undefined;
  const deviceId = getWindowVal<number>("__DEVICE_ID__");
  const deviceTokenHash = getWindowVal<string>("__DEVICE_TOKEN_HASH__");

  const eventType = input.name;
  const payloadObj = {
    ...(input.props || {}),
    category: input.category,
    label: input.label,
    value: input.value,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    title: typeof document !== "undefined" ? document.title : undefined,
  };
  const body: any = {
    eventType,
    payload: JSON.stringify(payloadObj),
    anonUserId,
    sessionId: resolvedSessionId, // Analytics Session ID
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" ? (document.referrer || undefined) : undefined,
    isBot: typeof navigator !== "undefined" ? /bot|crawl|spider/i.test(navigator.userAgent) : undefined,
    receivedAt: input.ts || new Date().toISOString(),
  };
  if (typeof deviceId === "number") body.deviceId = deviceId;
  if (deviceTokenHash) body.deviceTokenHash = deviceTokenHash;

  const res = await fetch(EP.analytics.events, {
    method: "POST",
    headers: baseHeaders(),
    credentials: "omit",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("logEventV2 failed");
  try { return await res.json(); } catch { return undefined; }
}
