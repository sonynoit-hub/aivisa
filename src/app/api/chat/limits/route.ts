import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, pickRateHeaders } from "@/server/bff/http";

export async function GET(req: NextRequest) {
  const BACKEND = getBackendUrl();
  if (!BACKEND) {
    return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  }
  const r = await fetch(`${BACKEND}/v1/chat/limits`, {
    method: "GET",
    cache: "no-store",
    headers: buildBackendHeaders(req, { extra: { "x-proxy": "next-bff-compat" } }),
  });

  if (r.ok) {
    let limit = 0;
    let remaining = 0;
    try {
      const data = (await r.json()) as any;
      limit = Number(data?.limit ?? 0) || 0;
      remaining = Number(data?.remaining ?? 0) || 0;
    } catch {
      // ignore
    }
  const headers = pickRateHeaders(r);
    headers.set("content-type", "application/json; charset=utf-8");
    return new NextResponse(JSON.stringify({ limit, remaining }), {
      status: 200,
      headers,
    });
  }

  return new NextResponse(r.body, { status: r.status, headers: pickRateHeaders(r) });
}
