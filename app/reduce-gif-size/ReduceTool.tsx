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
  const [bestIndex, setBestIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = useCallback((next: File | null) => {
    if (!next) return;
    if (!(next.type === 'image/gif' || /\.gif$/i.test(next.name))) {
      setError('Please choose a GIF file (.gif).');
      return;
    }
    setError(null);
    setAttempts([]);
    setBestIndex(-1);
    setPreviewUrl(null);
    setFile(next);
  }, []);

  const run = useCallback(async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setAttempts([]);
    setBestIndex(-1);
    setPreviewUrl(null);

    const done: Attempt[] = [];
    try {
      for (let i = 0; i < STEPS.length; i += 1) {
        const step = STEPS[i];
        setProgress(
          `Trying ${Math.round(step.scale * 100)}% size · ${step.maxColors} colours (${i + 1}/${STEPS.length})`,
        );
        const out = await compressGif(file, { scale: step.scale, maxColors: step.maxColors });
        const attempt: Attempt = {
          scale: step.scale,
          maxColors: step.maxColors,
          bytes: out.after,
          width: out.width,
          height: out.height,
          blob: out.blob,
        };
        done.push(attempt);
        setAttempts([...done]);
        if (out.after <= targetBytes) {
          setBestIndex(done.length - 1);
          break;
        }
      }

      // 没有一档达标：取最小的那档，照实告诉用户没压到目标
      if (!done.some((a) => a.bytes <= targetBytes)) {
        let min = 0;
        for (let i = 1; i < done.length; i += 1) if (done[i].bytes < done[min].bytes) min = i;
        setBestIndex(min);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reduce this GIF.');
    } finally {
      setProgress('');
      setBusy(false);
    }
  }, [file, busy, targetBytes]);

  useEffect(() => {
    if (bestIndex < 0 || !attempts[bestIndex]) return;
    const url = URL.createObjectURL(attempts[bestIndex].blob);
    setPreviewUrl(url);
  }, [bestIndex, attempts]);

  const best = bestIndex >= 0 ? attempts[bestIndex] : null;
  const hit = !!best && best.bytes <= targetBytes;

  return (
    <section className="resizer-tool" aria-label="GIF size reducer">
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
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
                onClick={() => setTargetBytes(p.bytes)}
                disabled={busy}
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
                onChange={(e) => setTargetBytes(Math.max(20, Number(e.target.value)) * 1024)}
                disabled={busy}
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

      {best && (
        <div className="result">
          {previewUrl && (
            <img
              src={previewUrl}
              alt={`Reduced GIF preview, ${best.width} by ${best.height} pixels`}
            />
          )}
          <p>
            {best.width} × {best.height} · {fmt(best.bytes)} · {Math.round(best.scale * 100)}% size ·{' '}
            {best.maxColors} colours ·{' '}
            {hit ? `under your ${fmt(targetBytes)} limit` : `closest we could get to ${fmt(targetBytes)}`}
          </p>
          {!hit && (
            <p className="tool-footnote">
              This GIF will not fit in {fmt(targetBytes)} without visible quality loss. The result
              below is the smallest version at usable quality.
            </p>
          )}
          <a
            href={previewUrl ?? '#'}
            download={`reduced-${best.width}x${best.height}.gif`}
          >
            Download GIF
          </a>
        </div>
      )}
    </section>
  );
}