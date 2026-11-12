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
    a: 'Discord and Slack emoji need 128 × 128 px and are capped at 256 KB. The free-account upload limit has been 20 MB since August 2026, with Nitro Basic at 50 MB and Nitro up to 1 GB. Most email clients stay safe under 1 MB, and a web page hero is fine around 2 MB as long as it is below the fold.',
  },
  {
    q: 'Is my GIF uploaded anywhere?',
    a: 'No. The file is decoded and re-encoded in your browser with a Web Worker, so it never leaves your device and the tool keeps working offline once loaded.',
  },
  {
    q: "Can I compress a GIF to exactly 10 MB?",
    a: "Yes — type 10000 in the size field. The tool treats the number as a hard ceiling in kilobytes and stops at the first encode that fits, so the result lands just under 10 MB rather than exactly on it. Anything close to the line is fine for email, forums and Discord; uploads that are checked to the byte are safer at 9.5 MB.",
  },
  {
    q: "What is the smallest size a GIF can be compressed to?",
    a: "It depends on the frame count and dimensions rather than on the tool. A short, small GIF can reach 100 KB or less; a long animation at full size will bottom out far above 512 KB no matter which palette setting you choose. When the tool cannot reach your target, resize the dimensions first and compress the smaller file again.",
  },
];

export const metadata: Metadata = {
  title: "Reduce GIF Size — Compress GIF to 10 MB, 1 MB, 512 KB",
  description:
    "Compress a GIF to 10 MB, 1 MB, 512 KB or any limit you type. The tool lowers dimensions and colours until the file fits — in your browser, no upload.",
  alternates: { canonical: `${SITE_URL}/reduce-gif-size/` },
  openGraph: {
    title: "Reduce GIF Size — Compress GIF to 10 MB, 1 MB, 512 KB",
    description:
      "Hit an exact GIF size limit: 10 MB, 1 MB or 512 KB. Compression runs on your device, animation and transparency preserved.",
    url: `${SITE_URL}/reduce-gif-size/`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Reduce GIF Size — Compress GIF to 10 MB, 1 MB, 512 KB",
    description:
      "Hit an exact GIF size limit: 10 MB, 1 MB or 512 KB. Runs in your browser.",
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
        <nav className="content-section anchor-nav" aria-label="GIF size targets">
        <a className="text-link" href="#to-10mb">GIF compressor to 10 MB</a>
        {" · "}
        <a className="text-link" href="#to-1mb">Compress a GIF to 1 MB</a>
        {" · "}
        <a className="text-link" href="#to-512kb">Compress a GIF to 512 KB</a>
      </nav>

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
                The tool tries smaller dimensions and colour counts until the file fits,
                then shows you the result plus every version it tried.
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
                <tr><td>Discord (free account)</td><td>20 MB</td><td>256 KB – 2 MB</td></tr>
                <tr><td>Slack</td><td>1 MB for emoji</td><td>128 KB</td></tr>
                <tr><td>Twitter / X</td><td>15 MB</td><td>2 MB</td></tr>
                <tr><td>Email attachment</td><td>10–25 MB</td><td>under 1 MB</td></tr>
                <tr><td>Website hero image</td><td>—</td><td>under 1 MB</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section" id="to-10mb">
          <div className="section-heading">
            <span className="eyebrow">10 MB TARGET</span>
            <h2>GIF compressor to 10 MB</h2>
          </div>
          <p className="section-copy">
            10 MB is the safe line for a GIF you want to send anywhere. Gmail caps an
            attachment at 25 MB, Outlook at 20 MB, X accepts 15 MB and a free Discord
            account takes 20 MB — so a GIF under 10 MB gets through all of them, even
            after being forwarded or re-attached a couple of times. Type 10000 in the
            size field, drop the file and the tool keeps the largest dimensions and
            colour count that still fit under ten megabytes.
          </p>
          <p className="section-copy">
            A GIF that starts above 30 MB usually needs its dimensions reduced as well,
            not just its palette. Halving width and height removes about three quarters
            of the pixel data, so a 40 MB animation often lands under 10 MB after one
            resize pass and a re-encode. If the result is still over, resize first with
            the <a className="text-link" href="/gif-resizer/">GIF resizer</a> and come
            back here with the smaller file — the two passes together beat any single
            colour setting.
          </p>
        </section>

        <section className="content-section" id="to-1mb">
          <div className="section-heading">
            <span className="eyebrow">1 MB TARGET</span>
            <h2>Compress a GIF to 1 MB</h2>
          </div>
          <p className="section-copy">
            1 MB is the practical ceiling for a GIF that sits on a web page or goes into
            a newsletter. Most email clients stay safe under 1 MB, and a GIF used as a
            hero or a section illustration should stay below it too — it loads on a
            phone connection without making the page feel stuck. Type 1024 in the size
            field: the tool tries smaller frame sizes and colour counts in order and
            stops at the first version that fits, so you get the sharpest GIF that still
            passes one megabyte.
          </p>
          <p className="section-copy">
            1 MB leaves room for maybe 40–60 frames at 480 px wide. If your animation is
            longer than that, cut the frame count in the source editor rather than
            squeezing the palette to 16 colours, which is where banding starts to show
            on gradients.
          </p>
        </section>

        <section className="content-section" id="to-512kb">
          <div className="section-heading">
            <span className="eyebrow">512 KB TARGET</span>
            <h2>Compress a GIF to 512 KB</h2>
          </div>
          <p className="section-copy">
            512 KB is the size to aim for when the GIF has to load instantly or fit a
            tight box: an animated reaction in a forum signature, a thumbnail, a preview
            image, Discord's server sticker limit (512 KB at 320 × 320 px). Type 512 and
            the tool will drop the palette before it drops the frame count, because a
            smaller palette is far less noticeable than missing frames.
          </p>
          <p className="section-copy">
            Below 512 KB the pixel dimensions matter more than anything else. A 320 px
            wide GIF compresses to half a megabyte with 128 colours without visible
            damage; the same animation at 800 px wide needs 32 colours and starts to
            look blotchy on faces and skies.
          </p>
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
            Sending a GIF to Discord? See{' '}
            <Link className="text-link" href="/gif-compressor-for-discord/">
              Discord&apos;s 20 MB upload limit
            </Link>
            {' '}and what it takes to stay under it.
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
