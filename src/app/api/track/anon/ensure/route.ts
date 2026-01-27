import { NextRequest, NextResponse } from "next/server";
import { ensureAnonRecord } from "@/server/track/store";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  try {
    const rec = ensureAnonRecord();
    return NextResponse.json({ aid: rec.aid, createdAt: rec.createdAt, lastSeenAt: rec.lastSeenAt }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: msg || "unknown", timestamp: new Date().toISOString() }, { status: 500 });
  }
}
