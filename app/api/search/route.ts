import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q     = searchParams.get("q") || "";
  const type  = searchParams.get("type") || "all";
  const limit = Math.min(20, parseInt(searchParams.get("limit") || "10", 10));

  const hasQuery = q.trim().length > 0;

  const searchFilter = hasQuery ? { contains: q, mode: "insensitive" as const } : undefined;

  const [colleges, exams, courses, articles] = await Promise.all([
    type === "all" || type === "colleges"
      ? prisma.college.findMany({
          where: hasQuery ? { name: searchFilter, isActive: true } : { isFeatured: true, isActive: true },
          take: limit,
          orderBy: { nirfRank: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "exams"
      ? prisma.exam.findMany({
          where: hasQuery ? { name: searchFilter, isActive: true } : { isFeatured: true, isActive: true },
          take: limit,
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "courses"
      ? prisma.course.findMany({
          where: hasQuery ? { name: searchFilter, isActive: true } : { isFeatured: true, isActive: true },
          take: limit,
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "articles"
      ? prisma.newsArticle.findMany({
          where: hasQuery ? { title: searchFilter, isActive: true } : { isActive: true },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({ colleges, exams, courses, articles });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const q = body.query || "";
  const url = new URL(req.url);
  url.searchParams.set("q", q);
  return GET(new NextRequest(url, { method: "GET" }));
}
