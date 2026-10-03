import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle, FileText, HelpCircle } from "lucide-react";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import {
  AreasServed,
  ContactButtons,
  OfficeCard,
  RelatedLinkGroup,
  ServiceLinks,
  getRelatedLinks,
} from "../../../components/local-seo/LocalSeoBlocks";
import { LOCAL_SEO_HUB_PATH, LOCAL_SEO_PAGES, getLocalSeoPage } from "../../../lib/local-seo";
import { SITE_URL } from "../../../lib/sitemap";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, localServiceJsonLd } from "../../../lib/seo";

// Local service pages at the site root, e.g. /education-consultant-in-vashi.
// Only slugs listed in lib/local-seo.ts render; every other root path 404s.
export const dynamicParams = false;
export const revalidate = 3600;

type Props = { params: Promise<{ localSlug: string }> };

export function generateStaticParams() {
  return LOCAL_SEO_PAGES.map((page) => ({ localSlug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { localSlug } = await params;
  const page = getLocalSeoPage(localSlug);
  if (!page) return {};
  const url = `${SITE_URL}/${page.slug}`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: { title: page.title, description: page.description, url, type: "website" },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function LocalServicePage({ params }: Props) {
  const { localSlug } = await params;
  const page = getLocalSeoPage(localSlug);
  if (!page) notFound();

  const related = await getRelatedLinks(page.related);
  const hasRelated = related.exams.length + related.courses.length + related.countries.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={localServiceJsonLd(page)} />
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Counselling Services", url: LOCAL_SEO_HUB_PATH },
          { name: page.h1 },
        ])}
      />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb
            items={[{ label: "Counselling Services", href: LOCAL_SEO_HUB_PATH }, { label: page.h1 }]}
            className="mb-5"
          />
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{page.h1}</h1>
          <div className="max-w-3xl space-y-3 text-gray-600 leading-relaxed mb-6">
            {page.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ContactButtons />
          <p className="mt-5 text-xs text-gray-400">Last updated {formatDate(page.updatedAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {page.sections.map((section) => (
              <section key={section.heading} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">How the process works</h2>
              <ol className="space-y-4">
                {page.process.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {page.documents && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Documents to keep ready
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                  {page.documents.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary-600" />
                Frequently asked questions
              </h2>
              <div className="divide-y divide-gray-100">
                {page.faqs.map((faq) => (
                  <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Areas we serve from Vashi</h2>
              <AreasServed />
            </section>

            {hasRelated && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Related guides</h2>
                <RelatedLinkGroup title="Entrance exams" links={related.exams} />
                <RelatedLinkGroup title="Courses" links={related.courses} />
                <RelatedLinkGroup title="Destinations" links={related.countries} />
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <OfficeCard />
            <ServiceLinks currentSlug={page.slug} title="Other services at our Vashi office" />
          </aside>
        </div>
      </div>
    </div>
  );
}
