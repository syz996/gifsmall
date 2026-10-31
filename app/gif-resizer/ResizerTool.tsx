'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'decoding' | 'encoding' | 'error';

const MAX_FRAMES = 600;

export default function ResizerTool() {
    const [file, setFile] = useState<File | null>(null);
    const [src, setSrc] = useState({ w: 0, h: 0, bytes: 0, frames: 0 });
    const [outW, setOutW] = useState(0);
    const [outH, setOutH] = useState(0);
    const [lock, setLock] = useState(true);
    const [status, setStatus] = useState<Status>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const [result, setResult] = useState<{ url: string; bytes: number; w: number; h: number } | null>(null);

    const framesRef = useRef<{ bitmaps: ImageBitmap[]; delays: number[] } | null>(null);
    const resultUrlRef = useRef<string | null>(null);

    useEffect(() => () => {
        framesRef.current?.bitmaps.forEach((b) => b.close());
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    }, []);

    const ratio = src.w > 0 ? src.h / src.w : 1;

    const decode = useCallback(async (f: File) => {
        if (!('ImageDecoder' in window)) {
            throw new Error('This browser cannot decode animated GIF locally. Please use Chrome, Edge or a recent Safari.');
        }
        const buf = await f.arrayBuffer();
        const decoder = new ImageDecoder({ data: buf, type: 'image/gif' });
        await decoder.completed;
        await decoder.tracks.ready;
        const total = decoder.tracks.selectedTrack?.frameCount ?? 1;
        const count = Math.min(total, MAX_FRAMES);

        const bitmaps: ImageBitmap[] = [];
        const delays: number[] = [];
        let w0 = 0;
        let h0 = 0;

        for (let i = 0; i < count; i++) {
            const { image } = await decoder.decode({ frameIndex: i });
            if (i === 0) {
                w0 = image.displayWidth;
                h0 = image.displayHeight;
            }
            bitmaps.push(await createImageBitmap(image));
            delays.push(Math.max(20, Math.round((image.duration ?? 100_000) / 1000)));
            image.close();
            setProgress(Math.round(((i + 1) / count) * 45));
        }
        return { bitmaps, delays, w: w0, h: h0, count };
    }, []);

    const onFiles = useCallback(async (files: FileList | null) => {
        const f = files?.[0];
        if (!f) return;
        if (!/\.gif$/i.test(f.name) && f.type !== 'image/gif') {
            setError('Please choose a .gif file.');
            return;
        }
        framesRef.current?.bitmaps.forEach((b) => b.close());
        framesRef.current = null;
        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }
        setResult(null);
        setError('');
        setProgress(0);
        setFile(f);
        setStatus('decoding');
        try {
            const data = await decode(f);
            framesRef.current = { bitmaps: data.bitmaps, delays: data.delays };
            setSrc({ w: data.w, h: data.h, bytes: f.size, frames: data.count });
            setOutW(data.w);
            setOutH(data.h);
            setStatus('idle');
            setProgress(0);
        } catch (e) {
            setStatus('error');
            setError(e instanceof Error ? e.message : 'Could not read this GIF.');
        }
    }, [decode]);

    const resize = useCallback(async () => {
        const data = framesRef.current;
        const w = Math.max(8, Math.round(outW));
        const h = Math.max(8, Math.round(outH));
        if (!data || !w || !h) return;
        setStatus('encoding');
        setError('');
        setProgress(45);
        try {
            const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
            const gif = GIFEncoder();
            let palette: ReturnType<typeof quantize> | undefined;
            let format: 'rgb565' | 'rgba4444' = 'rgb565';
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) throw new Error('Canvas is not available in this browser.');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            for (let i = 0; i < data.bitmaps.length; i++) {
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(data.bitmaps[i], 0, 0, w, h);
                const rgba = new Uint8Array(ctx.getImageData(0, 0, w, h).data);

                // 第 0 帧决定全局色表：有透明像素才用 rgba4444，否则用默认 rgb565（色深更高、无额外开销）
                if (i === 0) {
                    let hasAlpha = false;
                    for (let p = 3; p < rgba.length; p += 4) {
                        if (rgba[p] < 128) { hasAlpha = true; break; }
                    }
                    format = hasAlpha ? 'rgba4444' : 'rgb565';
                    palette = hasAlpha
                        ? quantize(rgba, 256, { format: 'rgba4444', oneBitAlpha: true })
                        : quantize(rgba, 256);
                }

                const index = applyPalette(rgba, palette!, format);

                gif.writeFrame(index, w, h, {
                    // 只有第 0 帧写色表，后续帧复用全局色表
                    ...(i === 0 ? { palette } : {}),
                    delay: data.delays[i],
                });

                setProgress(45 + Math.round(((i + 1) / data.bitmaps.length) * 50));
                await new Promise((r) => setTimeout(r, 0));
            }
            gif.finish();
            const bytes = gif.bytes();
            const blob = new Blob([bytes as unknown as BlobPart], { type: 'image/gif' });
            const url = URL.createObjectURL(blob);
            resultUrlRef.current = url;
            setResult({ url, bytes: blob.size, w, h });
            setStatus('idle');
            setProgress(100);
        } catch (e) {
            setStatus('error');
            setError(e instanceof Error ? e.message : 'Could not resize this GIF.');
        }
    }, [outW, outH]);

    const onW = (v: number) => {
        setOutW(v);
        if (lock) setOutH(Math.max(8, Math.round(v * ratio)));
    };
    const onH = (v: number) => {
        setOutH(v);
        if (lock) setOutW(Math.max(8, Math.round(v / ratio)));
    };
    const scale = (p: number) => {
        const w = Math.max(8, Math.round(src.w * p));
        setOutW(w);
        setOutH(Math.max(8, Math.round(w * ratio)));
    };

    const busy = status === 'decoding' || status === 'encoding';
    const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;

    return (
        <section className="resizer-tool">
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
                className={dragging ? 'dropzone is-dragging' : 'dropzone'}
            >
                <label>
                    <input type="file" accept="image/gif,.gif" onChange={(e) => onFiles(e.target.files)} hidden />
                    <span>{file ? file.name : 'Drop a GIF here, or click to choose'}</span>
                </label>
                <p className="hint">100% in your browser. The file never leaves your device.</p>
            </div>

            {file && src.w > 0 && (
                <div className="controls">
                    <p className="src">
                        Original: {src.w} × {src.h} · {src.frames} frames · {kb(src.bytes)}
                    </p>

                    <div className="scale-buttons">
                        {[0.75, 0.5, 0.25].map((p) => (
                            <button key={p} type="button" onClick={() => scale(p)} disabled={busy}>
                                {p * 100}%
                            </button>
                        ))}
                    </div>

                    <div className="fields">
                        <label>
                            Width
                            <input type="number" min={8} max={2000} value={outW || ''} onChange={(e) => onW(Number(e.target.value))} disabled={busy} />
                        </label>
                        <button type="button" onClick={() => setLock((v) => !v)} aria-pressed={lock}>
                            {lock ? '🔒 linked' : '🔓 free'}
                        </button>
                        <label>
                            Height
                            <input type="number" min={8} max={2000} value={outH || ''} onChange={(e) => onH(Number(e.target.value))} disabled={busy} />
                        </label>
                    </div>

                    <button type="button" onClick={resize} disabled={busy}>
                        {status === 'encoding' ? `Resizing… ${progress}%` : 'Resize GIF'}
                    </button>
                </div>
            )}

            {status === 'decoding' && <p className="hint">Reading frames… {progress}%</p>}
            {error && <p className="error" role="alert">{error}</p>}

            {result && (
                <div className="result">
                    <img src={result.url} alt={`Resized GIF preview, ${result.w} by ${result.h} pixels`} />
                    <p>
                        {result.w} × {result.h} · {kb(result.bytes)}
                        {src.bytes > 0 && result.bytes > 0 && (
                            <> · {result.bytes < src.bytes ? `${Math.round((1 - result.bytes / src.bytes) * 100)}% smaller` : 'larger than original'}</>
                        )}
                    </p>
                    <a href={result.url} download={`resized-${result.w}x${result.h}.gif`}>Download GIF</a>
                </div>
            )}
        </section>
    );
}
