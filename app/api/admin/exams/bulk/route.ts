import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, "exams", "import");
  if (auth instanceof NextResponse) return auth;

  try {
    const { exams } = await request.json();
    if (!Array.isArray(exams) || exams.length === 0) {
      return NextResponse.json({ success: false, error: "exams array is required" }, { status: 400 });
    }

    if (exams.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 exams per batch" }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;

    for (const e of exams) {
      try {
        await prisma.exam.upsert({
          where: { slug: e.slug },
          update: {},
          create: {
            name: e.name,
            slug: e.slug,
            fullName: e.fullName || e.name,
            conductingBody: e.conductingBody || "",
            streams: e.stream || e.streams || [],
            level: e.level || "UG",
            registrationStart: e.registrationStart || null,
            registrationEnd: e.registrationEnd || null,
            examDate: e.examDate || null,
            resultDate: e.resultDate || null,
            eligibility: e.eligibility || "",
            applicationFeeGeneral: e.applicationFee?.general || e.applicationFeeGeneral || 0,
            applicationFeeSCST: e.applicationFee?.sc_st || e.applicationFeeSCST || null,
            mode: e.mode || "Offline",
            frequency: e.frequency || "Annual",
            totalSeats: e.totalSeats || null,
            participatingColleges: e.participatingColleges || null,
            description: e.description || "",
            syllabus: e.syllabus || [],
            isFeatured: e.isFeatured || false,
            isActive: true,
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
      entity: "Exam",
      details: `Bulk imported ${created} exams (${skipped} skipped) out of ${exams.length}`,
    });

    revalidateEntity("Exam");
    return NextResponse.json({ success: true, data: { created, skipped, total: exams.length } });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ success: false, error: "Bulk import failed" }, { status: 500 });
  }
}
