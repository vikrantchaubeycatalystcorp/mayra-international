import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

type Props = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const seo = await prisma.pageSeo.findUnique({ where: { id } });
  if (!seo) return notFound("Page SEO record not found");

  return success(seo);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.pageSeo.findUnique({ where: { id } });
  if (!existing) return notFound("Page SEO record not found");

  try {
    const body = await req.json();

    const seo = await prisma.pageSeo.update({
      where: { id },
      data: {
        pageSlug: body.pageSlug ?? existing.pageSlug,
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        keywords: body.keywords ?? existing.keywords,
        ogImage: body.ogImage !== undefined ? body.ogImage : existing.ogImage,
        ogTitle: body.ogTitle !== undefined ? body.ogTitle : existing.ogTitle,
        ogDescription: body.ogDescription !== undefined ? body.ogDescription : existing.ogDescription,
        canonical: body.canonical !== undefined ? body.canonical : existing.canonical,
        noIndex: body.noIndex ?? existing.noIndex,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "PageSeo",
      entityId: seo.id,
      details: `Updated page SEO: ${seo.pageSlug}`,
    });

    revalidateEntity("PageSeo");
    return success(seo);
  } catch (error) {
    console.error("Update page SEO error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "manage");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.pageSeo.findUnique({ where: { id } });
  if (!existing) return notFound("Page SEO record not found");

  await prisma.pageSeo.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "PageSeo",
    entityId: id,
    details: `Deleted page SEO: ${existing.pageSlug}`,
  });

  revalidateEntity("PageSeo");
  return success({ message: "Page SEO record deleted" });
}
