import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// Avoid spamming logs when upstream is down in dev
let ADS_UPSTREAM_WARNED = false;

// Proxy to backend DB. No mock here.
export async function GET(req: NextRequest) {
  try {
    const inUrl = new URL(req.url);
    const page = inUrl.searchParams.get("page") || "top";
    const slot = inUrl.searchParams.get("slot") || "top_card";
    const locale = inUrl.searchParams.get("locale") || "ja";
    const category = inUrl.searchParams.get("category");
    const limit = inUrl.searchParams.get("limit");

    if (!env.BACKEND_URL) {
      // Backend not configured: return empty list for list requests, else null
      const isList = !!(limit && Number.parseInt(limit, 10) >= 2);
      return NextResponse.json(isList ? [] : null);
    }

    const outUrl = new URL("/ads", env.BACKEND_URL);
    outUrl.searchParams.set("page", page);
    outUrl.searchParams.set("slot", slot);
    outUrl.searchParams.set("locale", locale);
    if (category) outUrl.searchParams.set("category", category);
    if (limit) outUrl.searchParams.set("limit", limit);

  // Add a short timeout to keep UI responsive if upstream is unreachable
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new Error("ads upstream timeout")), 1500);
  const res = await fetch(outUrl.toString(), { headers: { Accept: "application/json" }, cache: "no-store", signal: ctrl.signal });
  clearTimeout(t);
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      // Degrade gracefully
      const isList = !!(limit && Number.parseInt(limit, 10) >= 2);
      return NextResponse.json(isList ? [] : null, { status: 200 });
    }
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: 200 });
    }
    // Non-JSON: return empty gracefully
    const isList = !!(limit && Number.parseInt(limit, 10) >= 2);
    return NextResponse.json(isList ? [] : null, { status: 200 });
  } catch {
    const isDev = process.env.NODE_ENV !== 'production';
    // Degrade gracefully and log once (concise) in dev
    if (isDev && !ADS_UPSTREAM_WARNED) {
      ADS_UPSTREAM_WARNED = true;
      console.warn('[api/ads] upstream unreachable; returning empty. Tip: run backend or unset BACKEND_URL for silent mock.');
    }
    return NextResponse.json([], { status: 200 });
  }
}
