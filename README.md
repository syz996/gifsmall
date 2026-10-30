# GIFSmall

A small Next.js static-export MVP for compressing animated GIFs locally in the browser.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production static export

```bash
npm run build
```

Next.js exports the static site into `out/`. Deploy the contents of `out/` to a static host such as Cloudflare Pages.

## Current MVP features

- GIF file selection and drag-and-drop
- Resize presets: 100%, 75%, 50%, 30%
- Maximum palette colors: 256, 128, 64, 32
- Browser-side processing in a Web Worker
- Before/after file size, output dimensions, frame count
- Animated preview and download
- Responsive landing page, how-to section, privacy explanation, FAQ and FAQ JSON-LD

## Important implementation notes

- No file upload API is included. The selected file is passed to a local Web Worker.
- The first encoder implementation is intentionally an MVP. GIF transparency, partial-frame compositing, and disposal methods can be complex. Test with a range of real GIFs and inspect the animation before publishing.
- The UI reports when the output is not smaller than the original; it does not claim a reduction in that case.
- `gifuct-js` 2.1.2 ships its own TypeScript declarations, so a separate `@types/gifuct-js` package is not needed.
- `Works offline` is not advertised because offline behavior depends on the browser cache and asset availability.
- Target-file-size optimization and WASM quantization are not included in this first version.
- This project has not been run through `npm install` or a production build in this environment. Run the commands above locally and resolve any dependency or build issues before deployment.

## Project structure

```text
gifsmall/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Compressor.tsx
├── lib/
│   └── gifEngine.ts
├── workers/
│   └── gif.worker.ts
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```
# gifsmall
