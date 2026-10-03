import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import { AreasServed, ContactButtons, OfficeCard } from "../../../components/local-seo/LocalSeoBlocks";
import { LOCAL_SEO_HUB_PATH, LOCAL_SEO_PAGES } from "../../../lib/local-seo";
import { SITE_URL } from "../../../lib/sitemap";
import { JsonLd, breadcrumbJsonLd, localBusinessJsonLd } from "../../../lib/seo";

// Hub for the local service pages — linked from the footer so none of them are orphaned.
const TITLE = "Education Counselling Services in Navi Mumbai & Mumbai";
const DESCRIPTION =
  "Admission, career and study abroad counselling from our office in Vashi, Navi Mumbai. Engineering, MBBS, MBA and overseas admissions. Book a free session.";
const URL = `${SITE_URL}${LOCAL_SEO_HUB_PATH}`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: "website" },
};

export default function EducationConsultantHubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Counselling Services" }])} />

      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: "Counselling Services" }]} className="mb-5" />
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{TITLE}</h1>
          <div className="max-w-3xl space-y-3 text-gray-600 leading-relaxed mb-6">
            <p>
              Mayra International is an education consultancy based at Satra Plaza in Vashi, Navi Mumbai. We help
              students and parents with course and college choices, entrance exams, counselling rounds, career planning
              and study abroad applications.
            </p>
            <p>
              Each service below has its own guide explaining how admissions work, what we do at each step, the
              documents you will need and answers to common questions.
            </p>
          </div>
          <ContactButtons />
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Services at our Vashi office</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LOCAL_SEO_PAGES.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/${page.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-shadow"
                  >
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-700">{page.h1}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{page.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
                      Read the guide
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Areas we serve</h2>
              <AreasServed />
            </section>
          </div>

          <aside className="space-y-6">
            <OfficeCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
