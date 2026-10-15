import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

interface IconOptions {
  size: number;
  maskable?: boolean;
}

function buildIcon({ size, maskable = false }: IconOptions): ReactElement {
  // Maskable: content stays inside the 80% safe zone
  const safeSize = maskable ? size * 0.8 : size;
  const dotSize = Math.round(safeSize * 0.14);
  const fontSize = Math.round(safeSize * 0.27);
  const gap = Math.round(dotSize * 0.4);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap,
        }}
      >
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: "#059669",
          }}
        />
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize,
            color: "#111827",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          HK
        </span>
      </div>
    </div>
  );
}

export function iconResponse(size: number, maskable = false) {
  return new ImageResponse(buildIcon({ size, maskable }), {
    width: size,
    height: size,
  });
}
