import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("countryCode");
  const bbox = searchParams.get("bbox");

  const where: Record<string, unknown> = {
    isActive: true,
    latitude: { not: null },
    longitude: { not: null },
  };

  if (countryCode) {
    where.countryCode = countryCode;
  }

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(Number);
    where.longitude = { gte: minLng, lte: maxLng };
    where.latitude = { gte: minLat, lte: maxLat };
  }

  const colleges = await prisma.college.findMany({
    where,
    take: 5000,
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      countryCode: true,
      countryName: true,
      nirfRank: true,
      rating: true,
      feesMin: true,
      feesMax: true,
      streams: true,
      type: true,
      accreditation: true,
    },
  });

  return NextResponse.json(colleges.map(c => ({
    ...c,
    fees: { min: c.feesMin, max: c.feesMax },
    feesMin: undefined,
    feesMax: undefined,
  })));
}
