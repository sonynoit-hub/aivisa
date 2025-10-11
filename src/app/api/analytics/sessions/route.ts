import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders } from "@/server/analytics/http";
import { passthrough } from "@/server/bff/http";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
	const url = `${getAnalyticsBase()}/api/analytics/sessions`;
	try {
		const upstream = await fetch(url, {
			method: "POST",
			headers: buildAnalyticsHeaders(req, { contentType: "application/json" }),
			body: await req.text(),
		});
		return passthrough(upstream, { forceJson: true });
	} catch (e) {
		return NextResponse.json({ error: { code: "BACKEND_UNREACHABLE", message: "sessions upstream failed" } }, { status: 502 });
	}
}
