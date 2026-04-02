import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.homeSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.sectionKey || !body.title) {
      return badRequest("sectionKey and title are required");
    }

    const section = await prisma.homeSection.create({
      data: {
        sectionKey: body.sectionKey,
        title: body.title,
        subtitle: body.subtitle ?? null,
        ctaLabel: body.ctaLabel ?? null,
        ctaLink: body.ctaLink ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "HomeSection",
      entityId: section.id,
      details: `Created home section: ${section.title}`,
    });

    revalidateEntity("HomeSection");
    return success(section, 201);
  } catch (error) {
    console.error("Create home section error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
