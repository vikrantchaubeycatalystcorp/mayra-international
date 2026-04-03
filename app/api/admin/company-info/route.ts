import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

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

    const existing = await prisma.companyInfo.findFirst();

    let companyInfo;
    if (existing) {
      companyInfo = await prisma.companyInfo.update({
        where: { id: existing.id },
        data: {
          name: body.name ?? existing.name,
          tagline: body.tagline ?? existing.tagline,
          description: body.description ?? existing.description,
          email: body.email ?? existing.email,
          phone: body.phone ?? existing.phone,
          phoneLabel: body.phoneLabel ?? existing.phoneLabel,
          address: body.address ?? existing.address,
          logo: body.logo ?? existing.logo,
          footerLogo: body.footerLogo ?? existing.footerLogo,
          copyrightText: body.copyrightText ?? existing.copyrightText,
          foundedYear: body.foundedYear ?? existing.foundedYear,
          siteUrl: body.siteUrl ?? existing.siteUrl,
          twitterHandle: body.twitterHandle ?? existing.twitterHandle,
        },
      });
    } else {
      companyInfo = await prisma.companyInfo.create({
        data: {
          name: body.name ?? "Mayra International",
          tagline: body.tagline ?? "India's most trusted education platform",
          description: body.description ?? "",
          email: body.email ?? "info@mayrainternational.com",
          phone: body.phone ?? "+91 7506799678",
          phoneLabel: body.phoneLabel ?? "",
          address: body.address ?? "Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Phase 2, Sector 19D, Vashi, Navi Mumbai-400703, Maharashtra",
          logo: body.logo ?? "/images/mayra-logo.png",
          footerLogo: body.footerLogo ?? "/images/mayra-logo.png",
          copyrightText: body.copyrightText ?? "Mayra International",
          foundedYear: body.foundedYear ?? 2020,
          siteUrl: body.siteUrl ?? "https://www.mayrainternational.com",
          twitterHandle: body.twitterHandle ?? "@mayraintl",
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
