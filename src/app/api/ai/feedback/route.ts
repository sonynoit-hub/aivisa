import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";
import { withRateLimit } from "@/lib/api/rateLimit";

const schema = z.object({
  threadId: z.number().int().positive(),
  messageId: z.number().int().positive(),
  scoreText: z.string().min(1).max(50),
  commentText: z.string().max(2000).optional().default(""),
  source: z.string().min(1).max(50),
  createdByUserId: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const gate = await withRateLimit('api', req, 'ai:feedback');
  if (!gate.success) return gate.response!;
  const BACKEND = getBackendUrl();
  if (!BACKEND) return NextResponse.json({ code: "CONFIG_ERROR", message: "BACKEND_URL is not set" }, { status: 500 });
  const raw = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: 'INVALID_INPUT', issues: parsed.error.flatten() }, { status: 400 });
  try {
    const r = await fetch(`${BACKEND}/api/ai/feedback`, {
      method: "POST",
      cache: "no-store",
      headers: buildBackendHeaders(req, { contentType: "application/json" }),
      body: JSON.stringify(parsed.data),
    });
    return passthrough(r);
  } catch (e: any) {
    return NextResponse.json({ code: "BACKEND_UNREACHABLE", message: String(e?.message || e) }, { status: 502 });
  }
}
