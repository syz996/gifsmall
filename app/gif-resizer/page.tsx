import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import ResizerTool from './ResizerTool';

const PAGE_URL = `${SITE_URL}/gif-resizer/`;

const FAQS = [
  {
    q: 'How do I resize a GIF without losing the animation?',
    a: 'Load the GIF in the tool above, type a new width or height, and export. Every frame is decoded, scaled and re-encoded in order, so the animation keeps its original frame count and timing. Nothing is flattened into a still image.',
  },
  {
    q: 'Does resizing a GIF reduce its file size?',
    a: 'Usually yes, and often by more than people expect. A GIF stores every frame as a full image, so halving the width and height cuts the pixel data per frame to roughly a quarter. Timing is preserved, so the result often looks close to the original while weighing far less.',
  },
  {
    q: 'What size should a GIF be for Discord or Slack emoji?',
    a: '128 × 128 pixels is the safe size for both. Discord and Slack scale emoji down to that size anyway, so a 500 × 500 emoji wastes file size for nothing and may be rejected for exceeding the upload limit.',
  },
  {
    q: 'Can I resize a GIF without uploading it?',
    a: 'Yes. This tool runs entirely in your browser using the WebCodecs API. The file is read into memory on your own device, resized frame by frame and encoded back into a GIF there — it is never sent to a server, so there is no upload wait and no copy of your file anywhere.',
  },
  {
    q: 'Will transparent backgrounds stay transparent?',
    a: 'Yes. Transparency is kept as long as the source GIF has it. The encoder stores a transparent palette index rather than flattening the image onto a white background, which is what matters for emoji, stickers and overlay graphics.',
  },
];

export const metadata: Metadata = {
  title: 'GIF Resizer — Resize Animated GIF Online, No Upload',
  description:
    'Resize GIF and animated GIF to any width and height right in your browser. Keep animation, timing and transparency — free, no upload, no watermark.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    url: PAGE_URL,
    type: 'website',
    title: 'GIF Resizer — Resize Animated GIF Online, No Upload',
    description:
      'Resize animated GIFs locally in your browser. Set any width and height, keep the animation, download in seconds.',
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
          <h1>GIF Resizer</h1>
          <p className="hero-copy">
            Resize an animated GIF to any width and height — right in your browser. Set an exact
            pixel size or scale down by percentage, keep the animation and transparency, and
            download the result without uploading anything.
          </p>
        </section>

        <ResizerTool />

        <section className="content-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>How to resize a GIF in three steps</h2>
          </div>
          <div className="steps-grid">
            <div className="info-card">
              <span className="step-number">01</span>
              <h3>Drop your GIF in</h3>
              <p>Nothing is uploaded — the file is read locally in your browser.</p>
            </div>
            <div className="info-card">
              <span className="step-number">02</span>
              <h3>Set the size</h3>
              <p>
                Type a width or height, or pick 75%, 50% or 25%. With the lock on, the aspect ratio
                is preserved so nothing gets stretched.
              </p>
            </div>
            <div className="info-card">
              <span className="step-number">03</span>
              <h3>Download</h3>
              <p>
                Every frame is scaled and re-encoded, so the animation and its timing survive the
                resize.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">SIZE VS WEIGHT</span>
            <h2>Resizing is not the same as compressing</h2>
          </div>
          <p className="section-copy">
            If your GIF is already the right dimensions and still too heavy, use the{' '}
            <Link className="text-link" href="/">
              GIF compressor
            </Link>
            . If the place you are uploading to has a hard limit such as 1 MB or 512 KB,{' '}
            <Link className="text-link" href="/reduce-gif-size/">
              reduce the file size instead
            </Link>
            : set the limit and the tool works backwards to the best quality that still fits under it.
          </p>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">CHEAT SHEET</span>
            <h2>What size should your GIF be?</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Where it will be used</th>
                  <th>Recommended size</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Discord or Slack emoji</td><td>128 × 128 px</td></tr>
                <tr><td>Twitter / X avatar</td><td>400 × 400 px</td></tr>
                <tr><td>Instagram post</td><td>1080 × 1080 px</td></tr>
                <tr><td>Email signature</td><td>600 px wide</td></tr>
                <tr><td>Website hero or banner</td><td>1200 px wide max</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">PRIVACY</span>
            <h2>Why resize locally?</h2>
          </div>
          <p className="section-copy">
            Most online GIF tools upload your file to a server, process it there and send it back.
            That means a wait on a slow connection, and a copy of your file sitting on someone
            else&apos;s disk. This page skips both: decoding, scaling and re-encoding all happen on
            your own device, so the tool works offline once loaded and your GIF never leaves the
            browser.
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
