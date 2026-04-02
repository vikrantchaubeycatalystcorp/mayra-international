import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const SORT_MAP: Record<string, Prisma.CollegeOrderByWithRelationInput[]> = {
  nirf: [{ nirfRank: { sort: "asc", nulls: "last" } }, { name: "asc" }],
  name: [{ name: "asc" }],
  "fees-asc": [{ feesMin: "asc" }],
  "fees-desc": [{ feesMin: "desc" }],
  rating: [{ rating: "desc" }],
  placement: [{ placementRate: { sort: "desc", nulls: "last" } }],
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
  const limit   = Math.min(100, parseInt(searchParams.get("limit") || "9", 10));
  const search  = searchParams.get("search")  || undefined;
  const featured = searchParams.get("featured");
  const ids     = searchParams.get("ids")     || undefined;
  const sort    = searchParams.get("sort")    || "nirf";

  // Multi-value filters (comma-separated)
  const streams = searchParams.get("streams")?.split(",").filter(Boolean);
  const types   = searchParams.get("types")?.split(",").filter(Boolean);
  const states  = searchParams.get("states")?.split(",").filter(Boolean);
  // Legacy single-value params
  const stream  = searchParams.get("stream")  || undefined;
  const type    = searchParams.get("type")    || undefined;
  const state   = searchParams.get("state")   || undefined;

  const feesMax   = searchParams.get("feesMax")   ? Number(searchParams.get("feesMax"))   : undefined;
  const ratingMin = searchParams.get("ratingMin") ? Number(searchParams.get("ratingMin")) : undefined;

  const where: Prisma.CollegeWhereInput = { isActive: true };
  if (ids)        where.id = { in: ids.split(",") };
  if (featured)   where.isFeatured = true;

  // Search across name, city, state
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { state: { contains: search, mode: "insensitive" } },
    ];
  }

  // Streams filter
  if (streams?.length)     where.streams = { hasSome: streams };
  else if (stream)         where.streams = { has: stream };

  // Type filter
  if (types?.length)       where.type = { in: types };
  else if (type)           where.type = type;

  // State filter
  if (states?.length)      where.state = { in: states };
  else if (state)          where.state = { contains: state, mode: "insensitive" };

  // Fees filter
  if (feesMax !== undefined && feesMax < 2000000) {
    where.feesMin = { lte: feesMax };
  }

  // Rating filter
  if (ratingMin !== undefined && ratingMin > 0) {
    where.rating = { gte: ratingMin };
  }

  const orderBy = SORT_MAP[sort] || SORT_MAP.nirf;

  const [data, total] = await Promise.all([
    prisma.college.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        city: true,
        state: true,
        streams: true,
        nirfRank: true,
        rating: true,
        reviewCount: true,
        established: true,
        type: true,
        feesMin: true,
        feesMax: true,
        avgPackage: true,
        topPackage: true,
        placementRate: true,
        accreditation: true,
        courses: true,
        description: true,
        highlights: true,
        address: true,
        website: true,
        phone: true,
        totalStudents: true,
        faculty: true,
        isFeatured: true,
        latitude: true,
        longitude: true,
        countryCode: true,
        countryName: true,
      },
    }),
    prisma.college.count({ where }),
  ]);

  const headers = new Headers();
  headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  return NextResponse.json(
    { data, total, page, limit, pages: Math.ceil(total / limit) },
    { headers }
  );
}
