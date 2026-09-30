import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "../../components/shared/Breadcrumb";
import { JsonLd, breadcrumbJsonLd } from "../../lib/seo";
import { SITE_URL } from "../../lib/sitemap";
import {
  BROWSE_LABELS,
  BROWSE_TYPES,
  browsePath,
  countBrowseItems,
  getBrowsePageCount,
} from "../../lib/browse";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Browse All Colleges, Courses & Exams A–Z",
  description:
    "Complete A–Z directory of every college, course and entrance exam on Mayra International.",
  alternates: { canonical: `${SITE_URL}/browse` },
};

export default async function BrowseIndexPage() {
  const sections = await Promise.all(
    BROWSE_TYPES.map(async (type) => ({
      type,
      count: await countBrowseItems(type),
      pages: await getBrowsePageCount(type),
    }))
  );

  return (
    <div className="container mx-auto py-8">
      <JsonLd data={breadcrumbJsonLd([{ name: "Browse", url: "/browse" }])} />
      <Breadcrumb items={[{ label: "Browse" }]} className="mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse A–Z</h1>
      <p className="text-gray-600 mb-8">Every college, course and exam on Mayra International, listed alphabetically.</p>

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map(({ type, count, pages }) => (
          <section key={type} className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              <Link href={browsePath(type, 1)} prefetch={false} className="hover:text-primary-600">
                All {BROWSE_LABELS[type].plural}
              </Link>
            </h2>
            <p className="text-sm text-gray-500 mb-3">{count.toLocaleString("en-IN")} listed</p>
            {pages > 1 && (
              <nav aria-label={`${BROWSE_LABELS[type].plural} pages`} className="flex flex-wrap gap-1.5 text-sm">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={browsePath(type, p)}
                    prefetch={false}
                    className="px-2 py-0.5 rounded border border-gray-200 text-gray-700 hover:border-primary-500 hover:text-primary-600"
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
