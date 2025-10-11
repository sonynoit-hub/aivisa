import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsBase, buildAnalyticsHeaders } from "@/server/analytics/http";
import { serverDbg } from "@/server/analytics/debug";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	// 若已存在 aid，则直接复用，避免上游返回新的 anonId 导致切语言时 anonId 变化
	const existing = req.cookies.get("aid")?.value;
	if (existing) {
		const res = NextResponse.json({ anonId: existing }, { status: 200 });
		res.cookies.set("aid", existing, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 365,
		});
		return res;
	}
	const url = `${getAnalyticsBase()}/api/analytics/anon/ensure`;
	try {
		serverDbg('POST', url);
		const upstream = await fetch(url, { method: "POST", headers: buildAnalyticsHeaders(req, { contentType: "application/json" }) });
		const data = await upstream.json().catch(() => ({}));
		serverDbg('RES', url, upstream.status, data);
		// 无论上游是否返回 Set-Cookie，这里都用 Next 的 cookies API 稳定写入 aid，避免 dev 环境 http + Secure 导致丢失
		const res = NextResponse.json(data, { status: upstream.status });
		const anonId = (data as any)?.anonId || (data as any)?.id;
		if (anonId) {
			res.cookies.set("aid", anonId, {
				path: "/",
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				maxAge: 60 * 60 * 24 * 365,
			});
		} else {
			// 如果没有拿到 anonId，尽量透传上游的 Set-Cookie（备用）
			const setCookie = upstream.headers.get("set-cookie");
			if (setCookie) res.headers.set("set-cookie", setCookie);
		}
		return res;
	} catch {
		// Fallback: 生成本地 aid Cookie
		const anonId = crypto.randomUUID();
		const res = NextResponse.json({ anonId }, { status: 200 });
		res.cookies.set("aid", anonId, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24 * 365,
		});
		return res;
	}
}
