import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Monitor,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { prisma } from "../../../../lib/db";
import { Breadcrumb } from "../../../../components/shared/Breadcrumb";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../../components/ui/accordion";
import { formatDate } from "../../../../lib/utils";
import { JsonLd, examJsonLd, examFaqJsonLd, breadcrumbJsonLd } from "../../../../lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Return empty — pages are generated on-demand and cached via ISR
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exam = await prisma.exam.findUnique({ where: { slug } });
  if (!exam) return { title: "Exam Not Found" };
  return {
    title: `${exam.name} 2026 — Exam Date, Registration, Syllabus, Eligibility`,
    description: `${exam.name} (${exam.fullName}) 2026: Exam date ${exam.examDate}, conducted by ${exam.conductingBody}. Check registration dates, syllabus, eligibility, application fee ₹${exam.applicationFeeGeneral}, and preparation tips.`,
    openGraph: {
      title: `${exam.name} 2026 — Dates, Syllabus & Eligibility`,
      description: exam.description.slice(0, 160),
      url: `https://www.mayrainternational.com/exams/${exam.slug}`,
      type: "website",
    },
    alternates: {
      canonical: `https://www.mayrainternational.com/exams/${exam.slug}`,
    },
  };
}

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = await prisma.exam.findUnique({ where: { slug } });
  if (!exam) notFound();

  const relatedExams = await prisma.exam.findMany({
    where: {
      isActive: true,
      id: { not: exam.id },
      streams: { hasSome: exam.streams },
    },
    take: 5,
  });

  const syllabus = (exam.syllabus as { section: string; topics: string[] }[]) || [];

  const today = new Date();
  const regEnd = exam.registrationEnd ? new Date(exam.registrationEnd) : null;
  const regStart = exam.registrationStart ? new Date(exam.registrationStart) : null;
  const isRegOpen = regStart && regEnd && regStart <= today && regEnd >= today;
  const isRegUpcoming = regStart && regStart > today;

  const importantDates = [
    { event: "Registration Start", date: exam.registrationStart, color: "bg-blue-50 border-blue-200 text-blue-700" },
    { event: "Registration End", date: exam.registrationEnd, color: "bg-red-50 border-red-200 text-red-700" },
    { event: "Exam Date", date: exam.examDate, color: "bg-orange-50 border-orange-200 text-orange-700" },
    { event: "Result Date", date: exam.resultDate, color: "bg-green-50 border-green-200 text-green-700" },
  ].filter((d) => d.date);

  // Build a compatible object for JSON-LD helpers that expect the old interface
  const examSeo = {
    ...exam,
    stream: exam.streams,
    applicationFee: { general: exam.applicationFeeGeneral, sc_st: exam.applicationFeeSCST },
    syllabus,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={examJsonLd(examSeo as any)} />
      <JsonLd data={examFaqJsonLd(examSeo as any)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Exams", url: "/exams" },
        { name: exam.name },
      ])} />
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb
            items={[
              { label: "Exams", href: "/exams" },
              { label: exam.name },
            ]}
            className="mb-5"
          />

          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {exam.streams.map((s) => (
                  <Badge key={s} variant="blue">{s}</Badge>
                ))}
                <Badge variant="secondary">{exam.level}</Badge>
                {isRegOpen && <Badge variant="success">Registration Open</Badge>}
                {isRegUpcoming && <Badge variant="warning">Registration Opening Soon</Badge>}
                {exam.isFeatured && <Badge variant="orange">Popular Exam</Badge>}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">
                {exam.name} 2026
              </h1>
              <p className="text-gray-500 text-base mb-3">{exam.fullName}</p>
              <p className="text-sm text-gray-500 mb-4">
                Conducted by:{" "}
                <span className="font-semibold text-gray-700">
                  {exam.conductingBody}
                </span>
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <Monitor className="h-4 w-4 text-blue-500" />
                  {exam.mode} Mode
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-500" />
                  {exam.frequency}
                </span>
                {exam.participatingColleges && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-500" />
                    {exam.participatingColleges}+ Colleges
                  </span>
                )}
                {exam.totalSeats && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <FileText className="h-4 w-4 text-orange-500" />
                    {exam.totalSeats.toLocaleString()} Seats
                  </span>
                )}
              </div>

              {isRegOpen && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-semibold text-green-700">
                    Registration is currently open! Deadline:{" "}
                    {exam.registrationEnd && formatDate(exam.registrationEnd)}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="gradient" size="lg">
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Download Syllabus
                </Button>
                <Link href="/exams">
                  <Button variant="ghost" size="lg">
                    View All Exams
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="w-full lg:w-72 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-5 flex-shrink-0">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Key Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Application Fee</span>
                  <span className="font-bold">₹{exam.applicationFeeGeneral.toLocaleString()}</span>
                </div>
                {exam.applicationFeeSCST && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">SC/ST Fee</span>
                    <span className="font-bold">₹{exam.applicationFeeSCST.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Exam Mode</span>
                  <span className="font-bold">{exam.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frequency</span>
                  <span className="font-bold text-right">{exam.frequency}</span>
                </div>
                {exam.totalSeats && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Seats</span>
                    <span className="font-bold">{exam.totalSeats.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                About {exam.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">{exam.description}</p>
            </section>

            {/* Eligibility */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Eligibility Criteria
              </h2>
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm leading-relaxed">{exam.eligibility}</p>
              </div>
            </section>

            {/* Syllabus */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Exam Syllabus
              </h2>
              <Accordion type="multiple" className="space-y-0">
                {syllabus.map((section, idx) => (
                  <AccordionItem key={idx} value={`section-${idx}`}>
                    <AccordionTrigger className="text-gray-800 font-semibold">
                      {section.section}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {section.topics.map((topic) => (
                          <span
                            key={topic}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Application Process */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary-600" />
                How to Apply
              </h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Register Online", desc: `Visit the official website and create a new account with your email and mobile number.` },
                  { step: "2", title: "Fill Application Form", desc: "Enter personal details, academic qualifications, and preferred exam city." },
                  { step: "3", title: "Upload Documents", desc: "Upload scanned photograph, signature, and category certificate as specified." },
                  { step: "4", title: "Pay Application Fee", desc: `Pay ₹${exam.applicationFeeGeneral.toLocaleString()} via debit/credit card, net banking, or UPI.` },
                  { step: "5", title: "Download Confirmation", desc: "Save the confirmation page. Admit card will be issued separately before the exam." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button variant="gradient" className="gap-2">
                  Apply for {exam.name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Important Dates */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                Important Dates
              </h3>
              <div className="space-y-3">
                {importantDates.map((date) => (
                  <div
                    key={date.event}
                    className={`p-3 rounded-xl border ${date.color}`}
                  >
                    <p className="text-xs font-medium opacity-80">{date.event}</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">
                      {date.date && formatDate(date.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Exams */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Related Exams</h3>
              <div className="space-y-3">
                {relatedExams.map((e) => (
                    <Link
                      key={e.id}
                      href={`/exams/${e.slug}`}
                      className="flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                          {e.name}
                        </p>
                        <p className="text-xs text-gray-400">{e.level}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {e.streams[0]}
                      </Badge>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
