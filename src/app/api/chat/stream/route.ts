import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, pickRateHeaders } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";
import { z } from 'zod';

const postBodySchema = z.object({
  prompt: z.string().min(1).max(2000).optional(),
  message: z.string().min(1).max(2000).optional(),
  q: z.string().min(1).max(2000).optional(),
  conversationId: z.string().uuid().optional(),
  model: z.string().max(100).optional(),
  language: z.string().max(10).optional(),
});

export async function POST(req: NextRequest) {
  const gate = await withRateLimit('chatStream', req, 'chat:sse');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) {
    return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  }
  const raw = await req.json().catch(() => ({}));
  const parsed = postBodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const payload: Record<string, unknown> = { message: body.prompt ?? body.message ?? body.q ?? "" };
  if (typeof body?.conversationId === "string" && body.conversationId) payload.conversationId = body.conversationId;
  if (typeof body?.model === "string") payload.model = body.model;
  if (typeof body?.language === "string") payload.language = body.language;

  let r: Response;
  try {
    r = await fetch(`${BACKEND}/v1/chat/stream`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { accept: "text/event-stream", contentType: "application/json", extra: { "x-proxy": "next-bff-compat" } }),
      body: JSON.stringify(payload),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { code: "BACKEND_UNREACHABLE", message: msg },
      { status: 502 }
    );
  }

  // 直接透传 SSE 流
  return new NextResponse(r.body, { status: r.status, headers: pickRateHeaders(r, { sse: true }) });
}
