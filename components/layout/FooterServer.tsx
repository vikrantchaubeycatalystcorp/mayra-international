import { getFooterData } from "../../lib/cached-queries";
import { FooterClient } from "./FooterClient";

export async function FooterServer() {
  const { company, footerSections, socialLinks, legalLinks, trustBadges, appDownloads } =
    await getFooterData();

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
