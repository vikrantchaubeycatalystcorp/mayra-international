import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "../../../../components/shared/Breadcrumb";
import { JsonLd, breadcrumbJsonLd } from "../../../../lib/seo";
import { SITE_URL } from "../../../../lib/sitemap";
import {
  BROWSE_LABELS,
  BROWSE_PAGE_SIZE,
  browsePath,
  getBrowseItems,
  getBrowsePageCount,
  isBrowseType,
  type BrowseType,
} from "../../../../lib/browse";

export const revalidate = 86400;

type Props = { params: Promise<{ type: string; page?: string[] }> };

export async function generateStaticParams() {
  // Generated on demand and cached via ISR.
  return [];
}

// "/browse/colleges" is page 1; "/browse/colleges/N" is page N (N >= 2).
async function resolveParams(params: Props["params"]): Promise<{ type: BrowseType; page: number }> {
  const { type, page: segments } = await params;
  if (!isBrowseType(type)) notFound();
  if (!segments || segments.length === 0) return { type, page: 1 };
  if (segments.length !== 1 || !/^[1-9]\d{0,4}$/.test(segments[0])) notFound();
  const page = Number(segments[0]);
  if (page === 1) permanentRedirect(browsePath(type, 1));
  return { type, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, page } = await resolveParams(params);
  const { plural } = BROWSE_LABELS[type];
  const suffix = page > 1 ? ` — Page ${page}` : "";
  return {
    title: `All ${plural} A–Z${suffix}`,
    description: `Alphabetical list of all ${plural.toLowerCase()} on Mayra International${suffix}.`,
    alternates: { canonical: `${SITE_URL}${browsePath(type, page)}` },
  };
}

export default async function BrowseListPage({ params }: Props) {
  const { type, page } = await resolveParams(params);
  const totalPages = await getBrowsePageCount(type);
  if (page > totalPages) notFound();

  const items = await getBrowseItems(type, page);
  const { plural } = BROWSE_LABELS[type];
  const first = (page - 1) * BROWSE_PAGE_SIZE + 1;
  const pageLabel = page > 1 ? `Page ${page}` : undefined;

  const crumbs = [
    { name: "Browse", url: "/browse" },
    { name: plural, url: browsePath(type, 1) },
    ...(pageLabel ? [{ name: pageLabel }] : []),
  ];

  return (
    <div className="container mx-auto py-8">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumb items={crumbs.map((c) => ({ label: c.name, href: "url" in c ? c.url : undefined }))} className="mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        All {plural} A–Z{pageLabel ? ` — ${pageLabel}` : ""}
      </h1>
      <p className="text-gray-600 mb-6">
        Showing {first.toLocaleString("en-IN")}–{(first + items.length - 1).toLocaleString("en-IN")}, sorted by name.{" "}
        <Link href={`/${type}`} prefetch={false} className="text-primary-600 hover:underline">
          Search and filter {plural.toLowerCase()}
        </Link>
      </p>

      <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm mb-8">
        {items.map((item) => (
          <li key={item.slug} className="min-w-0">
            <Link href={`/${type}/${item.slug}`} prefetch={false} className="text-gray-900 hover:text-primary-600">
              {item.name}
            </Link>
            {item.detail && <span className="text-gray-500"> — {item.detail}</span>}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5 text-sm">
          {page > 1 && (
            <Link href={browsePath(type, page - 1)} prefetch={false} rel="prev" className="px-3 py-1 rounded border border-gray-200 hover:border-primary-500">
              ← Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            p === page ? (
              <span key={p} aria-current="page" className="px-2.5 py-1 rounded bg-primary-600 text-white">
                {p}
              </span>
            ) : (
              <Link key={p} href={browsePath(type, p)} prefetch={false} className="px-2.5 py-1 rounded border border-gray-200 text-gray-700 hover:border-primary-500">
                {p}
              </Link>
            )
          )}
          {page < totalPages && (
            <Link href={browsePath(type, page + 1)} prefetch={false} rel="next" className="px-3 py-1 rounded border border-gray-200 hover:border-primary-500">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
