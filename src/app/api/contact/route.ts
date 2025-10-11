import { NextRequest, NextResponse } from "next/server";
import { requireBackendUrl } from "@/lib/api/backend";
import { TicketPayload } from "@/types/visa";
import { buildBackendHeaders, passthrough } from "@/server/bff/http";

export async function POST(req: NextRequest) {
	const backendUrl = new URL(
		"/api/v1/contact",
		requireBackendUrl(),
	).toString();

	try {
		const originalPayload = await req.json();

		const payload: TicketPayload = {
			type: originalPayload.type || null,
			id: originalPayload.id || null,
			source: originalPayload.source || null,
			name: originalPayload.name || null,
			email: originalPayload.email || null,
			phone: originalPayload.phone || null,
			subject: originalPayload.subject || "General Inquiry",
			message: originalPayload.message || "",
			status: originalPayload.status || "NEW",
			priority: originalPayload.priority || "NORMAL",
			locale: originalPayload.locale || null,
			sessionId: originalPayload.sessionId || null,
			userId: originalPayload.userId || null,
			assigneeUserId: originalPayload.assigneeUserId || null,
			createdAt: originalPayload.createdAt || new Date().toISOString(),
			updatedAt: originalPayload.updatedAt || new Date().toISOString(),
		};

		const headers = buildBackendHeaders(req, {
			contentType: "application/json; charset=utf-8",
			forwardCookie: false,
			extra: { "X-API-Request": "BFF", "X-Requested-With": "XMLHttpRequest" },
		});

		if (process.env.NODE_ENV === "development") {
			console.log("▲ [BFF] Contact POST to Backend:", backendUrl);
			console.log("▲ [BFF] Headers:", headers);
			console.log("▲ [BFF] Body:", JSON.stringify(payload, null, 2));
		}

		const response = await fetch(backendUrl, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(payload),
		});

		if (process.env.NODE_ENV === "development") {
			console.log(
				"▼ [BFF] Backend Response Status:",
				response.status,
				response.statusText,
			);
			const responseBody = await response.text();
			console.log("▼ [BFF] Backend Response Body:", responseBody);
			return new NextResponse(responseBody, { status: response.status, statusText: response.statusText, headers: response.headers });
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
		backendUrl = new URL(
			`/api/v1/contact/${id}`,
			requireBackendUrl(),
		).toString();
	} else {
		backendUrl = new URL(
			`/api/v1/contact?${searchParams.toString()}`,
			requireBackendUrl(),
		).toString();
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
