import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import slugify from "slugify";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "study-abroad", "import");
  if (auth instanceof NextResponse) return auth;

  try {
    const { countries } = await request.json();
    if (!Array.isArray(countries) || countries.length === 0) {
      return NextResponse.json({ success: false, error: "countries array is required" }, { status: 400 });
    }

    if (countries.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 countries per batch" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i];
      if (!c.name || typeof c.name !== "string" || !c.name.trim()) {
        errors.push({ index: i, error: "name is required and must be a non-empty string" });
        skipped++;
        continue;
      }
      const derivedSlug = c.slug || slugify(c.name, { lower: true, strict: true });
      if (!derivedSlug || typeof derivedSlug !== "string" || !derivedSlug.trim()) {
        errors.push({ index: i, error: "slug is required and must be a non-empty string" });
        skipped++;
        continue;
      }
      try {
        const slug = derivedSlug;
        await prisma.studyAbroadCountry.upsert({
          where: { slug },
          update: {},
          create: {
            name: c.name,
            slug,
            flag: c.flag || "",
            universities: c.universities || 0,
            avgCost: c.avgCost || "",
            popularCourses: c.popularCourses || [],
            description: c.description || "",
            topUniversities: c.topUniversities || [],
            whyStudyHere: c.whyStudyHere || "",
            visaInfo: c.visaInfo || "",
            scholarships: c.scholarships || "",
            livingCost: c.livingCost || "",
            isFeatured: c.isFeatured || false,
            isActive: true,
            sortOrder: c.sortOrder || 0,
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
      entity: "StudyAbroadCountry",
      details: `Bulk imported ${created} countries (${skipped} skipped) out of ${countries.length}`,
    });

    revalidateEntity("StudyAbroad");
    return NextResponse.json({ success: true, data: { created, skipped, total: countries.length, errors: errors.length > 0 ? errors : undefined } });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
