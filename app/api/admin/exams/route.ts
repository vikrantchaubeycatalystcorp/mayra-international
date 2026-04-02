import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, paginated, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { examFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "exams", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const stream = url.searchParams.get("stream") || "";
  const level = url.searchParams.get("level") || "";
  const featured = url.searchParams.get("featured");

  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (stream) where.streams = { has: stream };
  if (level) where.level = level;
  if (featured === "true") where.isFeatured = true;
  if (active !== null && active !== undefined && active !== "") {
    where.isActive = active === "true";
  }

  const [data, total] = await Promise.all([
    prisma.exam.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
    prisma.exam.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "exams", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = examFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.name);
    const existing = await prisma.exam.findUnique({ where: { slug } });
    if (existing) return badRequest("An exam with this name already exists");

    const exam = await prisma.exam.create({
      data: {
        name: data.name, slug, fullName: data.fullName, conductingBody: data.conductingBody,
        streams: data.streams, level: data.level, mode: data.mode, frequency: data.frequency,
        registrationStart: data.registrationStart ?? null, registrationEnd: data.registrationEnd ?? null,
        examDate: data.examDate ?? null, resultDate: data.resultDate ?? null,
        applicationFeeGeneral: data.applicationFeeGeneral, applicationFeeSCST: data.applicationFeeSCST ?? null,
        totalSeats: data.totalSeats ?? null, participatingColleges: data.participatingColleges ?? null,
        eligibility: data.eligibility || "", description: data.description || "",
        syllabus: data.syllabus || [], isFeatured: data.isFeatured, isActive: data.isActive,
        createdBy: auth.admin.id, source: "admin",
      },
    });

    await logActivity({ adminId: auth.admin.id, action: "CREATE", entity: "Exam", entityId: exam.id, details: `Created exam: ${exam.name}` });
    revalidateEntity("Exam", exam.slug);
    return success(exam, 201);
  } catch (error) {
    console.error("Create exam error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
