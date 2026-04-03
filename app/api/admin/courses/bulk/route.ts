import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "courses", "import");
  if (auth instanceof NextResponse) return auth;

  try {
    const { courses } = await request.json();
    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ success: false, error: "courses array is required" }, { status: 400 });
    }

    if (courses.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 courses per batch" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const c of courses) {
      try {
        await prisma.course.upsert({
          where: { slug: c.slug },
          update: {},
          create: {
            name: c.name,
            slug: c.slug,
            stream: c.stream || "",
            level: c.level || "UG",
            duration: c.duration || "",
            description: c.description || "",
            topColleges: c.topColleges || 10,
            avgFees: c.avgFees || 100000,
            avgSalary: c.avgSalary || null,
            isFeatured: c.isFeatured || false,
            isActive: true,
            icon: c.icon || null,
            color: c.color || null,
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
      entity: "Course",
      details: `Bulk imported ${created} courses (${skipped} skipped) out of ${courses.length}`,
    });

    revalidateEntity("Course");
    return NextResponse.json({ success: true, data: { created, skipped, total: courses.length } });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
