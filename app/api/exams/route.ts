import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
  const limit   = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const stream  = searchParams.get("stream")  || undefined;
  const level   = searchParams.get("level")   || undefined;
  const search  = searchParams.get("search")  || undefined;
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = { isActive: true };
  if (stream)   where.streams = { has: stream };
  if (level)    where.level = level;
  if (featured) where.isFeatured = true;
  if (search)   where.name = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.exam.count({ where }),
  ]);

  const response = NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return response;
}
