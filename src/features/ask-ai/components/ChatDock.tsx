"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/locales";
import { useMemo } from "react";

function resolveLocale(pathname: string): Locale {
	const seg = pathname.split("/").filter(Boolean)[0];
	return (seg && (locales as readonly string[]).includes(seg)) ? (seg as Locale) : defaultLocale;
}

export default function ChatDock() {
	const pathname = usePathname() || `/${defaultLocale}`;
	const locale = useMemo(() => resolveLocale(pathname), [pathname]);

	// Hide on home page (e.g., /ja, /en, /zh ...), show elsewhere
	const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
	if (isHome) return null;

	return (
		<Link
			href={`/${locale}/ask-ai`}
			className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#04c4b6] to-[#039991] p-3 text-white shadow-lg hover:from-[#03a898] hover:to-[#028074] focus:outline-none focus:ring-2 focus:ring-teal-300 active:scale-[.99]"
			aria-label="Ask AI"
			title="Ask AI"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 opacity-90">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12c0 4-4.03 7-9 7-.61 0-1.2-.04-1.76-.12L6 21l1.45-2.9C5.4 17.04 3 14.73 3 12 3 8.13 7.03 5 12 5s9 3.13 9 7Z" />
			</svg>
		</Link>
	);
}
