import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

const querySchema = z.object({
  sinceMessageId: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(10).optional(),
});

function parseId(param: string | string[] | null): number | null {
  const s = Array.isArray(param) ? param[0] : param;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ threadId: string }> }) {
  const gate = await withRateLimit('api', req, 'ai:poll:get');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const { threadId } = await ctx.params;
  const id = parseId(threadId ?? null);
  if (!id) return NextResponse.json({ code: 'INVALID_INPUT', message: 'Invalid threadId' }, { status: 400 });
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    sinceMessageId: url.searchParams.get("sinceMessageId") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  const qs = new URLSearchParams();
  const p = parsed.data;
  if (typeof p.sinceMessageId === 'number') qs.set('sinceMessageId', String(p.sinceMessageId));
  if (typeof p.limit === 'number') qs.set('limit', String(p.limit));
  try {
    const r = await fetch(`${BACKEND}/api/ai/threads/${id}/poll${qs.toString() ? `?${qs}` : ''}` , {
      method: "GET",
      cache: "no-store",
      headers: buildBackendHeaders(req),
    });
    return passthrough(r);
  } catch (e: any) {
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: String(e?.message || e) }, { status: 502 });
  }
}
