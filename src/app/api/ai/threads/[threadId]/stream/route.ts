import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, pickRateHeaders } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

const bodySchema = z.object({
  content: z.string().min(1),
  locale: z.string().max(10).optional(),
  metaJson: z.string().max(200000).optional(),
});

function getId(param: string | string[] | null): number | null {
  const s = Array.isArray(param) ? param[0] : param;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ threadId: string }> }) {
  const gate = await withRateLimit('chatStream', req, 'ai:stream');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const { threadId } = await ctx.params;
  const id = getId(threadId ?? null);
  if (!id) return NextResponse.json({ code: 'INVALID_INPUT', message: 'Invalid threadId' }, { status: 400 });
  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });

  let r: Response;
  try {
    r = await fetch(`${BACKEND}/api/ai/threads/${id}/stream`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { accept: "text/event-stream", contentType: "application/json" }),
      body: JSON.stringify(parsed.data),
    });
  } catch (e: any) {
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: String(e?.message || e) }, { status: 502 });
  }

  return new NextResponse(r.body, { status: r.status, headers: pickRateHeaders(r, { sse: true }) });
}
