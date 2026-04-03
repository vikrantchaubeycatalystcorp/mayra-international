import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
  const limit    = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const category = searchParams.get("category") || undefined;
  const search   = searchParams.get("search")   || undefined;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { contains: category, mode: "insensitive" };
  if (search)   where.title = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  const response = NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return response;
}
