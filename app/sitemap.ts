import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

const LASTMOD = '2026-10-30';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: LASTMOD, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/gif-resizer/`, lastModified: LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
  ];
}