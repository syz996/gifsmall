import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// 只在页面内容真的改了才动这里：改完记得重新构建部署
const LASTMOD = {
  home: '2026-11-01',      // 导航加了 Reduce GIF size 一条
  resizer: '2026-11-01',   // 同上，header 由 layout 渲染，三页一起变
  reduce: '2026-11-01',    // 2026-11-01 上线
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: LASTMOD.home, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/gif-resizer/`, lastModified: LASTMOD.resizer, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/reduce-gif-size/`, lastModified: LASTMOD.reduce, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
