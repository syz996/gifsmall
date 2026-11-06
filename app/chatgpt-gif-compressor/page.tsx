import type { Metadata } from 'next';
import ReduceTool from '../reduce-gif-size/ReduceTool';

export const metadata: Metadata = {
  title: 'ChatGPT GIF Compressor — Shrink GIFs from Images 2.6',
  description:
    "Compress a GIF made in ChatGPT right inside your browser. Get under Discord's 20 MB upload limit or down to 256 KB — no upload, no watermark, free.",
  alternates: { canonical: 'https://gifsmall.org/chatgpt-gif-compressor/' },
  openGraph: {
    title: 'ChatGPT GIF Compressor — Shrink GIFs from Images 2.6',
    description:
      'Shrink a ChatGPT-generated GIF to a size Discord accepts, locally in your browser.',
    url: 'https://gifsmall.org/chatgpt-gif-compressor/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ChatGPT GIF Compressor — Shrink GIFs from Images 2.6',
    description:
      'Shrink a ChatGPT-generated GIF to a size Discord accepts, locally in your browser.',
  },
};

const FAQS = [
  {
    q: 'Can I compress a GIF made in ChatGPT?',
    a: 'Yes. ChatGPT Images 2.6 exports a standard animated GIF, so this tool reads it exactly like any other GIF. Pick the limit you need, download the smaller file, and the frame count and timing stay unchanged.',
  },
  {
    q: 'Why is my ChatGPT GIF too big to upload?',
    a: 'GIF size grows with resolution and the number of frames, so an animation exported at full resolution and full length can land above the 20 MB a free Discord account accepts, or above the roughly 256 KB that auto-plays in chat. Compressing first is faster than generating it again at lower quality.',
  },
  {
    q: 'Will compressing change the speed or the frame count?',
    a: 'No. Every frame is decoded, scaled and re-encoded in order, so the loop and the timing ChatGPT produced stay the same. Only the pixel dimensions and the colour palette get smaller.',
  },
  {
    q: 'What size do I need for a Discord emoji?',
    a: 'Discord emoji and animated stickers are capped at 256 KB and 128 × 128 px. Choose the 256 KB limit here, and if the file still will not fit, resize it to 128 × 128 first and compress again.',
  },
  {
    q: 'Is my GIF uploaded to a server?',
    a: 'No. The file is decoded and re-encoded in your browser with a Web Worker, so it never leaves your device and the tool keeps working offline once the page has loaded.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Page() {
  return (
    <main>
      <div className="page-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        />

        <section className="hero">
          <span className="eyebrow">FREE ONLINE GIF TOOL</span>
          <h1>ChatGPT GIF Compressor</h1>
          <p className="hero-copy">
            ChatGPT can now turn a prompt or an image into an animated GIF, and the file it hands you
            is an ordinary GIF — with all the usual size limits attached. Drop it here to get a
            version that uploads to Discord, or that auto-plays at emoji size. Everything runs in your
            browser, so the file never leaves your device.
          </p>
        </section>

        <ReduceTool />

        <section className="content-section" id="what-changed">
          <div className="section-heading">
            <span className="eyebrow">WHAT CHANGED</span>
            <h2>ChatGPT Images 2.6 can export GIFs</h2>
          </div>
          <p className="section-copy">
            OpenAI&apos;s Images 2.6 release, published on 4 November 2026, lists GIF creation as a
            new capability: a prompt or an uploaded image can become an animated GIF, with the speed
            adjusted and individual frames edited. What comes back is a standard GIF file, so every
            platform limit below applies to it exactly as it does to any other animation.
          </p>
          <p className="section-copy">
            How heavy that export turns out depends on the resolution and the number of frames — a
            short loop at small size can pass on its own, while a longer animation at full resolution
            often lands above what a free Discord account accepts. Compressing here is quicker than
            regenerating the animation at a lower quality, because the frames and the timing you
            already generated are kept as they are.
          </p>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">TARGET SIZES</span>
            <h2>Which limit to pick</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Where you are sending it</th>
                  <th>Cap</th>
                  <th>Pick this</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Discord, free account</td>
                  <td>20 MB</td>
                  <td>20 MB</td>
                </tr>
                <tr>
                  <td>Discord emoji or animated sticker</td>
                  <td>256 KB, 128 × 128 px</td>
                  <td>256 KB</td>
                </tr>
                <tr>
                  <td>Discord, Nitro Basic</td>
                  <td>50 MB</td>
                  <td>20 MB is enough for most chats</td>
                </tr>
                <tr>
                  <td>Email attachment</td>
                  <td>10–25 MB</td>
                  <td>under 1 MB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="section-copy">
            If the file is still over the cap at the lowest setting, cut the dimensions first with the
            <a className="text-link" href="/gif-resizer/"> GIF resizer</a>, then compress again. Every
            platform limit, and what changed in August 2026, is on the
            <a className="text-link" href="/gif-compressor-for-discord/">
              {' '}Discord GIF compressor
            </a>
            {' '}page.
          </p>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <span className="eyebrow">WHAT COMPRESSION DOES</span>
            <h2>Two controls, and what each one costs you</h2>
          </div>
          <p className="section-copy">
            A GIF stores every frame as a full image, so the file weight follows the number of pixels
            per frame. Halving both the width and the height cuts the pixel data to roughly a quarter,
            which is the single biggest lever available. The colour palette is the second: dropping
            from 256 to 64 colours often removes another third with no visible difference, while going
            down to 16 colours starts to show banding on gradients and in shadows.
          </p>
          <p className="section-copy">
            Neither control touches the frame count or the timing ChatGPT produced, so a loop that
            looked right before still looks right after — it just weighs less. If you only need a
            smaller file and have no exact number to hit, the
            <a className="text-link" href="/"> GIF compressor</a> gives you the same controls with a
            live before-and-after preview, and
            <a className="text-link" href="/reduce-gif-size/">
              {' '}reducing a GIF to a target size
            </a>
            {' '}explains the stepped search in more detail.
          </p>
        </section>

        <section className="content-section faq-section" id="faq">
          <div className="section-heading">
            <span className="eyebrow">NEED TO KNOW</span>
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