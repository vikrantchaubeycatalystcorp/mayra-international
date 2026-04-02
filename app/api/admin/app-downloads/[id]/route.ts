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
  const link = await prisma.appDownloadLink.findUnique({ where: { id } });
  if (!link) return notFound("App download link not found");

  return success(link);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.appDownloadLink.findUnique({ where: { id } });
  if (!existing) return notFound("App download link not found");

  try {
    const body = await req.json();

    const link = await prisma.appDownloadLink.update({
      where: { id },
      data: {
        platform: body.platform ?? existing.platform,
        icon: body.icon ?? existing.icon,
        storeLabel: body.storeLabel ?? existing.storeLabel,
        storeName: body.storeName ?? existing.storeName,
        url: body.url ?? existing.url,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "AppDownloadLink",
      entityId: link.id,
      details: `Updated app download link: ${link.platform}`,
    });

    revalidateEntity("AppDownloadLink");
    return success(link);
  } catch (error) {
    console.error("Update app download link error:", error);
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
  const existing = await prisma.appDownloadLink.findUnique({ where: { id } });
  if (!existing) return notFound("App download link not found");

  await prisma.appDownloadLink.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "AppDownloadLink",
    entityId: id,
    details: `Deleted app download link: ${existing.platform}`,
  });

  revalidateEntity("AppDownloadLink");
  return success({ message: "App download link deleted" });
}
