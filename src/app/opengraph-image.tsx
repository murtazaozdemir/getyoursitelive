import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Get Your Site Live — Websites for Local Business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#F5EFE3",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Accent top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "#E85D29", display: "flex" }} />

        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#6B6660",
            marginBottom: 32,
            display: "flex",
            fontFamily: "monospace",
          }}
        >
          GET YOUR SITE LIVE
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 300,
            color: "#1A1815",
            lineHeight: 0.95,
            maxWidth: 900,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Websites built the{" "}
          <span style={{ color: "#E85D29", fontStyle: "italic", marginLeft: 16 }}>
            right way.
          </span>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            color: "#3A3530",
            lineHeight: 1.5,
            maxWidth: 700,
            display: "flex",
          }}
        >
          $500 flat · No monthly fees · Yours forever
        </div>
      </div>
    ),
    size,
  );
}
