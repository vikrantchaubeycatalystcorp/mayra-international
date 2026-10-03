import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "../lib/site-stats";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mayra International — Colleges, Exams & Admission Counselling",
    short_name: "Mayra International",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e40af",
    icons: [
      {
        src: "/favicon-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/favicon-144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
