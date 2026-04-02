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
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return notFound("Media asset not found");

  return success(asset);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) return notFound("Media asset not found");

  try {
    const body = await req.json();

    const asset = await prisma.mediaAsset.update({
      where: { id },
      data: {
        url: body.url ?? existing.url,
        alt: body.alt ?? existing.alt,
        type: body.type ?? existing.type,
        size: body.size !== undefined ? body.size : existing.size,
        width: body.width !== undefined ? body.width : existing.width,
        height: body.height !== undefined ? body.height : existing.height,
        folder: body.folder ?? existing.folder,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "MediaAsset",
      entityId: asset.id,
      details: `Updated media asset: ${asset.url}`,
    });

    revalidateEntity("MediaAsset");
    return success(asset);
  } catch (error) {
    console.error("Update media asset error:", error);
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
  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) return notFound("Media asset not found");

  await prisma.mediaAsset.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "MediaAsset",
    entityId: id,
    details: `Deleted media asset: ${existing.url}`,
  });

  revalidateEntity("MediaAsset");
  return success({ message: "Media asset deleted" });
}
