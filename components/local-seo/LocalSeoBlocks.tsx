import Link from "next/link";
import { ArrowRight, Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { prisma } from "../../lib/db";
import { AREAS_SERVED, LOCAL_SEO_HUB_PATH, LOCAL_SEO_PAGES, OFFICE } from "../../lib/local-seo";

// Server-rendered building blocks shared by the hub (/education-consultant)
// and the local service pages (/{service}-in-vashi).

export function OfficeCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <h2 className="font-bold text-gray-900 mb-4">Visit our Vashi office</h2>
      <div className="space-y-3 text-sm text-gray-600">
        <p className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
          <span>
            {OFFICE.addressLines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary-600 flex-shrink-0" />
          {OFFICE.hours}
        </p>
        <a href={OFFICE.phoneHref} className="flex items-center gap-2 hover:text-primary-600">
          <Phone className="h-4 w-4 text-primary-600 flex-shrink-0" />
          {OFFICE.phoneDisplay}
        </a>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={OFFICE.directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-700"
        >
          <Navigation className="h-3.5 w-3.5" />
          Directions
        </a>
        <a
          href={OFFICE.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export function ContactButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={OFFICE.phoneHref}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500"
      >
        <Phone className="h-4 w-4" />
        Call {OFFICE.phoneDisplay}
      </a>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-700"
      >
        Book a free session
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Links to every local service page except the current one. */
export function ServiceLinks({ currentSlug, title = "Our counselling services" }: { currentSlug?: string; title?: string }) {
  const pages = LOCAL_SEO_PAGES.filter((page) => page.slug !== currentSlug);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <h2 className="font-bold text-gray-900 mb-3">{title}</h2>
      <ul className="space-y-2 text-sm">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link href={`/${page.slug}`} className="text-primary-700 hover:underline">
              {page.serviceName} in Vashi
            </Link>
          </li>
        ))}
        {currentSlug && (
          <li>
            <Link href={LOCAL_SEO_HUB_PATH} className="text-gray-600 hover:underline">
              All services
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export function AreasServed() {
  return (
    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
      <p>
        <span className="font-semibold text-gray-900">Navi Mumbai: </span>
        {AREAS_SERVED.naviMumbai.join(", ")}.
      </p>
      <p>
        <span className="font-semibold text-gray-900">Mumbai: </span>
        {AREAS_SERVED.mumbai.join(", ")} and other areas of the city.
      </p>
      <p>
        We have one office, in Vashi. Students from these areas visit us there, or start with a phone or WhatsApp
        conversation.
      </p>
    </div>
  );
}

type RelatedSlugs = { exams?: string[]; courses?: string[]; countries?: string[] };
type RelatedLink = { href: string; label: string };

function inOrder<T extends { slug: string }>(slugs: string[], rows: T[]): T[] {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

/** Resolves candidate slugs to links, keeping only records that exist and are active. */
export async function getRelatedLinks(related: RelatedSlugs) {
  const exams = related.exams ?? [];
  const courses = related.courses ?? [];
  const countries = related.countries ?? [];
  const [examRows, courseRows, countryRows] = await Promise.all([
    exams.length
      ? prisma.exam.findMany({ where: { slug: { in: exams }, isActive: true }, select: { slug: true, name: true } })
      : [],
    courses.length
      ? prisma.course.findMany({ where: { slug: { in: courses }, isActive: true }, select: { slug: true, name: true } })
      : [],
    countries.length
      ? prisma.studyAbroadCountry.findMany({ where: { slug: { in: countries }, isActive: true }, select: { slug: true, name: true } })
      : [],
  ]);
  return {
    exams: inOrder(exams, examRows).map((e): RelatedLink => ({ href: `/exams/${e.slug}`, label: e.name })),
    courses: inOrder(courses, courseRows).map((c): RelatedLink => ({ href: `/courses/${c.slug}`, label: c.name })),
    countries: inOrder(countries, countryRows).map((c): RelatedLink => ({ href: `/study-abroad/${c.slug}`, label: `Study in ${c.name}` })),
  };
}

export function RelatedLinkGroup({ title, links }: { title: string; links: RelatedLink[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary-300 hover:text-primary-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
