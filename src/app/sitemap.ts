import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/locales';
import { visaCatalog } from '@/data/visaCatalog';
import { catalogToShort } from '@/features/visa/lib/pathMap';
import { getPublicBaseUrl } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getPublicBaseUrl();
  // 生产环境下若仍是 localhost，尽量不抛出致命错误，改为安全回退（不包含域名的 URL 会被搜索引擎视为相对路径）
  // 推荐仍在平台环境变量中设置 NEXT_PUBLIC_SITE_URL 来保证绝对 URL。
  const pages: MetadataRoute.Sitemap = [];

  // 首页
  for (const l of locales) {
    pages.push({ url: `${base}/${l}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 });
  }

  // 签证列表页
  for (const l of locales) {
  pages.push({ url: `${base}/${l}/visa/pr`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 });
  }

  // 顶部导航核心页面
  for (const l of locales) {
    pages.push({ url: `${base}/${l}/ask-ai`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
    pages.push({ url: `${base}/${l}/questionnaire`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
    // 未上线页面不输出至 sitemap
  }

  // 工具/资源页
  for (const l of locales) {
    pages.push({ url: `${base}/${l}/tools/hsp-points`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 });
  }

  // 详情与材料页（alternates 由 Next 自动生成站点级 sitemap.xml 的 <xhtml:link> 一般难直写，这里输出各语言 URL）
  for (const v of visaCatalog) {
    for (const l of locales) {
  const key = catalogToShort[v.slug] ?? v.slug;
  const url = `${base}/${l}/visa/${key}`;
      pages.push({ url, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 });
      pages.push({ url: `${url}/documents`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 });
    }
  }

  // 类别页：当前不输出（如需恢复，请根据数据源生成 URL）

  return pages;
}
