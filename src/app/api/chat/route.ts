import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough, pickRateHeaders } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";
import { z } from 'zod';

const getQuerySchema = z.object({
  q: z.string().min(1).max(2000).optional(),
});

const postBodySchema = z.object({
  prompt: z.string().min(1).max(2000).optional(),
  message: z.string().min(1).max(2000).optional(),
  q: z.string().min(1).max(2000).optional(),
  conversationId: z.string().uuid().optional(),
  model: z.string().max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export async function GET(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'chat:get');
  if (!gate.success) return gate.response!;
  // zod 校验查询参数
  const url = new URL(req.url);
  const parsed = getQuerySchema.safeParse({ q: url.searchParams.get('q') || undefined });
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  const BACKEND = getBackendUrl();
  if (!BACKEND) {
    return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  }
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    const r = await fetch(`${BACKEND}/v1/chat`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { contentType: "application/json", extra: { "x-proxy": "next-bff-compat" } }),
      body: JSON.stringify({ message: q }),
    });
    return passthrough(r);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { code: "BACKEND_UNREACHABLE", message: msg },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'chat:post');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) {
    return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  }
  const raw = await req.json().catch(() => ({}));
  const parsed = postBodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const prompt = (body.prompt ?? body.message ?? body.q ?? "");
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "prompt is required" },
      { status: 400 }
    );
  }

  // 后端需要 message 字段，这里做归一化
  const payload: Record<string, unknown> = { message: prompt };
  if (typeof body?.conversationId === "string" && body.conversationId) {
    payload.conversationId = body.conversationId;
  }
  if (typeof body?.model === "string") payload.model = body.model;
  if (typeof body?.temperature === "number") payload.temperature = body.temperature;

  let r: Response;
  try {
    r = await fetch(`${BACKEND}/v1/chat`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { contentType: "application/json", extra: { "x-proxy": "next-bff-compat" } }),
      body: JSON.stringify(payload),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { code: "BACKEND_UNREACHABLE", message: msg },
      { status: 502 }
    );
  }

  if (r.ok) {
    // 后端返回 AskResponse，按契约仅暴露 { answer }
    let answer: string | null = null;
    let conversationId: string | undefined;
    try {
      const data: unknown = await r.json();
      const rec = (data && typeof data === 'object') ? (data as Record<string, unknown>) : undefined;
      // 兼容后端返回字段名 reply
      const a = rec?.answer;
      const reply = rec?.reply;
      answer = typeof a === "string" ? a : (typeof reply === "string" ? reply : null);
      if (typeof rec?.conversationId === "string") conversationId = rec.conversationId;
    } catch {
      answer = null;
    }
  const headers = pickRateHeaders(r);
    headers.set("content-type", "application/json; charset=utf-8");
    return new NextResponse(JSON.stringify({ answer: answer ?? "", conversationId }), {
      status: 200,
      headers,
    });
  }

  // 非 2xx：按后端原样透传（含 429）
  return passthrough(r);
}
