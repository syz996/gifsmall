export type CompressOptions = {
  scale?: number;
  maxColors?: number;
};

export type CompressResult = {
  blob: Blob;
  before: number;
  after: number;
  width: number;
  height: number;
  frames: number;
};

type WorkerResponse = {
  blob?: Blob;
  after?: number;
  width?: number;
  height?: number;
  frames?: number;
  error?: string;
};

export async function compressGif(
  file: File,
  opts: CompressOptions = {},
): Promise<CompressResult> {
  const buffer = await file.arrayBuffer();
  const before = file.size;

  return new Promise<CompressResult>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('../workers/gif.worker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      reject(new Error('Web Workers are not supported in this browser.'));
      return;
    }

    let settled = false;
    const cleanup = () => {
      worker.terminate();
    };
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (settled) return;
      const data = event.data;
      if (data.error) {
        fail(data.error);
        return;
      }
      if (!data.blob || typeof data.after !== 'number' ||
          typeof data.width !== 'number' || typeof data.height !== 'number' ||
          typeof data.frames !== 'number') {
        fail('The compression worker returned an incomplete result.');
        return;
      }
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
