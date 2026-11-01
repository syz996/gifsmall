'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
// ↓ 换成 lib/gifEngine.ts 里真实导出的名字
import { compressGif } from '@/lib/gifEngine';

type Attempt = {
  scale: number;
  maxColors: number;
  bytes: number;
  width: number;
  height: number;
  blob: Blob;
};

const STEPS = [
  { scale: 1, maxColors: 64 },
  { scale: 0.75, maxColors: 64 },
  { scale: 0.5, maxColors: 64 },
  { scale: 0.5, maxColors: 32 },
  { scale: 0.35, maxColors: 32 },
  { scale: 0.25, maxColors: 16 },
];

const PRESETS = [
  { label: '1 MB', bytes: 1024 * 1024 },
  { label: '512 KB', bytes: 512 * 1024 },
  { label: '256 KB', bytes: 256 * 1024 },
  { label: '100 KB', bytes: 100 * 1024 },
];

function fmt(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default function ReduceTool() {
  const [file, setFile] = useState<File | null>(null);
  const [targetBytes, setTargetBytes] = useState(512 * 1024);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [previewIndex, setPreviewIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = previewIndex >= 0 ? attempts[previewIndex] ?? null : null;
  const selectedBlob = selected ? selected.blob : null;

  useEffect(() => {
    if (!selectedBlob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedBlob]);

  const handleFile = useCallback((next: File | null) => {
    if (!next) return;
    if (!(next.type === 'image/gif' || /\.gif$/i.test(next.name))) {
      setError('Please choose a GIF file (.gif).');
      return;
    }
    setError(null);
    setAttempts([]);
    setPreviewIndex(-1);
    setPreviewUrl(null);
    setFile(next);
  }, []);

  const run = useCallback(async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setAttempts([]);
    setPreviewIndex(-1);
    setPreviewUrl(null);

    const done: Attempt[] = [];
    let hitIndex = -1;

    try {
      for (let i = 0; i < STEPS.length; i += 1) {
        const step = STEPS[i];
        setProgress(
          `Trying ${Math.round(step.scale * 100)}% size · ${step.maxColors} colours (${i + 1}/${STEPS.length})`,
        );
        const out = await compressGif(file, { scale: step.scale, maxColors: step.maxColors });
        done.push({
          scale: step.scale,
          maxColors: step.maxColors,
          bytes: out.after,
          width: out.width,
          height: out.height,
          blob: out.blob,
        });
        setAttempts(done.slice());
        if (out.after <= targetBytes) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex >= 0) {
        setPreviewIndex(hitIndex);
      } else {
        let min = 0;
        for (let i = 1; i < done.length; i += 1) {
          if (done[i].bytes < done[min].bytes) min = i;
        }
        setPreviewIndex(min);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reduce this GIF.');
    } finally {
      setProgress('');
      setBusy(false);
    }
  }, [file, busy, targetBytes]);

  return (
    <section className="resizer-tool" aria-label="GIF size reducer">
      <div
        className="dropzone"
        role="button"
        tabIndex={0}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".gif,image/gif"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <label>
          <span>{file ? file.name : 'Drop a GIF here, or click to choose'}</span>
        </label>
        <p className="hint">100% in your browser. The file never leaves your device.</p>
      </div>

      {file && (
        <div className="controls">
          <p className="src">Original: {fmt(file.size)}</p>

          <div className="scale-buttons">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                disabled={busy}
                onClick={() => setTargetBytes(p.bytes)}
                aria-pressed={targetBytes === p.bytes}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="fields">
            <label>
              Target size
              <input
                type="number"
                min={20}
                max={51200}
                value={Math.round(targetBytes / 1024)}
                disabled={busy}
                onChange={(e) => setTargetBytes(Math.max(20, Number(e.target.value)) * 1024)}
              />
            </label>
            <span className="hint">KB</span>
          </div>

          <button type="button" onClick={run} disabled={busy}>
            {busy ? `Reducing… ${progress}` : 'Reduce GIF to target size'}
          </button>
        </div>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {selected && (
        <div className="result">
          {previewUrl && (
            <img
              src={previewUrl}
              alt={`Reduced GIF preview, ${selected.width} by ${selected.height} pixels`}
            />
          )}
          <p>
            {selected.width} × {selected.height} · {fmt(selected.bytes)} ·{' '}
            {Math.round(selected.scale * 100)}% size · {selected.maxColors} colours ·{' '}
            {selected.bytes <= targetBytes
              ? `under your ${fmt(targetBytes)} limit`
              : `over your ${fmt(targetBytes)} limit`}
          </p>

          {attempts.length > 1 && (
            <div className="version-row" role="group" aria-label="Other versions from this run">
              {attempts.map((a, i) => (
                <button
                  key={`${a.scale}-${a.maxColors}`}
                  type="button"
                  aria-pressed={i === previewIndex}
                  onClick={() => setPreviewIndex(i)}
                >
                  {a.bytes <= targetBytes ? '✓ ' : ''}
                  {Math.round(a.scale * 100)}% · {a.maxColors} colours · {fmt(a.bytes)}
                </button>
              ))}
            </div>
          )}

          {selected.bytes > targetBytes && (
            <p className="tool-footnote">
              This GIF will not fit in {fmt(targetBytes)} without visible quality loss. The result
              above is the smallest version at usable quality.
            </p>
          )}

          <a
            href={previewUrl ?? '#'}
            download={`reduced-${selected.width}x${selected.height}-${Math.round(selected.bytes / 1024)}KB.gif`}
          >
            Download GIF
          </a>
        </div>
      )}
    </section>
  );
}
