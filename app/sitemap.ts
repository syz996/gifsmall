import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { compressGif } from '@/lib/gifEngine';

export const dynamic = 'force-static';

const LASTMOD = {
  home: '2026-11-03',      // 导航加了 Reduce GIF size 一条
  resizer: '2026-11-03',   // 同上，header 由 layout 渲染，三页一起变
  reduce: '2026-11-12',    // 2026-11-01 上线
  discord: '2026-11-12',   // 2026-11-03 上线
  compressor: '2026-11-06', 
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: LASTMOD.home, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/gif-resizer/`, lastModified: LASTMOD.resizer, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/reduce-gif-size/`, lastModified: LASTMOD.reduce, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/gif-compressor-for-discord/`, lastModified: LASTMOD.discord, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/chatgpt-gif-compressor/`, lastModified: LASTMOD.compressor, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
