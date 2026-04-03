import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";
import { z } from "zod";

const companyInfoSchema = z.object({
  name: z.string().max(200).optional(),
  tagline: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  phoneLabel: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  logo: z.string().max(500).optional(),
  footerLogo: z.string().max(500).optional(),
  copyrightText: z.string().max(200).optional(),
  foundedYear: z.number().int().min(1900).max(2100).optional(),
  siteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  twitterHandle: z.string().max(100).optional(),
}).strict();

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.companyInfo.findFirst();

  return success(data);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = companyInfoSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid input", parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })));
    }
    const validated = parsed.data;

    const existing = await prisma.companyInfo.findFirst();

    let companyInfo;
    if (existing) {
      companyInfo = await prisma.companyInfo.update({
        where: { id: existing.id },
        data: {
          name: validated.name ?? existing.name,
          tagline: validated.tagline ?? existing.tagline,
          description: validated.description ?? existing.description,
          email: validated.email ?? existing.email,
          phone: validated.phone ?? existing.phone,
          phoneLabel: validated.phoneLabel ?? existing.phoneLabel,
          address: validated.address ?? existing.address,
          logo: validated.logo ?? existing.logo,
          footerLogo: validated.footerLogo ?? existing.footerLogo,
          copyrightText: validated.copyrightText ?? existing.copyrightText,
          foundedYear: validated.foundedYear ?? existing.foundedYear,
          siteUrl: validated.siteUrl ?? existing.siteUrl,
          twitterHandle: validated.twitterHandle ?? existing.twitterHandle,
        },
      });
    } else {
      companyInfo = await prisma.companyInfo.create({
        data: {
          name: validated.name ?? "Mayra International",
          tagline: validated.tagline ?? "India's most trusted education platform",
          description: validated.description ?? "",
          email: validated.email ?? "info@mayrainternational.com",
          phone: validated.phone ?? "+91 7506799678",
          phoneLabel: validated.phoneLabel ?? "",
          address: validated.address ?? "Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Phase 2, Sector 19D, Vashi, Navi Mumbai-400703, Maharashtra",
          logo: validated.logo ?? "/images/mayra-logo.png",
          footerLogo: validated.footerLogo ?? "/images/mayra-logo.png",
          copyrightText: validated.copyrightText ?? "Mayra International",
          foundedYear: validated.foundedYear ?? 2015,
          siteUrl: validated.siteUrl ?? "https://www.mayrainternational.com",
          twitterHandle: validated.twitterHandle ?? "@mayraintl",
        },
      });
    }

    await logActivity({
      adminId: auth.admin.id,
      action: existing ? "UPDATE" : "CREATE",
      entity: "CompanyInfo",
      entityId: companyInfo.id,
      details: `${existing ? "Updated" : "Created"} company info`,
    });

    revalidateEntity("CompanyInfo");
    return success(companyInfo);
  } catch (error) {
    console.error("Upsert company info error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
