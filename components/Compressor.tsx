'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import ResultPanel from '@/components/ResultPanel';
import ToolErrorPanel from '@/components/ToolError';
import { compressGif } from '@/lib/gifEngine';
import { formatSize } from '@/lib/format';
import { notGifError, tooLargeError, workerError, type ToolError } from '@/lib/errors';

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

// 拖入即压用的默认参数
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  scale: 0.75,
  maxColors: 64,
};

const MAX_INPUT_BYTES = 40 * 1024 * 1024; // 40 MB，与三个内页保持一致

export default function Compressor() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(DEFAULT_OPTIONS.scale);
  const [maxColors, setMaxColors] = useState(DEFAULT_OPTIONS.maxColors);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ToolError | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function compress(next: File, overrides?: CompressionOptions) {
    const nextScale = overrides?.scale ?? scale;
    const nextColors = overrides?.maxColors ?? maxColors;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const output = await compressGif(next, {
        scale: nextScale,
        maxColors: nextColors,
      });
      setResult(output);
    } catch (err) {
      setError(
        workerError(err instanceof Error ? err.message : undefined),
      );
    } finally {
      setBusy(false);
    }
  }

  function handleFile(next: File | undefined) {
    if (!next) return;

    if (!(next.type === 'image/gif' || /\.gif$/i.test(next.name))) {
      setError(notGifError(next.name));
      return;
    }

    if (next.size > MAX_INPUT_BYTES) {
      setError(tooLargeError(next.size, 40));
      return;
    }

    setError(null);
    setResult(null);
    setFile(next);

    // 拖入即压：用默认参数先跑一次，用户先看到结果再调参数
    setScale(DEFAULT_OPTIONS.scale);
    setMaxColors(DEFAULT_OPTIONS.maxColors);
    void compress(next, DEFAULT_OPTIONS);
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

  const isSmaller = result ? result.after < result.before : false;

  return (
    <section className="tool-card" aria-label="GIF compressor">
      <UploadZone
        onFile={handleFile}
        onInvalidFile={(name) => setError(notGifError(name))}
        busy={busy}
        hint="Drop a GIF and it starts compressing right away — adjust the settings after you see the result."
      />

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

      <ToolErrorPanel error={error} />

      {result && previewUrl && (
        <ResultPanel
          before={result.before}
          after={result.after}
          width={result.width}
          height={result.height}
          frames={result.frames}
          downloadUrl={previewUrl}
          downloadName={`small-${file?.name ?? 'gif'}`}
          status={
            isSmaller
              ? { text: 'smaller', good: true }
              : { text: 'already optimized', good: false }
          }
        >
          <div className="preview-wrap">
            <img src={previewUrl} alt="Compressed animated GIF preview" />
          </div>

          {!isSmaller && (
            <div className="retry-row">
              <button
                className="secondary-button"
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!file) return;
                  setScale(0.5);
                  void compress(file, { scale: 0.5 });
                }}
              >
                Try Resize 50%
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!file) return;
                  setMaxColors(64);
                  void compress(file, { maxColors: 64 });
                }}
              >
                Try 64 colors
              </button>
            </div>
          )}
        </ResultPanel>
      )}

      {file && (
        <div className="settings-area">
          <div className="selected-file">
            <div className="file-symbol">GIF</div>
            <div className="file-details">
              <strong title={file.name}>{file.name}</strong>
              <span>{formatSize(file.size)}</span>
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
              if (!file) return;
              void compress(file);
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

      <p className="tool-footnote">
        Your file is processed locally in this browser. Large GIFs may take longer
        depending on your device.
      </p>

      <p className="tool-footnote">
        Need to hit an exact cap?{' '}
      <Link href="/reduce-gif-size/">Reduce GIF size to an exact limit</Link>
        {' · '}
        Posting to Discord?{' '}
        <Link href="/gif-compressor-for-discord/">Check the upload limits</Link>
      </p>
    </section>
  );
}
