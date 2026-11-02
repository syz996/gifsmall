'use client';

import { useEffect, useState } from 'react';
import UploadZone from '@/components/UploadZone';

type CompressionResult = {
  blob: Blob;
  before: number;
  after: number;
  width: number;
  height: number;
  frames: number;
};

type CompressionOptions = {
  scale?: number;
  maxColors?: number;
};

async function runGifCompression(
  file: File,
  options: CompressionOptions = {},
): Promise<CompressionResult> {
  const buffer = await file.arrayBuffer();
  const before = file.size;

  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      // ⚠️ 这一行按你本地原样保留（worker 文件名我看不到，其余都已核对）
      worker = new Worker(new URL('../workers/gif.worker.ts', import.meta.url));
    } catch {
      reject(new Error('Web Workers are not supported in this browser.'));
      return;
    }

    let settled = false;
    const cleanup = () => worker.terminate();
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    worker.onmessage = (event: MessageEvent) => {
      if (settled) return;
      const data = event.data;

      if (data?.error) {
        fail(data.error);
        return;
      }

      if (
        data?.blob &&
        typeof data.after === 'number' &&
        typeof data.width === 'number' &&
        typeof data.height === 'number' &&
        typeof data.frames === 'number'
      ) {
        settled = true;
        cleanup();
        resolve({
          blob: data.blob,
          before,
          after: data.after,
          width: data.width,
          height: data.height,
          frames: data.frames,
        });
        return;
      }

      fail('The compression worker returned an incomplete result.');
    };

    worker.onerror = (event) =>
      fail(event.message || 'The compression worker stopped unexpectedly.');
    worker.onmessageerror = () =>
      fail('Could not read the compression result from the worker.');

    try {
      worker.postMessage({ buffer, opts: options }, [buffer]);
    } catch {
      fail('Could not send the GIF to the local compression worker.');
    }
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function Compressor() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [maxColors, setMaxColors] = useState(128);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFile(next: File | undefined) {
    if (!next) return;

    if (!(next.type === 'image/gif' || /\.gif$/i.test(next.name))) {
      setError('Please choose a GIF file (.gif).');
      return;
    }

    setError(null);
    setResult(null);
    setFile(next);
  }

  async function compress(overrides?: CompressionOptions) {
    if (!file || busy)return;

    const nextScale = overrides?.scale ?? scale;
    const nextColors = overrides?.maxColors ?? maxColors;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const output = await runGifCompression(file, {
        scale: nextScale,
        maxColors: nextColors,
      });
      setResult(output);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Compression failed. Please try another GIF.',
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!result) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [result]);

  const savedBytes = result ? result.before - result.after : 0;
  const savedPercent =
    result && result.before > 0
      ? Math.round((1 - result.after / result.before) * 100)
      : 0;
  const isSmaller = savedBytes > 0;

  return (
    <section className="tool-card" aria-label="GIF compressor">
      <UploadZone onFile={handleFile} busy={busy} />

      <div className="trust-row">
        <span>
          <i>✓</i> No upload
        </span>
        <span>
          <i>✓</i> No watermark
        </span>
        <span>
          <i>✓</i> Free to use
        </span>
      </div>

      {file && (
        <div className="settings-area">
          <div className="selected-file">
            <div className="file-symbol">GIF</div>
            <div className="file-details">
              <strong title={file.name}>{file.name}</strong>
              <span>{formatBytes(file.size)}</span>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
            >
              Remove
            </button>
          </div>

          <div className="settings-grid">
            <label className="field">
              <span>Resize</span>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                disabled={busy}
              >
                <option value={1}>Original size (100%)</option>
                <option value={0.75}>75%</option>
                <option value={0.5}>50%</option>
                <option value={0.3}>30%</option>
              </select>
            </label>

            <label className="field">
              <span>Maximum colors</span>
              <select
                value={maxColors}
                onChange={(e) => setMaxColors(Number(e.target.value))}
                disabled={busy}
              >
                <option value={256}>256 colors</option>
                <option value={128}>128 colors</option>
                <option value={64}>64 colors</option>
                <option value={32}>32 colors</option>
              </select>
            </label>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              void compress();
            }}
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner" /> Compressing GIF…
              </>
            ) : (
              'Compress GIF'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {result && previewUrl && (
        <div className="result-area">
          <div className="result-heading">
            <div>
              <span className="eyebrow">COMPRESSION COMPLETE</span>
              <h3>Your GIF is ready</h3>
            </div>
            <span className={isSmaller ? 'result-status good' : 'result-status neutral'}>
              {isSmaller ? `${savedPercent}% smaller` : 'Already optimized'}
            </span>
          </div>

          <div className="comparison-grid">
            <div className="comparison-item">
              <span>Original</span>
              <strong>{formatBytes(result.before)}</strong>
            </div>
            <div className="comparison-arrow">→</div>
            <div className="comparison-item">
              <span>Compressed</span>
              <strong>{formatBytes(result.after)}</strong>
            </div>
          </div>

          <p className="result-meta">
            Output: {result.width} × {result.height}px · {result.frames} frames
            {isSmaller
              ? ` · Saved ${formatBytes(savedBytes)}`
              : ' · Nothing left to squeeze at these settings'}
          </p>

          {!isSmaller && (
            <>
              <p className="tool-footnote">
                This GIF is already compressed. Shrink it further with{' '}
                <strong>Resize 50%</strong> or <strong>64 colors</strong> —
                already-optimized GIFs usually drop 50–70% that way.
              </p>
              <div className="retry-row">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setScale(0.5);
                    void compress({ scale: 0.5 });
                  }}
                >
                  Try Resize 50%
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMaxColors(64);
                    void compress({ maxColors: 64 });
                  }}
                >
                  Try 64 colors
                </button>
              </div>
            </>
          )}

          <div className="preview-wrap">
            <img src={previewUrl} alt="Compressed animated GIF preview" />
          </div>

          <a
            className="download-button"
            href={previewUrl}
            download={`small-${file?.name ?? 'gif'}`}
          >
            Download GIF
          </a>

          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setResult(null);
              setError(null);
            }}
          >
            Adjust settings and try again
          </button>
        </div>
      )}

      <p className="tool-footnote">
        Your file is processed locally in this browser. Large GIFs may take
        longer depending on your device.
      </p>
    </section>
  );
}