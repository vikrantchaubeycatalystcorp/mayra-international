import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.pageSeo.findMany({
    orderBy: { pageSlug: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.pageSlug || !body.title || !body.description) {
      return badRequest("pageSlug, title, and description are required");
    }

    const seo = await prisma.pageSeo.create({
      data: {
        pageSlug: body.pageSlug,
        title: body.title,
        description: body.description,
        keywords: body.keywords ?? [],
        ogImage: body.ogImage ?? null,
        ogTitle: body.ogTitle ?? null,
        ogDescription: body.ogDescription ?? null,
        canonical: body.canonical ?? null,
        noIndex: body.noIndex ?? false,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "PageSeo",
      entityId: seo.id,
      details: `Created page SEO: ${seo.pageSlug}`,
    });

    revalidateEntity("PageSeo");
    return success(seo, 201);
  } catch (error) {
    console.error("Create page SEO error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
