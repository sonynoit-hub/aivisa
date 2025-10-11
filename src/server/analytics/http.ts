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
  const al = req.headers.get("accept-language");
  if (al) headers["accept-language"] = al;
  const ua = req.headers.get("user-agent");
  if (ua) headers["user-agent"] = ua;
  if (opts?.contentType) headers["content-type"] = opts.contentType;
  if (opts?.extra) Object.assign(headers, opts.extra);
  return headers;
}
