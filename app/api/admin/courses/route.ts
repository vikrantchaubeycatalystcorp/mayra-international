import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, paginated, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { courseFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "courses", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const stream = url.searchParams.get("stream") || "";
  const level = url.searchParams.get("level") || "";
  const featured = url.searchParams.get("featured");

  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (stream) where.stream = stream;
  if (level) where.level = level;
  if (featured === "true") where.isFeatured = true;
  if (active !== null && active !== undefined && active !== "") {
    where.isActive = active === "true";
  }

  const [data, total] = await Promise.all([
    prisma.course.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
    prisma.course.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "courses", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = courseFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.name);
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) return badRequest("A course with this name already exists");

    const course = await prisma.course.create({
      data: { ...data, slug, avgSalary: data.avgSalary ?? null, createdBy: auth.admin.id, source: "admin" },
    });

    await logActivity({ adminId: auth.admin.id, action: "CREATE", entity: "Course", entityId: course.id, details: `Created course: ${course.name}` });
    revalidateEntity("Course", course.slug);
    return success(course, 201);
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
