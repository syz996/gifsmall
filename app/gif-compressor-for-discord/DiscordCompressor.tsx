'use client';

import { useCallback, useEffect, useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ResultPanel from '@/components/ResultPanel';
import ToolErrorPanel from '@/components/ToolError';
import { notGifError, tooLargeError, type ToolError } from '@/lib/errors';

type Job = { blob: Blob; before: number; after: number; width: number; height: number; frames: number };
type Attempt = { scale: number; maxColors: number; bytes: number; width: number; height: number; frames: number; blob: Blob };

const MAX_INPUT_BYTES = 40 * 1024 * 1024; // 40 MB：手机端内存的保守上限

const LADDER = [
  { scale: 1, maxColors: 64 },
  { scale: 0.75, maxColors: 64 },
  { scale: 0.5, maxColors: 64 },
  { scale: 0.5, maxColors: 32 },
  { scale: 0.35, maxColors: 32 },
  { scale: 0.25, maxColors: 16 },
];

// Discord 的四档：免费上传上限 / 旧上限的安全档 / 服务器贴纸 / 表情与自动播放
const PRESETS = [
  { label: '20 MB', bytes: 20971520, note: 'Free account upload limit' },
  { label: '8 MB', bytes: 8388608, note: 'Safe target for older limits' },
  { label: '512 KB', bytes: 524288, note: 'Server sticker (320 × 320)' },
  { label: '256 KB', bytes: 262144, note: 'Emoji / auto-play in chat' },
];

async function runJob(file: File, opts: { scale: number; maxColors: number } = { scale: 1, maxColors: 64 }): Promise<Job> {
  const buffer = await file.arrayBuffer();
  const before = file.size;

  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('../../workers/gif.worker.ts', import.meta.url));
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

      if (data?.error) return fail(data.error);

      if (
        data?.blob &&
        typeof data.after === 'number' &&
        typeof data.width === 'number' &&
        typeof data.height === 'number' &&
        typeof data.frames === 'number'
      ) {
        settled = true;
        cleanup();
        resolve({ blob: data.blob, before, after: data.after, width: data.width, height: data.height, frames: data.frames });
        return;
      }

      fail('The compression worker returned an incomplete result.');
    };

    worker.onerror = (event) => fail(event.message || 'The compression worker stopped unexpectedly.');
    worker.onmessageerror = () => fail('Could not read the compression result from the worker.');

    try {
      worker.postMessage({ buffer, opts }, [buffer]);
    } catch {
      fail('Could not send the GIF to the local compression worker.');
    }
  });
}

function formatSize(bytes: number) {
  return bytes >= 1048576
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export default function DiscordCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState(20971520);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<ToolError | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selected = selectedIndex >= 0 ? attempts[selectedIndex] ?? null : null;
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

  const handleFile = useCallback((f: File | undefined) => {
    if (!f) return;

    if (f.size > MAX_INPUT_BYTES) {
      setError(tooLargeError(f.size, 40));
      return;
    }

    if (!(f.type === 'image/gif' || /\.gif$/i.test(f.name))) {
      setError(notGifError(f.name));
      return;
    }
    setError(null);
    setAttempts([]);
    setSelectedIndex(-1);
    setPreviewUrl(null);
    setFile(f);
  }, []);

  const run = useCallback(async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setAttempts([]);
    setSelectedIndex(-1);
    setPreviewUrl(null);

    const tried: Attempt[] = [];
    let hit = -1;

    try {
      for (let i = 0; i < LADDER.length; i += 1) {
        const step = LADDER[i];
        setStatus(
          `Trying ${Math.round(step.scale * 100)}% size · ${step.maxColors} colours (${i + 1}/${LADDER.length})`,
        );

        const job = await runJob(file, { scale: step.scale, maxColors: step.maxColors });
        tried.push({
          scale: step.scale,
          maxColors: step.maxColors,
          bytes: job.after,
          width: job.width,
          height: job.height,
          frames: job.frames,
          blob: job.blob,
        });
        setAttempts(tried.slice());

        if (job.after <= target) {
          hit = i;
          break;
        }
      }

      if (hit >= 0) {
        setSelectedIndex(hit);
      } else {
        let smallest = 0;
        for (let i = 1; i < tried.length; i += 1) {
          if (tried[i].bytes < tried[smallest].bytes) smallest = i;
        }
        setSelectedIndex(smallest);
      }
    } catch (e) {
      setError({
        title: 'Could not compress this GIF',
        body:
          e instanceof Error
            ? e.message
            : 'Reload the page and try again — a very long animation is often the cause.',
      });
    } finally {
      setStatus('');
      setBusy(false);
    }
  }, [file, busy, target]);

  return (
    <section className="resizer-tool" aria-label="GIF compressor for Discord">
      <UploadZone
        onFile={handleFile}
        onInvalidFile={(name) => setError(notGifError(name))}
        busy={busy}
        hint="Drop a GIF and pick a Discord limit — everything stays on your device."
      />

      {file && (
        <div className="controls">
          <p className="src">Original: {formatSize(file.size)}</p>

          <div className="scale-buttons">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                title={p.note}
                disabled={busy}
                aria-pressed={target === p.bytes}
                onClick={() => setTarget(p.bytes)}
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
                value={Math.round(target / 1024)}
                disabled={busy}
                onChange={(e) => setTarget(1024 * Math.max(20, Number(e.target.value)))}
              />
            </label>
            <span className="hint">KB</span>
          </div>

          <button type="button" onClick={run} disabled={busy}>
            {busy ? `Compressing… ${status}` : 'Compress GIF for Discord'}
          </button>
        </div>
      )}

      <ToolErrorPanel error={error} />

      {selected && (
        <ResultPanel
          before={file ? file.size : selected.bytes}
          after={selected.bytes}
          width={selected.width}
          height={selected.height}
          frames={selected.frames}
          downloadUrl={previewUrl}
          downloadName={`discord-${selected.width}x${selected.height}-${Math.round(selected.bytes / 1024)}KB.gif`}
          status={{
            text: selected.bytes <= target ? `under ${formatSize(target)}` : `over ${formatSize(target)}`,
            good: selected.bytes <= target,
          }}
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt={`Discord-ready GIF preview, ${selected.width} by ${selected.height} pixels`}
            />
          )}

          {attempts.length > 1 && (
            <div className="version-row" role="group" aria-label="Other versions from this run">
              {attempts.map((a, i) => (
                <button
                  key={`${a.scale}-${a.maxColors}`}
                  type="button"
                  aria-pressed={i === selectedIndex}
                  onClick={() => setSelectedIndex(i)}
                >
                  {a.bytes <= target ? '✓ ' : ''}
                  {Math.round(a.scale * 100)}% · {a.maxColors} colours · {formatSize(a.bytes)}
                </button>
              ))}
            </div>
          )}

          {selected.bytes > target && (
            <p className="tool-footnote">
              Even at the lowest setting this GIF is still over your Discord limit. Try{' '}
              <a className="text-link" href="/gif-resizer/">
                resizing the GIF dimensions first
              </a>
              , then compress again.
            </p>
          )}
        </ResultPanel>
      )}
    </section>
  );
}
