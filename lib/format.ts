export function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function percentSaved(before: number, after: number): number {
  if (!before || !after || after >= before) return 0;
  return Math.round((1 - after / before) *100);
}

export function framesNote(frames: number): string {
  return `${frames} ${frames === 1 ? 'frame' : 'frames'}`;
}
