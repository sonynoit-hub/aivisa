import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders } from "@/server/analytics/http";
import { passthrough } from "@/server/bff/http";
import { serverDbg } from "@/server/analytics/debug";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
	const url = `${getAnalyticsBase()}/api/analytics/sessions`;
	try {
		const body = await req.text();
		serverDbg('POST', url, { body });
			const upstream = await fetch(url, {
			method: "POST",
				headers: buildAnalyticsHeaders(req, { contentType: "application/json", extra: { "x-forwarded-for": req.headers.get("x-forwarded-for") || "" } }),
			body,
		});
		serverDbg('RES', url, upstream.status);
		return passthrough(upstream, { forceJson: true });
	} catch (e) {
		return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "sessions upstream failed" } }, { status: 502 });
	}
}
