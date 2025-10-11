import { NextRequest } from "next/server";
import { runtimeConfig, requireAnalyticsBaseUrl } from "@/config/runtime";

export function getAnalyticsBase(): string {
  // Prefer configured value; in dev it may fall back to localhost
  return runtimeConfig.analyticsBaseUrl ?? requireAnalyticsBaseUrl();
}

export function buildAnalyticsHeaders(
  req: NextRequest,
  opts?: { contentType?: string; extra?: Record<string, string>; forwardCookie?: boolean }
): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json", "x-proxy": "next-bff" };
  const cookie = req.headers.get("cookie");
  if (cookie && opts?.forwardCookie !== false) headers["cookie"] = cookie;
  // Also forward 'cookie' when Next sets cookies via Response cookies API (aid)
  const aidCookie = req.cookies?.get?.("aid")?.value as string | undefined;
  if (aidCookie) {
    headers["cookie"] = headers["cookie"] ? `${headers["cookie"]}; aid=${aidCookie}` : `aid=${aidCookie}`;
  }
  const al = req.headers.get("accept-language");
  if (al) headers["accept-language"] = al;
  const ua = req.headers.get("user-agent");
  if (ua) headers["user-agent"] = ua;
  // Forward client IP related headers so upstream can derive geo (GeoIP)
  const xff = req.headers.get("x-forwarded-for");
  if (xff) headers["x-forwarded-for"] = xff;
  const xri = req.headers.get("x-real-ip");
  if (xri) headers["x-real-ip"] = xri;
  const cfc = req.headers.get("cf-connecting-ip");
  if (cfc) headers["cf-connecting-ip"] = cfc;
  if (opts?.contentType) headers["content-type"] = opts.contentType;
  if (opts?.extra) Object.assign(headers, opts.extra);
  return headers;
}

// Best-effort client IP resolution for BFF → upstream usage (dev-friendly)
export function resolveClientIp(req: NextRequest): string | undefined {
  const headerFirst = (name: string) => {
    const v = req.headers.get(name);
    if (!v) return undefined;
    // x-forwarded-for may contain multiple IPs
    const first = v.split(",")[0]?.trim();
    return first || undefined;
  };
  const candidates = [
    headerFirst("x-forwarded-for"),
    headerFirst("cf-connecting-ip"),
    headerFirst("x-real-ip"),
    headerFirst("x-client-ip"),
    headerFirst("forwarded"),
  ].filter(Boolean) as string[];
  let ip = candidates[0];
  if (!ip && runtimeConfig.stage === "dev") {
    const devIp = (process.env.ANALYTICS_DEV_CLIENT_IP || "").trim();
    if (devIp) ip = devIp;
  }
  if (!ip) return undefined;
  // Strip port if present (e.g., 1.2.3.4:5678)
  ip = ip.replace(/:\d+$/, "");
  return ip;
}
