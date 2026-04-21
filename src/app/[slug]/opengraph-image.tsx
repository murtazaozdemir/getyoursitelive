import { ImageResponse } from "next/og";
import { getBusinessBySlug } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Business site preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);

  const name = biz?.businessInfo.name ?? "Local Business";
  const tagline = biz?.businessInfo.tagline ?? "";
  const address = biz?.businessInfo.address ?? "";
  const phone = biz?.businessInfo.phone ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #0f2b23 0%, #1a4a38 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "#e2a84b", display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 16, color: "#e2a84b", letterSpacing: "0.15em", textTransform: "uppercase", display: "flex" }}>
            {biz?.category ?? "Auto Repair"}
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1.05, display: "flex" }}>
            {name}
          </div>
          {tagline ? (
            <div style={{ fontSize: 28, color: "#a8c5b5", lineHeight: 1.4, display: "flex" }}>
              {tagline}
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
            {address ? (
              <div style={{ fontSize: 20, color: "#6b9e88", display: "flex" }}>{address}</div>
            ) : null}
            {phone ? (
              <div style={{ fontSize: 20, color: "#6b9e88", display: "flex" }}>{phone}</div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
