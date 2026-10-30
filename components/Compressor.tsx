'use client';

import { useEffect, useRef, useState } from 'react';
import { compressGif, type CompressResult } from '@/lib/gifEngine';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isGif(file: File) {
  const extensionMatches = /\.gif$/i.test(file.name);
  return file.type === 'image/gif' || extensionMatches;
}
console.log('abcxxxxxxxxx')

export default function Compressor() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [colors, setColors] = useState(128);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!result) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  function pick(nextFile: File | undefined | null) {
    if (!nextFile) return;
    if (!isGif(nextFile)) {
      setErr('Please choose a GIF file (.gif).');
      return;
    }
    setErr(null);
    setResult(null);
    setFile(nextFile);
  }

  async function run() {
    if (!file || busy) return;
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const output = await compressGif(file, { scale, maxColors: colors });
      setResult(output);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Compression failed. Please try another GIF.');
    } finally {
      setBusy(false);
    }
  }

  const savedBytes = result ? result.before - result.after : 0;
  const savedPct = result && result.before > 0
    ? Math.round((1 - result.after / result.before) * 100)
    : 0;
  const isSmaller = savedBytes > 0;

  return (
    <section className="tool-card" aria-label="GIF compressor">
      <div
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          pick(event.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Choose a GIF file or drop one here"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".gif,image/gif"
          hidden
          onChange={(event) => {
            pick(event.target.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
        <div className="upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3" />
          </svg>
        </div>
        <h2>{file ? 'Choose another GIF' : 'Drop your GIF here'}</h2>
        <p>or <span className="text-link">browse files</span> from your device</p>
        <span className="file-hint">GIF files only</span>
      </div>

      <div className="trust-row">
        <span><i>✓</i> No upload</span>
        <span><i>✓</i> No watermark</span>
        <span><i>✓</i> Free to use</span>
      </div>

      {file && (
        <div className="settings-area">
          <div className="selected-file">
            <div className="file-symbol">GIF</div>
            <div className="file-details">
              <strong title={file.name}>{file.name}</strong>
              <span>{formatBytes(file.size)}</span>
            </div>
            <button className="text-button" type="button" onClick={() => {
              setFile(null);
              setResult(null);
              setErr(null);
            }}>Remove</button>
          </div>

          <div className="settings-grid">
            <label className="field">
              <span>Resize</span>
              <select value={scale} onChange={(event) => setScale(Number(event.target.value))} disabled={busy}>
                <option value={1}>Original size (100%)</option>
                <option value={0.75}>75%</option>
                <option value={0.5}>50%</option>
                <option value={0.3}>30%</option>
              </select>
            </label>
            <label className="field">
              <span>Maximum colors</span>
              <select value={colors} onChange={(event) => setColors(Number(event.target.value))} disabled={busy}>
                <option value={256}>256 colors</option>
                <option value={128}>128 colors</option>
                <option value={64}>64 colors</option>
                <option value={32}>32 colors</option>
              </select>
            </label>
          </div>

          <button className="primary-button" type="button" onClick={run} disabled={busy}>
            {busy ? <><span className="spinner" /> Compressing GIF…</> : 'Compress GIF'}
          </button>
        </div>
      )}

      {err && <div className="error-message" role="alert">{err}</div>}

      {result && previewUrl && (
        <div className="result-area">
          <div className="result-heading">
            <div>
              <span className="eyebrow">COMPRESSION COMPLETE</span>
              <h3>Your GIF is ready</h3>
            </div>
            <span className={isSmaller ? 'result-status good' : 'result-status neutral'}>
              {isSmaller ? `${savedPct}% smaller` : 'No size reduction'}
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
            {isSmaller ? ` · Saved ${formatBytes(savedBytes)}` : ' · The new file is not smaller than the original.'}
          </p>

          <div className="preview-wrap">
            {/* The preview URL is created once per result and revoked on replacement/unmount. */}
            <img src={previewUrl} alt="Compressed animated GIF preview" />
          </div>

          <a className="download-button" href={previewUrl} download={`small-${file?.name ?? 'gif'}`}>
            Download GIF
          </a>
          <button className="secondary-button" type="button" onClick={() => {
            setResult(null);
            setErr(null);
          }}>Adjust settings and try again</button>
        </div>
      )}
      <p className="tool-footnote">Your file is processed locally in this browser. Large GIFs may take longer depending on your device.</p>
    </section>
  );
}
