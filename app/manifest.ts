import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mayra International — Find Your Dream College in India",
    short_name: "Mayra International",
    description:
      "India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e40af",
    icons: [
      {
        src: "/icon",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
