import Link from "next/link";
import Image from "next/image";
import {
  Mail, Phone, MapPin, Twitter, Linkedin, Youtube, Instagram, Facebook,
  ShieldCheck, Smartphone, PlayCircle, type LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

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

type LegalLinkData = {
  id: string;
  label: string;
  href: string;
};

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
  return (
    <footer className="relative bg-[#0a0a12] text-gray-300 overflow-hidden">
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      {/* Decorative blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto py-16 relative">
        <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-10",
            sections.length + 2 <= 4 ? "lg:grid-cols-4" : sections.length + 2 <= 5 ? "lg:grid-cols-5" : "lg:grid-cols-6"
          )}>
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <Image
                src={company.footerLogo}
                alt={company.name}
                width={170}
                height={52}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {company.tagline}
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <div className="h-8 w-8 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span>{company.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <div className="h-8 w-8 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span>{company.phone} {company.phoneLabel}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <div className="h-8 w-8 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span>{company.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((social) => {
                const Icon = getIcon(social.icon);
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    aria-label={social.platform}
                    className="h-9 w-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs">{social.platform}</span>}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Dynamic Footer Sections */}
          {sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h2 className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-5">
              Stay Updated
            </h2>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Get latest exam dates, results, and admission news straight to your inbox.
            </p>
            <div className="space-y-2.5">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 rounded-xl h-11"
              />
              <Button variant="gradient" className="w-full rounded-xl h-11">
                Subscribe Free
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2.5">
              No spam. Unsubscribe anytime.
            </p>

            {/* App Download */}
            {appDownloads.length > 0 && (
              <div className="mt-7">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-3 font-medium">Download App</p>
                <div className="flex gap-2">
                  {appDownloads.map((app) => {
                    const Icon = getIcon(app.icon);
                    return (
                      <a
                        key={app.id}
                        href={app.url}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-300"
                      >
                        {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : null}
                        <div>
                          <p className="text-[10px] text-gray-600 leading-none">{app.storeLabel}</p>
                          <p className="text-xs font-semibold text-white leading-none mt-0.5">{app.storeName}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.05]">
        <div className="container mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {company.copyrightText}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-600">
            {legalLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="hover:text-gray-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {trustBadges.map((badge) => {
              const Icon = getIcon(badge.icon || "");
              return (
                <span
                  key={badge.id}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-gray-500 font-medium"
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
