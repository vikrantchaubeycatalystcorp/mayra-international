import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

export async function GET() {
  const stats = await prisma.worldCollegeStat.findMany({
    where: { isActive: true },
    orderBy: { collegeCount: "desc" },
  });

  return NextResponse.json(
    stats.map((s) => ({
      countryCode: s.countryCode,
      countryName: s.countryName,
      collegeCount: s.collegeCount,
      centroid: [s.centroidLng, s.centroidLat] as [number, number],
    }))
  );
}
