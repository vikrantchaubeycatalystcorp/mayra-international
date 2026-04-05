import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          borderRadius: "10px",
        }}
      >
        <span
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size }
  );
}
