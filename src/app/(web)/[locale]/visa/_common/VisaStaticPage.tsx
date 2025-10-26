import { getVisaDetail } from '@/lib/api/services/visa.service';
import { visaCatalog } from '@/data/visaCatalog';
import { locales, type Locale, ogLocaleMap } from '@/i18n/locales';
import { notFound } from 'next/navigation';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import type { Metadata } from 'next';
import { VisaIconBySlug } from '@/features/visa/components/VisaIcon';
import { site } from '@/config/site';
import type { ComponentType } from 'react';
import type { VisaPageI18n } from '@/i18n/messages/visaPages';

type Props = { params: Promise<{ locale: string }> };

type StaticPageOptions = { showHeaderIcon?: boolean; showHeaderTitle?: boolean; showSummary?: boolean; showHtml?: boolean; staticI18n?: Partial<Record<string, VisaPageI18n>> };
export function createVisaStaticPage<TDocs = unknown, TMeta = unknown>(
  catalogSlug: string,
  shortPath: string,
  extra?: ComponentType<{ locale: string; studyDocs?: TDocs; studyDocsMeta?: TMeta }>,
  opts: StaticPageOptions = {}
) {
  async function loadLocalizedContent(locale: string) {
    const tryLocales = [locale, 'en', 'ja'];
    // 1) Prefer statically imported i18n when provided (to satisfy Turbopack HMR)
    if (opts.staticI18n) {
      for (const loc of tryLocales) {
        const data = opts.staticI18n[loc];
        if (data) {
          return {
            title: typeof data.title === 'string' ? data.title : undefined,
            summary: typeof data.summary === 'string' ? data.summary : undefined,
            html: typeof data.html === 'string' ? data.html : undefined,
            studyDocs: data.studyDocs,
            studyDocsMeta: {
              stageLabels: data.stageLabels,
              categoryLabels: data.categoryLabels,
              title: data.docsTitle,
              tips: data.tips,
              stageTips: data.stageTips,
              ui: data.ui,
              actions: data.actions,
            },
          } as Partial<{ title: string; summary: string; html: string; studyDocs: TDocs; studyDocsMeta: TMeta }>;
        }
      }
    }
    // 2) Fallback to dynamic import for other pages
    for (const loc of tryLocales) {
      try {
        const mod = await import(`@/i18n/messages/${loc}/visa-pages/${shortPath}.json`);
        const data = (mod as { default?: VisaPageI18n }).default || {};
        return {
          title: typeof data.title === 'string' ? data.title : undefined,
          summary: typeof data.summary === 'string' ? data.summary : undefined,
          html: typeof data.html === 'string' ? data.html : undefined,
          studyDocs: data.studyDocs,
          studyDocsMeta: {
            stageLabels: data.stageLabels,
            categoryLabels: data.categoryLabels,
            title: data.docsTitle,
            tips: data.tips,
            stageTips: data.stageTips,
            ui: data.ui,
            actions: data.actions,
          },
        } as Partial<{ title: string; summary: string; html: string; studyDocs: TDocs; studyDocsMeta: TMeta }>;
      } catch {}
    }
  return {} as Partial<{ title: string; summary: string; html: string; studyDocs: TDocs; studyDocsMeta: TMeta }>;
  }
  async function Page({ params }: Props) {
    const { locale } = await params;
    if (!(locales as readonly string[]).includes(locale) || !visaCatalog.some(v => v.slug === catalogSlug)) {
      notFound();
    }
    const [detail, local] = await Promise.all([
      getVisaDetail(catalogSlug, locale),
      loadLocalizedContent(locale),
    ]);
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        {(() => {
          const showIcon = opts.showHeaderIcon !== false && catalogSlug !== 'student';
          const showTitle = opts.showHeaderTitle !== false;
          if (!showIcon && !showTitle) return null;
          return (
            <h2 className={`text-2xl font-bold mb-2 ${showIcon ? 'flex items-center gap-2' : ''}`}>
              {showIcon ? <VisaIconBySlug slug={catalogSlug} /> : null}
              {showTitle ? <span>{local.title || detail.title}</span> : null}
            </h2>
          );
        })()}
        {opts.showSummary !== false && (local.summary || detail.summary) ? (
          <p className="text-sm text-gray-500 mb-6">{local.summary ?? detail.summary}</p>
        ) : null}
        {opts.showHtml !== false && (local.html || detail.html) ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(local.html ?? detail.html) }} />
        ) : null}
  {(() => { const Extra = extra; return Extra ? <Extra locale={locale} studyDocs={local.studyDocs} studyDocsMeta={local.studyDocsMeta} /> : null; })()}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.baseUrl}/${locale}` },
                { '@type': 'ListItem', position: 2, name: 'Visa', item: `${site.baseUrl}/${locale}/visa` },
                { '@type': 'ListItem', position: 3, name: local.title || detail.title, item: `${site.baseUrl}/${locale}/visa/${shortPath}` },
              ]
            })
          }}
        />
      </div>
    );
  }

  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    if (!(locales as readonly string[]).includes(locale)) return {};
    const base = site.baseUrl.replace(/\/$/, '');
    const currentUrl = `${base}/${locale}/visa/${shortPath}`;
    const v = visaCatalog.find(x => x.slug === catalogSlug)!;
    const local = await loadLocalizedContent(locale);
    const title = local.title || (v.names[locale as Locale] ?? v.names.ja ?? catalogSlug);
    const description = (local.summary || '').trim();
    const keywords: string[] = [
      title,
      'visa', 'status of residence',
      'documents', 'requirements',
      // localized common tokens
      ...(locale === 'ja' ? ['在留資格', '必要書類', '要件'] : []),
      ...(locale === 'zh' ? ['在留资格', '所需材料', '申请条件'] : []),
      ...(locale === 'ko' ? ['재류자격', '필요서류', '요건'] : []),
      ...(locale === 'vi' ? ['tư cách lưu trú', 'hồ sơ', 'yêu cầu'] : []),
    ];
    const alternates: Record<string, string> = {};
    for (const l of locales) alternates[l] = `${base}/${l}/visa/${shortPath}`;
    return {
      title: `${title} | ${site.name}`,
      description: description || undefined,
      keywords,
      alternates: { canonical: currentUrl, languages: alternates },
      openGraph: { title: `${title} | ${site.name}`, description: description || undefined, url: currentUrl, type: 'article', siteName: site.name, locale: ogLocaleMap[locale as Locale] },
      twitter: { card: 'summary_large_image', title: `${title} | ${site.name}`, description: description || undefined },
    };
  }

  return Object.assign(Page, { generateMetadata });
}
