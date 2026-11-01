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
          </nav>
        </header>

        {children}

        <footer className="site-footer page-shell">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark">G</span>
            <span>GIFSmall</span>
          </Link>
          <p>Free GIF tools that run in your browser.</p>
          <span>© {new Date().getFullYear()} GIFSmall</span>
        </footer>
      </body>
    </html>
  );
}
