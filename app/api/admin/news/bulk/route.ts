import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "news", "import");
  if (auth instanceof NextResponse) return auth;

  try {
    const { articles } = await request.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ success: false, error: "articles array is required" }, { status: 400 });
    }

    if (articles.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 articles per batch" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < articles.length; i++) {
      const a = articles[i];
      if (!a.title || typeof a.title !== "string" || !a.title.trim()) {
        errors.push({ index: i, error: "title is required and must be a non-empty string" });
        skipped++;
        continue;
      }
      if (!a.slug || typeof a.slug !== "string" || !a.slug.trim()) {
        errors.push({ index: i, error: "slug is required and must be a non-empty string" });
        skipped++;
        continue;
      }
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

    await logActivity({
      adminId: auth.admin.id,
      action: "IMPORT",
      entity: "NewsArticle",
      details: `Bulk imported ${created} articles (${skipped} skipped) out of ${articles.length}`,
    });

    revalidateEntity("News");
    return NextResponse.json({ success: true, data: { created, skipped, total: articles.length, errors: errors.length > 0 ? errors : undefined } });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
