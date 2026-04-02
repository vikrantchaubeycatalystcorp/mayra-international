import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { examFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "exams", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) return notFound("Exam not found");
  return success(exam);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "exams", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.exam.findUnique({ where: { id } });
  if (!existing) return notFound("Exam not found");

  try {
    const body = await req.json();
    const parsed = examFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.name);
    if (slug !== existing.slug) {
      const dup = await prisma.exam.findUnique({ where: { slug } });
      if (dup) return badRequest("An exam with this name already exists");
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        name: data.name, slug, fullName: data.fullName, conductingBody: data.conductingBody,
        streams: data.streams, level: data.level, mode: data.mode, frequency: data.frequency,
        registrationStart: data.registrationStart ?? null, registrationEnd: data.registrationEnd ?? null,
        examDate: data.examDate ?? null, resultDate: data.resultDate ?? null,
        applicationFeeGeneral: data.applicationFeeGeneral, applicationFeeSCST: data.applicationFeeSCST ?? null,
        totalSeats: data.totalSeats ?? null, participatingColleges: data.participatingColleges ?? null,
        eligibility: data.eligibility || "", description: data.description || "",
        syllabus: data.syllabus || [], isFeatured: data.isFeatured, isActive: data.isActive,
        updatedBy: auth.admin.id,
      },
    });

    await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "Exam", entityId: exam.id, details: `Updated exam: ${exam.name}` });
    revalidateEntity("Exam", exam.slug);
    return success(exam);
  } catch (error) {
    console.error("Update exam error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "exams", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.exam.findUnique({ where: { id } });
  if (!existing) return notFound("Exam not found");

  const body = await req.json();
  if (typeof body.isActive !== "boolean") return badRequest("isActive must be a boolean");

  const exam = await prisma.exam.update({ where: { id }, data: { isActive: body.isActive, updatedBy: auth.admin.id } });
  await logActivity({ adminId: auth.admin.id, action: body.isActive ? "ACTIVATE" : "DEACTIVATE", entity: "Exam", entityId: id, details: `${body.isActive ? "Activated" : "Deactivated"} exam: ${existing.name}` });
  revalidateEntity("Exam", existing.slug);
  return success(exam);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "exams", "delete");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.exam.findUnique({ where: { id } });
  if (!existing) return notFound("Exam not found");
  await prisma.exam.update({ where: { id }, data: { isActive: false } });
  await logActivity({ adminId: auth.admin.id, action: "DELETE", entity: "Exam", entityId: id, details: `Soft-deleted exam: ${existing.name}` });
  revalidateEntity("Exam", existing.slug);
  return success({ message: "Exam deleted" });
}
