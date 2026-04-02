import { prisma } from "../../lib/db";
import { FooterClient } from "./FooterClient";

export async function FooterServer() {
  const [
    companyInfo,
    footerSections,
    socialLinks,
    legalLinks,
    trustBadges,
    appDownloads,
  ] = await Promise.all([
    prisma.companyInfo.findFirst(),
    prisma.footerSection.findMany({
      where: { isActive: true },
      include: {
        links: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.socialLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.legalLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.trustBadge.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.appDownloadLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const company = companyInfo || {
    name: "Mayra International",
    tagline: "India's most trusted education platform. Helping students discover the right college, exam, and career since 2020.",
    email: "support@mayra.in",
    phone: "1800-123-4567",
    phoneLabel: "(Free)",
    address: "Bangalore, India",
    footerLogo: "/images/mayra-logo.png",
    copyrightText: "Mayra India",
    foundedYear: 2020,
  };

  return (
    <FooterClient
      company={company}
      sections={footerSections}
      socialLinks={socialLinks}
      legalLinks={legalLinks}
      trustBadges={trustBadges}
      appDownloads={appDownloads}
    />
  );
}
