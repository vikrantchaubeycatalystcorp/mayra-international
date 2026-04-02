import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Globe,
  Phone,
  Calendar,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { prisma } from "../../../../lib/db";
import { Breadcrumb } from "../../../../components/shared/Breadcrumb";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { cn, formatCurrency, getGradientForLetter } from "../../../../lib/utils";
import { JsonLd, collegeJsonLd, collegeFaqJsonLd, breadcrumbJsonLd } from "../../../../lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Return empty — pages are generated on-demand and cached via ISR
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const college = await prisma.college.findUnique({ where: { slug } });
  if (!college) return { title: "College Not Found" };
  return {
    title: `${college.name} — Admissions, Courses, Fees, Placements ${new Date().getFullYear() + 1}`,
    description: `${college.name} — ${college.description.slice(0, 140)}. Check NIRF ranking, fee structure, placement record, courses offered, and admission process.`,
    openGraph: {
      title: `${college.name} — Admissions, Fees & Placements`,
      description: college.description.slice(0, 160),
      url: `https://mayra.in/colleges/${college.slug}`,
      type: "website",
    },
    alternates: {
      canonical: `https://mayra.in/colleges/${college.slug}`,
    },
  };
}

export default async function CollegeDetailPage({ params }: Props) {
  const { slug } = await params;
  const college = await prisma.college.findUnique({
    where: { slug },
    include: {
      gallery: { orderBy: { sortOrder: "asc" } },
      recruiters: { orderBy: { sortOrder: "asc" } },
      feeStructures: { orderBy: { sortOrder: "asc" } },
      admissionInfo: true,
    },
  });
  if (!college) notFound();

  const similarColleges = await prisma.college.findMany({
    where: {
      isActive: true,
      id: { not: college.id },
      streams: { hasSome: college.streams },
    },
    take: 4,
    orderBy: { rating: "desc" },
  });

  const gradient = getGradientForLetter(college.name[0]);

  const defaultRecruiters = ["Google", "Microsoft", "Amazon", "Goldman Sachs", "McKinsey", "BCG", "Flipkart", "Apple", "Deloitte", "KPMG"];
  const recruiterNames = college.recruiters.length > 0
    ? college.recruiters.map((r) => r.name)
    : defaultRecruiters;

  // Build a compatible object for JSON-LD helpers that expect the old interface
  const collegeSeo = {
    ...college,
    fees: { min: college.feesMin, max: college.feesMax },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={collegeJsonLd(collegeSeo as any)} />
      <JsonLd data={collegeFaqJsonLd(collegeSeo as any)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Colleges", url: "/colleges" },
        { name: college.name },
      ])} />
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb
            items={[
              { label: "Colleges", href: "/colleges" },
              { label: college.name },
            ]}
            className="mb-6"
          />

          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Logo */}
            <div
              className={cn(
                "h-24 w-24 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-4xl flex-shrink-0 shadow-lg",
                gradient
              )}
            >
              {college.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={college.type === "Government" ? "blue" : "secondary"}>
                  {college.type}
                </Badge>
                {college.nirfRank && (
                  <Badge variant="orange">NIRF Rank #{college.nirfRank}</Badge>
                )}
                {college.accreditation.map((acc) => (
                  <Badge key={acc} variant="success">
                    {acc}
                  </Badge>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                {college.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  {college.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  Est. {college.established}
                </span>
                {college.totalStudents && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary-500" />
                    {college.totalStudents.toLocaleString()} students
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-5 w-5",
                        s <= Math.floor(college.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">
                  {college.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({college.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="gradient" size="lg">
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Download Brochure
                </Button>
                {college.website && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="lg" className="gap-1.5">
                      <Globe className="h-4 w-4" />
                      Official Website
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="w-full lg:w-72 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-5 flex-shrink-0">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Annual Fees</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(college.feesMin)} — {formatCurrency(college.feesMax)}
                  </span>
                </div>
                {college.avgPackage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Avg Package</span>
                    <span className="font-bold text-green-600">
                      {(college.avgPackage / 100000).toFixed(1)} LPA
                    </span>
                  </div>
                )}
                {college.topPackage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Top Package</span>
                    <span className="font-bold text-green-700">
                      {(college.topPackage / 100000).toFixed(0)} LPA
                    </span>
                  </div>
                )}
                {college.placementRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Placement Rate</span>
                    <span className="font-bold text-blue-600">
                      {college.placementRate}%
                    </span>
                  </div>
                )}
                {college.faculty && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Faculty</span>
                    <span className="font-bold text-gray-900">
                      {college.faculty.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none pb-px">
            {["Overview", "Courses", "Admission", "Placements", "Reviews"].map(
              (tab) => (
                <button suppressHydrationWarning
                  key={tab}
                  className={cn(
                    "px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors",
                    tab === "Overview"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                  )}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                About {college.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {college.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {college.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Courses Offered */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" />
                Courses Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {college.courses.map((course) => (
                  <span
                    key={course}
                    className="px-4 py-2 bg-primary-50 border border-primary-100 rounded-xl text-primary-700 text-sm font-medium"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </section>

            {/* Admission */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Admission Process
              </h2>
              <Accordion type="single" collapsible className="space-y-0">
                <AccordionItem value="eligibility">
                  <AccordionTrigger>Eligibility Criteria</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">
                      Admission to {college.name} is through national entrance exams. Engineering programs require JEE Main/Advanced qualification. Management programs require CAT/XAT scores. Check the official website for specific cutoffs and requirements.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="fees">
                  <AccordionTrigger>Fee Structure</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Annual Tuition Fee</span>
                        <span className="font-semibold">{formatCurrency(college.feesMin)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Hostel + Mess (Approx.)</span>
                        <span className="font-semibold">₹80,000–₹1,20,000</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Total Annual Cost</span>
                        <span className="font-bold text-primary-700">{formatCurrency(college.feesMax)}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="documents">
                  <AccordionTrigger>Documents Required</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>10th & 12th Mark Sheets</li>
                      <li>Entrance Exam Scorecard</li>
                      <li>Category Certificate (if applicable)</li>
                      <li>Migration Certificate</li>
                      <li>Character Certificate</li>
                      <li>Medical Fitness Certificate</li>
                      <li>Aadhaar Card / ID Proof</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Placements */}
            {college.avgPackage && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Placement Statistics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Placement Rate", value: `${college.placementRate}%`, color: "text-blue-600" },
                    { label: "Average Package", value: `${(college.avgPackage / 100000).toFixed(1)} LPA`, color: "text-green-600" },
                    { label: "Highest Package", value: `${college.topPackage ? (college.topPackage / 100000).toFixed(0) : "N/A"} LPA`, color: "text-purple-600" },
                    { label: "Companies", value: "500+", color: "text-orange-600" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className={cn("text-2xl font-black mb-1", stat.color)}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Top Recruiters</h3>
                <div className="flex flex-wrap gap-2">
                  {recruiterNames.map(
                    (company) => (
                      <span
                        key={company}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 font-medium"
                      >
                        {company}
                      </span>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply CTA */}
            <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-2xl p-6 text-white text-center">
              <h3 className="font-bold text-lg mb-2">Admissions 2026</h3>
              <p className="text-blue-200 text-sm mb-4">
                Apply now and get expert guidance on your application
              </p>
              <Button variant="accent" className="w-full mb-2">
                Apply Now
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                Download Brochure
              </Button>
              {college.phone && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-200">
                  <Phone className="h-4 w-4" />
                  {college.phone}
                </div>
              )}
            </div>

            {/* Accreditations */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">
                Accreditations & Rankings
              </h3>
              <div className="space-y-2">
                {college.accreditation.map((acc) => (
                  <div
                    key={acc}
                    className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">{acc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streams */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Streams Available</h3>
              <div className="flex flex-wrap gap-2">
                {college.streams.map((s) => (
                  <Badge key={s} variant="blue">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Related Colleges */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">
                Similar Colleges
              </h3>
              <div className="space-y-3">
                {similarColleges.map((c) => (
                    <Link
                      key={c.id}
                      href={`/colleges/${c.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                          getGradientForLetter(c.name[0])
                        )}
                      >
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">{c.city}</p>
                      </div>
                    </Link>
                  ))}
              </div>
              <Link
                href="/colleges"
                className="flex items-center gap-1 mt-3 text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                View all colleges
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
