"use client";
import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useTranslations } from "next-intl";
import { apiPost } from "@/lib/api/client";

type TicketType = "suggestion" | "biz";
type TicketPayload = {
	type: TicketType;
	subject?: string;
	message: string;
	email?: string;
	phone?: string;
	locale?: string;
	source?: string | null;
	sessionId?: string | null;
};

export function ContactForm() {
	const locale = useLocale();
	const t = useTranslations("forms.contact");
	const te = useTranslations("errors");
	const [loading, setLoading] = useState(false);
	const [ok, setOk] = useState<null | { id?: string; status?: string }>(null);
	const [err, setErr] = useState<string | null>(null);
	const [form, setForm] = useState<TicketPayload>({ type: "suggestion", message: "", email: "", phone: "", subject: "", locale });

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((p) => ({ ...p, [name]: value }));
	};

	const validate = (): string | null => {
		if (!form.type || (form.type !== "suggestion" && form.type !== "biz")) return t("required");
		if (!form.email || !form.email.trim()) return t("required");
		if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t("invalidEmail");
		if (!form.message || !form.message.trim()) return t("required");
		if (form.phone && form.phone.length > 0 && !/^[0-9+\-()\s]{5,}$/.test(form.phone)) return t("invalidPhone");
		return null;
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(null);
		const msg = validate();
		if (msg) { setErr(msg); return; }
		setLoading(true);
		try {
			const source = (typeof window !== 'undefined') ? (window.location.pathname + (window.location.search || '')) : null;
			const sessionId = (typeof window !== 'undefined' && (window as any).__WEB_SESSION_ID__) ? (window as any).__WEB_SESSION_ID__ : null;
			
			if (process.env.NODE_ENV !== 'production') {
				console.log('[ContactForm] source:', source);
				console.log('[ContactForm] sessionId:', sessionId);
				console.log('[ContactForm] window location:', typeof window !== 'undefined' ? window.location.href : 'undefined');
			}
			
			const payload: TicketPayload = {
				...form,
				locale,
				source,
				sessionId,
			};
			const res = await apiPost<{ id?: string; status?: string; ok?: boolean; message?: string }>("/api/contact", payload);
			setOk({ id: res?.id, status: res?.status ?? (res?.ok ? "open" : undefined) });
			// reset minimal
			setForm((p) => ({ ...p, subject: "", message: "" }));
		} catch (e: any) {
			setErr(e?.payload?.message || e?.message || te("generic"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="space-y-5" onSubmit={onSubmit} noValidate>
			{ok && (
				<div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 text-sm">
					{t("success")} {ok.id ? `(ID: ${ok.id})` : ""}
				</div>
			)}
			{err && (
				<div className="rounded-md bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 text-sm">
					{err}
				</div>
			)}

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<label className="block">
					<span className="text-sm text-slate-700">{t("type")}</span>
							<select
								name="type"
								value={form.type}
								onChange={onChange}
								className="mt-1 h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
							>
						<option value="suggestion">{t("typeSuggestion")}</option>
						<option value="biz">{t("typeBiz")}</option>
					</select>
				</label>
				<label className="block">
					<span className="text-sm text-slate-700">{t("subject")}</span>
									<input
								name="subject"
								value={form.subject}
								onChange={onChange}
										className="mt-1 h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
							/>
				</label>
			</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<label className="block">
					<span className="text-sm text-slate-700">{t("email")}</span>
									<input
								name="email"
								type="email"
										required
						value={form.email}
								onChange={onChange}
										className="mt-1 h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
							/>
				</label>
				<label className="block">
					<span className="text-sm text-slate-700">{t("phone")}</span>
									<input
								name="phone"
								value={form.phone}
								onChange={onChange}
										className="mt-1 h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
							/>
				</label>
			</div>

					<label className="block">
						<span className="text-sm text-slate-700">{t("message")}</span>
						<textarea
							name="message"
							value={form.message}
							onChange={onChange}
							required
							className="mt-1 w-full min-h-[120px] rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
						/>
					</label>

	      {/* source removed per request */}

			<div className="pt-2 flex justify-center">
						<button
								className="relative h-11 min-w-[160px] rounded-lg px-6 sm:px-8 text-white shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:opacity-60 btn-primary"
							type="submit"
							disabled={loading}
						>
							{loading ? t("sending") : t("submit")}
						</button>
			</div>
		</form>
	);
}
