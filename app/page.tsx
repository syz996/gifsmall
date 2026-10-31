import type { Metadata } from 'next';
import Compressor from '@/components/Compressor';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';

const TITLE = 'GIF Compressor — Compress GIF Online, No Upload';
const DESCRIPTION =
  'Compress GIF and animated GIF right in your browser. Reduce GIF file size locally with resize and color controls. Free, no upload, no watermark.';
const SHORT_DESCRIPTION =
  'Compress animated GIFs locally in your browser. Shrink the file with size and color controls — no upload, no watermark.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: TITLE,
    description: SHORT_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: SHORT_DESCRIPTION,
  },
};

const faqs = [
  {
    q: 'How do I compress a GIF?',
    a: 'Choose a GIF, adjust the resize and maximum color settings, then select Compress GIF. Preview the result and download it if you are happy with the output.',
  },
  {
    q: 'Are my GIF files uploaded?',
    a: 'No. The compression runs in your browser using a Web Worker. Your selected file is processed locally and is not sent to our server.',
  },
  {
    q: 'Will compression reduce image quality?',
    a: 'It can. Reducing dimensions or the color palette may affect sharpness, gradients, and transparency. Try a higher color count or a larger size if the result looks too rough.',
  },
  {
    q: 'Will the compressed GIF keep its animation?',
    a: 'The tool is designed to decode and encode animated frames. Some complex GIFs with unusual transparency or frame disposal behavior may render differently, so always preview the output before using it.',
  },
  {
    q: 'Can I use GIFSmall on mobile?',
    a: 'You can use the page on a modern mobile browser, but large GIFs may require substantial memory and processing time. Desktop browsers are recommended for large files.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'There is no server upload limit because files are processed locally. Practical limits depend on your device memory, browser, GIF dimensions, and frame count.',
  },
  {
    q: 'Does GIFSmall add a watermark?',
    a: 'No watermark is added to the output.',
  },
  {
    q: 'Why is the output file sometimes larger?',
    a: 'Some GIFs are already highly optimized. Re-encoding can occasionally increase file size; compare the before and after sizes and keep the original if it is smaller.',
  },
];

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default function Home() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <main className="page-shell">

      <section className="hero">
        <span className="eyebrow">FREE ONLINE GIF TOOL</span>
        <h1>GIF Compressor</h1>
        <p className="hero-copy">
          Compress GIF files in your browser. Your files stay on your device — no upload, no account, no watermark.
        </p>
      </section>

      <Compressor />

      <section className="content-section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">SIMPLE WORKFLOW</span>
          <h2>How to compress a GIF</h2>
        </div>
        <div className="steps-grid">
          <article className="info-card">
            <span className="step-number">01</span>
            <h3>Choose a GIF</h3>
            <p>Drop an animated GIF into the tool or select a file from your device.</p>
          </article>
          <article className="info-card">
            <span className="step-number">02</span>
            <h3>Adjust compression</h3>
            <p>Choose an output size and color count to balance file size and visual quality.</p>
          </article>
          <article className="info-card">
            <span className="step-number">03</span>
            <h3>Preview and download</h3>
            <p>Check the result and download the compressed GIF when it looks right.</p>
          </article>
        </div>
      </section>

      <section className="privacy-panel">
        <div className="privacy-icon" aria-hidden="true">⌑</div>
        <div>
          <h2>Private, browser-based processing</h2>
          <p>
            GIFSmall processes the selected file locally in your browser with a Web Worker.
            The file is not uploaded to a GIFSmall server. Processing capability and speed depend on your browser and device.
          </p>
        </div>
      </section>

      <section className="content-section faq-section" id="faq">
        <div className="section-heading">
          <span className="eyebrow">NEED TO KNOW</span>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map(({ q, a }) => (
            <details className="faq-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">ALSO USEFUL</span>
          <h2>Need a different size instead?</h2>
        </div>
        <p>
          Resizing changes the dimensions; compressing reduces the file size. If your GIF is the right size but
          still heavy, stay here. If it&apos;s simply too large in pixels, use the{' '}
          <Link href="/gif-resizer">GIF resizer</Link> to set an exact width and height.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
    </main>
  );
}
