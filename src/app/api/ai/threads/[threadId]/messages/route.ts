import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

const listQuerySchema = z.object({ size: z.coerce.number().int().min(1).max(1000).optional() });

const createBodySchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]).default("user"),
  content: z.string().min(1),
  metaJson: z.string().max(10000).optional(),
  tokenIn: z.number().int().min(0).optional(),
  tokenOut: z.number().int().min(0).optional(),
  latencyMs: z.number().int().min(0).optional(),
  costMicroUsd: z.number().int().min(0).optional(),
  safetyFlags: z.string().max(1000).optional(),
  provider: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  redacted: z.boolean().optional(),
});

function getId(param: string | string[] | null): number | null {
  const s = Array.isArray(param) ? param[0] : param;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ threadId: string }> }) {
  const gate = await withRateLimit('api', req, 'ai:messages:get');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const { threadId } = await ctx.params;
  const id = getId(threadId ?? null);
  if (!id) return NextResponse.json({ code: 'INVALID_INPUT', message: 'Invalid threadId' }, { status: 400 });
  const url = new URL(req.url);
  const parsed = listQuerySchema.safeParse({ size: url.searchParams.get("size") || undefined });
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  const qs = new URLSearchParams();
  if (typeof parsed.data.size === 'number') qs.set("size", String(parsed.data.size));
  try {
    const r = await fetch(`${BACKEND}/api/ai/threads/${id}/messages${qs.toString() ? `?${qs}` : ''}`, {
      method: "GET",
      cache: "no-store",
      headers: buildBackendHeaders(req),
    });
    return passthrough(r);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: msg }, { status: 502 });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ threadId: string }> }) {
  const gate = await withRateLimit('api', req, 'ai:messages:post');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const { threadId } = await ctx.params;
  const id = getId(threadId ?? null);
  if (!id) return NextResponse.json({ code: 'INVALID_INPUT', message: 'Invalid threadId' }, { status: 400 });
  const raw = await req.json().catch(() => ({}));
  const parsed = createBodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  try {
    const r = await fetch(`${BACKEND}/api/ai/threads/${id}/messages`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { contentType: "application/json" }),
      body: JSON.stringify(parsed.data),
    });
    return passthrough(r);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: msg }, { status: 502 });
  }
}
