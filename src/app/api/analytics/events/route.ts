import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders } from "@/server/analytics/http";
import { runtimeConfig } from "@/config/runtime";
import { passthrough } from "@/server/bff/http";
import { serverDbg } from "@/server/analytics/debug";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
	const base = getAnalyticsBase();
	const candidates = [
		`${base}/api/analytics/events`,
		`${base}/analytics/events`,
		`${base}/api/v1/analytics/events`,
	];
	try {
		const bodyText = await req.text();
		let lastErr: unknown = null;
		for (const url of candidates) {
			try {
				serverDbg('POST', url, { body: bodyText });
				const upstream = await fetch(url, {
					method: "POST",
					headers: buildAnalyticsHeaders(req, { contentType: "application/json; charset=utf-8", extra: { "x-forwarded-for": req.headers.get("x-forwarded-for") || "" } }),
					body: bodyText,
				});
				serverDbg('RES', url, upstream.status);
				if (!upstream.ok && (upstream.status === 404 || upstream.status === 405)) {
					continue; // try next candidate
				}
				return passthrough(upstream, { forceJson: true });
			} catch (e) {
				serverDbg('ERR', url, String(e));
				lastErr = e;
				continue;
			}
		}
		serverDbg('ERR', 'analytics/events fallback exhausted', String(lastErr || 'unknown'));
		if (runtimeConfig.stage === 'dev') {
			return NextResponse.json({ ok: true, devNoop: true }, { status: 200 });
		}
		return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "events upstream failed" } }, { status: 502 });
	} catch (e) {
		serverDbg('ERR', 'analytics/events unhandled', String(e));
		if (runtimeConfig.stage === 'dev') {
			return NextResponse.json({ ok: true, devNoop: true }, { status: 200 });
		}
		return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "events upstream failed" } }, { status: 502 });
	}
}
