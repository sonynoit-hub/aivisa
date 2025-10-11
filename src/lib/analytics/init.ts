import { dbg, newRequestId } from "@/lib/analytics/debug";
const API = "/api/analytics";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Tracking-Consent": "true",
    "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
    "X-Request-Id": newRequestId(),
  } as const;
}

async function post<T>(path: string, body?: any): Promise<T> {
  const h = headers();
  dbg("POST", `${API}${path}`, { headers: h, body });
  // same-origin 以便 /anon/ensure 的 Set-Cookie 能被复用
  const res = await fetch(`${API}${path}`, { method: "POST", headers: h, credentials: "same-origin", body: body ? JSON.stringify(body) : null });
  dbg("RES", `${API}${path}`, res.status);
  if (!res.ok) {
    let errText = "";
    try { errText = await res.text(); } catch {}
    dbg("ERR", `${API}${path}`, res.status, errText);
    throw new Error(`${path} failed: ${res.status}`);
  }
  const json = await res.json();
  dbg("JSON", `${API}${path}`, json);
  return json;
}

function parseUtm(): { source?: string; medium?: string; campaign?: string; term?: string; content?: string } | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const sp = new URLSearchParams(window.location.search);
    const source = sp.get('utm_source') || undefined;
    const medium = sp.get('utm_medium') || undefined;
    const campaign = sp.get('utm_campaign') || undefined;
    const term = sp.get('utm_term') || undefined;
    const content = sp.get('utm_content') || undefined;
    if (!source && !medium && !campaign && !term && !content) return undefined;
    return { source, medium, campaign, term, content } as any;
  } catch { return undefined; }
}

async function sha256Hex(input: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const buf = await (crypto.subtle.digest("SHA-256", data) as Promise<ArrayBuffer>);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // 简易 fallback（非安全）
    let h = 0;
    for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0").padEnd(64, "0");
  }
}

function detectDeviceType(): "desktop" | "mobile" | "tablet" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android/.test(ua)) return "mobile";
  return "desktop";
}

export async function ensureAnon(): Promise<{ aid: string; createdAt?: string; lastSeenAt?: string }> {
  const data: any = await post("/anon/ensure");
  const aid = data?.anonId || data?.id || data?.aid; // 兼容多种后端返回
  if (!aid) throw new Error("no aid returned");
  return { aid, createdAt: data?.createdAt, lastSeenAt: data?.lastSeenAt };
}

// /devices: { anonUserId, token?, fingerprint?, uaRaw }
export async function registerDevice(anonUserId: string, fingerprint?: string, token?: string) {
  return post<{ id: number; anonUserId: string; firstSeenAt: string; lastSeenAt: string }>("/devices", {
    anonUserId,
    token: token || undefined,
    fingerprint: fingerprint || undefined,
    uaRaw: typeof navigator !== "undefined" ? navigator.userAgent : "",
  });
}

// /web-sessions: { anonUserId, deviceId, locale?, ipAddr?, referrer?, utmJson?, landingPath, isBot? }
export async function createWebSession(anonUserId: string, deviceId: number) {
  const utm = parseUtm();
  return post<{ id: number; anonUserId: string; deviceId: number; startedAt: string; endedAt?: string; bot?: boolean }>("/web-sessions", {
    anonUserId,
    deviceId,
    locale: typeof navigator !== "undefined" ? navigator.language : undefined,
    referrer: typeof document !== "undefined" ? (document.referrer || undefined) : undefined,
    utmJson: utm ? JSON.stringify(utm) : undefined,
    landingPath: typeof window !== "undefined" ? window.location.pathname : "/",
    isBot: typeof navigator !== "undefined" ? /bot|crawl|spider/i.test(navigator.userAgent) : undefined,
  });
}

// /sessions: 平铺字段，注意 sessionId = Web Session ID
export async function createAnalyticsSession(payload: {
  anonUserId: string;
  sessionId: number; // Web Session ID
  deviceId: number;
  deviceTokenHash?: string;
  userAgent: string;
  deviceType: "desktop" | "mobile" | "tablet";
  screenWidth: number;
  screenHeight: number;
  screenDpr: number;
  lang: string;
  timezone: string;
  geoCountry?: string;
  lastSeenAt?: string;
}) {
  return post<{ id: number; createdAt?: string; lastSeenAt?: string }>("/sessions", payload);
}

export async function initAnalytics(): Promise<{ aid: string; deviceId: number; webSessionId: number; sessionId: number }> {
  if (typeof window === "undefined") throw new Error("client only");
  // 1) 匿名用户（前端保存为 aid，但请求字段必须用 anonUserId）
  let aid = window.localStorage.getItem("aid") || undefined;
  if (!aid) {
    const anon = await ensureAnon();
    aid = anon.aid;
    window.localStorage.setItem("aid", aid);
  }

  // 2) 设备 token（原始）与指纹
  const tokenKey = "vp_device_token";
  let deviceToken = window.localStorage.getItem(tokenKey) || undefined;
  if (!deviceToken) {
    deviceToken = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
    window.localStorage.setItem(tokenKey, deviceToken);
  }
  const fingerprint = `${navigator.platform}|${navigator.language}|${(window as any).devicePixelRatio || 1}`;

  // 3) 注册/更新设备
  const device = await registerDevice(aid!, fingerprint, deviceToken);
  const deviceId = (device as any)?.id ?? (device as any)?.deviceId ?? (device as any)?.data?.id ?? (device as any)?.data?.deviceId;
  if (typeof deviceId !== "number") throw new Error("invalid deviceId from /devices");

  // 4) 创建 Web 会话
  const ws = await createWebSession(aid!, deviceId);
  const webSessionId = (ws as any)?.id ?? (ws as any)?.webSessionId ?? (ws as any)?.data?.id;
  if (typeof webSessionId !== "number") throw new Error("invalid webSessionId from /web-sessions");

  // 5) 创建 Analytics Session（环境快照；此处 sessionId = Web Session ID）
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo";
  const deviceTokenHash = deviceToken ? await sha256Hex(deviceToken) : undefined;
  const aSession = await createAnalyticsSession({
    anonUserId: aid!,
    sessionId: webSessionId,
    deviceId,
    deviceTokenHash,
    userAgent: navigator.userAgent,
    deviceType: detectDeviceType(),
    screenWidth: typeof window !== "undefined" ? window.screen.width : 0,
    screenHeight: typeof window !== "undefined" ? window.screen.height : 0,
    screenDpr: (typeof window !== "undefined" && (window.devicePixelRatio || 1)) || 1,
    lang: navigator.language,
    timezone: tz,
  });
  const analyticsSessionId = (aSession as any)?.id ?? (aSession as any)?.sessionId ?? (aSession as any)?.data?.id;
  if (typeof analyticsSessionId !== "number") throw new Error("invalid analyticsSessionId from /sessions");

  // 6) 发布上下文（供事件上报使用）
  try {
    (window as any).__ANON_USER_ID__ = aid;
    (window as any).__DEVICE_ID__ = deviceId;
    (window as any).__DEVICE_TOKEN_HASH__ = deviceTokenHash;
    (window as any).__WEB_SESSION_ID__ = webSessionId;
    (window as any).__ANALYTICS_SESSION_ID__ = analyticsSessionId;
    window.dispatchEvent(new CustomEvent("analytics:ready", { detail: { sessionId: analyticsSessionId } } as any));
  } catch {}

  return { aid: aid!, deviceId, webSessionId, sessionId: analyticsSessionId };
}
