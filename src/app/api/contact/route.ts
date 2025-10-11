import { NextRequest, NextResponse } from "next/server";
import { requireBackendUrl } from "@/lib/api/backend";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";

export async function POST(req: NextRequest) {
	const base = requireBackendUrl();
	const urlObj = new URL(base);
	const localhostBase = `http://localhost:${urlObj.port || 80}`;
	const loopbackBase = `http://127.0.0.1:${urlObj.port || 80}`;
	const candidates = [
		new URL("/api/contact", base).toString(),
		new URL("/api/v1/contact", base).toString(),
		new URL("/api/contact", localhostBase).toString(),
		new URL("/api/v1/contact", localhostBase).toString(),
		new URL("/api/contact", loopbackBase).toString(),
		new URL("/api/v1/contact", loopbackBase).toString(),
	];

	try {
		const original = await req.json().catch(() => ({}));
		// Map to strict DTO expected by backend
		const payload: {
			email: string;
			subject: string;
			message: string;
			kind?: string;
			source?: string;
			locale?: string;
		} = {
			email: String(original.email ?? ""),
			subject: String(original.subject ?? ""),
			message: String(original.message ?? ""),
			kind: original.kind ? String(original.kind) : undefined,
			source: original.source ? String(original.source) : undefined,
			locale: original.locale ? String(original.locale) : undefined,
		};

		const headers = buildBackendHeaders(req, {
			contentType: "application/json; charset=utf-8",
			forwardCookie: false,
			extra: { "X-API-Request": "BFF", "X-Requested-With": "XMLHttpRequest" },
		});

		if (process.env.NODE_ENV === "development") {
			console.log("▲ [BFF] Contact POST candidates:", candidates);
			console.log("▲ [BFF] Body:", JSON.stringify(payload));
		}

		// Try multiple candidates (path + host) to maximize connectivity in dev
		const doPost = async (url: string) => fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
		let response: Response | null = null;
		let lastErr: any = null;
		for (const url of candidates) {
			try {
				const r = await doPost(url);
				if (!r.ok && (r.status === 404 || r.status === 405)) {
					// try next candidate
					continue;
				}
				response = r;
				break;
			} catch (e) {
				lastErr = e;
				continue;
			}
		}
		if (!response) {
			throw new Error(`Contact upstream unreachable: ${lastErr ? String(lastErr) : 'no candidates succeeded'}`);
		}
		return passthrough(response, { forceJson: true });
	} catch (error) {
		console.error("[BFF] Error in POST /api/contact:", error);
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred.";
		return new NextResponse(
			JSON.stringify({
				error: "Internal Server Error",
				details: errorMessage,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	let backendUrl;
	if (id) {
		backendUrl = new URL(`/api/contact/${id}`, requireBackendUrl()).toString();
	} else {
		backendUrl = new URL(`/api/contact?${searchParams.toString()}`, requireBackendUrl()).toString();
	}

	try {
		const headers = buildBackendHeaders(request, { forwardCookie: false, extra: { "X-API-Request": "BFF", "X-Requested-With": "XMLHttpRequest" } });
		const response = await fetch(backendUrl, { method: "GET", headers });
		return passthrough(response, { forceJson: true });
	} catch (error) {
		console.error("[BFF] Error in GET /api/contact:", error);
		return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers":
				"Content-Type, Authorization, X-Requested-With",
		},
	});
}
