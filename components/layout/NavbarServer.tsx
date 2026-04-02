import { getNavbarData } from "../../lib/cached-queries";
import { NavbarClient } from "./NavbarClient";

export async function NavbarServer() {
  const { navItems, logo, siteName } = await getNavbarData();

  return <NavbarClient navItems={navItems} logo={logo} siteName={siteName} />;
}
