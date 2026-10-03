import { educationConsultantVashi } from "../data/local-seo/education-consultant-in-vashi";
import { careerCounsellingVashi } from "../data/local-seo/career-counselling-in-vashi";
import { mbbsAdmissionVashi } from "../data/local-seo/mbbs-admission-consultant-in-vashi";
import { mbbsAbroadVashi } from "../data/local-seo/mbbs-abroad-consultant-in-vashi";
import { engineeringAdmissionVashi } from "../data/local-seo/engineering-admission-consultant-in-vashi";
import { mbaAdmissionVashi } from "../data/local-seo/mba-admission-consultant-in-vashi";
import { studyAbroadVashi } from "../data/local-seo/study-abroad-consultant-in-vashi";

// Local service pages served at /{slug} (app/(public)/[localSlug]/page.tsx).
// Every page is anchored to the real Vashi office — do not add pages for
// localities where Mayra has no office unless they carry genuinely local content.

export interface LocalFaq {
  question: string;
  answer: string;
}

export interface LocalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LocalSeoPage {
  slug: string;
  /** Service name used in schema and link anchors, e.g. "MBBS Admission Consultant". */
  serviceName: string;
  /** Full <title>, brand included where it fits. Kept ≤ 60 characters. */
  title: string;
  /** Meta description. Kept ≤ 160 characters. */
  description: string;
  h1: string;
  intro: string[];
  sections: LocalSection[];
  process: { title: string; desc: string }[];
  documents?: string[];
  faqs: LocalFaq[];
  /** Candidate slugs; only those that exist and are active are linked. */
  related: { exams?: string[]; courses?: string[]; countries?: string[] };
  /** ISO date the content was last reviewed. Shown on the page and used as sitemap lastmod. */
  updatedAt: string;
}

export const OFFICE = {
  name: "Mayra International",
  addressLines: ["Office No 613, 6th Floor, Satra Plaza", "Palm Beach Road, Sector 19D, Vashi", "Navi Mumbai, Maharashtra 400703"],
  hours: "Mon – Sat: 9 AM – 7 PM",
  phoneDisplay: "+91 75067 99678",
  phoneHref: "tel:+917506799678",
  whatsappHref: "https://wa.me/917506799678",
  email: "info@mayrainternational.com",
  directionsHref:
    "https://www.google.com/maps/dir//Satra+Plaza,+Palm+Beach+Rd,+Sector+19D,+Vashi,+Navi+Mumbai,+Maharashtra+400703",
} as const;

/** Navi Mumbai and Mumbai areas whose students commonly travel to the Vashi office. */
export const AREAS_SERVED = {
  naviMumbai: ["Vashi", "Sanpada", "Turbhe", "Juinagar", "Nerul", "Seawoods", "CBD Belapur", "Kharghar", "Kamothe", "Panvel", "Ulwe", "Koparkhairane", "Ghansoli", "Airoli"],
  mumbai: ["Chembur", "Ghatkopar", "Kurla", "Mulund", "Bhandup", "Vikhroli", "Powai", "Sion", "Dadar"],
};

export const LOCAL_SEO_HUB_PATH = "/education-consultant";

export const LOCAL_SEO_PAGES: LocalSeoPage[] = [
  educationConsultantVashi,
  careerCounsellingVashi,
  mbbsAdmissionVashi,
  mbbsAbroadVashi,
  engineeringAdmissionVashi,
  mbaAdmissionVashi,
  studyAbroadVashi,
];

// These pages live at the site root, so a malformed or duplicate slug could shadow
// or be shadowed by another route. Every slug must follow "{service}-in-{place}".
const LOCAL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-in-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const seen = new Set<string>();
for (const page of LOCAL_SEO_PAGES) {
  if (!LOCAL_SLUG_PATTERN.test(page.slug)) throw new Error(`Invalid local SEO slug: ${page.slug}`);
  if (seen.has(page.slug)) throw new Error(`Duplicate local SEO slug: ${page.slug}`);
  seen.add(page.slug);
}

export function getLocalSeoPage(slug: string): LocalSeoPage | undefined {
  return LOCAL_SEO_PAGES.find((page) => page.slug === slug);
}
