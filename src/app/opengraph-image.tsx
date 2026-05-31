import { ImageResponse } from "next/og";

// Required when `output: 'export'` is set in next.config.ts
export const dynamic = "force-static";

export const alt = "Francesco Tenace — Full-stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#34d399",
            fontSize: 28,
            fontFamily: "monospace",
          }}
        >
          $ whoami
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Francesco Tenace
          </div>
          <div style={{ fontSize: 44, color: "#cbd5e1" }}>
            Full-stack Developer
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          <span>Java · .NET · Kubernetes · DevOps</span>
          <span style={{ color: "#34d399", fontFamily: "monospace" }}>~/ft</span>
        </div>
      </div>
    ),
    size,
  );
}
