import { getOfficeDetail } from "@/lib/api/services/company.service";
import type { OfficeDetail } from "@/types/company";
import Link from "next/link";
import Markdown from "@/components/common/Markdown";
import AutoScrollImageStrip from "@/components/common/AutoScrollImageStrip";
import QrCodeModal from "@/components/common/QrCodeModal";
import CopyableText from "@/components/common/CopyableText";
import { parseJson } from "@/lib/utils/parseJson";
import type { ContactChannelsMap } from "@/types/company";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; officeSlug: string }> }) {
  const { locale, officeSlug } = await params;
  const office: OfficeDetail = await getOfficeDetail(officeSlug, locale);
  const title = office.seoTitle || `${office.name} | aivisa`;
  const description = office.seoDesc || office.shortDesc || undefined;
  const openGraph = office.ogImageUrl ? { images: [{ url: office.ogImageUrl }] } : undefined;
  return { title, description, openGraph };
}

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

export default async function OfficeDetailPage({ params }: { params: Promise<{ locale: string; officeSlug: string }> }) {
  const { locale, officeSlug } = await params;
  const office: OfficeDetail = await getOfficeDetail(officeSlug, locale);
  // 解析直连咨询渠道：支持对象或数组形态，按平台打平，仅展示 is_public = true 且存在 url 或 id 的条目
  const channelsRaw = parseJson<Record<string, any>>(office.contactChannelsJson, {});
  const channelItems: Array<{ platform: string; url?: string; id?: string; label?: string; qrUrl?: string }> = Object.entries(channelsRaw)
    .flatMap(([platform, value]) => {
      const arr = Array.isArray(value) ? value : (value ? [value] : []);
      return arr
        .filter(Boolean)
        .map((entry: any) => {
          const isPublic = Boolean(entry?.is_public ?? entry?.isPublic);
          if (!isPublic) return null;
          const url = entry?.url || entry?.href || entry?.link || undefined;
          const id = entry?.id || entry?.phone || undefined;
          if (!url && !id) return null;
          const label = entry?.label || undefined;
          const qrUrl = entry?.qr_url || entry?.qrUrl || undefined;
          return { platform, url, id, label, qrUrl };
        })
        .filter(Boolean) as Array<{ platform: string; url?: string; id?: string; label?: string; qrUrl?: string }>;
    });

  // 安全窄化：cards / sns
  // 优先使用标准化后的 office.cards；若为空，则尝试从可能的原始字段回退解析
  let cards = Array.isArray(office.cards) ? office.cards : [] as any[];
  if (!cards.length) {
    const rawCandidate = (office as any)?.cardsJson
      ?? (office as any)?.cards_json
      ?? (office as any)?.cardsJSON
      ?? (office as any)?.cards
      ?? (office as any)?.i18n?.cardsJson
      ?? (office as any)?.i18n?.cards_json
      ?? (office as any)?.i18n?.cardsJSON
      ?? (office as any)?.i18n?.cards;
    let parsed: any = rawCandidate;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = [];
      }
    }
    // 情况1：{ cards: {...} } - 可能是“单卡片对象”或“命名卡片对象映射”
    if (parsed && typeof parsed === 'object' && parsed.cards && typeof parsed.cards === 'object' && !Array.isArray(parsed.cards)) {
      const cardsObj = parsed.cards;
      // 如果 cardsObj 本身呈现为卡片形状（包含常见字段），或其值几乎都不是纯对象（如字符串/数组），则当作单卡片
      const likelyCardKeys = [
        'title','name','heading','label','subtitle','subTitle','sub_title',
        'desc','description','lead','text','content','emoji','icon','pill','badge','tag',
        'bullets','detail','url','href','cta_primary','ctaPrimary','ctaLabel','ctaUrl','cta_primary_url','ctaPrimaryUrl'
      ];
      const hasCardHints = likelyCardKeys.some(k => Object.prototype.hasOwnProperty.call(cardsObj, k));
      const values = Object.values(cardsObj);
      const hasObjectChildren = values.some(v => v && typeof v === 'object' && !Array.isArray(v));

      if (hasCardHints || !hasObjectChildren) {
        // 单卡片对象
        cards = [cardsObj];
      } else {
        // 命名映射：{ key1: {...}, key2: {...} }
        const entries = Object.entries(cardsObj).filter(([_, v]) => v && typeof v === 'object');
        cards = entries.map(([key, v]) => ({ key, ...(v as any) }));
      }
    }
    // 情况2：{ cards: [...] } - 数组
    else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.cards)) {
      cards = parsed.cards;
    }
    // 情况3：直接是数组
    else if (Array.isArray(parsed)) {
      cards = parsed;
    }
    // 情况4：对象映射，如 { legal: {...}, career: {...} }（没有 cards 包装）
    else if (parsed && typeof parsed === 'object') {
      const entries = Object.entries(parsed).filter(([_, v]) => v && typeof v === 'object');
      cards = entries.map(([key, v]) => ({ key, ...(v as any) }));
    }
  }
  const snsEntries: [string, string][] = office.sns ? Object.entries(office.sns) as [string, string][] : [];

  const addressText = typeof office.address === 'string'
    ? office.address
    : office.address
    ? [
        office.address.zip,
        office.address.pref,
        office.address.city,
        office.address.line1,
        office.address.line2,
        office.address.country,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  // 提取邮编与不含邮编的地址行，便于“邮编一行 + 地址一行”的展示
  const addressZip = typeof office.address === 'object' ? office.address?.zip : undefined;
  const addressLineNoZip = typeof office.address === 'string'
    ? office.address
    : office.address
    ? [
        office.address.pref,
        office.address.city,
        office.address.line1,
        office.address.line2,
        office.address.country,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  // 若卡片包含 order 字段，则按 order 升序排列，未定义的排在后面
  const cardsSorted = Array.isArray(cards)
    ? [...cards].sort((a: any, b: any) => {
        const ao = typeof a?.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
        const bo = typeof b?.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
        return ao - bo;
      })
    : cards;

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
                {office.languages?.map((lng) => (
                  <span key={`lang-${lng}`} className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm sm:text-base font-medium text-slate-700 shadow-sm hover:border-[#04c4b6] hover:shadow-md transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current text-slate-500">
                      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                    </svg>
                    <span>{lng.toUpperCase?.() || lng}</span>
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

          {/* Full-width Images Gallery - auto scroll every 3s, no title (moved here after header) */}
          {office.images && office.images.length > 0 && (() => {
            const imagesSorted = [...office.images].sort((a, b) => {
              const aSort = typeof a.sort === 'number' ? a.sort : 999;
              const bSort = typeof b.sort === 'number' ? b.sort : 999;
              return aSort - bSort;
            });
            return (
              <section className="my-6 sm:my-8 md:my-10">
                <AutoScrollImageStrip images={imagesSorted as any} />
              </section>
            );
          })()}

          {/* Main */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              {/* Office Images Gallery moved below into the sidebar after SNS */}

              {/* Enhanced JSON Cards with modern design */}
              {cardsSorted.length > 0 && (
                <div className="space-y-8">
                  {cardsSorted.map((c, idx) => {
                    const title = (c as any).title || (c as any).name || (c as any).heading || (c as any).label;
                    const desc = (c as any).desc || (c as any).lead || (c as any).description || (c as any).text || (c as any).content;
                    const subtitle = (c as any).subtitle || (c as any).subTitle || (c as any).sub_title;
                    const pill = (c as any).pill || (c as any).badge || (c as any).tag;
                    const href = (c as any).url || (c as any).href || (c as any).ctaUrl || (c as any).cta_primary_url || (c as any).ctaPrimaryUrl;
                    const emoji = (c as any).emoji;
                    const icon = (c as any).icon;
                    const imageUrl = (c as any).imageUrl || (c as any).image_url || (c as any).image;
                    const defaultCta = (locale || '').startsWith('ja') ? '詳しく見る' : ((locale || '').startsWith('zh') ? '查看详情' : 'Learn more');
                    const ctaPrimary = (c as any).cta_primary || (c as any).ctaPrimary || (c as any).ctaLabel || defaultCta;
                    const ctaSecondary = (c as any).cta_secondary || (c as any).ctaSecondary || undefined;
                    const ctaSecondaryUrl = (c as any).cta_secondary_url || (c as any).ctaSecondaryUrl || undefined;
                    const bullets = Array.isArray((c as any).bullets) ? (c as any).bullets.filter(Boolean) : [];
                    const details = Array.isArray((c as any).detail) ? (c as any).detail.filter(Boolean) : [];
                    const variant = (c as any).variant || 'default'; // 支持不同视觉风格
                    
                    return (
                      <article 
                        key={idx} 
                        className="group bg-white rounded-3xl border-2 border-slate-200 shadow-md hover:shadow-2xl hover:border-[#04c4b6] transition-all duration-300 overflow-hidden"
                      >
                        {/* Card Header with optional image */}
                        {imageUrl && (
                          <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden">
                            <img 
                              src={String(imageUrl)} 
                              alt={title ? String(title) : ''} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
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
                          {/* Title Section with enhanced visual hierarchy */}
                          {(title || emoji || icon || (pill && !imageUrl)) && (
                            <div className="mb-6">
                              <div className="flex items-start gap-4 mb-3">
                                {/* Icon/Emoji - 更大更醒目 */}
                                {emoji && (
                                  <span className="text-4xl sm:text-5xl flex-shrink-0" role="img" aria-hidden="true">
                                    {String(emoji)}
                                  </span>
                                )}
                                {icon && !emoji && (
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#04c4b6]/10 to-[#039991]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl text-[#04c4b6]">{String(icon)}</span>
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    {title && (
                                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 break-words leading-tight">
                                        {String(title)}
                                      </h3>
                                    )}
                                    {pill && !imageUrl && (
                                      <span className="inline-block rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium px-3 py-1">
                                        {String(pill)}
                                      </span>
                                    )}
                                  </div>
                                  {subtitle && (
                                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                                      {String(subtitle)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Description */}
                          {desc && (
                            <p className="text-slate-700 leading-relaxed mb-6 text-lg sm:text-xl">
                              {String(desc)}
                            </p>
                          )}
                          
                          {/* Enhanced Bullets with custom icons */}
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
                          
                          {/* Enhanced Details with different style */}
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
                          
                          {/* Enhanced CTA buttons */}
                          {(href || ctaSecondary) && (
                            <div className="flex flex-wrap gap-4 pt-2">
                              {href && (
                                <a 
                                  href={String(href)} 
                                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#04c4b6] to-[#039991] text-white px-6 py-3 text-base font-semibold hover:from-[#03a898] hover:to-[#028074] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
                                  target={href.toString().startsWith('http') ? '_blank' : undefined}
                                  rel={href.toString().startsWith('http') ? 'noopener noreferrer' : undefined}
                                >
                                  <span>{String(ctaPrimary)}</span>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                  </svg>
                                </a>
                              )}
                              {ctaSecondary && (
                                ctaSecondaryUrl ? (
                                  <a 
                                    href={String(ctaSecondaryUrl)} 
                                    className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white text-slate-700 px-6 py-3 text-base font-semibold hover:border-slate-400 hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200 no-underline"
                                    target={ctaSecondaryUrl.toString().startsWith('http') ? '_blank' : undefined}
                                    rel={ctaSecondaryUrl.toString().startsWith('http') ? 'noopener noreferrer' : undefined}
                                  >
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
                  <div className="prose prose-slate prose-xl max-w-none
                    prose-headings:font-bold prose-headings:text-slate-900
                    prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mb-4
                    prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200
                    prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mb-2 prose-h3:mt-6
                    prose-h4:text-base prose-h4:sm:text-lg prose-h4:mb-2 prose-h4:mt-4
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-[#04c4b6] prose-a:no-underline prose-a:font-medium hover:prose-a:text-[#039991] hover:prose-a:underline prose-a:transition-colors
                    prose-strong:text-slate-900 prose-strong:font-semibold
                    prose-ul:my-4 prose-ul:space-y-2
                    prose-ol:my-4 prose-ol:space-y-2
                    prose-li:text-slate-700 prose-li:leading-relaxed
                    prose-li:marker:text-[#04c4b6]
                    prose-blockquote:border-l-4 prose-blockquote:border-[#04c4b6] prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-4 prose-blockquote:rounded-r-lg
                    prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:shadow-lg
                    prose-hr:border-slate-200 prose-hr:my-8
                    prose-table:border-collapse prose-table:my-6
                    prose-th:bg-slate-50 prose-th:border prose-th:border-slate-200 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-slate-900
                    prose-td:border prose-td:border-slate-200 prose-td:px-4 prose-td:py-2 prose-td:text-slate-700
                    prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
                  ">
                    <Markdown>{String(office.descriptionMd)}</Markdown>
                  </div>
                </article>
              )}
            </div>

            {/* Right */}
            <aside className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-100">
                  お問合せ
                </h3>
                <div className="space-y-5">
                  {office.phone && (
                    <div className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#04c4b6]/10 text-[#04c4b6] flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                      </div>
                      <a href={`tel:${office.phone}`} className="text-base text-slate-900 hover:text-[#04c4b6] transition-colors font-medium">
                        {office.phone}
                      </a>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#04c4b6]/10 text-[#04c4b6] flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                      </div>
                      <a href={`mailto:${office.email}`} className="text-base text-slate-900 hover:text-[#04c4b6] transition-colors font-medium break-all">
                        {office.email}
                      </a>
                    </div>
                  )}
                  {(addressZip || addressLineNoZip) && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#04c4b6]/10 text-[#04c4b6] flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="text-base text-slate-900 leading-relaxed">
                        {addressZip && (
                          <div className="font-normal">〒{addressZip}</div>
                        )}
                        {addressLineNoZip && (
                          <div className="mt-0.5 font-normal">{addressLineNoZip}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {office.websiteUrl && (
                    <div className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#04c4b6]/10 text-[#04c4b6] flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <a href={office.websiteUrl} target="_blank" rel="noreferrer" className="text-base text-slate-900 hover:text-[#04c4b6] transition-colors font-medium break-all">
                        {office.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* SNS moved to bottom section */}

              {/* Images moved to full-width section below */}
            </aside>
          </div>

          {/* Bottom: SNS + Chat - ID cards above, link icons below */}
          {(snsEntries.length > 0 || channelItems.length > 0) && (() => {
            // Build unified list
            const snsItems = snsEntries.map(([k, url]) => ({ platform: k.toLowerCase(), url, id: undefined as string | undefined, label: undefined as string | undefined, qrUrl: undefined as string | undefined }));
            const itemsRaw = [...snsItems, ...channelItems.map(ci => ({ ...ci, platform: ci.platform.toLowerCase() }))];
            const dedup = new Map<string, typeof itemsRaw[number]>();
            for (const it of itemsRaw) {
              const key = `${it.platform}|${it.url || it.id || ''}`;
              if (!dedup.has(key)) dedup.set(key, it);
            }
            const items = Array.from(dedup.values());

            // Separate items with IDs vs links
            const itemsWithId = items.filter(it => !it.url && it.id);
            const itemsWithLink = items.filter(it => it.url);

            const renderIcon = (platform: string, sizeClass = 'w-5 h-5') => {
              if (platform === 'x' || platform === 'twitter') return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>);
              if (platform === 'line') return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>);
              if (platform === 'wechat') return (<svg className={sizeClass} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 14C12.596 14 7 18.775 7 24.667c0 3.194 1.748 6.053 4.487 7.978-.142.64-.524 2.358-.567 2.583-.09.468.171.46.357.334.147-.1 2.334-1.606 3.264-2.26a15.06 15.06 0 004.96.801c6.904 0 12.5-4.775 12.5-10.666C32 18.775 26.404 14 19.5 14zm-3.75 4.167a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm7.5 0a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"/><path d="M40.333 20.333c0-5.178-5.074-9.375-11.333-9.375-6.26 0-11.334 4.197-11.334 9.375 0 5.179 5.074 9.375 11.334 9.375.944 0 1.86-.097 2.74-.278.798.558 2.73 1.895 3.055 2.115.236.16.514.178.467-.302-.026-.269-.35-1.907-.457-2.508 2.81-2 4.528-4.958 4.528-8.402zM24.5 14.75a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25zm8.25 0a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25z"/></svg>);
              if (platform === 'facebook') return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
              if (platform === 'instagram') return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>);
              if (platform === 'linkedin') return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);
              if (platform === 'youtube') return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>);
              if (platform === 'whatsapp') return (<svg className={sizeClass} viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.62-6.003C.122 5.281 5.403 0 12.057 0c3.181 0 6.167 1.24 8.413 3.488a11.82 11.82 0 013.485 8.414c-.003 6.654-5.284 11.935-11.94 11.935a11.9 11.9 0 01-6.003-1.616L.057 24zm6.597-3.807c1.735 1.033 3.27 1.676 5.392 1.678 5.448.003 9.886-4.428 9.889-9.877.002-5.463-4.415-9.89-9.881-9.894-5.45 0-9.89 4.434-9.893 9.881-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.746-.97zm11.387-5.464c-.074-.123-.272-.198-.57-.347-.297-.149-1.758-.868-2.03-.967-.272-.099-.47-.148-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.413z"/></svg>);
              if (platform === 'messenger') return (<svg className={sizeClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.044 2 11.037c0 2.85 1.37 5.406 3.535 7.092V22l3.232-1.771c.98.272 2.02.42 3.1.42 5.523 0 10-4.044 10-9.037S17.523 2 12 2zm5.053 7.234l-3.035 4.82a1.2 1.2 0 01-1.73.32l-1.86-1.36-3.21 2.7a.6.6 0 01-.93-.73l3.036-4.82a1.2 1.2 0 011.73-.32l1.86 1.36 3.21-2.7a.6.6 0 01.93.73z"/></svg>);
              if (platform === 'telegram') return (<svg className={sizeClass} viewBox="0 0 24 24" fill="currentColor"><path d="M9.036 15.803l-.375 5.29c.537 0 .77-.23 1.047-.506l2.511-2.41 5.205 3.814c.954.526 1.635.25 1.89-.883l3.427-16.06h.001c.304-1.418-.511-1.972-1.44-1.626L1.12 11.01c-1.378.537-1.357 1.31-.234 1.66l5.96 1.86L19.59 6.57c.619-.407 1.18-.182.717.226"/></svg>);
              return (<svg className={sizeClass} fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>);
            };

            const clsByPlatform = (platform: string) => {
              if (platform === 'x' || platform === 'twitter') return ['bg-black','hover:bg-gray-900','text-white'];
              if (platform === 'line') return ['bg-[#06C755]','hover:bg-[#05B04C]','text-white'];
              if (platform === 'wechat') return ['bg-[#09b83e]','hover:bg-[#089a35]','text-white'];
              if (platform === 'facebook') return ['bg-[#1877F2]','hover:bg-[#166FE5]','text-white'];
              if (platform === 'instagram') return ['bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB]','hover:opacity-90','text-white'];
              if (platform === 'linkedin') return ['bg-[#0A66C2]','hover:bg-[#004182]','text-white'];
              if (platform === 'youtube') return ['bg-[#FF0000]','hover:bg-[#CC0000]','text-white'];
              if (platform === 'whatsapp') return ['bg-[#25D366]','hover:bg-[#1DA851]','text-white'];
              if (platform === 'messenger') return ['bg-[#0084FF]','hover:bg-[#0073DB]','text-white'];
              if (platform === 'telegram') return ['bg-[#26A5E4]','hover:bg-[#1b8fc6]','text-white'];
              return ['bg-slate-700','hover:bg-slate-800','text-white'];
            };

            const platformLabel = (platform: string) => {
              const labels: Record<string, string> = {
                'x': 'X',
                'twitter': 'Twitter',
                'line': 'LINE',
                'wechat': 'WeChat',
                'facebook': 'Facebook',
                'instagram': 'Instagram',
                'linkedin': 'LinkedIn',
                'youtube': 'YouTube',
                'whatsapp': 'WhatsApp',
                'messenger': 'Messenger',
                'telegram': 'Telegram',
              };
              return labels[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
            };

            return (
              <section className="mt-10 sm:mt-12">
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-8 sm:p-10">
                  <div className="mb-6 pb-4 border-b-2 border-slate-100">
                    <h4 className="text-2xl font-bold text-slate-900">SNS・チャット</h4>
                  </div>
                  
                  {/* ID cards section */}
                  {itemsWithId.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {itemsWithId.map((it, idx) => {
                        const [bg, hover, textColor] = clsByPlatform(it.platform);
                        const displayLabel = it.label || platformLabel(it.platform);
                        const platformName = platformLabel(it.platform);
                        
                        return (
                          <div
                            key={`id-${idx}`}
                            className="group relative flex gap-4 p-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-[#04c4b6] hover:shadow-lg transition-all duration-300"
                          >
                            {/* Icon with platform label below */}
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${bg} ${textColor} shadow-sm`}>
                                {renderIcon(it.platform, 'w-6 h-6')}
                              </div>
                              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                                {platformName}
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {it.label && it.label !== platformName && (
                                <p className="font-bold text-slate-900 text-base leading-tight truncate">
                                  {it.label}
                                </p>
                              )}
                              {it.id && (
                                <div>
                                  <CopyableText text={it.id} />
                                </div>
                              )}
                              {it.qrUrl && (
                                <div>
                                  <QrCodeModal qrUrl={it.qrUrl} platformLabel={platformName} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Link icons section */}
                  {itemsWithLink.length > 0 && (
                    <div className={itemsWithId.length > 0 ? 'pt-6 border-t border-slate-100' : ''}>
                      <div className="flex flex-wrap justify-center gap-4">
                        {itemsWithLink.map((it, idx) => {
                          const [bg, hover, textColor] = clsByPlatform(it.platform);
                          const displayLabel = it.label || platformLabel(it.platform);
                          
                          return (
                            <a
                              key={`link-${idx}`}
                              href={it.url!}
                              target="_blank"
                              rel="noreferrer"
                              title={displayLabel}
                              className="group transition-transform hover:-translate-y-1 duration-300"
                            >
                              <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${bg} ${textColor} ${hover} shadow-md hover:shadow-xl transition-all duration-300`}>
                                {renderIcon(it.platform, 'w-7 h-7')}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                </div>
              </section>
            );
          })()}

          {/* Gallery moved above */}
        </div>
      </main>
    );
  }
