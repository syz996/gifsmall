import type { Metadata } from 'next';
import DiscordCompressor from './DiscordCompressor';

export const metadata: Metadata = {
  title: 'GIF Compressor for Discord — Under 20 MB or 256 KB',
  description:
    'Compress a GIF for Discord in your browser. Get under the free 20 MB upload limit, or down to 256 KB so it auto-plays — no upload, no watermark, free.',
  alternates: { canonical: 'https://gifsmall.org/gif-compressor-for-discord/' },
  openGraph: {
    title: 'GIF Compressor for Discord — Under 20 MB or 256 KB',
    description:
      'Shrink a GIF to fit Discord locally. Pick 20 MB, 8 MB, 512 KB or 256 KB and the tool finds the best quality that fits.',
    url: 'https://gifsmall.org/gif-compressor-for-discord/',
    type: 'website',
  },
};

export default function Page() {
  return <DiscordCompressor />;
}