import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { studyAbroadFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "study-abroad", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const country = await prisma.studyAbroadCountry.findUnique({ where: { id } });
  if (!country) return notFound("Country not found");
  return success(country);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "study-abroad", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.studyAbroadCountry.findUnique({ where: { id } });
  if (!existing) return notFound("Country not found");

  try {
    const body = await req.json();
    const parsed = studyAbroadFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.name);
    if (slug !== existing.slug) {
      const dup = await prisma.studyAbroadCountry.findUnique({ where: { slug } });
      if (dup) return badRequest("This country already exists");
    }

    const country = await prisma.studyAbroadCountry.update({ where: { id }, data: { ...data, slug } });
    await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "StudyAbroad", entityId: country.id, details: `Updated country: ${country.name}` });
    revalidateEntity("StudyAbroad");
    return success(country);
  } catch (error) {
    console.error("Update study abroad error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "study-abroad", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.studyAbroadCountry.findUnique({ where: { id } });
  if (!existing) return notFound("Country not found");

  const body = await req.json();
  if (typeof body.isActive !== "boolean") return badRequest("isActive must be a boolean");

  const country = await prisma.studyAbroadCountry.update({ where: { id }, data: { isActive: body.isActive } });
  await logActivity({ adminId: auth.admin.id, action: body.isActive ? "ACTIVATE" : "DEACTIVATE", entity: "StudyAbroad", entityId: id, details: `${body.isActive ? "Activated" : "Deactivated"} country: ${existing.name}` });
  revalidateEntity("StudyAbroad");
  return success(country);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "study-abroad", "delete");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.studyAbroadCountry.findUnique({ where: { id } });
  if (!existing) return notFound("Country not found");
  await prisma.studyAbroadCountry.update({ where: { id }, data: { isActive: false } });
  await logActivity({ adminId: auth.admin.id, action: "DELETE", entity: "StudyAbroad", entityId: id, details: `Deleted country: ${existing.name}` });
  revalidateEntity("StudyAbroad");
  return success({ message: "Country deleted" });
}
