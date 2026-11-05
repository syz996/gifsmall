import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import DiscordCompressor from './DiscordCompressor';

const PAGE_URL = `${SITE_URL}/gif-compressor-for-discord/`;

const FAQS = [
  {
    q: "What is Discord's GIF size limit in 2026?",
    a: 'Free accounts can upload files up to 20 MB, the limit Discord set in August 2026 and raised from the 10 MB it used to be. Nitro Basic goes to 50 MB and Nitro up to 1 GB. Custom emoji and stickers have their own much smaller limits, listed above.',
  },
  {
    q: 'Why does my GIF not auto-play in Discord chat?',
    a: 'Discord only auto-plays GIFs that are small enough and has never published the exact threshold. In practice anything under roughly 256 KB plays by itself, while bigger files arrive as a still frame or a link you have to click. Compress to 256 KB or less and it usually plays inline.',
  },
  {
    q: 'Does compressing a GIF remove the animation or transparency?',
    a: 'No. Every frame is decoded, scaled and re-encoded in order, so the frame count and timing stay the same, and transparent pixels stay transparent. What gets smaller is the pixel data and the colour palette, which is what makes the file lighter.',
  },
  {
    q: 'Can I compress a GIF for Discord on my phone?',
    a: 'Yes. The tool runs in the browser with a Web Worker, so it works in Chrome on Android and Safari on iOS without installing anything. Large GIFs are slower on a phone than on a desktop, and a very long animation may need the dimensions reduced first.',
  },
  {
    q: 'What if the GIF is still over the limit at the lowest setting?',
    a: 'That means the source file is too heavy for the shared limit at any quality. Resize the dimensions first, then come back and compress again. Cutting the width and height in half removes about three quarters of the pixel data, which is usually enough.',
  },
];

export const metadata: Metadata = {
  title: 'GIF Compressor for Discord — Under 20 MB or 256 KB',
  description:
    'Compress a GIF for Discord in your browser. Get under the free 20 MB upload limit, or down to 256 KB so it auto-plays — no upload, no watermark, free.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    url: PAGE_URL,
    type: 'website',
    title: 'GIF Compressor for Discord — Under 20 MB or 256 KB',
    description:
      'Shrink a GIF to fit Discord locally. Pick 20 MB, 8 MB, 512 KB or 256 KB and the tool finds the best quality that fits.',
  },
};

export default function Page() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main>
      <div className="page-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />

        <section className="hero">
          <span className="eyebrow">FREE ONLINE GIF TOOL</span>
          <h1>GIF Compressor for Discord</h1>
          <p className="hero-copy">
            Discord lets free accounts upload up to 20 MB, but a GIF only auto-plays in chat once
            it is under roughly 256 KB. Drop a file, pick the limit that matters to you, and the
            tool finds the best quality that fits — entirely in your browser.
          </p>
        </section>

        <DiscordCompressor />

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">DISCORD LIMITS</span>
            <h2>Discord file size limits in 2026</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Account or context</th>
                  <th>Limit</th>
                  <th>What to pick here</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Free account</td><td>20 MB</td><td>20 MB for uploads, 256 KB to auto-play</td></tr>
                <tr><td>Nitro Basic</td><td>50 MB</td><td>20 MB is still the safe shareable size</td></tr>
                <tr><td>Nitro</td><td>up to 1 GB</td><td>20 MB unless you know the reader has Nitro</td></tr>
                <tr><td>Custom emoji</td><td>256 KB, 128 × 128 px</td><td>256 KB</td></tr>
                <tr><td>Server sticker</td><td>512 KB, 320 × 320 px</td><td>512 KB</td></tr>
              </tbody>
            </table>
          </div>
          <p className="section-copy">
            Source: Discord&apos;s File Attachments FAQ, updated August 2026. Discord says it is
            still experimenting with limits, so a small number of accounts may see different
            numbers than the ones above.
          </p>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">TWO DIFFERENT LIMITS</span>
            <h2>Uploading and auto-playing are two different limits</h2>
          </div>
          <p className="section-copy">
            The 20 MB limit decides whether Discord accepts the file at all. The auto-play
            threshold decides whether the GIF moves inside the chat, or arrives as a static frame
            nobody clicks. They are far apart, which is why a GIF that uploads fine can still feel
            broken to the person receiving it.
          </p>
          <p className="section-copy">
            Discord has never officially published the auto-play threshold, so 256 KB is the number
            that holds up in practice rather than a documented rule. If the animation matters more
            than the sharpness, target 256 KB. If it only needs to be viewable after a click, 8 MB
            is a comfortable middle ground that still opens instantly on a phone.
          </p>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">EMOJI AND STICKERS</span>
            <h2>Sizing a GIF for a custom emoji or a sticker</h2>
          </div>
          <p className="section-copy">
            Custom emoji are the tightest target on Discord: 256 KB at 128 × 128 pixels. An
            animated GIF that looks fine in a chat window is usually far too sharp and far too
            large for that box, so compress to 256 KB first, then check the edges — a 128 pixel
            square has no room for hair-thin detail.
          </p>
          <p className="section-copy">
            Server stickers sit at 512 KB and 320 × 320 pixels. That is four times the pixel area
            of an emoji, so a compressed sticker can keep noticeably more colour and shading. Both
            limits are checked by Discord when you upload, and a file that is one kilobyte over is
            rejected outright — aim slightly below the number rather than exactly at it.
          </p>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Compress a GIF for Discord in three steps</h2>
          </div>
          <div className="steps-grid">
            <div className="info-card">
              <span className="step-number">01</span>
              <h3>Drop your GIF in</h3>
              <p>The file is read locally in your browser, so nothing is uploaded to a server.</p>
            </div>
            <div className="info-card">
              <span className="step-number">02</span>
              <h3>Pick the Discord limit</h3>
              <p>
                20 MB for uploads, 256 KB for auto-play, 512 KB for a server sticker — or type any
                number of kilobytes yourself.
              </p>
            </div>
            <div className="info-card">
              <span className="step-number">03</span>
              <h3>Download the result</h3>
              <p>
                The tool lowers the dimensions and colour count until the file fits, then shows the
                result next to every version it tried.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">SIZE LIMITS</span>
            <h2>Why the 8 MB advice is out of date</h2>
          </div>
          <p className="section-copy">
            Plenty of guides still tell you Discord allows 8 MB, and a few still say 10 MB. Both
            were true at some point: the free limit moved to 10 MB and then, in August 2026, to
            20 MB. Discord documents the current number in its own File Attachments FAQ, so a
            guide that quotes 8 MB without a date has simply not been updated.
          </p>
          <p className="section-copy">
            8 MB is still useful as a target, just not as a limit. Older mobile devices, slower
            connections and the experimental caps Discord sometimes applies to some accounts all
            reward a file that is well under the maximum. If you want a GIF that opens instantly
            for everyone rather than one that merely uploads, aim lower — or{' '}
            <Link className="text-link" href="/reduce-gif-size/">
              reduce a GIF to an exact file size
            </Link>{' '}
            when you need a hard number.
          </p>
          <p className="section-copy">
            If the dimensions are the problem rather than the palette,{' '}
            <Link className="text-link" href="/gif-resizer/">
              resize the GIF first
            </Link>{' '}
            and compress afterwards — halving width and height does more in one pass than any
            colour setting. For everything else
            <Link className="text-link" href="/">
              the browser-based GIF compressor
            </Link>{' '}
            on the home page covers general use.
          </p>
        </section>

        <section className="content-section">
  <div className="section-heading">
    <span className="eyebrow">CHATGPT GIF OUTPUT</span>
    <h2>Compressing GIFs exported from ChatGPT Images 2.6</h2>
  </div>
  <p className="section-copy">
    OpenAI&apos;s Images 2.6 release, published on 4 November 2026, lists GIF creation as a new capability: ChatGPT can turn a prompt or an uploaded image into an animated GIF. What it hands you is a standard GIF file, so every Discord limit on this page applies to it exactly as it does to any other animation.
  </p>
  <p className="section-copy">
    How large that export turns out depends on the resolution and the number of frames, and it can land above what a free Discord account accepts, or above the size that auto-plays in chat. Drop the downloaded file above and pick 20 MB to get past the upload check, or 256 KB to make it move inline — the compression runs on your own device and nothing is sent to a server.
  </p>
  <p className="section-copy">
    Compressing does not change the frame count or the timing ChatGPT produced; it discards pixel detail and colour depth, which is what makes the file lighter. An animation built for a chat reply keeps its loop and gets small enough to send. If it is still too heavy at the lowest setting, reduce the dimensions first and compress again.
  </p>
</section>

        <section className="content-section faq-section" id="faq">
          <div className="section-heading">
            <span className="eyebrow">FAQ</span>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
            <details className="faq-item">
              <summary>Can I compress a GIF that ChatGPT generated?</summary>
              <p>Yes. Images 2.6 exports a standard animated GIF, and this tool reads it in the browser like any other file. Pick the Discord limit you need, download the smaller version, and the frame count and timing stay unchanged.</p>
            </details>
            <details className="faq-item">
              <summary>Why is a ChatGPT GIF too large for Discord?</summary>
              <p>GIF size grows with resolution and frame count, so an animation exported at full size can exceed the 20 MB a free Discord account accepts, or the roughly 256 KB that lets it auto-play. Compress it here first, and reduce the dimensions if it is still over the limit.</p>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
