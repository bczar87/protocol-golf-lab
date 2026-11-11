import { ImageResponse } from "next/og";

export const alt = "Protocol Golf Lab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#e5dfd1",
          color: "#1c1e16",
          padding: "64px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 22, letterSpacing: 2 }}>
          <span>PGL-REV-1</span>
          <span>LAB SCORE · COMING SOON</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 0.95 }}>Protocol Golf Lab</div>
          <div style={{ fontSize: 32, marginTop: 18 }}>We measured it, not surveyed it.</div>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 24 }}>Specs · checked price · 3-year cost</div>
      </div>
    ),
    { ...size },
  );
}
