import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, DollarSign, GraduationCap, ShieldCheck } from "lucide-react";
import { prisma } from "../../../../lib/db";
import { Breadcrumb } from "../../../../components/shared/Breadcrumb";
import { Badge } from "../../../../components/ui/badge";
import { ContactButtons, RelatedLinkGroup, getRelatedLinks } from "../../../../components/local-seo/LocalSeoBlocks";
import { SITE_URL } from "../../../../lib/sitemap";
import { JsonLd, breadcrumbJsonLd, studyAbroadCountryJsonLd, DEFAULT_OG_IMAGES } from "../../../../lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Return empty — pages are generated on-demand and cached via ISR
  return [];
}

async function getCountry(slug: string) {
  return prisma.studyAbroadCountry.findFirst({ where: { slug, isActive: true } });
}

function universityNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((u: unknown) => (typeof u === "string" ? u : (u as { name?: string })?.name))
    .filter((name): name is string => Boolean(name));
}

/** First sentences of the description that fit a meta description. */
function metaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sentenceEnd = cut.lastIndexOf(". ");
  if (sentenceEnd > 80) return cut.slice(0, sentenceEnd + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountry(slug);
  if (!country) notFound();
  const title = `Study in ${country.name} from India | Mayra International`;
  const description = metaDescription(country.description || `Universities, costs and popular courses in ${country.name} for Indian students.`);
  const url = `${SITE_URL}/study-abroad/${country.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: DEFAULT_OG_IMAGES },
  };
}

const MBBS_EXAMS = ["neet-national-eligibility-cum-entrance-test", "fmge-foreign-medical-graduates-examination", "next-national-exit-test"];
const STUDY_ABROAD_EXAMS = [
  "ielts-international-english-language-testing-system",
  "toefl-test-of-english-as-foreign-language",
  "pte-academic-pearson-test-of-english-academic",
  "gre-graduate-record-exam",
  "gmat-focus-edition-graduate-management-admission-test-focus-edition",
  "sat-scholastic-assessment-test",
];

export default async function StudyAbroadCountryPage({ params }: Props) {
  const { slug } = await params;
  const country = await getCountry(slug);
  if (!country) notFound();

  const universities = universityNames(country.topUniversities);
  const isMbbsDestination = country.popularCourses.some((course) => /mbbs/i.test(course));

  const [otherCountries, related] = await Promise.all([
    prisma.studyAbroadCountry.findMany({
      where: { isActive: true, id: { not: country.id } },
      select: { slug: true, name: true, flag: true },
      orderBy: { sortOrder: "asc" },
    }),
    getRelatedLinks({ exams: isMbbsDestination ? MBBS_EXAMS : STUDY_ABROAD_EXAMS }),
  ]);

  // Optional long-form fields, filled in from the admin panel when available.
  const extraSections = [
    { heading: `Why study in ${country.name}`, body: country.whyStudyHere },
    { heading: "Cost of living", body: country.livingCost },
    { heading: "Student visa", body: country.visaInfo },
    { heading: "Scholarships", body: country.scholarships },
  ].filter((section) => section.body.trim().length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={studyAbroadCountryJsonLd(country)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Study Abroad", url: "/study-abroad" }, { name: country.name }])} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white">
        <div className="container mx-auto py-12">
          <Breadcrumb
            items={[{ label: "Study Abroad", href: "/study-abroad" }, { label: country.name }]}
            className="mb-5 [&_*]:text-white/70 [&_a:hover]:text-white"
          />
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl" aria-hidden="true">{country.flag}</span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">Study in {country.name}</h1>
          </div>
          {country.description && <p className="max-w-3xl text-blue-100 leading-relaxed">{country.description}</p>}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {country.universities > 0 && (
              <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5">
                <GraduationCap className="h-4 w-4" />
                {country.universities.toLocaleString("en-IN")}+ universities
              </span>
            )}
            {country.avgCost && (
              <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5">
                <DollarSign className="h-4 w-4" />
                Average cost: {country.avgCost}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {universities.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary-600" />
                  Top universities in {country.name}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {universities.map((name) => (
                    <li key={name} className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">{name}</li>
                  ))}
                </ul>
              </section>
            )}

            {country.popularCourses.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  Popular courses for Indian students
                </h2>
                <div className="flex flex-wrap gap-2">
                  {country.popularCourses.map((course) => (
                    <Badge key={course} variant="blue">{course}</Badge>
                  ))}
                </div>
              </section>
            )}

            {extraSections.map((section) => (
              <section key={section.heading} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
              </section>
            ))}

            {isMbbsDestination ? (
              <section className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-600" />
                  Planning MBBS in {country.name}? Check NMC rules first
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  To practise in India, the programme must meet the National Medical Commission&apos;s Foreign Medical
                  Graduate Licentiate Regulations, 2021 — at least 54 months of study, a 12-month internship at the same
                  institution, teaching in English and NEET UG qualification before admission — and you must later pass
                  the NMC licensing exam. Check the specific university and programme, not just the country.
                </p>
                <Link
                  href="/mbbs-abroad-consultant-in-vashi"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
                >
                  MBBS abroad counselling at our Vashi office
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ) : (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Planning your application</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Most universities in {country.name} ask for academic transcripts, a statement of purpose, letters of
                  recommendation and English test scores, and some programmes also need GRE, GMAT or SAT scores. Start
                  12 to 18 months before your intended intake.
                </p>
                <Link
                  href="/study-abroad-consultant-in-vashi"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
                >
                  Study abroad counselling at our Vashi office
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            )}

            {related.exams.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <RelatedLinkGroup title="Exams to know about" links={related.exams} />
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-bold text-gray-900 mb-2">Talk to a counsellor</h2>
              <p className="text-sm text-gray-600 mb-4">
                Free counselling on universities, costs and visas for {country.name}.
              </p>
              <ContactButtons />
            </div>

            {otherCountries.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <h2 className="font-bold text-gray-900 mb-3">Other destinations</h2>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  {otherCountries.map((other) => (
                    <li key={other.slug}>
                      <Link href={`/study-abroad/${other.slug}`} className="text-primary-700 hover:underline">
                        <span aria-hidden="true">{other.flag} </span>
                        {other.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
