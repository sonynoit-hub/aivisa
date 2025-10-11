import { NextRequest, NextResponse } from "next/server";
import { endSessionRecord } from "@/server/track/store";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "BAD_REQUEST", message: "missing session id", timestamp: new Date().toISOString() }, { status: 400 });
    const ended = endSessionRecord(id);
    if (!ended) return NextResponse.json({ error: "NOT_FOUND", message: "session not found", timestamp: new Date().toISOString() }, { status: 404 });
    return NextResponse.json(ended, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: e?.message ?? "unknown", timestamp: new Date().toISOString() }, { status: 500 });
  }
}
