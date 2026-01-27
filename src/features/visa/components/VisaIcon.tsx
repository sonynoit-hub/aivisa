"use client";

import type { ComponentProps, ComponentType } from "react";
import { visaIconBySlug, categoryIconByKey } from "@/data/visaIcons";
import { visaCategories, type VisaCategoryKey } from "@/data/visaCategories";
import { THEME } from "@/config/theme";
import {
	StudentColorIcon,
	CareWorkerColorIcon,
	EngineerIntlColorIcon,
	BusinessManagerColorIcon,
	SkilledLaborColorIcon,
	SpecifiedSkilledColorIcon,
	HighlySkilledColorIcon,
	PermanentResidentColorIcon,
	SpouseJapaneseColorIcon,
	SpousePRColorIcon,
	LongTermResidentColorIcon,
	DependentColorIcon,
	TraineeColorIcon,
	TechnicalInternColorIcon,
	TemporaryVisitorColorIcon,
	DesignatedActivitiesColorIcon,
} from '@/components/icons/visa/ColorVisaIcons';

type SvgProps = ComponentProps<"svg"> & { className?: string; size?: string; variant?: 'outline' | 'color' };

// Build slug -> category lookup for coloring
const slugToCategory: Record<string, VisaCategoryKey> = (() => {
	const map: Record<string, VisaCategoryKey> = {};
	for (const c of visaCategories) {
		for (const slug of c.visas) map[slug] = c.key;
	}
	return map;
})();

// Base classes applied to all outline icons for subtle polish
const BASE_ICON_CLS = "transition-colors duration-200 ease-out subpixel-antialiased";

// Tailwind color palette for categories（统一色相，专业简洁）
const CAT_COLOR: Record<VisaCategoryKey, string> = {
	work: THEME.cat.work.base,
	"status-family": THEME.cat["status-family"].base,
	"study-training": THEME.cat["study-training"].base,
	"short-others": THEME.cat["short-others"].base,
};

const CAT_RING: Record<VisaCategoryKey, string> = {
	work: THEME.cat.work.ring,
	"status-family": THEME.cat["status-family"].ring,
	"study-training": THEME.cat["study-training"].ring,
	"short-others": THEME.cat["short-others"].ring,
};

// Per-slug shades: 只在各自类别的同一色相内做明暗变化，避免“彩虹”杂乱
const SLUG_COLOR: Record<string, string> = THEME.slug;

const colorBySlug = (slug: string): string => {
	const custom = SLUG_COLOR[slug];
	if (custom) return custom;
	const cat = slugToCategory[slug];
	return (cat && CAT_COLOR[cat]) || "text-slate-500";
};

// 将如 text-indigo-600 提升一档用于 group-hover（600→700，500→600，700保持）
const hoverShadeUp = (cls: string): string => {
	const m = cls.match(/^text-([a-z-]+)-(\d{3})$/);
	if (!m) return cls;
	const [, hue, shadeStr] = m;
	const shade = parseInt(shadeStr, 10);
	const next = shade >= 700 ? shade : shade + 100;
	return `text-${hue}-${next}`;
};

const colorIconBySlug: Partial<Record<string, ComponentType<SvgProps>>> = {
	'engineer-humanities-international': EngineerIntlColorIcon,
	'business-manager': BusinessManagerColorIcon,
	'skilled-labor': SkilledLaborColorIcon,
	'technical-intern-training': TechnicalInternColorIcon,
	trainee: TraineeColorIcon,
	'care-worker': CareWorkerColorIcon,
	'specified-skilled-worker': SpecifiedSkilledColorIcon,
	'highly-skilled-professional': HighlySkilledColorIcon,
	'permanent-resident': PermanentResidentColorIcon,
	'spouse-of-japanese-national': SpouseJapaneseColorIcon,
	'spouse-of-permanent-resident': SpousePRColorIcon,
	'long-term-resident': LongTermResidentColorIcon,
	dependent: DependentColorIcon,
	student: StudentColorIcon,
	'temporary-visitor': TemporaryVisitorColorIcon,
	'designated-activities': DesignatedActivitiesColorIcon,
};

export function VisaIconBySlug({ slug, className, size, variant, ...rest }: { slug: string } & SvgProps) {
	const ColorIcon = colorIconBySlug[slug];
	const Icon = variant === 'color' && ColorIcon ? ColorIcon : visaIconBySlug[slug];
	if (!Icon) return null;
	const color = className ? "" : colorBySlug(slug);
	const hover = className ? "" : hoverShadeUp(color);
	const sizeCls = size ?? "h-5 w-5";
	const extra = variant === 'color' ? '' : `${color} group-hover:${hover}`;
	return (
		<Icon
			strokeWidth={2.1}
			{...rest}
			className={`${sizeCls} ${BASE_ICON_CLS} ${className ?? extra}`}
			aria-hidden
		/>
	);
}

export function VisaCategoryIcon({ cat, className, size, ...rest }: { cat: VisaCategoryKey } & SvgProps) {
	const Icon = categoryIconByKey[cat];
	if (!Icon) return null;
	const color = className ? "" : CAT_COLOR[cat] ?? "text-slate-500";
	const hover = className ? "" : hoverShadeUp(color);
	const sizeCls = size ?? "h-5 w-5";
	return (
		<Icon
			strokeWidth={2.1}
			{...rest}
			className={`${sizeCls} ${BASE_ICON_CLS} ${className ?? `${color} group-hover:${hover}`}`}
			aria-hidden
		/>
	);
}

export function VisaBadgeIconBySlug({ slug, size = "h-11 w-11", iconSize = "h-6 w-6" }: { slug: string; size?: string; iconSize?: string }) {
	const cat = slugToCategory[slug];
	const ring = (cat && CAT_RING[cat]) || "ring-slate-200";
	return (
		<span className={`inline-flex items-center justify-center rounded-full bg-white ring-1 ${size} ${ring}`}>
			<VisaIconBySlug slug={slug} size={iconSize} />
		</span>
	);
}

export function VisaBadgeCategoryIcon({ cat, size = "h-11 w-11", iconSize = "h-6 w-6" }: { cat: VisaCategoryKey; size?: string; iconSize?: string }) {
	const ring = CAT_RING[cat] ?? "ring-slate-200";
	return (
		<span className={`inline-flex items-center justify-center rounded-full bg-white ring-1 ${size} ${ring}`}>
			<VisaCategoryIcon cat={cat} size={iconSize} />
		</span>
	);
}

// Square tile variants (no halo), with category-colored background
const CAT_BG: Record<VisaCategoryKey, string> = {
	work: THEME.cat.work.tileBg,
	"status-family": THEME.cat["status-family"].tileBg,
	"study-training": THEME.cat["study-training"].tileBg,
	"short-others": THEME.cat["short-others"].tileBg,
};

export function VisaTileIconBySlug({ slug, size = "h-12 w-12", iconSize = "h-6 w-6" }: { slug: string; size?: string; iconSize?: string }) {
	const cat = slugToCategory[slug];
	const bg = (cat && CAT_BG[cat]) || "bg-slate-500";
	return (
		<span className={`inline-flex items-center justify-center rounded-lg ${size} ${bg}`}>
			<VisaIconBySlug slug={slug} className={`${iconSize} text-white`} />
		</span>
	);
}

export function VisaTileCategoryIcon({ cat, size = "h-11 w-11", iconSize = "h-6 w-6" }: { cat: VisaCategoryKey; size?: string; iconSize?: string }) {
	const bg = CAT_BG[cat] ?? "bg-slate-500";
	return (
		<span className={`inline-flex items-center justify-center rounded-lg ${size} ${bg}`}>
			<VisaCategoryIcon cat={cat} className={`${iconSize} text-white`} />
		</span>
	);
}

