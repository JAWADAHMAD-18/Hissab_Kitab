import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "Hisab Kitab — simple monthly money tracker";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAFA",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "80px",
        }}
      >
        {/* Brand Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#059669",
            }}
          />
          <span
            style={{
              fontSize: "76px",
              fontWeight: 800,
              color: "#171717",
              letterSpacing: "-0.04em",
            }}
          >
            Hisab Kitab
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#525252",
            margin: 0,
            letterSpacing: "-0.01em",
            textAlign: "center",
          }}
        >
          Track income and spending. See what&apos;s left.
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
