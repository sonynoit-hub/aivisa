"use client";
import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useTranslations } from "next-intl";
import { apiPost } from "@/lib/api/client";

type TicketPayload = {
	email: string;
	subject: string;
	message: string;
	kind?: string;
	source?: string | null;
	locale?: string;
};

export function ContactForm() {
	const locale = useLocale();
	const t = useTranslations("forms.contact");
	const te = useTranslations("errors");
	const [loading, setLoading] = useState(false);
	const [ok, setOk] = useState<null | { id?: string; status?: string }>(null);
	const [err, setErr] = useState<string | null>(null);
	const [fieldErr, setFieldErr] = useState<{ email?: string; message?: string }>({});
			const [form, setForm] = useState<TicketPayload & { phone?: string }>({ message: "", email: "", subject: "", locale, phone: "" });

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((p) => ({ ...p, [name]: value }));
		// clear field error when user types something
		if (name === "email" && value.trim()) {
			setFieldErr((fe) => ({ ...fe, email: undefined }));
		}
		if (name === "message" && value.trim()) {
			setFieldErr((fe) => ({ ...fe, message: undefined }));
		}
	};

	// minimal validation: required fields only
	const validate = (): { ok: boolean } => {
		const errors: { email?: string; message?: string } = {};
		if (!form.email || !form.email.trim()) {
			errors.email = t("required");
		}
		if (!form.message || !form.message.trim()) {
			errors.message = t("required");
		}
		setFieldErr(errors);
		return { ok: Object.keys(errors).length === 0 };
	};


	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErr(null);
		const v = validate();
		if (!v.ok) return; // stop here; avoid HTTP 400 by not calling API
		setLoading(true);
		try {
					const source = (typeof window !== 'undefined') ? 'web' : undefined;
							// Append phone into message body to keep strict DTO while preserving info
							const messageWithPhone = (() => {
								const base = (form.message || '').trim();
								const ph = (form.phone || '').trim();
								if (ph) return `${base}\n\nPhone: ${ph}`;
								return base;
							})();
							const payload: TicketPayload = {
								email: (form.email || '').trim(),
								subject: (form.subject || '').trim(),
								message: messageWithPhone,
								kind: form.kind?.trim() || undefined,
								source,
								locale,
							};
					const res = await apiPost<{ id?: number; message?: string }>("/api/contact", payload);
							setOk({ id: String(res?.id ?? ""), status: "created" });
			// reset minimal
							setForm((p) => ({ ...p, subject: "", message: "", phone: "" }));
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
							{t("success")}
						</div>
					)}
			{err && (
				<div className="rounded-md bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 text-sm">
					{err}
				</div>
			)}

								{/* Kind (種別) moved to top */}
								<label className="block">
									<span className="text-sm text-slate-700">{t("type")}</span>
									<select
										name="kind"
										value={form.kind || ""}
										onChange={onChange}
										className="mt-1 h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
									>
										<option value="">{t("typeSuggestion")}</option>
										<option value="biz">{t("typeBiz")}</option>
									</select>
								</label>

								{/* Subject placed between Kind and Email */}
								<label className="block">
									<span className="text-sm text-slate-700">{t("subject")}</span>
									<input
										name="subject"
										value={form.subject}
										onChange={onChange}
										className="mt-1 h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
									/>
								</label>

								{/* Email, then Phone (under email) */}
								<label className="block">
									<span className="text-sm text-slate-700">{t("email")} <span className="text-rose-600">*</span></span>
									<input
										name="email"
										type="email"
										required
										value={form.email}
										onChange={onChange}
										aria-invalid={!!fieldErr.email}
										className={`mt-1 h-11 w-full rounded-lg border bg-white px-3 text-[15px] outline-none focus:ring-2 ${fieldErr.email ? "border-rose-400 focus:ring-rose-400" : "border-slate-200/60 focus:ring-slate-400"}`}
									/>
									{fieldErr.email && (
										<p className="mt-1 text-sm text-rose-600">{fieldErr.email}</p>
									)}
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

								{/* removed previous email+kind grid; now vertical order as above */}

					<label className="block">
							<span className="text-sm text-slate-700">{t("message")} <span className="text-rose-600">*</span></span>
						<textarea
							name="message"
							value={form.message}
							onChange={onChange}
							required
								aria-invalid={!!fieldErr.message}
								className={`mt-1 w-full min-h-[120px] rounded-lg border bg-white px-3 py-2 text-[15px] outline-none focus:ring-2 ${fieldErr.message ? "border-rose-400 focus:ring-rose-400" : "border-slate-200/60 focus:ring-slate-400"}`}
						/>
							{fieldErr.message && (
								<p className="mt-1 text-sm text-rose-600">{fieldErr.message}</p>
							)}
					</label>

	{/* source 固定为 web，在 BFF 中只映射允许的字段 */}

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
