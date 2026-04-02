import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { revalidateEntity } from "@/lib/revalidate";
import slugify from "slugify";

export async function POST(request: NextRequest) {
  try {
    const { countries } = await request.json();
    if (!Array.isArray(countries) || countries.length === 0) {
      return NextResponse.json({ success: false, error: "countries array is required" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const c of countries) {
      try {
        const slug = c.slug || slugify(c.name, { lower: true, strict: true });
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

    revalidateEntity("StudyAbroad");
    return NextResponse.json({ success: true, data: { created, skipped, total: countries.length } });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
