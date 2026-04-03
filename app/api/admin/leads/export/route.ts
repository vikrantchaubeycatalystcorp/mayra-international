import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { Prisma } from "@prisma/client";

function sanitizeCsvCell(value: string): string {
  let cell = String(value ?? "").replace(/"/g, '""');
  // Prevent CSV formula injection
  if (/^[=+\-@\t\r]/.test(cell)) {
    cell = "'" + cell;
  }
  return `"${cell}"`;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "leads", "export");
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const source = url.searchParams.get("source") || "";
  const status = url.searchParams.get("status") || "";

  const validSources = ["INQUIRY", "FREE_COUNSELLING"] as const;
  const validStatuses = ["NEW", "CONTACTED", "CLOSED"] as const;

  const where: Prisma.LeadWhereInput = {};
  if (source && validSources.includes(source as typeof validSources[number])) {
    where.source = source as "INQUIRY" | "FREE_COUNSELLING";
  }
  if (status && validStatuses.includes(status as typeof validStatuses[number])) {
    where.status = status as "NEW" | "CONTACTED" | "CLOSED";
  }

  const leads = await prisma.lead.findMany({
    where,
    take: 50000,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID", "Source", "Full Name", "Email", "Phone", "City", "State",
    "Current Class", "Course Interested", "Message", "Status",
    "Admin Email Status", "Student Email Status", "Created At",
  ];

  const rows = leads.map((lead) => [
    lead.id,
    lead.source,
    lead.fullName,
    lead.email || "",
    lead.phone,
    lead.city || "",
    lead.state || "",
    lead.currentClass || "",
    lead.courseInterested || "",
    lead.message || "",
    lead.status,
    lead.adminEmailStatus,
    lead.studentEmailStatus,
    lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => sanitizeCsvCell(String(cell))).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=leads-export-${new Date().toISOString().split("T")[0]}.csv`,
    },
  });
}
