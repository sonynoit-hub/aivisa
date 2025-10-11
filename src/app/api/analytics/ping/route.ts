import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders } from "@/server/analytics/http";
import { passthrough } from "@/server/bff/http";
import { serverDbg } from "@/server/analytics/debug";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = `${getAnalyticsBase()}/api/analytics/ping`;
  try {
    serverDbg("GET", url);
    const upstream = await fetch(url, {
      method: "GET",
      headers: buildAnalyticsHeaders(req, { contentType: "application/json" }),
    });
    const txt = await upstream.clone().text().catch(() => "");
    serverDbg("RES", url, upstream.status, txt);
    return passthrough(upstream, { forceJson: false });
  } catch (e) {
    serverDbg("ERR", url, String(e));
    return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "ping upstream failed" } }, { status: 502 });
  }
}
