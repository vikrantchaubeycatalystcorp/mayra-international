import { prisma } from "../../lib/db";
import { NavbarClient } from "./NavbarClient";

export async function NavbarServer() {
  const [navItems, companyInfo] = await Promise.all([
    prisma.navigationItem.findMany({
      where: { isActive: true, section: "main", parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.companyInfo.findFirst(),
  ]);

  const logo = companyInfo?.logo || "/images/mayra-logo.png";
  const siteName = companyInfo?.name || "Mayra International";

  return <NavbarClient navItems={navItems} logo={logo} siteName={siteName} />;
}
