
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ToolError from '@/components/ToolError';、import ResultPanel from '@/components/ResultPanel';、import { notGifError, browserError, toolErrorFor, type ToolError } from '@/lib/errors';
type SourceInfo = {
  w: number;
  h: number;
  bytes: number;
  frames: number;
};

type Decoded = {
  bitmaps: ImageBitmap[];
  delays: number[];
};

type Result = {
  url: string;
  bytes: number;
  w: number;
  h: number;
};

type Mode = 'idle' | 'decoding' | 'encoding' | 'error';

// gifenc 调色板中的 RGB 颜色类型
type RGB = [number, number, number];

const MAX_FRAMES = 600;
const MAX_INPUT_BYTES = 40 * 1024 * 1024; // 40 MB：手机端内存的保守上限
const MIN_SIZE = 8;
const MAX_SIZE = 2000;

function formatKb(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ResizerTool() {
  const [file, setFile] = useState<File | null>(null);

  const [source, setSource] = useState<SourceInfo>({
    w: 0,
    h: 0,
    bytes: 0,
    frames: 0,
  });

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [linked, setLinked] = useState(true);
  const [mode, setMode] = useState<Mode>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ToolError | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const decodedRef = useRef<Decoded | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  // 组件卸载时释放 ImageBitmap 和预览 URL
  useEffect(
    () => () => {
      decodedRef.current?.bitmaps.forEach((bitmap) => bitmap.close());

      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    },
    [],
  );

  // 原始图片宽高比
  const ratio = source.w > 0 ? source.h / source.w : 1;

  // 解码 GIF 动画帧
  const decode = useCallback(
    async (f: File): Promise<SourceInfo & Decoded & { count: number }> => {
      if (!('ImageDecoder' in window)) {
        throw new Error(
          'This browser cannot decode animated GIF locally. Please use Chrome, Edge or a recent Safari.',
        );
      }

      const decoder = new ImageDecoder({
        data: await f.arrayBuffer(),
        type: 'image/gif',
      });

      await decoder.completed;
      await decoder.tracks.ready;

      const count = Math.min(
        decoder.tracks.selectedTrack?.frameCount ?? 1,
        MAX_FRAMES,
      );

      const bitmaps: ImageBitmap[] = [];
      const delays: number[] = [];

      let w = 0;
      let h = 0;

      for (let i = 0; i < count; i += 1) {
        const { image } = await decoder.decode({
          frameIndex: i,
        });

        if (i === 0) {
          w = image.displayWidth;
          h = image.displayHeight;
        }

        bitmaps.push(await createImageBitmap(image));

        delays.push(
          Math.max(20, Math.round((image.duration ?? 100000) / 1000)),
        );

        image.close();

        setProgress(Math.round(((i + 1) / count) * 45));
      }

      return {
        bitmaps,
        delays,
        w,
        h,
        count,
        bytes: f.size,
        frames: count,
      };
    },
    [],
  );

  // 处理上传文件
  const handleFile = useCallback(
    async (f: File | undefined) => {
      if (!f) return;
      if (f.size > MAX_INPUT_BYTES) {
      setError({ title: `This GIF is ${formatKb(f.size)} — the limit is 40 MB`, body: 'Resize a smaller export, or split the animation first.' });
      return;
    }

      if (!/\.gif$/i.test(f.name) && f.type !== 'image/gif') {
        setError(notGifError(f.name));
        return;
      }

      // 释放之前的动画帧
      decodedRef.current?.bitmaps.forEach((bitmap) => bitmap.close());
      decodedRef.current = null;

      // 释放之前的结果 URL
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
        resultUrlRef.current = null;
      }

      setResult(null);
      setError('');
      setProgress(0);
      setFile(f);
      setMode('decoding');

      try {
        const d = await decode(f);

        decodedRef.current = {
          bitmaps: d.bitmaps,
          delays: d.delays,
        };

        setSource({
          w: d.w,
          h: d.h,
          bytes: f.size,
          frames: d.count,
        });

        setWidth(d.w);
        setHeight(d.h);

        setMode('idle');
        setProgress(0);
      } catch (e) {
        setMode('error');

        setError(
          e instanceof Error ? e.message : 'Could not read this GIF.',
        );
      }
    },
    [decode],
  );

  // 调整尺寸并重新编码 GIF
  const encode = useCallback(async () => {
    const source_ = decodedRef.current;

    const w = Math.min(
      MAX_SIZE,
      Math.max(MIN_SIZE, Math.round(width)),
    );

    const h = Math.min(
      MAX_SIZE,
      Math.max(MIN_SIZE, Math.round(height)),
    );

    if (!source_ || !w || !h) return;

    setMode('encoding');
    setError('');
    setProgress(45);

    try {
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

      const enc = GIFEncoder();

      let paletteFormat = 'rgb565';

      const canvas = document.createElement('canvas');

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
      });

      if (!ctx) {
        throw new Error('Canvas is not available in this browser.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 修复：使用 RGB 三元组数组类型
      let palette: RGB[] | null = null;

      for (let i = 0; i < source_.bitmaps.length; i += 1) {
        ctx.clearRect(0, 0, w, h);

        ctx.drawImage(
          source_.bitmaps[i],
          0,
          0,
          w,
          h,
        );

        const rgba = new Uint8Array(
          ctx.getImageData(0, 0, w, h).data,
        );

        // 第一帧生成全局调色板
        if (i === 0) {
          let hasAlpha = false;

          for (let a = 3; a < rgba.length; a += 4) {
            if (rgba[a] < 128) {
              hasAlpha = true;
              break;
            }
          }

          paletteFormat = hasAlpha ? 'rgba4444' : 'rgb565';

          // 修复：明确调色板为 RGB 三元组数组
          palette = hasAlpha
            ? (quantize(rgba, 256, {
              format: 'rgba4444',
              oneBitAlpha: true,
            }) as RGB[])
            : (quantize(rgba, 256) as RGB[]);
        }

        const indexed = applyPalette(
          rgba,
          palette!,
          paletteFormat,
        );

        enc.writeFrame(indexed, w, h, {
          ...(i === 0 ? { palette: palette! } : {}),
          delay: source_.delays[i],
        });

        setProgress(
          45 +
          Math.round(
            ((i + 1) / source_.bitmaps.length) * 50,
          ),
        );

        // 让浏览器有机会更新进度
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      enc.finish();

      // 将 GIF 编码结果转换为明确使用 ArrayBuffer 的 Uint8Array
      const encoded = enc.bytes();

      const buffer = new ArrayBuffer(encoded.byteLength);
      new Uint8Array(buffer).set(encoded);

      const blob = new Blob([buffer], {
        type: 'image/gif',
      });

      const url = URL.createObjectURL(blob);

      // 释放上一次的结果 URL
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }

      resultUrlRef.current = url;

      setResult({
        url,
        bytes: blob.size,
        w,
        h,
      });

      setMode('idle');
      setProgress(100);
    } catch (e) {
      setMode('error');

      setError(
        e instanceof Error ? e.message : 'Could not resize this GIF.',
      );
    }
  }, [width, height]);

  const busy = mode === 'decoding' || mode === 'encoding';

  return (
    <section className="resizer-tool" aria-label="GIF resizer">
      <UploadZone onFile={handleFile}  onInvalidFile={(name) => setError(notGifError(name))}   busy={busy} hint="Resize to an exact width or height — frames and timing kept." />

      {file && source.w > 0 && (
        <div className="controls">
          <p className="src">
            Original: {source.w} × {source.h} · {source.frames} frames ·{' '}
            {formatKb(source.bytes)}
          </p>

          <div className="scale-buttons">
            {[0.75, 0.5, 0.25].map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy}
                onClick={() => {
                  const nextW = Math.max(
                    MIN_SIZE,
                    Math.round(source.w * p),
                  );

                  setWidth(nextW);

                  setHeight(
                    Math.max(
                      MIN_SIZE,
                      Math.round(nextW * ratio),
                    ),
                  );
                }}
              >
                {p * 100}%
              </button>
            ))}
          </div>

          <div className="fields">
            <label>
              Width
              <input
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={width || ''}
                disabled={busy}
                onChange={(e) => {
                  const nextW = Number(e.target.value);

                  setWidth(nextW);

                  if (linked) {
                    setHeight(
                      Math.max(
                        MIN_SIZE,
                        Math.round(nextW * ratio),
                      ),
                    );
                  }
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => setLinked((v) => !v)}
              aria-pressed={linked}
              disabled={busy}
            >
              {linked ? '🔒 linked' : '🔓 free'}
            </button>

            <label>
              Height
              <input
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={height || ''}
                disabled={busy}
                onChange={(e) => {
                  const nextH = Number(e.target.value);

                  setHeight(nextH);

                  if (linked) {
                    setWidth(
                      Math.max(
                        MIN_SIZE,
                        Math.round(nextH / ratio),
                      ),
                    );
                  }
                }}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={encode}
            disabled={busy}
          >
            {mode === 'encoding'
              ? `Resizing… ${progress}%`
              : 'Resize GIF'}
          </button>
        </div>
      )}

      {mode === 'decoding' && (
        <p className="hint">
          Reading frames… {progress}%
        </p>
      )}

      {mode === 'encoding' && (
        <p className="hint">
          Processing GIF… {progress}%
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <ResultPanel
          before={source.bytes}
          after={result.bytes}
          width={result.w}
          height={result.h}
          frames={source.frames}
          downloadUrl={result.url}
          downloadName={`resized-${result.w}x${result.h}.gif`}
        />
      )}
    </section>
  );
}
