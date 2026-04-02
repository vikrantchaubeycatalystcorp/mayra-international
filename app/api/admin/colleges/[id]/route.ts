import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { collegeFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req, "colleges", "view");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) return notFound("College not found");

  return success(college);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req, "colleges", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.college.findUnique({ where: { id } });
  if (!existing) return notFound("College not found");

  try {
    const body = await req.json();
    const parsed = collegeFormSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(
        "Validation failed",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const data = parsed.data;
    const slug = createSlug(data.name);

    if (slug !== existing.slug) {
      const slugExists = await prisma.college.findUnique({ where: { slug } });
      if (slugExists) return badRequest("A college with this name already exists");
    }

    const college = await prisma.college.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        logo: data.logo || existing.logo,
        city: data.city,
        state: data.state,
        address: data.address,
        countryCode: data.countryCode,
        type: data.type,
        established: data.established,
        streams: data.streams,
        nirfRank: data.nirfRank ?? null,
        rating: data.rating,
        reviewCount: data.reviewCount,
        feesMin: data.feesMin,
        feesMax: data.feesMax,
        avgPackage: data.avgPackage ?? null,
        topPackage: data.topPackage ?? null,
        placementRate: data.placementRate ?? null,
        accreditation: data.accreditation || [],
        courses: data.courses || [],
        description: data.description || "",
        highlights: data.highlights || [],
        website: data.website || null,
        phone: data.phone || null,
        totalStudents: data.totalStudents ?? null,
        faculty: data.faculty ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        updatedBy: auth.admin.id,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "College",
      entityId: college.id,
      details: `Updated college: ${college.name}`,
    });

    revalidateEntity("College", college.slug);
    return success(college);
  } catch (error) {
    console.error("Update college error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req, "colleges", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.college.findUnique({ where: { id } });
  if (!existing) return notFound("College not found");

  const body = await req.json();
  if (typeof body.isActive !== "boolean") return badRequest("isActive must be a boolean");

  const college = await prisma.college.update({
    where: { id },
    data: { isActive: body.isActive, updatedBy: auth.admin.id },
  });

  await logActivity({
    adminId: auth.admin.id,
    action: body.isActive ? "ACTIVATE" : "DEACTIVATE",
    entity: "College",
    entityId: id,
    details: `${body.isActive ? "Activated" : "Deactivated"} college: ${existing.name}`,
  });

  revalidateEntity("College", existing.slug);
  return success(college);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req, "colleges", "delete");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.college.findUnique({ where: { id } });
  if (!existing) return notFound("College not found");

  await prisma.college.update({
    where: { id },
    data: { isActive: false },
  });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "College",
    entityId: id,
    details: `Soft-deleted college: ${existing.name}`,
  });

  revalidateEntity("College", existing.slug);
  return success({ message: "College deleted" });
}
