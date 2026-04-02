import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAdmin,
  success,
  paginated,
  badRequest,
  getSearchParams,
} from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { collegeFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "colleges", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const stream = url.searchParams.get("stream") || "";
  const type = url.searchParams.get("type") || "";
  const featured = url.searchParams.get("featured");
  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (stream) where.streams = { has: stream };
  if (type) where.type = type;
  if (featured === "true") where.isFeatured = true;
  if (active !== null && active !== undefined && active !== "") {
    where.isActive = active === "true";
  }

  const [data, total] = await Promise.all([
    prisma.college.findMany({
      where,
      orderBy: [{ nirfRank: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.college.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "colleges", "create");
  if (auth instanceof NextResponse) return auth;

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

    const existing = await prisma.college.findUnique({ where: { slug } });
    if (existing) return badRequest("A college with this name already exists");

    const college = await prisma.college.create({
      data: {
        name: data.name,
        slug,
        logo: data.logo || "",
        city: data.city,
        state: data.state,
        address: data.address,
        countryCode: data.countryCode,
        countryName: data.countryCode === "IN" ? "India" : data.countryCode,
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
        createdBy: auth.admin.id,
        source: "admin",
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "College",
      entityId: college.id,
      details: `Created college: ${college.name}`,
    });

    revalidateEntity("College", college.slug);
    return success(college, 201);
  } catch (error) {
    console.error("Create college error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
