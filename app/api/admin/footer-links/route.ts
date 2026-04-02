import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { url } = getSearchParams(req);
  const sectionId = url.searchParams.get("sectionId") || "";

  const where: Record<string, unknown> = {};
  if (sectionId) where.sectionId = sectionId;

  const data = await prisma.footerLink.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.sectionId || !body.label || !body.href) {
      return badRequest("sectionId, label, and href are required");
    }

    const link = await prisma.footerLink.create({
      data: {
        sectionId: body.sectionId,
        label: body.label,
        href: body.href,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "FooterLink",
      entityId: link.id,
      details: `Created footer link: ${link.label}`,
    });

    revalidateEntity("FooterLink");
    return success(link, 201);
  } catch (error) {
    console.error("Create footer link error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
