"use client";

import Link from "next/link";
import type { AdCardContent } from "@/types/ad";
import React from "react";
import { useLocale } from "@/hooks/useLocale";
import { EP } from "@/lib/api/endpoints";
import { Building2 } from "lucide-react";

export type AdCardProps = {
  ad: AdCardContent;
};

export default function AdCard({ ad }: AdCardProps) {
  const locale = useLocale();
  const bullets = (ad.bullets ?? []).filter(Boolean).slice(0, 4);
  const variant = (ad.badgeVariant || '').toLowerCase();
  const badgeMap: Record<string, { badge: string; dot: string }> = {
    legal:  { badge: 'bg-indigo-100 text-indigo-800',  dot: 'bg-indigo-500' },
    life:   { badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    career: { badge: 'bg-violet-100 text-violet-800',  dot: 'bg-violet-500' },
    pr:     { badge: 'bg-cyan-100 text-cyan-800',      dot: 'bg-cyan-500' },
  };
  const badgeStyle = badgeMap[variant]?.badge || 'bg-slate-100 text-slate-700';
  const dotStyle = badgeMap[variant]?.dot || 'bg-teal-500';
  const hasPrimary = !!ad.primaryCtaLabel;
  const hasSecondary = !!(ad.secondaryCtaLabel && ad.secondaryCtaUrl);
  const hasButtons = hasPrimary || hasSecondary;

  // 安全归一：
  const normalizeHref = (url?: string): string => {
    if (!url) return "#";
    const u = String(url);
    // 外链或协议相对
    if (/^https?:\/\//i.test(u) || /^\/\//.test(u)) return u;
    // 站内：确保前导斜杠存在
    return u.startsWith('/') ? u : `/${u}`;
  };

  // 详细按钮跳转（新版）：
  // 1) 若有 officeSlug => 公司详情页 /{locale}/companies/{officeSlug}
  // 2) 否则 => 使用 primaryCtaUrl（站内链接补前导斜杠）
  const primaryHref = ad.officeSlug
    ? `/${locale}/companies/${ad.officeSlug}`
    : normalizeHref(ad.primaryCtaUrl);
  const secondaryHref = normalizeHref(ad.secondaryCtaUrl);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-semibold text-slate-900 clamp-2 min-w-0" data-card-title>
          {ad.title}
        </h3>
        {ad.badgeText && (
          <span className={`flex-none rounded-full px-2 py-0.5 text-xs ${badgeStyle}`}>
            {ad.badgeText}
          </span>
        )}
      </div>
      {ad.leadMd && (
        <p className="mt-1 text-[14px] leading-6 text-slate-700 whitespace-pre-wrap">
          {ad.leadMd}
        </p>
      )}
      {bullets.length > 0 && (
        <ul className="mt-2 space-y-1 text-[13px] text-slate-700">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${dotStyle}`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center ${hasButtons ? 'justify-between' : 'justify-start'} gap-3`}>
        {/* 左侧：公司名 */}
        {ad.companyName ? (
          <div className="min-w-0 max-w-full" title={ad.companyName}>
            <span className="inline-flex items-start gap-1.5 text-[15px] font-medium text-slate-800">
              <Building2 aria-hidden className="mt-[2px] h-4 w-4 text-slate-500 flex-none" />
              <span className="clamp-2 leading-5">
                {ad.companyName}
              </span>
            </span>
          </div>
        ) : <span />}
        {/* 右侧：按钮区 */}
        {hasButtons && (
          <div className="flex gap-2 justify-end shrink-0 flex-none">
            {hasPrimary && (
              <Link
                href={primaryHref}
                className="h-10 inline-flex items-center rounded-lg bg-gradient-to-br from-[#04c4b6] to-[#039991] px-4 text-white shadow-lg hover:from-[#03a898] hover:to-[#028074] focus:outline-none focus:ring-2 focus:ring-teal-300 active:scale-[.99]"
              >
                {ad.primaryCtaLabel}
              </Link>
            )}
            {hasSecondary && (
              <Link href={secondaryHref} className="h-10 inline-flex items-center rounded-lg border px-4">
                {ad.secondaryCtaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
