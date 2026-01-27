import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

const listQuerySchema = z.object({
  anonUserId: z.string().uuid().optional(),
  webSessionId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  size: z.coerce.number().int().min(1).max(500).optional(),
});

const createBodySchema = z.object({
  webSessionId: z.number().int().positive().optional(),
  anonUserId: z.string().uuid().optional(),
  userId: z.number().int().positive().optional(),
  locale: z.string().max(10).optional(),
  topicHint: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'ai:threads:get');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const url = new URL(req.url);
  const parsed = listQuerySchema.safeParse({
    anonUserId: url.searchParams.get("anonUserId") || undefined,
    webSessionId: url.searchParams.get("webSessionId") || undefined,
    userId: url.searchParams.get("userId") || undefined,
    size: url.searchParams.get("size") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  const qs = new URLSearchParams();
  const p = parsed.data;
  if (p.anonUserId) qs.set("anonUserId", p.anonUserId);
  if (typeof p.webSessionId === 'number') qs.set("webSessionId", String(p.webSessionId));
  if (typeof p.userId === 'number') qs.set("userId", String(p.userId));
  if (typeof p.size === 'number') qs.set("size", String(p.size));
  try {
    const r = await fetch(`${BACKEND}/api/ai/threads${qs.toString() ? `?${qs}` : ''}` , {
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

export async function POST(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'ai:threads:post');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const raw = await req.json().catch(() => ({}));
  const parsed = createBodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  try {
    const r = await fetch(`${BACKEND}/api/ai/threads`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { contentType: "application/json", extra: { "X-Requested-With": "XMLHttpRequest", "X-API-Request": "BFF" } }),
      body: JSON.stringify(parsed.data),
    });
    return passthrough(r);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: msg }, { status: 502 });
  }
}
