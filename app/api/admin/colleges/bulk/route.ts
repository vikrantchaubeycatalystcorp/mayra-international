import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "colleges", "import");
  if (auth instanceof NextResponse) return auth;

  try {
    const { colleges } = await request.json();

    if (!Array.isArray(colleges) || colleges.length === 0) {
      return NextResponse.json({ success: false, error: "colleges array is required" }, { status: 400 });
    }

    if (colleges.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 colleges per batch" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < colleges.length; i++) {
      const c = colleges[i];
      if (!c.name || typeof c.name !== "string" || !c.name.trim()) {
        errors.push({ index: i, error: "name is required and must be a non-empty string" });
        skipped++;
        continue;
      }
      if (!c.slug || typeof c.slug !== "string" || !c.slug.trim()) {
        errors.push({ index: i, error: "slug is required and must be a non-empty string" });
        skipped++;
        continue;
      }
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

    await logActivity({
      adminId: auth.admin.id,
      action: "IMPORT",
      entity: "College",
      details: `Bulk imported ${created} colleges (${skipped} skipped) out of ${colleges.length}`,
    });

    revalidateEntity("College");
    return NextResponse.json({
      success: true,
      data: { created, skipped, total: colleges.length, errors: errors.length > 0 ? errors : undefined },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
