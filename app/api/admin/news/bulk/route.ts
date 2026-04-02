import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { revalidateEntity } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ success: false, error: "articles array is required" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const a of articles) {
      try {
        await prisma.newsArticle.upsert({
          where: { slug: a.slug },
          update: {},
          create: {
            title: a.title,
            slug: a.slug,
            category: a.category || "General",
            summary: a.summary || "",
            content: a.content || "",
            publishedAt: a.publishedAt || new Date().toISOString(),
            imageColor: a.imageColor || "#3B82F6",
            author: a.author || "Editorial Team",
            isLive: a.isLive || false,
            isActive: true,
            tags: a.tags || [],
            views: a.views || 0,
            source: "bulk-import",
          },
        });
        created++;
      } catch {
        skipped++;
      }
    }

    revalidateEntity("News");
    return NextResponse.json({ success: true, data: { created, skipped, total: articles.length } });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
