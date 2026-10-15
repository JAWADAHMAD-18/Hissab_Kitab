import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const contentType = "image/png";
export const size = { width: 180, height: 180 };

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#FAFAFA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#059669",
            }}
          />
          <span
            style={{
              fontFamily: "sans-serif",
              fontWeight: 800,
              fontSize: 44,
              color: "#111827",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            HK
          </span>
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
