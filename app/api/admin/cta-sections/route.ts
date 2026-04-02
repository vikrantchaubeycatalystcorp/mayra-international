import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.ctaSection.findMany({
    orderBy: { sectionKey: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.sectionKey || !body.heading) {
      return badRequest("sectionKey and heading are required");
    }

    const section = await prisma.ctaSection.create({
      data: {
        sectionKey: body.sectionKey,
        badge: body.badge ?? null,
        heading: body.heading,
        subheading: body.subheading ?? null,
        ctaPrimaryText: body.ctaPrimaryText ?? null,
        ctaPrimaryLink: body.ctaPrimaryLink ?? null,
        ctaSecondaryText: body.ctaSecondaryText ?? null,
        ctaSecondaryLink: body.ctaSecondaryLink ?? null,
        footnote: body.footnote ?? null,
        bgGradient: body.bgGradient ?? null,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "CtaSection",
      entityId: section.id,
      details: `Created CTA section: ${section.sectionKey}`,
    });

    revalidateEntity("CtaSection");
    return success(section, 201);
  } catch (error) {
    console.error("Create CTA section error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
