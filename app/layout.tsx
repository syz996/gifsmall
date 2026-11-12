import type { Metadata } from 'next';
import Link from "next/link";
import './globals.css';
import SiteNav from '@/components/SiteNav';

export const metadata: Metadata = {
  metadataBase: new URL('https://gifsmall.org'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header page-shell">
          <Link className="brand" href="/" aria-label="GIFSmall home">
            <span className="brand-mark">G</span>
            <span>GIFSmall</span>
          </Link>
          <SiteNav />
        </header>
        {children}
        <footer className="site-footer page-shell">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">G</span>
            <span>GIFSmall</span>
          </Link>
          <nav className="footer-nav" aria-label="All GIF tools">
            <Link href="/">GIF compressor</Link>
            <Link href="/gif-resizer/">Resize an animated GIF</Link>
            <Link href="/reduce-gif-size/">Compress a GIF to 10 MB, 1 MB or 512 KB</Link>
            <Link href="/gif-compressor-for-discord/">GIF compressor for Discord</Link>
            <Link href="/chatgpt-gif-compressor/">Compress a ChatGPT GIF</Link>
          </nav>
          <div className="footer-badges">
          <a
            className="footer-badge"
            href="https://twelve.tools"
            target="_blank"
            rel="noopener"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://twelve.tools/badge0-white.svg"
              alt="Featured on Twelve Tools"
              width={148}
              height={40}
              loading="lazy"
              decoding="async"
            />
          </a>
          <a
            className="footer-badge"
            href="https://startupfa.me/s/gifsmall-1?utm_source=gifsmall.org"
            target="_blank"
            rel="noopener"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://startupfa.me/badges/featured-badge-small.webp"
              alt="GIFSmall - Featured on Startup Fame"
              width={224}
              height={36}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
          <p>Free GIF tools that run in your browser.</p>
          <span>© {new Date().getFullYear()} GIFSmall</span>
        </footer>
      </body>
    </html>
  );
}
