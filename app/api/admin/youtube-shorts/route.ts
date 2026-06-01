import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { parseYouTubeId, youTubeThumb } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { search } = getSearchParams(req);

  const data = await prisma.youTubeShort.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.title) return badRequest("title is required");
    if (!body.url) return badRequest("url is required");

    const videoId = parseYouTubeId(body.url);
    if (!videoId) {
      return badRequest("Invalid YouTube URL — paste a valid video or Shorts link");
    }

    const type = body.type === "video" ? "video" : "short";

    const short = await prisma.youTubeShort.create({
      data: {
        title: body.title,
        url: body.url,
        videoId,
        type,
        thumbnail: body.thumbnail || youTubeThumb(videoId),
        description: body.description ?? "",
        category: body.category ?? null,
        isFeatured: body.isFeatured ?? false,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
        createdBy: auth.admin.id,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "YouTubeShort",
      entityId: short.id,
      details: `Created YouTube ${type}: ${short.title.substring(0, 50)}`,
    });

    revalidateEntity("YouTubeShort");
    return success(short, 201);
  } catch (error) {
    console.error("Create YouTube short error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
