import Link from 'next/link';
import { visaCategories, type VisaCategoryKey } from '@/data/visaCategories';
import { visaCatalog } from '@/data/visaCatalog';
import type { Locale } from '@/i18n/locales';
import { VisaCategoryIcon, VisaIconBySlug } from '@/features/visa/components/VisaIcon';
import { toShortPathFromSlug } from '@/features/visa/lib/pathMap';
import { THEME } from '@/config/theme';

const colorByKey: Record<VisaCategoryKey, { icon: string; ring: string; hover: string; chip: string; chipHover: string; border: string }> = {
	work: { icon: THEME.cat.work.base, ring: THEME.cat.work.ring, hover: 'hover:shadow-indigo-100', chip: `${THEME.cat.work.chipBg} ${THEME.cat.work.chipText}`, chipHover: THEME.cat.work.chipHoverBg, border: THEME.cat.work.border },
	'status-family': { icon: THEME.cat['status-family'].base, ring: THEME.cat['status-family'].ring, hover: 'hover:shadow-emerald-100', chip: `${THEME.cat['status-family'].chipBg} ${THEME.cat['status-family'].chipText}`, chipHover: THEME.cat['status-family'].chipHoverBg, border: THEME.cat['status-family'].border },
	'study-training': { icon: THEME.cat['study-training'].base, ring: THEME.cat['study-training'].ring, hover: 'hover:shadow-violet-100', chip: `${THEME.cat['study-training'].chipBg} ${THEME.cat['study-training'].chipText}`, chipHover: THEME.cat['study-training'].chipHoverBg, border: THEME.cat['study-training'].border },
	'short-others': { icon: THEME.cat['short-others'].base, ring: THEME.cat['short-others'].ring, hover: 'hover:shadow-sky-100', chip: `${THEME.cat['short-others'].chipBg} ${THEME.cat['short-others'].chipText}`, chipHover: THEME.cat['short-others'].chipHoverBg, border: THEME.cat['short-others'].border },
};

export function VisaCategoryGrid({ locale, limitPerCat = 6 }: { locale: Locale; limitPerCat?: number }) {
	const moreLabelByLocale: Record<Locale, string> = {
		ja: 'もっと見る',
		zh: '更多',
		en: 'More',
		vi: 'Xem thêm',
		ko: '더 보기',
	} as const;
	const more = moreLabelByLocale[locale] ?? moreLabelByLocale.ja;
	return (
		<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{visaCategories.map((cat) => {
				const items = visaCatalog.filter((v) => cat.visas.includes(v.slug));
				const color = colorByKey[cat.key];
				const title = cat.names[locale] ?? cat.names.ja ?? cat.key;
				return (
					<section
						key={cat.key}
						className={`rounded-2xl border bg-white/70 p-4 shadow-sm ring-1 ${color.ring} transition-shadow ${color.hover}`}
					>
						<header className="flex items-center gap-2 mb-2">
							<VisaCategoryIcon cat={cat.key} size="h-6 w-6" />
							<h2 className="text-base font-semibold text-slate-800">{title}</h2>
							<span className="ml-auto text-xs text-slate-500">{items.length}</span>
						</header>
						<ul className="flex flex-wrap gap-2">
							{items.slice(0, limitPerCat).map((v) => (
								<li key={v.slug}>
									<Link
										href={`/${locale}/visa/${toShortPathFromSlug(v.slug)}`}
										className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${color.border} ${color.chip} ${color.chipHover} transition-colors`}
									>
										<VisaIconBySlug slug={v.slug} className={`${color.icon}`} />
										<span>{v.names[locale] ?? v.names.ja ?? v.slug}</span>
									</Link>
								</li>
							))}
							{items.length > limitPerCat && (
								<li className="text-xs text-slate-500">+{items.length - limitPerCat}</li>
							)}
						</ul>
						<footer className="mt-3 text-right text-xs text-slate-400">{more}</footer>
					</section>
				);
			})}
		</div>
	);
}
