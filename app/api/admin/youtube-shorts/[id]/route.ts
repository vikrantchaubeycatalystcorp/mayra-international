import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest, notFound } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { parseYouTubeId, youTubeThumb } from "@/lib/youtube";

type Props = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const short = await prisma.youTubeShort.findUnique({ where: { id } });
  if (!short) return notFound("Video not found");

  return success(short);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.youTubeShort.findUnique({ where: { id } });
  if (!existing) return notFound("Video not found");

  try {
    const body = await req.json();

    // If the URL changed, re-parse the video ID and refresh the derived thumbnail.
    let videoId = existing.videoId;
    let thumbnail = body.thumbnail !== undefined ? body.thumbnail : existing.thumbnail;
    if (body.url && body.url !== existing.url) {
      const parsed = parseYouTubeId(body.url);
      if (!parsed) {
        return badRequest("Invalid YouTube URL — paste a valid video or Shorts link");
      }
      videoId = parsed;
      if (body.thumbnail === undefined) thumbnail = youTubeThumb(parsed);
    }

    const short = await prisma.youTubeShort.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        url: body.url ?? existing.url,
        videoId,
        type: body.type !== undefined ? (body.type === "video" ? "video" : "short") : existing.type,
        thumbnail,
        description: body.description !== undefined ? body.description : existing.description,
        category: body.category !== undefined ? body.category : existing.category,
        isFeatured: body.isFeatured ?? existing.isFeatured,
        isActive: body.isActive ?? existing.isActive,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        updatedBy: auth.admin.id,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "YouTubeShort",
      entityId: short.id,
      details: `Updated YouTube ${short.type}: ${short.title.substring(0, 50)}`,
    });

    revalidateEntity("YouTubeShort");
    return success(short);
  } catch (error) {
    console.error("Update YouTube short error:", error);
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
  const existing = await prisma.youTubeShort.findUnique({ where: { id } });
  if (!existing) return notFound("Video not found");

  await prisma.youTubeShort.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "YouTubeShort",
    entityId: id,
    details: `Deleted YouTube ${existing.type}: ${existing.title.substring(0, 50)}`,
  });

  revalidateEntity("YouTubeShort");
  return success({ message: "Video deleted" });
}
