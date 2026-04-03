import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/middleware";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "leads", "export");
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const source = url.searchParams.get("source") || "";
  const status = url.searchParams.get("status") || "";

  const where: Prisma.LeadWhereInput = {};
  if (source) where.source = source as "INQUIRY" | "FREE_COUNSELLING";
  if (status) where.status = status as "NEW" | "CONTACTED" | "CLOSED";

  const leads = await prisma.lead.findMany({
    where,
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
    String(lead.message || "").replace(/"/g, '""'),
    lead.status,
    lead.adminEmailStatus,
    lead.studentEmailStatus,
    lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=leads-export-${new Date().toISOString().split("T")[0]}.csv`,
    },
  });
}
