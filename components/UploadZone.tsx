'use client';

import { useRef, useState } from 'react';

type Props = {
  onFile: (file: File) => void;
  onInvalidFile?: (fileName: string) => void;
  hint?: string;
  busy?: boolean;
};

export default function UploadZone({
  onFile,
  onInvalidFile,
  hint = 'GIF files only. Everything runs in your browser.',
  busy = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = () => {
    if (!busy) inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== 'image/gif' && !/\.gif$/i.test(file.name)) {
      onInvalidFile?.(file.name);
      return;
    }
    onFile(file);
  };

  return (
    <div
      className={`dropzone${dragging ? ' is-dragging' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Choose a GIF file or drop one here"
      aria-disabled={busy || undefined}
      onClick={pick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".gif,image/gif"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="upload-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3" />
        </svg>
      </div>
      <h2>Drop your GIF here</h2>
      <p>
        or <span className="text-link">browse files</span> from your device
      </p>
      <span className="file-hint">{hint}</span>
    </div>
  );
}
