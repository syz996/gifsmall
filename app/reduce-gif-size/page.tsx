import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import ReduceTool from './ReduceTool';

const PAGE_URL = `${SITE_URL}/reduce-gif-size/`;

const FAQS = [
  {
    q: 'How do I reduce a GIF to a specific size like 1 MB or 512 KB?',
    a: 'Load the GIF, type the limit you need (for example 512 KB) and press the button. The tool re-encodes the GIF at several frame sizes and colour counts and stops at the first result that fits under your limit, so you get the largest file that still passes.',
  },
  {
    q: 'Will reducing the file size break the animation?',
    a: 'No. Every frame is decoded, scaled and re-encoded in order, so the animation keeps its frame count and timing. Only the pixel dimensions and the colour palette get smaller.',
  },
  {
    q: 'Why does re-encoding sometimes make a GIF bigger?',
    a: 'A GIF already saved at a small size with few colours has little left to give. Re-encoding it at full size and 256 colours can add bytes instead of removing them. That is why this tool always lowers the size and colour count until your target is met, instead of just re-saving.',
  },
  {
    q: 'What size do I need for Discord, Slack or email?',
    a: 'Discord and Slack emoji need 128 × 128 px, and the standard upload limit for free servers is 8 MB (10 MB on some tiers). Most email clients stay safe under 1 MB, and a web page hero is fine around 2 MB as long as it is below the fold.',
  },
  {
    q: 'Is my GIF uploaded anywhere?',
    a: 'No. The file is decoded in your browser with the WebCodecs API and re-encoded locally, so it never leaves your device and the tool keeps working offline once loaded.',
  },
];

export const metadata: Metadata = {
  title: 'Reduce GIF Size Online — Compress GIF to 1 MB, 512 KB, Free',
  description:
    'Reduce GIF file size to a target limit right in your browser. Set 1 MB, 512 KB or any size and the tool finds the best quality that fits — no upload, no watermark.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    url: PAGE_URL,
    type: 'website',
    title: 'Reduce GIF Size Online — Compress GIF to 1 MB, 512 KB, Free',
    description:
      'Shrink a GIF to an exact file size limit locally in your browser. Keep the animation, choose 1 MB or 512 KB, download in seconds.',
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
          <h1>Reduce GIF Size</h1>
          <p className="hero-copy">
            Set the file size you need — 1 MB, 512 KB or anything else — and this tool finds the
            best quality that fits. The animation, timing and transparency stay intact, and the GIF
            is processed entirely in your browser.
          </p>
        </section>

        <ReduceTool />

        <section className="content-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Reduce a GIF to a target size in three steps</h2>
          </div>
          <div className="steps-grid">
            <div className="info-card">
              <span className="step-number">01</span>
              <h3>Drop your GIF in</h3>
              <p>The file is read locally in your browser, so nothing is uploaded.</p>
            </div>
            <div className="info-card">
              <span className="step-number">02</span>
              <h3>Pick a target size</h3>
              <p>
                Choose 1 MB, 512 KB, 256 KB or type your own limit — whatever the platform you are
                uploading to accepts.
              </p>
            </div>
            <div className="info-card">
              <span className="step-number">03</span>
              <h3>Download the result</h3>
              <p>
                The tool tries smaller dimensions and colour counts until the file fits, then shows
                you the result and two alternatives.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">SIZE LIMITS</span>
            <h2>How big can a GIF be where you are posting it?</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Typical limit</th>
                  <th>Safe target</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Discord (free server)</td><td>8 MB</td><td>512 KB – 2 MB</td></tr>
                <tr><td>Slack</td><td>1 MB for emoji</td><td>128 KB</td></tr>
                <tr><td>Twitter / X</td><td>15 MB</td><td>2 MB</td></tr>
                <tr><td>Email attachment</td><td>10–25 MB</td><td>under 1 MB</td></tr>
                <tr><td>Website hero image</td><td>—</td><td>under 1 MB</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">THE TRADE-OFF</span>
            <h2>Pixel size, colours and weight</h2>
          </div>
          <p className="section-copy">
            A GIF stores every frame as a full image, so the file size grows with the number of
            pixels per frame. Halving both the width and the height cuts the pixel data to roughly a
            quarter, which is the single biggest lever you have. The colour palette is the second
            lever: dropping from 256 to 64 colours often removes another third without a visible
            difference, while going all the way to 16 colours starts to show banding on gradients.
          </p>
          <p className="section-copy">
            If you would rather change the dimensions by hand, use the{' '}
            <Link className="text-link" href="/gif-resizer/">
              GIF resizer
            </Link>
            . If you only need a smaller file and not an exact number, the{' '}
            <Link className="text-link" href="/">
              GIF compressor
            </Link>{' '}
            gives you the same controls with a live preview.
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
          </div>
        </section>
      </div>
    </main>
  );
}