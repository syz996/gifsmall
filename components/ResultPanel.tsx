'use client';

import { formatSize, percentSaved } from '@/lib/format';

type Props = {
  before: number;
  after: number;
  width: number;
  height: number;
  frames: number;
  downloadUrl: string | null;
  downloadName: string;
  /** 达标提示，如「under your 20 MB limit」；不传则不显示徽章 */
  status?: { text: string; good: boolean };
  /** 额外一行说明，如版本切换按钮 */
  children?: React.ReactNode;
};

export default function ResultPanel({
  before,
  after,
  width,
  height,
  frames,
  downloadUrl,
  downloadName,
  status,
  children,
}: Props) {
  const saved = percentSaved(before, after);

  return (
    <div className="result-area" aria-live="polite">
      <div className="result-heading">
        <h3>Compressed GIF</h3>
        {status && (
          <span className={`result-status ${status.good ? 'good' : 'neutral'}`}>
            {status.text}
          </span>
        )}
      </div>

      <div className="comparison-grid">
        <div className="comparison-item">
          <span>Original</span>
          <strong>{formatSize(before)}</strong>
        </div>
        <div className="comparison-arrow" aria-hidden="true">→</div>
        <div className="comparison-item">
          <span>Compressed</span>
          <strong>{formatSize(after)}</strong>
        </div>
      </div>

      <p className="result-meta">
        {width} × {height} px · {frames} frames
        {saved > 0 ? ` · ${saved}% smaller` : ' · no size gain — try a smaller target'}
      </p>

      {children}

      {downloadUrl && (
        <a className="download-button" href={downloadUrl} download={downloadName}>
          Download GIF
        </a>
      )}
    </div>
  );
}
