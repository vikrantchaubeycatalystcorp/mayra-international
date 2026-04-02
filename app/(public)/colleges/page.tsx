import { prisma } from "../../../lib/db";
import { CollegesClient } from "./CollegesClient";
import type { College } from "../../../types";

export const revalidate = 60;

export default async function CollegesPage() {
  const dbColleges = await prisma.college.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Map DB model (feesMin/feesMax) to the College interface (fees: { min, max })
  const colleges: College[] = dbColleges.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    logo: c.logo,
    city: c.city,
    state: c.state,
    streams: c.streams,
    nirfRank: c.nirfRank ?? undefined,
    rating: c.rating,
    reviewCount: c.reviewCount,
    established: c.established,
    type: c.type as College["type"],
    fees: { min: c.feesMin, max: c.feesMax },
    avgPackage: c.avgPackage ?? undefined,
    topPackage: c.topPackage ?? undefined,
    placementRate: c.placementRate ?? undefined,
    accreditation: c.accreditation,
    courses: c.courses,
    description: c.description,
    highlights: c.highlights,
    address: c.address,
    website: c.website ?? undefined,
    phone: c.phone ?? undefined,
    totalStudents: c.totalStudents ?? undefined,
    faculty: c.faculty ?? undefined,
    isFeatured: c.isFeatured,
    latitude: c.latitude ?? undefined,
    longitude: c.longitude ?? undefined,
    countryCode: c.countryCode,
    countryName: c.countryName,
  }));

  return <CollegesClient colleges={colleges} />;
}
