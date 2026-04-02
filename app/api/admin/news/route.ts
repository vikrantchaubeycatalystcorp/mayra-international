import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, paginated, badRequest, getSearchParams } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { newsFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "news", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const category = url.searchParams.get("category") || "";
  const live = url.searchParams.get("live");

  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (category) where.category = category;
  if (live === "true") where.isLive = true;
  if (live === "false") where.isLive = false;
  if (active !== null && active !== undefined && active !== "") {
    where.isActive = active === "true";
  }

  const [data, total] = await Promise.all([
    prisma.newsArticle.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.newsArticle.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "news", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = newsFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.title);
    const existing = await prisma.newsArticle.findUnique({ where: { slug } });
    if (existing) return badRequest("An article with this title already exists");

    const article = await prisma.newsArticle.create({
      data: { ...data, slug, createdBy: auth.admin.id, source: "admin" },
    });

    await logActivity({ adminId: auth.admin.id, action: "CREATE", entity: "News", entityId: article.id, details: `Created article: ${article.title}` });
    revalidateEntity("News", article.slug);
    return success(article, 201);
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
