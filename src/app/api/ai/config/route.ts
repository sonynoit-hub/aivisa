import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

export async function GET(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'ai:config:get');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  try {
    const r = await fetch(`${BACKEND}/api/ai/config`, {
      method: "GET",
      cache: "no-store",
      headers: buildBackendHeaders(req),
    });
    return passthrough(r);
  } catch (e: any) {
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: String(e?.message || e) }, { status: 502 });
  }
}
