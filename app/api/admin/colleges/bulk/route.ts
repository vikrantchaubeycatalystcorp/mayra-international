import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { revalidateEntity } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  try {
    const { colleges } = await request.json();

    if (!Array.isArray(colleges) || colleges.length === 0) {
      return NextResponse.json({ success: false, error: "colleges array is required" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const c of colleges) {
      try {
        await prisma.college.upsert({
          where: { slug: c.slug },
          update: {},
          create: {
            name: c.name,
            slug: c.slug,
            logo: c.logo || "",
            city: c.city || "",
            state: c.state || "",
            streams: c.streams || [],
            nirfRank: c.nirfRank || null,
            rating: c.rating || 4.0,
            reviewCount: c.reviewCount || 50,
            established: c.established || 2000,
            type: c.type || "Private",
            feesMin: c.fees?.min || c.feesMin || 50000,
            feesMax: c.fees?.max || c.feesMax || 500000,
            avgPackage: c.avgPackage || null,
            topPackage: c.topPackage || null,
            placementRate: c.placementRate || null,
            accreditation: c.accreditation || [],
            courses: c.courses || [],
            description: c.description || "",
            highlights: c.highlights || [],
            address: c.address || "",
            website: c.website || null,
            phone: c.phone || null,
            totalStudents: c.totalStudents || null,
            faculty: c.faculty || null,
            isFeatured: c.isFeatured || false,
            isActive: true,
            latitude: c.latitude || null,
            longitude: c.longitude || null,
            countryCode: c.countryCode || "IN",
            countryName: c.countryName || "India",
            source: "bulk-import",
          },
        });
        created++;
      } catch {
        skipped++;
      }
    }

    revalidateEntity("College");
    return NextResponse.json({
      success: true,
      data: { created, skipped, total: colleges.length },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
