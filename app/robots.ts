import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/", "/(payload)/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/colleges/", "/courses/", "/exams/", "/news/", "/study-abroad/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/colleges/", "/courses/", "/exams/", "/news/", "/study-abroad/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/colleges/", "/courses/", "/exams/", "/news/", "/study-abroad/"],
      },
    ],
    sitemap: "https://mayra.in/sitemap.xml",
  };
}
