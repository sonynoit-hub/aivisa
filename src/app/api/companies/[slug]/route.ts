import { NextRequest, NextResponse } from "next/server";
import { getBackendBase, buildBackendHeaders, passthrough } from "@/server/bff/http";
import { runtimeConfig } from "@/config/runtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: any) {
  const slug = ctx?.params?.slug as string;
  const base = getBackendBase(false);
  if (!base) {
    return NextResponse.json(
      { error: { code: "BACKEND_URL_MISSING", message: "BACKEND_URL is not configured" } },
      { status: 500 }
    );
  }
  const search = new URLSearchParams(req.nextUrl.searchParams);
  const loc = (search.get("locale") || "").toLowerCase();
  const normalize = (s: string) => s.replace(/_/g, "-").toLowerCase();
  const al = loc ? normalize(loc) : undefined;
  const candidates = [
    `${base.replace(/\/$/, "")}/api/companies/${encodeURIComponent(slug)}`,
    `${base.replace(/\/$/, "")}/companies/${encodeURIComponent(slug)}`,
  ];

  for (const u of candidates) {
    try {
      const url = new URL(u);
      for (const [k, v] of search.entries()) url.searchParams.set(k, v);
      // Add a short timeout to avoid hanging the SSR rendering
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(new Error("companies upstream timeout")), 5000);
      const r = await fetch(url.toString(), {
        method: "GET",
        headers: buildBackendHeaders(req, { extra: al ? { "accept-language": al } : undefined }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (r.ok) return passthrough(r, { forceJson: true });
      // if upstream returns 404/500, try next candidate
    } catch {
      // try next
    }
  }

  if (runtimeConfig.stage === "dev") {
    return NextResponse.json({ ok: true, devNoop: true, error: "no candidate matched" }, { status: 200 });
  }
  return NextResponse.json(
    { error: { code: "UPSTREAM_UNAVAILABLE", message: "no backend candidate matched" } },
    { status: 502 }
  );
}
