export type ToolError = { title: string; body: string };

export function notGifError(fileName: string): ToolError {
  return {
    title: `${fileName} is not a GIF`,
    body: 'This tool only reads animated GIFs. Export your image as a .gif first, or use a different converter.',
  };
}

export function tooLargeError(bytes: number, limitMb: number): ToolError {
  return {
    title: `This GIF is ${formatSizeShort(bytes)} — the limit is ${limitMb} MB`,
    body: 'Try a smaller export, or resize the GIF first so it has fewer pixels to encode.',
  };
}

export function browserError(message?: string): ToolError {
  return {
    title: 'This browser could not process the GIF',
    body: message
      ? `${message} Try Chrome, Edge or a recent Safari on a desktop.`
      : 'Try Chrome, Edge or a recent Safari on a desktop.',
  };
}

export function workerError(message?: string): ToolError {
  return {
    title: 'The compression stopped part-way',
    body: message
      ? `${message} Reload the page and try again — a very long animation is often the cause.`
      : 'Reload the page and try again — a very long animation is often the cause.',
  };
}

function formatSizeShort(bytes: number): string {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}
