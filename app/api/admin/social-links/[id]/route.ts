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
  const link = await prisma.socialLink.findUnique({ where: { id } });
  if (!link) return notFound("Social link not found");

  return success(link);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.socialLink.findUnique({ where: { id } });
  if (!existing) return notFound("Social link not found");

  try {
    const body = await req.json();

    const link = await prisma.socialLink.update({
      where: { id },
      data: {
        platform: body.platform ?? existing.platform,
        url: body.url ?? existing.url,
        icon: body.icon ?? existing.icon,
        hoverColor: body.hoverColor ?? existing.hoverColor,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "SocialLink",
      entityId: link.id,
      details: `Updated social link: ${link.platform}`,
    });

    revalidateEntity("SocialLink");
    return success(link);
  } catch (error) {
    console.error("Update social link error:", error);
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
  const existing = await prisma.socialLink.findUnique({ where: { id } });
  if (!existing) return notFound("Social link not found");

  await prisma.socialLink.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "SocialLink",
    entityId: id,
    details: `Deleted social link: ${existing.platform}`,
  });

  revalidateEntity("SocialLink");
  return success({ message: "Social link deleted" });
}
