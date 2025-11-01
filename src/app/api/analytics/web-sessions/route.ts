import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders, resolveClientIp } from "@/server/analytics/http";
import { runtimeConfig } from "@/config/runtime";
import { passthrough } from "@/server/bff/http";
import { serverDbg } from "@/server/analytics/debug";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
	const url = `${getAnalyticsBase()}/api/analytics/web-sessions`;
	try {
			let body = await req.text();
			// Inject ipAddr when missing
			try {
				const json = JSON.parse(body || "{}");
				if (!json.ipAddr) {
					const ip = resolveClientIp(req);
					if (ip) { json.ipAddr = ip; body = JSON.stringify(json); }
				}
			} catch {}
			serverDbg('POST', url, { body });
					const upstream = await fetch(url, {
			method: "POST",
					headers: buildAnalyticsHeaders(req, { contentType: "application/json", extra: { "x-forwarded-for": req.headers.get("x-forwarded-for") || "" } }),
			body,
		});
			const txt = await upstream.clone().text().catch(() => "");
			serverDbg('RES', url, upstream.status, txt);
			return passthrough(upstream, { forceJson: true });
	} catch {
		if (runtimeConfig.stage === 'dev') {
			return NextResponse.json({ ok: true, devNoop: true }, { status: 200 });
		}
		return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "web-sessions upstream failed" } }, { status: 502 });
	}
}
