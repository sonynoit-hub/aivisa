import { NextRequest, NextResponse } from "next/server";
import { createSessionRecord } from "@/server/track/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { aid, deviceId, locale, referrer, utm, landingPath } = body || {};
    if (!aid || !deviceId || !landingPath) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "aid, deviceId, landingPath are required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }
    const ua = req.headers.get("user-agent") || undefined;
    const rec = createSessionRecord({ aid, deviceId, locale, referrer, utm, landingPath, userAgent: ua });
    return NextResponse.json(
      { sessionId: rec.sessionId, aid: rec.aid, startedAt: rec.startedAt, isBot: rec.isBot },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: e?.message ?? "unknown", timestamp: new Date().toISOString() }, { status: 500 });
  }
}
