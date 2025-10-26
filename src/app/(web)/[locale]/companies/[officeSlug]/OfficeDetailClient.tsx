"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { OfficeDetail, ContactChannel, OfficeCard } from "@/types/company";
import { getOfficeDetail } from "@/lib/api/services/company.service";
import Markdown from "@/components/common/Markdown";
import AutoScrollImageStrip from "@/components/common/AutoScrollImageStrip";
import QrCodeModal from "@/components/common/QrCodeModal";
import CopyableText from "@/components/common/CopyableText";
import SafeImage from "@/components/common/SafeImage";
import {
  Globe,
  Mail,
  Phone,
  ExternalLink,
  MessageCircle,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Github,
} from "lucide-react";

type Props = { locale: string; officeSlug: string };

function Badge({ text, variant }: { text?: string; variant?: string }) {
  const v = (variant || '').toLowerCase();
  const map: Record<string, string> = {
    legal: "bg-indigo-100 text-indigo-800",
    life: "bg-emerald-100 text-emerald-800",
    career: "bg-violet-100 text-violet-800",
    pr: "bg-cyan-100 text-cyan-800",
  };
  const cls = map[v] || "bg-slate-100 text-slate-700";
  if (!text) return null;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{text}</span>;
}

export default function OfficeDetailClient({ locale, officeSlug }: Props) {
  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getOfficeDetail(officeSlug, locale, { timeoutMs: 20000 })
      .then((res) => {
        if (mounted) setOffice(res);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        if (mounted) setError(msg || "Failed to load");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [locale, officeSlug]);

  const channelItems = useMemo(() => {
    if (!office) return [] as Array<{ platform: string; url?: string; id?: string; label?: string; qrUrl?: string }>;
    const raw = office.contactChannelsJson as Record<string, ContactChannel | ContactChannel[]> | string | undefined;
    let parsed: Record<string, ContactChannel | ContactChannel[]> | undefined;
    if (typeof raw === 'string') {
      try { parsed = JSON.parse(raw) as Record<string, ContactChannel | ContactChannel[]>; } catch { parsed = undefined; }
    } else parsed = raw as Record<string, ContactChannel | ContactChannel[]> | undefined;
    const entries = parsed ? Object.entries(parsed) : [];
    return entries.flatMap(([platform, value]) => {
      const arr: ContactChannel[] = Array.isArray(value) ? value : (value ? [value] : []);
      return arr
        .filter(Boolean)
        .map((entry: ContactChannel) => {
          const isPublic = Boolean((entry as ContactChannel)?.is_public ?? (entry as ContactChannel)?.isPublic);
          if (!isPublic) return null;
          const url = (entry as ContactChannel)?.url || (entry as Record<string, unknown>)?.["href"] as string | undefined || (entry as Record<string, unknown>)?.["link"] as string | undefined || undefined;
          const id = (entry as ContactChannel)?.id || (entry as ContactChannel)?.phone || undefined;
          if (!url && !id) return null;
          const label = (entry as ContactChannel)?.label || undefined;
          const qrUrl = (entry as ContactChannel)?.qr_url || (entry as ContactChannel)?.qrUrl || undefined;
          return { platform, url, id, label, qrUrl };
        })
        .filter(Boolean) as Array<{ platform: string; url?: string; id?: string; label?: string; qrUrl?: string }>;
    });
  }, [office]);

  // Helpers for channel/platform presentation
  const channelIconFor = (platform: string) => {
    const p = (platform || "").toLowerCase();
    if (p.includes("line")) return LinkIcon;
    if (p.includes("wechat") || p.includes("weixin")) return LinkIcon;
    if (p.includes("whatsapp")) return Phone;
    if (p.includes("telegram")) return LinkIcon;
    if (p.includes("facebook")) return Facebook;
    if (p.includes("twitter") || p === "x") return Twitter;
    if (p.includes("instagram")) return Instagram;
    if (p.includes("linkedin")) return Linkedin;
    if (p.includes("youtube")) return Youtube;
    if (p.includes("github")) return Github;
    return LinkIcon;
  };

  const snsIconBg = (keyOrUrl: string) => {
    const s = (keyOrUrl || "").toLowerCase();
    if (s.includes("instagram")) return "bg-pink-100 text-pink-600";
    if (s.includes("x.com") || s.includes("twitter")) return "bg-slate-100 text-slate-700";
    if (s.includes("facebook")) return "bg-blue-100 text-blue-600";
    if (s.includes("linkedin")) return "bg-sky-100 text-sky-700";
    if (s.includes("youtube")) return "bg-red-100 text-red-600";
    if (s.includes("github")) return "bg-slate-100 text-slate-700";
    return "bg-slate-100 text-slate-600";
  };

  const cardsSorted: OfficeCard[] = useMemo(() => {
    if (!office) return [] as OfficeCard[];
    const cards = Array.isArray(office.cards) ? office.cards : [] as OfficeCard[];
    return [...cards].sort((a, b) => {
      const ao = typeof a?.order === 'number' ? a.order! : Number.POSITIVE_INFINITY;
      const bo = typeof b?.order === 'number' ? b.order! : Number.POSITIVE_INFINITY;
      return ao - bo;
    });
  }, [office]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-2/3 bg-slate-200 rounded" />
            <div className="h-5 w-1/2 bg-slate-200 rounded" />
            <div className="h-64 w-full bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-slate-200 rounded-2xl" />
                <div className="h-40 bg-slate-200 rounded-2xl" />
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-48 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !office) {
    const msg = error || '';
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">会社詳細を一時的に読み込めません</h1>
          <p className="text-slate-600 mb-6">サービスが一時的に利用できないか、応答が遅延しています。しばらくしてからもう一度お試しください。</p>
          {msg && <pre className="text-xs text-slate-500 bg-slate-100 p-3 rounded-md overflow-auto">{String(msg)}</pre>}
          <div className="mt-6">
            <a href={`/${locale}/companies/${officeSlug}`} className="inline-flex items-center rounded-md bg-[#04c4b6] px-4 py-2 text-white hover:opacity-90">再読み込み</a>
          </div>
        </div>
      </main>
    );
  }

  const snsEntries: [string, string][] = office.sns ? (Object.entries(office.sns) as [string, string][]) : [];
  const addressZip = typeof office.address === 'object' ? office.address?.zip : undefined;
  const addressLineNoZip = typeof office.address === 'string'
    ? office.address
    : office.address
    ? [office.address.pref, office.address.city, office.address.line1, office.address.line2, office.address.country].filter(Boolean).join(' ')
    : '';

  const imagesSorted = (office.images && office.images.length > 0)
    ? [...office.images].sort((a, b) => {
        const aSort = typeof a.sort === 'number' ? a.sort : 999;
        const bSort = typeof b.sort === 'number' ? b.sort : 999;
        return aSort - bSort;
      })
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 sm:pt-9 lg:px-8 lg:pt-10">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 break-words leading-tight">{office.name}</h1>
            {office.badgeText && <Badge text={office.badgeText} variant={office.badgeVariant} />}
          </div>
          {office.shortDesc && (
            <p className="text-slate-600 text-lg sm:text-xl leading-snug sm:leading-relaxed max-w-3xl mb-4 sm:mb-5">{office.shortDesc}</p>
          )}
          {(office.languages?.length || office.services?.length) && (
            <div className="flex flex-wrap gap-2">
              {office.languages?.map((lng: string) => (
                <span key={`lang-${lng}`} className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm sm:text-base font-medium text-slate-700 shadow-sm hover:border-[#04c4b6] hover:shadow-md transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current text-slate-500">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                  </svg>
                  <span>{lng.toUpperCase()}</span>
                </span>
              ))}
              {office.services?.map((s) => (
                <span key={`svc-${s}`} className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm sm:text-base font-medium text-slate-700 shadow-sm hover:border-[#04c4b6] hover:shadow-md transition-all">
                  {s}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Full-width Images Gallery */}
        {imagesSorted.length > 0 && (
          <section className="my-6 sm:my-8 md:my-10">
            <AutoScrollImageStrip images={imagesSorted} />
          </section>
        )}

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced JSON Cards */}
            {cardsSorted.length > 0 && (
              <div className="space-y-8">
                {cardsSorted.map((c, idx) => {
                  const oc = c as OfficeCard;
                  const ocr = oc as Record<string, unknown>;
                  const title = oc.title || oc.name || oc.heading || oc.label;
                  const desc = oc.desc || oc.lead || oc.description || oc.text || oc.content;
                  const subtitle = oc.subtitle || (ocr.subTitle as string) || (ocr.sub_title as string);
                  const pill = oc.pill || (ocr.badge as string) || (ocr.tag as string);
                  const href = oc.url || oc.href || (ocr.ctaUrl as string) || oc.cta_primary_url || (ocr.ctaPrimaryUrl as string);
                  const emoji = oc.emoji as string | undefined;
                  const icon = oc.icon as string | undefined;
                  const imageUrl = oc.imageUrl || (ocr.image_url as string) || (ocr.image as string);
                  const defaultCta = (locale || '').startsWith('ja') ? '詳しく見る' : ((locale || '').startsWith('zh') ? '查看详情' : 'Learn more');
                  const ctaPrimary = oc.cta_primary || (ocr.ctaPrimary as string) || oc.ctaLabel || defaultCta;
                  const ctaSecondary = oc.cta_secondary || (ocr.ctaSecondary as string) || undefined;
                  const ctaSecondaryUrl = oc.cta_secondary_url || (ocr.ctaSecondaryUrl as string) || undefined;
                  const bullets = Array.isArray(oc.bullets) ? (oc.bullets.filter(Boolean) as string[]) : [];
                  const details = Array.isArray(oc.detail) ? (oc.detail.filter(Boolean) as string[]) : [];
                  return (
                    <article key={idx} className="group bg-white rounded-3xl border-2 border-slate-200 shadow-md hover:shadow-2xl hover:border-[#04c4b6] transition-all duration-300 overflow-hidden">
                      {imageUrl && (
                        <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden">
                          <SafeImage src={String(imageUrl)} alt={title ? String(title) : ''} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          {pill && (
                            <div className="absolute top-4 right-4">
                              <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1 shadow-sm">
                                {String(pill)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-8 sm:p-10">
                        {(title || emoji || icon || (pill && !imageUrl)) && (
                          <div className="mb-6">
                            <div className="flex items-start gap-4 mb-3">
                              {emoji && (
                                <span className="text-4xl sm:text-5xl flex-shrink-0" role="img" aria-hidden="true">{String(emoji)}</span>
                              )}
                              {icon && !emoji && (
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#04c4b6]/10 to-[#039991]/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-2xl text-[#04c4b6]">{String(icon)}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  {title && (<h3 className="text-xl sm:text-2xl font-bold text-slate-900 break-words leading-tight">{String(title)}</h3>)}
                                  {pill && !imageUrl && (
                                    <span className="inline-block rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium px-3 py-1">{String(pill)}</span>
                                  )}
                                </div>
                                {subtitle && (<p className="text-sm sm:text-base text-slate-500 leading-relaxed">{String(subtitle)}</p>)}
                              </div>
                            </div>
                          </div>
                        )}
                        {desc && (<p className="text-slate-700 leading-relaxed mb-6 text-lg sm:text-xl">{String(desc)}</p>)}
                        {bullets.length > 0 && (
                          <div className="mb-6">
                            <ul className="space-y-3">
                              {bullets.map((b: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-lg sm:text-xl text-slate-700">
                                  <svg className="w-6 h-6 text-[#04c4b6] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  <span className="flex-1">{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {details.length > 0 && (
                          <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                            <ul className="space-y-3">
                              {details.map((d: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-slate-600">
                                  <span className="inline-block w-2 h-2 rounded-full bg-slate-400 flex-shrink-0 mt-2" />
                                  <span className="flex-1">{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(href || ctaSecondary) && (
                          <div className="flex flex-wrap gap-4 pt-2">
                            {href && (
                              <a href={String(href)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#04c4b6] to-[#039991] text-white px-6 py-3 text-base font-semibold hover:from-[#03a898] hover:to-[#028074] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline" target={String(href).startsWith('http') ? '_blank' : undefined} rel={String(href).startsWith('http') ? 'noopener noreferrer' : undefined}>
                                <span>{String(ctaPrimary)}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                </svg>
                              </a>
                            )}
                            {ctaSecondary && (
                              ctaSecondaryUrl ? (
                                <a href={String(ctaSecondaryUrl)} className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white text-slate-700 px-6 py-3 text-base font-semibold hover:border-slate-400 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200 no-underline" target={String(ctaSecondaryUrl).startsWith('http') ? '_blank' : undefined} rel={String(ctaSecondaryUrl).startsWith('http') ? 'noopener noreferrer' : undefined}>
                                  {String(ctaSecondary)}
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500 px-6 py-3 text-base font-semibold">
                                  {String(ctaSecondary)}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {office.descriptionMd && (
              <article className="bg-white rounded-3xl border-2 border-slate-200 shadow-md hover:shadow-2xl hover:border-[#04c4b6] transition-all duration-300 p-8 sm:p-10">
                <div className="prose prose-slate prose-xl max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mb-4 prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200 prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mb-2 prose-h3:mt-6 prose-h4:text-base prose-h4:sm:text-lg prose-h4:mb-2 prose-h4:mt-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-[#04c4b6] prose-a:no-underline prose-a:font-medium hover:prose-a:text-[#039991] hover:prose-a:underline prose-a:transition-colors prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-4 prose-ul:space-y-2 prose-ol:my-4 prose-ol:space-y-2">
                  <Markdown className="prose" >{office.descriptionMd}</Markdown>
                </div>
              </article>
            )}

          </div>

          {/* Right */}
          <aside className="space-y-8">
            {/* お問い合わせ */}
            {(office.websiteUrl || office.email || office.phone || addressZip || addressLineNoZip) && (
              <section className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-5">お問い合わせ</h2>

                <div className="space-y-4">
                  {office.websiteUrl && (
                    <a href={office.websiteUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
                      <Globe className="w-5 h-5 text-[#04c4b6] flex-shrink-0" strokeWidth={2} />
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-800 font-medium text-sm truncate group-hover:text-[#04c4b6]">{office.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
                      </div>
                    </a>
                  )}

                  {office.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#04c4b6] flex-shrink-0" strokeWidth={2} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CopyableText text={office.email} className="text-slate-800 font-medium text-sm" />
                          <a href={`mailto:${office.email}`} className="inline-flex items-center gap-1 rounded-md bg-[#04c4b6] px-2.5 py-1 text-xs text-white hover:opacity-90 transition-opacity flex-shrink-0">
                            <Mail className="w-3.5 h-3.5" />
                            送信
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {office.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#04c4b6] flex-shrink-0" strokeWidth={2} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CopyableText text={office.phone} className="text-slate-800 font-medium text-sm" />
                          <a href={`tel:${office.phone}`} className="inline-flex items-center gap-1 rounded-md bg-[#04c4b6] px-2.5 py-1 text-xs text-white hover:opacity-90 transition-opacity flex-shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                            発信
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {(addressZip || addressLineNoZip) && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#04c4b6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-800 text-sm leading-relaxed">
                          {addressZip && <div className="font-medium">〒{addressZip}</div>}
                          {addressLineNoZip && <div>{addressLineNoZip}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* SNS・チャット */}
            {(channelItems.length > 0 || snsEntries.length > 0) && (
              <section className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-5">SNS・チャット</h2>

                {channelItems.length > 0 && (
                  <ul className="space-y-4">
                    {channelItems.map((ch, i) => {
                      const platform = (ch.platform || '').toLowerCase();
                      const isLine = platform.includes('line');
                      const isWechat = platform.includes('wechat');
                      const isFacebook = platform.includes('facebook');
                      
                      const tile = isLine
                        ? 'bg-gradient-to-br from-[#06C755] to-[#05B04B] text-white shadow-lg shadow-[#06C755]/30'
                        : isWechat
                        ? 'bg-gradient-to-br from-[#1AAD19] to-[#159914] text-white shadow-lg shadow-[#1AAD19]/30'
                        : isFacebook
                        ? 'bg-gradient-to-br from-[#1877F2] to-[#1366D9] text-white shadow-lg shadow-[#1877F2]/30'
                        : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 shadow-md';
                      
                      const PlatformIcon = isFacebook ? Facebook : MessageCircle;
                      const platformLabel = isLine ? 'LINE' : isWechat ? 'WeChat' : isFacebook ? 'Facebook' : ch.platform;
                      const title = ch.label || (isLine ? 'LINE公式アカウント' : ch.platform);
                      const subtitle = ch.id || '';
                      
                      return (
                        <li key={i} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tile}`}>
                              <PlatformIcon className="w-5 h-5 drop-shadow-sm" strokeWidth={2.5} />
                            </div>
                            <div className="text-xs font-medium text-slate-600">{platformLabel}</div>
                          </div>
                          <div className="min-w-0 flex-1 pt-1">
                            <div className="text-slate-900 font-bold text-lg leading-tight mb-1.5 truncate">{title}</div>
                            {subtitle && <div className="text-slate-600 text-base mb-2.5 truncate">{subtitle}</div>}
                            <div className="flex items-center gap-3 flex-wrap">
                              {ch.qrUrl && <QrCodeModal qrUrl={ch.qrUrl} platformLabel={ch.label || ch.platform} />}
                              {ch.url && (
                                <a href={ch.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#04c4b6] hover:text-[#039991] text-sm font-semibold transition-colors">
                                  <ExternalLink className="w-4 h-4" />
                                  開く
                                </a>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {channelItems.length > 0 && snsEntries.length > 0 && (
                  <div className="my-6 border-t border-slate-200" />
                )}

                {snsEntries.length > 0 && (
                  <div className="flex items-center justify-center gap-4">
                    {snsEntries.filter(([k]) => /(\bx\b|twitter|linkedin)/i.test(k)).map(([k, v]) => {
                      const isX = /(^x$|twitter)/i.test(k);
                      const isLinkedIn = /linkedin/i.test(k);
                      const bgGradient = isX 
                        ? 'bg-gradient-to-br from-black to-zinc-800 shadow-lg shadow-black/30' 
                        : isLinkedIn 
                        ? 'bg-gradient-to-br from-[#0A66C2] to-[#084F99] shadow-lg shadow-[#0A66C2]/30'
                        : 'bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg shadow-slate-900/30';
                      const Icon = isX ? Twitter : isLinkedIn ? Linkedin : LinkIcon;
                      return (
                        <a key={k} href={v} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgGradient} text-white hover:shadow-xl transition-shadow`}>
                          <Icon className="w-5 h-5 drop-shadow-sm" strokeWidth={2.5} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Office Images moved here in original server version – keep gallery above, so skip duplication */}

          </aside>
        </div>
      </div>
    </main>
  );
}
