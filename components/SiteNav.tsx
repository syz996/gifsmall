'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'GIF compressor' },
  { href: '/gif-resizer/', label: 'GIF resizer' },
  { href: '/reduce-gif-size/', label: 'Reduce GIF size' },
  { href: '/gif-compressor-for-discord/', label: 'GIF compressor for Discord' },
  { href: '/chatgpt-gif-compressor/', label: 'ChatGPT GIF compressor' },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      {LINKS.map(({ href, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
