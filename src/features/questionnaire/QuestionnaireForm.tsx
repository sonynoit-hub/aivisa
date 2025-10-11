"use client";
import { useState } from "react";

export function QuestionnaireForm({ locale }: { locale: string }) {
	const [loading, setLoading] = useState(false)
	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setTimeout(() => { setLoading(false); window.location.href = `/${locale}/questionnaire/review` }, 400)
	}

	return (
		<form className="space-y-4" onSubmit={onSubmit}>
			<label className="block"><span className="text-sm">Name</span><input name="name" className="w-full rounded border px-2 py-1" required/></label>
			<label className="block"><span className="text-sm">Nationality</span><input name="nationality" className="w-full rounded border px-2 py-1" required/></label>
			<label className="block"><span className="text-sm">Purpose</span><input name="purpose" placeholder="Work/Study/Family" className="w-full rounded border px-2 py-1" required/></label>
			<button className="px-3 py-1 rounded bg-blue-600 text-white" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
		</form>
	)
}
