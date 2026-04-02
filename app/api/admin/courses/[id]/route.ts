import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { courseFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "courses", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return notFound("Course not found");
  return success(course);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "courses", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) return notFound("Course not found");

  try {
    const body = await req.json();
    const parsed = courseFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.name);
    if (slug !== existing.slug) {
      const dup = await prisma.course.findUnique({ where: { slug } });
      if (dup) return badRequest("A course with this name already exists");
    }

    const course = await prisma.course.update({ where: { id }, data: { ...data, slug, avgSalary: data.avgSalary ?? null, updatedBy: auth.admin.id } });
    await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "Course", entityId: course.id, details: `Updated course: ${course.name}` });
    revalidateEntity("Course", course.slug);
    return success(course);
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "courses", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) return notFound("Course not found");

  const body = await req.json();
  if (typeof body.isActive !== "boolean") return badRequest("isActive must be a boolean");

  const course = await prisma.course.update({ where: { id }, data: { isActive: body.isActive, updatedBy: auth.admin.id } });
  await logActivity({ adminId: auth.admin.id, action: body.isActive ? "ACTIVATE" : "DEACTIVATE", entity: "Course", entityId: id, details: `${body.isActive ? "Activated" : "Deactivated"} course: ${existing.name}` });
  revalidateEntity("Course", existing.slug);
  return success(course);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "courses", "delete");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) return notFound("Course not found");
  await prisma.course.update({ where: { id }, data: { isActive: false } });
  await logActivity({ adminId: auth.admin.id, action: "DELETE", entity: "Course", entityId: id, details: `Soft-deleted course: ${existing.name}` });
  revalidateEntity("Course", existing.slug);
  return success({ message: "Course deleted" });
}
