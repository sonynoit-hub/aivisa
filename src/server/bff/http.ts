// Server-only helpers for App Router BFF routes
import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, requireBackendUrl } from "@/lib/api/backend";

export function getBackendBase(strict = false): string | undefined {
  return strict ? requireBackendUrl() : getBackendUrl();
}

export function buildBackendHeaders(
  req: NextRequest,
  opts?: { accept?: string; contentType?: string; extra?: Record<string, string>; forwardCookie?: boolean }
): Record<string, string> {
  const headers: Record<string, string> = { Accept: opts?.accept ?? "application/json", "x-proxy": "next-bff" };
  const cookie = req.headers.get("cookie");
  if (cookie && opts?.forwardCookie !== false) headers["cookie"] = cookie;
  const al = req.headers.get("accept-language");
  if (al) headers["accept-language"] = al;
  const ua = req.headers.get("user-agent");
  if (ua) headers["user-agent"] = ua;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) headers["x-forwarded-for"] = xff;
  if (opts?.contentType) headers["content-type"] = opts.contentType;
  if (opts?.extra) Object.assign(headers, opts.extra);
  return headers;
}

export function pickRateHeaders(r: Response, opts?: { sse?: boolean }) {
  const h = new Headers();
  const ct = r.headers.get("content-type");
  if (ct) h.set("content-type", ct);
  const limit = r.headers.get("x-ratelimit-limit");
  const remaining = r.headers.get("x-ratelimit-remaining");
  const retryAfter = r.headers.get("retry-after");
  if (limit) h.set("X-RateLimit-Limit", limit);
  if (remaining) h.set("X-RateLimit-Remaining", remaining);
  if (retryAfter) h.set("Retry-After", retryAfter);
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) h.set("set-cookie", setCookie);
  if (opts?.sse) {
    if (!ct) h.set("content-type", "text/event-stream; charset=utf-8");
    h.set("Cache-Control", "no-cache");
    h.set("Connection", "keep-alive");
  }
  return h;
}

export function passthrough(r: Response, opts?: { forceJson?: boolean; sse?: boolean }) {
  const h = pickRateHeaders(r, { sse: !!opts?.sse });
  const ct = h.get("content-type");
  if (!ct && opts?.forceJson) h.set("content-type", "application/json; charset=utf-8");
  return new NextResponse(r.body, { status: r.status, headers: h });
}
