import { NextRequest, NextResponse } from "next/server";
import { upsertDeviceRecord } from "@/server/track/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { aid, fingerprint, userAgent, deviceToken } = body || {};
    if (!aid || !fingerprint || !userAgent) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "aid, fingerprint, userAgent are required", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }
    const rec = upsertDeviceRecord({ aid, fingerprint, userAgent, deviceToken });
    return NextResponse.json(
      { deviceId: rec.deviceId, aid: rec.aid, firstSeenAt: rec.firstSeenAt, lastSeenAt: rec.lastSeenAt },
      { status: 200 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: msg || "unknown", timestamp: new Date().toISOString() }, { status: 500 });
  }
}
