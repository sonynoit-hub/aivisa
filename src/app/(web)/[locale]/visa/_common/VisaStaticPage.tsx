import { getVisaDetail } from '@/lib/api/services/visa.service';
import { visaCatalog } from '@/data/visaCatalog';
import { locales, type Locale, ogLocaleMap, defaultLocale } from '@/i18n/locales';
import { notFound } from 'next/navigation';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import type { Metadata } from 'next';
import { VisaIconBySlug } from '@/features/visa/components/VisaIcon';
import { site } from '@/config/site';
import type { ComponentType } from 'react';
import { getSeoMeta } from '@/config/seo-tags';
import type { VisaPageI18n } from '@/i18n/messages/visaPages';

type Props = { params: Promise<{ locale: string }> };

type StaticPageOptions = { showHeaderIcon?: boolean; showHeaderTitle?: boolean; showSummary?: boolean; showHtml?: boolean; staticI18n?: Partial<Record<string, VisaPageI18n>> };
export function createVisaStaticPage<TDocs = unknown, TMeta = unknown>(
  catalogSlug: string,
  shortPath: string,
  extra?: ComponentType<{ locale: string; studyDocs?: TDocs; studyDocsMeta?: TMeta }>,
  opts: StaticPageOptions = {}
) {
  // 供页面与元数据共用的加载函数工厂
  function makeLoadLocalizedContent(locale: string) {
    const tryLocales = [locale, 'en', 'ja'];
    return {
      async run() {
        // 1) Prefer statically imported i18n when provided (to satisfy Turbopack HMR)
        if (opts.staticI18n) {
          for (const loc of tryLocales) {
            const data = opts.staticI18n![loc as keyof typeof opts.staticI18n];
            if (data) {
              return {
                title: typeof data.title === 'string' ? data.title : undefined,
                summary: typeof data.summary === 'string' ? data.summary : undefined,
                html: typeof data.html === 'string' ? data.html : undefined,
                studyDocs: (data as any).studyDocs,
                studyDocsMeta: {
                  stageLabels: (data as any).stageLabels,
                  categoryLabels: (data as any).categoryLabels,
                  title: (data as any).docsTitle,
                  tips: (data as any).tips,
                  stageTips: (data as any).stageTips,
                  ui: (data as any).ui,
                  actions: (data as any).actions,
                },
              } as any;
            }
          }
        }
        // 2) Fallback to dynamic import for other pages
        for (const loc of tryLocales) {
          try {
            const mod = await import(`@/i18n/messages/${loc}/visa-pages/${shortPath}.json`);
            const data = (mod as { default?: VisaPageI18n }).default || {};
            return {
              title: typeof (data as any).title === 'string' ? (data as any).title : undefined,
              summary: typeof (data as any).summary === 'string' ? (data as any).summary : undefined,
              html: typeof (data as any).html === 'string' ? (data as any).html : undefined,
              studyDocs: (data as any).studyDocs,
              studyDocsMeta: {
                stageLabels: (data as any).stageLabels,
                categoryLabels: (data as any).categoryLabels,
                title: (data as any).docsTitle,
                tips: (data as any).tips,
                stageTips: (data as any).stageTips,
                ui: (data as any).ui,
                actions: (data as any).actions,
              },
            } as any;
          } catch {}
        }
        return {} as any;
      }
    };
  }
  async function loadLocalizedContent(locale: string) { return makeLoadLocalizedContent(locale).run(); }
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
                { '@type': 'ListItem', position: 1, name: 'Home', item: `/${locale}` },
                { '@type': 'ListItem', position: 2, name: 'Visa', item: `/${locale}/visa` },
                { '@type': 'ListItem', position: 3, name: local.title || detail.title, item: `/${locale}/visa/${shortPath}` },
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
    const currentUrl = `/${locale}/visa/${shortPath}`;
    const v = visaCatalog.find(x => x.slug === catalogSlug)!;
    const local = await loadLocalizedContent(locale);
  // 优先采用集中 SEO 配置中的标题（若未设置则回退到文案/i18n/默认名）
  const staticMeta = getSeoMeta(locale as Locale, `visa/${shortPath}`);
  const title = (staticMeta as { title?: string }).title || local.title || (v.names[locale as Locale] ?? v.names.ja ?? catalogSlug);
    const description = (local.summary || '').trim();
    // legacy keywords removed per SEO policy
  const alternates: Record<string, string> = {};
  for (const l of locales) alternates[l] = `/${l}/visa/${shortPath}`;
  // 为搜索引擎提供 x-default（指向默认语言对应页）
  alternates['x-default'] = `/${defaultLocale}/visa/${shortPath}`;
    return {
      // 用户要求标题直接用“分类名-国家签证”等，不追加品牌名
      title: title,
      description: description || undefined,
      alternates: { canonical: currentUrl, languages: alternates },
      openGraph: { title: title, description: description || undefined, url: currentUrl, type: 'article', siteName: site.name, locale: ogLocaleMap[locale as Locale] },
      twitter: { card: 'summary_large_image', title: title, description: description || undefined },
    };
  }

  return Object.assign(Page, { generateMetadata });
}

// 导出：为每个 page.tsx 单独导出 generateMetadata（Next.js 需要模块级命名导出）
export function buildVisaStaticMetadata(
  catalogSlug: string,
  shortPath: string,
  opts: StaticPageOptions = {}
) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    if (!(locales as readonly string[]).includes(locale)) return {};
    const currentUrl = `/${locale}/visa/${shortPath}`;
    const v = visaCatalog.find(x => x.slug === catalogSlug)!;

    // 与页面一致的本地化加载
    async function loadLocalized(locale0: string) {
      const tryLocales = [locale0, 'en', 'ja'];
      if (opts.staticI18n) {
        for (const loc of tryLocales) {
          const data = (opts.staticI18n as any)[loc];
          if (data) return data as any;
        }
      }
      for (const loc of tryLocales) {
        try {
          const mod = await import(`@/i18n/messages/${loc}/visa-pages/${shortPath}.json`);
          return ((mod as any).default || {}) as any;
        } catch {}
      }
      return {} as any;
    }

  const data = await loadLocalized(locale);
  const staticMeta = getSeoMeta(locale as Locale, `visa/${shortPath}`);
  const title = (staticMeta as { title?: string }).title || (data.title as string | undefined) || (v.names[locale as Locale] ?? v.names.ja ?? catalogSlug);
  // 使用集中配置的描述与关键词
  const description = staticMeta.description;
  const alternates: Record<string, string> = {};
  for (const l of locales) alternates[l] = `/${l}/visa/${shortPath}`;
  // 为搜索引擎提供 x-default（指向默认语言对应页）
  alternates['x-default'] = `/${defaultLocale}/visa/${shortPath}`;

    return {
      title: title,
      description,
      alternates: { canonical: currentUrl, languages: alternates },
      openGraph: { title: title, description, url: currentUrl, type: 'article', siteName: site.name, locale: ogLocaleMap[locale as Locale] },
      twitter: { card: 'summary_large_image', title: title, description },
    };
  };
}
