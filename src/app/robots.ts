import type { MetadataRoute } from 'next';
import { getPublicBaseUrl } from '@/config/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getPublicBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin']
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
