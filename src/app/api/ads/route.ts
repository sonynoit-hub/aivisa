import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

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

    const res = await fetch(outUrl.toString(), { headers: { Accept: "application/json" }, cache: "no-store" });
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
  } catch (e) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) console.error('[api/ads] proxy error', e);
    return NextResponse.json([], { status: 200 });
  }
}
