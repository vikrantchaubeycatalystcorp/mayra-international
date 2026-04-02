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
  const section = await prisma.ctaSection.findUnique({ where: { id } });
  if (!section) return notFound("CTA section not found");

  return success(section);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.ctaSection.findUnique({ where: { id } });
  if (!existing) return notFound("CTA section not found");

  try {
    const body = await req.json();

    const section = await prisma.ctaSection.update({
      where: { id },
      data: {
        sectionKey: body.sectionKey ?? existing.sectionKey,
        badge: body.badge !== undefined ? body.badge : existing.badge,
        heading: body.heading ?? existing.heading,
        subheading: body.subheading !== undefined ? body.subheading : existing.subheading,
        ctaPrimaryText: body.ctaPrimaryText !== undefined ? body.ctaPrimaryText : existing.ctaPrimaryText,
        ctaPrimaryLink: body.ctaPrimaryLink !== undefined ? body.ctaPrimaryLink : existing.ctaPrimaryLink,
        ctaSecondaryText: body.ctaSecondaryText !== undefined ? body.ctaSecondaryText : existing.ctaSecondaryText,
        ctaSecondaryLink: body.ctaSecondaryLink !== undefined ? body.ctaSecondaryLink : existing.ctaSecondaryLink,
        footnote: body.footnote !== undefined ? body.footnote : existing.footnote,
        bgGradient: body.bgGradient !== undefined ? body.bgGradient : existing.bgGradient,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "CtaSection",
      entityId: section.id,
      details: `Updated CTA section: ${section.sectionKey}`,
    });

    revalidateEntity("CtaSection");
    return success(section);
  } catch (error) {
    console.error("Update CTA section error:", error);
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
  const existing = await prisma.ctaSection.findUnique({ where: { id } });
  if (!existing) return notFound("CTA section not found");

  await prisma.ctaSection.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "CtaSection",
    entityId: id,
    details: `Deleted CTA section: ${existing.sectionKey}`,
  });

  revalidateEntity("CtaSection");
  return success({ message: "CTA section deleted" });
}
