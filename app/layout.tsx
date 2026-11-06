import type { Metadata } from 'next';
import Link from "next/link";
import './globals.css';

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
          <nav aria-label="Main navigation">
            <Link href="/">GIF compressor</Link>
            <Link href="/gif-resizer/">GIF resizer</Link>
            <Link href="/reduce-gif-size/">Reduce GIF size</Link> 
            <Link href="/gif-compressor-for-discord/">GIF compressor for Discord</Link> 
            <Link href="/chatgpt-gif-compressor/">ChatGPT GIF compressor</Link>
          </nav>
        </header>

        {children}

        <footer className="site-footer page-shell">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">G</span>
            <span>GIFSmall</span>
          </Link>
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
          <p>Free GIF tools that run in your browser.</p>
          <span>© {new Date().getFullYear()} GIFSmall</span>
        </footer>
      </body>
    </html>
  );
}
