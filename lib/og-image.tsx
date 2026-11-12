import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function renderOg({
  eyebrow, title, sub,
}: { eyebrow: string; title: string; sub: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "72px", background: "#0B1220", color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 3, color: "#7DD3FC" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.1, marginTop: 28 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 44, marginTop: 32, color: "#94A3B8" }}>
          {sub}
        </div>
      </div>
    ),
    ogSize,
  );
}
