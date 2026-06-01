import { ImageResponse } from "next/og";

export const alt = "Mayra International — India's Most Trusted Education Portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #11392B 0%, #164A37 45%, #1C5A42 100%)",
          fontFamily: "serif",
          padding: "60px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100px",
            height: "100px",
            background: "#FBF9F4",
            borderRadius: "24px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#1C5A42",
              lineHeight: 1,
            }}
          >
            M
          </span>
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          Mayra International
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#CFC6B6",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: "800px",
          }}
        >
          Find Your Dream College in India — 25,000+ Colleges | 500+ Exams | 800+ Courses
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "40px",
          }}
        >
          {["Colleges", "Exams", "Courses", "Study Abroad"].map((item) => (
            <div
              key={item}
              style={{
                padding: "10px 24px",
                background: "rgba(200, 132, 27, 0.18)",
                border: "1px solid rgba(200, 132, 27, 0.4)",
                borderRadius: "999px",
                color: "#EAD3A3",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
