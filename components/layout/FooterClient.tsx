import Link from "next/link";
import {
  Mail, Phone, MapPin, Twitter, Linkedin, Youtube, Instagram, Facebook,
  ShieldCheck, Smartphone, PlayCircle, type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Twitter, Linkedin, Youtube, Instagram, Facebook,
  Smartphone, PlayCircle, ShieldCheck,
  Mail, Phone, MapPin,
};

function getIcon(name: string): LucideIcon | null {
  return iconMap[name] || null;
}

type CompanyData = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  phoneLabel: string;
  address: string;
  footerLogo: string;
  copyrightText: string;
  foundedYear: number;
};

type FooterSectionData = {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
};

type SocialLinkData = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  hoverColor: string;
};

type LegalLinkData = { id: string; label: string; href: string };

type TrustBadgeData = {
  id: string;
  label: string;
  icon: string | null;
  bgColor: string;
  borderColor: string;
  textColor: string;
};

type AppDownloadData = {
  id: string;
  platform: string;
  icon: string;
  storeLabel: string;
  storeName: string;
  url: string;
};

type Props = {
  company: CompanyData;
  sections: FooterSectionData[];
  socialLinks: SocialLinkData[];
  legalLinks: LegalLinkData[];
  trustBadges: TrustBadgeData[];
  appDownloads: AppDownloadData[];
};

export function FooterClient({
  company,
  sections,
  socialLinks,
  legalLinks,
  trustBadges,
  appDownloads,
}: Props) {
  const safeCopyrightText = (company.copyrightText || "Mayra International")
    .replace(/\b(?:myra|mayra)\s+india\b/gi, "Mayra International")
    .trim();

  // brand (1.6fr) + one column per section (1fr) + newsletter (1.3fr)
  const gridTemplateColumns = `1.6fr ${sections.map(() => "1fr").join(" ")} 1.3fr`;

  return (
    <div className="ed-scope">
      <footer className="site-footer">
        <div className="container">
          <div className="foot-grid" style={{ gridTemplateColumns }}>
            {/* Brand */}
            <div className="foot-brand">
              <span className="word">
                Mayra<span style={{ color: "var(--gold)" }}>.</span>
              </span>
              <p>{company.tagline}</p>
              <div className="foot-contact">
                <span><b>{company.email}</b></span>
                <span>{company.phone}{company.phoneLabel ? ` ${company.phoneLabel}` : ""}</span>
                <span>{company.address}</span>
              </div>
              {socialLinks.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                  {socialLinks.map((social) => {
                    const Icon = getIcon(social.icon);
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        aria-label={social.platform}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.05)",
                          display: "grid",
                          placeItems: "center",
                          color: "#CFC6B6",
                        }}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs">{social.platform}</span>}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic link columns */}
            {sections.map((section) => (
              <div key={section.id} className="foot-col">
                <h4>{section.title}</h4>
                {section.links.map((link) => (
                  <Link key={link.id} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Newsletter */}
            <div className="foot-col foot-news">
              <h4>Stay updated</h4>
              <p style={{ color: "#B8AE9E", fontSize: "13.5px", marginBottom: 12, lineHeight: 1.55 }}>
                Exam dates, results and admission alerts — weekly, edited by our desk.
              </p>
              <form>
                <input
                  className="input"
                  type="email"
                  placeholder="you@email.com"
                  required
                  style={{ marginBottom: 8 }}
                />
                <button className="btn btn-gold btn-block btn-sm" type="submit">
                  Subscribe
                </button>
              </form>

              {appDownloads.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8E8472", marginBottom: 10 }}>
                    Download app
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {appDownloads.map((app) => {
                      const Icon = getIcon(app.icon);
                      return (
                        <a
                          key={app.id}
                          href={app.url}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            borderRadius: "var(--r-sm)",
                            border: "1px solid #3A352D",
                            background: "#2A2620",
                            color: "#CFC6B6",
                          }}
                        >
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          <div>
                            <p style={{ fontSize: 10, lineHeight: 1, color: "#8E8472" }}>{app.storeLabel}</p>
                            <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1, color: "#fff", marginTop: 2 }}>{app.storeName}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="foot-bottom">
            <span>&copy; {new Date().getFullYear()} {safeCopyrightText}. All rights reserved.</span>
            <div className="foot-legal">
              {legalLinks.map((link) => (
                <Link key={link.id} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
            {trustBadges.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                {trustBadges.map((badge) => {
                  const Icon = getIcon(badge.icon || "");
                  return (
                    <span
                      key={badge.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 9px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid #332E27",
                        borderRadius: "var(--r-xs)",
                        fontSize: 12,
                        color: "#B8AE9E",
                        fontWeight: 500,
                      }}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
