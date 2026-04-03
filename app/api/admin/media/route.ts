import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { z } from "zod";

const mediaUrlSchema = z.string().url().refine(
  (url) => /^https?:\/\//i.test(url),
  { message: "URL must use http or https protocol" }
);

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { url } = getSearchParams(req);
  const folder = url.searchParams.get("folder") || "";
  const type = url.searchParams.get("type") || "";

  const where: Record<string, unknown> = {};
  if (folder) where.folder = folder;
  if (type) where.type = type;

  const data = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.url) {
      return badRequest("url is required");
    }

    const urlResult = mediaUrlSchema.safeParse(body.url);
    if (!urlResult.success) {
      return badRequest("Invalid URL: must be a valid http or https URL");
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        url: body.url,
        alt: body.alt ?? "",
        type: body.type ?? "image",
        size: body.size ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
        folder: body.folder ?? "general",
        uploadedBy: auth.admin.id,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "MediaAsset",
      entityId: asset.id,
      details: `Uploaded media asset: ${asset.url}`,
    });

    revalidateEntity("MediaAsset");
    return success(asset, 201);
  } catch (error) {
    console.error("Create media asset error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
