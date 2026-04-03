import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stateId = searchParams.get("stateId");

    const activeFilter = { isActive: true };
    const sortByOrder = { sortOrder: "asc" as const };
    const sortByName = { name: "asc" as const };

    const [
      streams,
      states,
      cities,
      accreditations,
      tags,
      newsCategories,
      collegeTypes,
      courseLevels,
      examModes,
      leadQualifications,
      leadInterests,
    ] = await Promise.all([
      prisma.stream.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, name: true, slug: true, icon: true, color: true },
      }),
      prisma.state.findMany({
        where: activeFilter,
        orderBy: sortByName,
        select: { id: true, name: true, code: true },
      }),
      prisma.city.findMany({
        where: {
          ...activeFilter,
          ...(stateId ? { stateId } : {}),
        },
        orderBy: sortByName,
        select: { id: true, name: true, stateId: true },
      }),
      prisma.accreditationBody.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, name: true, fullName: true },
      }),
      prisma.tag.findMany({
        orderBy: sortByName,
        select: { id: true, name: true, slug: true },
      }),
      prisma.newsCategory.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, name: true, slug: true, icon: true, color: true },
      }),
      prisma.collegeType.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, name: true },
      }),
      prisma.courseLevel.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, name: true, code: true },
      }),
      prisma.examMode.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, name: true },
      }),
      prisma.leadQualification.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, label: true, value: true },
      }),
      prisma.leadInterest.findMany({
        where: activeFilter,
        orderBy: sortByOrder,
        select: { id: true, label: true, value: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        streams,
        states,
        cities,
        accreditations,
        tags,
        newsCategories,
        collegeTypes,
        courseLevels,
        examModes,
        leadQualifications,
        leadInterests,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Fetch master data error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
