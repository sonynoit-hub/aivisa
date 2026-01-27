import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

const schema = z.object({
  threadId: z.number().int().positive().optional(),
  messageId: z.number().int().positive().optional(),
  provider: z.string().max(100).optional(),
  model: z.string().max(200).optional(),
  inputJson: z.string().max(200000).optional(),
  outputJson: z.string().max(200000).optional(),
  tokenIn: z.number().int().min(0).optional(),
  tokenOut: z.number().int().min(0).optional(),
  latencyMs: z.number().int().min(0).optional(),
  httpStatus: z.number().int().min(100).max(599).optional(),
  cacheHit: z.boolean().optional(),
  errorCode: z.string().max(200).optional(),
  retryOf: z.number().int().min(0).optional(),
  costMicroUsd: z.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'ai:runs');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const raw = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  try {
    const r = await fetch(`${BACKEND}/api/ai/runs`, {
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
