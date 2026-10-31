/// <reference lib="webworker" />
import { parseGIF, decompressFrames } from 'gifuct-js';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

type Msg = { buffer: ArrayBuffer; opts: { scale?: number; maxColors?: number } };

self.addEventListener('message', (ev: MessageEvent<Msg>) => {
  try {
    const { buffer, opts } = ev.data;
    const scale = Math.min(1, Math.max(0.1, opts.scale ?? 1));
    const maxColors = Math.min(256, Math.max(2, opts.maxColors ?? 128));

    const bytes = new Uint8Array(buffer);
    if (bytes.length < 6 || String.fromCharCode(...bytes.slice(0, 6)) !== 'GIF87a' &&
      String.fromCharCode(...bytes.slice(0, 6)) !== 'GIF89a') {
      throw new Error('This file does not contain a valid GIF signature.');
    }

    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);
    if (!frames.length) throw new Error('No frames could be decoded from this GIF.');

    const width: number = gif.lsd.width;
    const height: number = gif.lsd.height;
    if (!width || !height) throw new Error('Invalid GIF dimensions.');

    const outW = Math.max(1, Math.round(width * scale));
    const outH = Math.max(1, Math.round(height * scale));

    if (typeof OffscreenCanvas === 'undefined') {
      throw new Error('This browser does not support local GIF compression. Please try a recent version of Chrome, Edge, or Firefox.');
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const outputCanvas = new OffscreenCanvas(outW, outH);
    const outputContext = outputCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !outputContext) throw new Error('Canvas is not available in this browser.');

    const encoder = GIFEncoder();
    let previous: { left: number; top: number; width: number; height: number; disposal: number } | null = null;

    // 全局色表（整份动画只量化一次）
    let palette: ReturnType<typeof quantize> | undefined;
    let format: 'rgb565' | 'rgba4444' = 'rgb565';
    let transparentIndex: number | undefined;
    let paletteWritten = false;

    for (const frame of frames) {
      if (previous && previous.disposal === 2) {
        ctx.clearRect(previous.left, previous.top, previous.width, previous.height);
      }

      const { left, top, width: frameWidth, height: frameHeight } = frame.dims;
      const patch = new ImageData(new Uint8ClampedArray(frame.patch), frameWidth, frameHeight);
      ctx.putImageData(patch, left, top);

      outputContext.clearRect(0, 0, outW, outH);
      outputContext.drawImage(canvas, 0, 0, outW, outH);

      const imageData = outputContext.getImageData(0, 0, outW, outH).data;
      const rgbaData = new Uint8Array(
        imageData.buffer as ArrayBuffer,
        imageData.byteOffset,
        imageData.byteLength,
      );

      // 第 0 帧决定全局色表：有透明像素用 rgba4444，否则 rgb565（色深高 4 倍、体积不增）
      if (!palette) {
        let hasAlpha = false;
        for (let p = 3; p < rgbaData.length; p += 4) {
          if (rgbaData[p] < 128) { hasAlpha = true; break; }
        }
        format = hasAlpha ? 'rgba4444' : 'rgb565';
        palette = hasAlpha
          ? quantize(rgbaData, maxColors, { format: 'rgba4444', oneBitAlpha: true })
          : quantize(rgbaData, maxColors);
      }

      const indexed = applyPalette(rgbaData, palette!, format);
      const delay = frame.delay && frame.delay >= 20 ? frame.delay : 100;

      encoder.writeFrame(indexed, outW, outH, {
        // 只有第 0 帧写色表，后续帧复用（每帧省 768 字节）
        ...(paletteWritten ? {} : { palette: palette! }),
        delay,
      });
      paletteWritten = true;

      previous = {
        left,
        top,
        width: frameWidth,
        height: frameHeight,
        disposal: frame.disposalType ?? 0,
      };
    }

    encoder.finish();
    const encoded = encoder.bytes();
    const outputBuffer = encoded.buffer.slice(
      encoded.byteOffset,
      encoded.byteOffset + encoded.byteLength,
    ) as ArrayBuffer;
    const blob = new Blob([outputBuffer], { type: 'image/gif' });

    (self as unknown as Worker).postMessage({
      blob,
      after: blob.size,
      width: outW,
      height: outH,
      frames: frames.length,
    });
  } catch (error) {
    (self as unknown as Worker).postMessage({
      error: error instanceof Error ? error.message : 'Unknown compression error.',
    });
  }
});
