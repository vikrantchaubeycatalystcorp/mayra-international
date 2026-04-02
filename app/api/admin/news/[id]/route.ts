import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { newsFormSchema } from "@/types/admin";
import { createSlug } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "news", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) return notFound("Article not found");
  return success(article);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "news", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.newsArticle.findUnique({ where: { id } });
  if (!existing) return notFound("Article not found");

  try {
    const body = await req.json();
    const parsed = newsFormSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const slug = createSlug(data.title);
    if (slug !== existing.slug) {
      const dup = await prisma.newsArticle.findUnique({ where: { slug } });
      if (dup) return badRequest("An article with this title already exists");
    }

    const article = await prisma.newsArticle.update({ where: { id }, data: { ...data, slug, updatedBy: auth.admin.id } });
    await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "News", entityId: article.id, details: `Updated article: ${article.title}` });
    revalidateEntity("News", article.slug);
    return success(article);
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "news", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.newsArticle.findUnique({ where: { id } });
  if (!existing) return notFound("Article not found");

  const body = await req.json();
  if (typeof body.isActive !== "boolean") return badRequest("isActive must be a boolean");

  const article = await prisma.newsArticle.update({ where: { id }, data: { isActive: body.isActive, updatedBy: auth.admin.id } });
  await logActivity({ adminId: auth.admin.id, action: body.isActive ? "ACTIVATE" : "DEACTIVATE", entity: "News", entityId: id, details: `${body.isActive ? "Activated" : "Deactivated"} article: ${existing.title}` });
  revalidateEntity("News", existing.slug);
  return success(article);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "news", "delete");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.newsArticle.findUnique({ where: { id } });
  if (!existing) return notFound("Article not found");
  await prisma.newsArticle.update({ where: { id }, data: { isActive: false } });
  await logActivity({ adminId: auth.admin.id, action: "DELETE", entity: "News", entityId: id, details: `Soft-deleted article: ${existing.title}` });
  revalidateEntity("News", existing.slug);
  return success({ message: "Article deleted" });
}
