// Minimal front-end wrapper calling same-origin /api/track per spec
const API_BASE = "/api/track";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Tracking-Consent": "true",
    "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
  } as const;
}

async function req<T = any>(path: string, body?: any): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    credentials: "omit",
    body: body ? JSON.stringify(body) : null,
  });
}

export async function ensureAnon() {
  const res = await req("/anon/ensure", {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    fingerprint:
      typeof window !== "undefined"
        ? `${navigator.platform}|${navigator.language}|${(window as any).devicePixelRatio || 1}`
        : undefined,
  });
  if (!res.ok) throw new Error("ensureAnon failed");
  return res.json() as Promise<{ aid: string; createdAt: string; lastSeenAt: string }>;
}

export async function upsertDevice(aid: string, fingerprint: string) {
  const res = await req("/device", {
    aid,
    fingerprint,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  });
  if (!res.ok) throw new Error("upsertDevice failed");
  return res.json() as Promise<{ deviceId: string; aid: string; firstSeenAt: string; lastSeenAt: string }>;
}

export async function startSession(input: { aid: string; deviceId: string }) {
  const res = await req("/session", {
    aid: input.aid,
    deviceId: input.deviceId,
    locale: typeof navigator !== "undefined" ? navigator.language : undefined,
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    utm: undefined,
    landingPath: typeof window !== "undefined" ? window.location.pathname : "/",
  });
  if (!res.ok) throw new Error("startSession failed");
  return res.json() as Promise<{ sessionId: string; aid: string; startedAt: string; isBot: boolean }>;
}

export function endSession(sessionId: string, payload: { reason?: string } = { reason: "page_unload" }) {
  const url = `${API_BASE}/session/${sessionId}/end`;
  const data = JSON.stringify(payload);
  const headers: any = { type: "application/json" };
  if (typeof navigator !== "undefined" && (navigator as any).sendBeacon) {
    const ok = (navigator as any).sendBeacon(url, new Blob([data], headers));
    if (ok) return Promise.resolve();
  }
  return fetch(url, { method: "POST", headers: headers(), credentials: "omit", body: data });
}

export async function initTracking() {
  if (typeof window === "undefined") return null;
  let aid = window.localStorage.getItem("aid");
  if (!aid) {
    const anon = await ensureAnon();
    aid = anon.aid;
    window.localStorage.setItem("aid", aid);
  }
  const fingerprint = `${navigator.platform}|${navigator.language}|${(window as any).devicePixelRatio || 1}`;
  const device = await upsertDevice(aid, fingerprint);
  const session = await startSession({ aid, deviceId: device.deviceId });

  const onEnd = () => endSession(session.sessionId).catch(() => {});
  window.addEventListener("pagehide", onEnd);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onEnd();
  });

  return { aid, deviceId: device.deviceId, sessionId: session.sessionId } as const;
}
