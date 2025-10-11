import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders } from "@/server/analytics/http";
import { passthrough } from "@/server/bff/http";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
	const url = `${getAnalyticsBase()}/api/analytics/events`;
	try {
		const bodyText = await req.text();
		const upstream = await fetch(url, {
			method: "POST",
			headers: buildAnalyticsHeaders(req, { contentType: "application/json; charset=utf-8", extra: { "x-forwarded-for": req.headers.get("x-forwarded-for") || "" } }),
			body: bodyText,
		});
		return passthrough(upstream, { forceJson: true });
	} catch (e) {
		return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "events upstream failed" } }, { status: 502 });
	}
}
