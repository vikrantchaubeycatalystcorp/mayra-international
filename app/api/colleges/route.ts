import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
  const limit   = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const stream  = searchParams.get("stream")  || undefined;
  const type    = searchParams.get("type")    || undefined;
  const state   = searchParams.get("state")   || undefined;
  const search  = searchParams.get("search")  || undefined;
  const featured = searchParams.get("featured");

  const ids     = searchParams.get("ids")     || undefined;

  const where: Record<string, unknown> = { isActive: true };
  if (ids)      where.id = { in: ids.split(",") };
  if (stream)   where.streams = { has: stream };
  if (type)     where.type = type;
  if (state)    where.state = { contains: state, mode: "insensitive" };
  if (featured) where.isFeatured = true;
  if (search)   where.name = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.college.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ nirfRank: "asc" }, { name: "asc" }],
    }),
    prisma.college.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit, pages: Math.ceil(total / limit) });
}
