import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, paginated, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { studyAbroadFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "study-abroad", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (active !== null && active !== undefined && active !== "") {
    where.isActive = active === "true";
  }

  const [data, total] = await Promise.all([
    prisma.studyAbroadCountry.findMany({ where, orderBy: { sortOrder: "asc" }, skip: (page - 1) * limit, take: limit }),
    prisma.studyAbroadCountry.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "study-abroad", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = studyAbroadFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.name);
    const existing = await prisma.studyAbroadCountry.findUnique({ where: { slug } });
    if (existing) return badRequest("This country already exists");

    const country = await prisma.studyAbroadCountry.create({
      data: { ...data, slug, source: "admin" },
    });

    await logActivity({ adminId: auth.admin.id, action: "CREATE", entity: "StudyAbroad", entityId: country.id, details: `Created country: ${country.name}` });
    revalidateEntity("StudyAbroad");
    return success(country, 201);
  } catch (error) {
    console.error("Create study abroad error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
