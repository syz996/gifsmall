import type { ToolError as ErrorShape } from '@/lib/errors';

export default function ToolError({ error }: { error: ErrorShape | null }) {
  if (!error) return null;

  return (
    <div className="tool-error" role="alert">
      <strong>{error.title}</strong>
      <p>{error.body}</p>
    </div>
  );
}
