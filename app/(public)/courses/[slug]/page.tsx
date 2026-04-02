import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Building2,
  TrendingUp,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Briefcase,
  IndianRupee,
  Users,
  CheckCircle,
  Cpu,
  Stethoscope,
  Scale,
  Monitor,
  FlaskConical,
  BarChart3,
  Building,
  Pill,
  Tv,
  Microscope,
  Palette,
  Leaf,
  PenLine,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "../../../../lib/db";
import { Breadcrumb } from "../../../../components/shared/Breadcrumb";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { formatCurrency } from "../../../../lib/utils";
import { JsonLd, courseJsonLd, courseFaqJsonLd, breadcrumbJsonLd } from "../../../../lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const streamIconMap: Record<string, LucideIcon> = {
  Engineering: Cpu,
  Medical: Stethoscope,
  Management: Briefcase,
  Law: Scale,
  "Computer Science": Monitor,
  Science: FlaskConical,
  Commerce: BarChart3,
  "Arts & Humanities": BookOpen,
  Architecture: Building,
  Pharmacy: Pill,
  Hospitality: Heart,
  "Media & Communication": Tv,
  Research: Microscope,
  Design: Palette,
  Agriculture: Leaf,
  Education: PenLine,
  "Veterinary Sciences": Heart,
};

export async function generateStaticParams() {
  // Return empty — pages are generated on-demand and cached via ISR
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.name} — Duration, Fees, Top Colleges, Career Scope ${new Date().getFullYear() + 1}`,
    description: `Complete guide to ${course.name}: ${course.duration} duration, ₹${(course.avgFees / 100000).toFixed(1)}L avg fees, ${course.topColleges.toLocaleString()}+ colleges.${course.avgSalary ? ` Avg salary ₹${(course.avgSalary / 100000).toFixed(1)} LPA.` : ""} Eligibility, syllabus, and career scope.`,
    openGraph: {
      title: `${course.name} — Fees, Duration & Career Scope`,
      description: course.description.slice(0, 160),
      url: `https://mayra.in/courses/${course.slug}`,
      type: "website",
    },
    alternates: {
      canonical: `https://mayra.in/courses/${course.slug}`,
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) notFound();

  const Icon = streamIconMap[course.stream] ?? BookOpen;

  const relatedCourses = await prisma.course.findMany({
    where: {
      isActive: true,
      id: { not: course.id },
      stream: course.stream,
    },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={courseJsonLd(course as any)} />
      <JsonLd data={courseFaqJsonLd(course as any)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Courses", url: "/courses" },
        { name: course.name },
      ])} />
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb
            items={[
              { label: "Courses", href: "/courses" },
              { label: course.name },
            ]}
            className="mb-5"
          />

          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="blue">{course.stream}</Badge>
                {course.isFeatured && <Badge variant="orange">Popular Course</Badge>}
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${course.color || "from-blue-600 to-blue-400"} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900">{course.name}</h1>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-green-500" />
                  {course.topColleges.toLocaleString()}+ Colleges
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <IndianRupee className="h-4 w-4 text-orange-500" />
                  Avg Fees: {formatCurrency(course.avgFees)}/yr
                </span>
                {course.avgSalary && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    Avg Salary: {(course.avgSalary / 100000).toFixed(1)} LPA
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="gradient" size="lg">
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/courses">
                  <Button variant="ghost" size="lg">
                    View All Courses
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="w-full lg:w-72 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-5 flex-shrink-0">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Key Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-bold">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Level</span>
                  <span className="font-bold">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stream</span>
                  <span className="font-bold">{course.stream}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg Fees</span>
                  <span className="font-bold">{formatCurrency(course.avgFees)}/yr</span>
                </div>
                {course.avgSalary && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Salary</span>
                    <span className="font-bold text-green-600">{(course.avgSalary / 100000).toFixed(1)} LPA</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Top Colleges</span>
                  <span className="font-bold">{course.topColleges.toLocaleString()}+</span>
                </div>
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
                About {course.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </section>

            {/* Highlights */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Course Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Clock, label: "Duration", value: course.duration, color: "text-blue-500" },
                  { icon: GraduationCap, label: "Level", value: course.level, color: "text-purple-500" },
                  { icon: Building2, label: "Colleges Offering", value: `${course.topColleges.toLocaleString()}+`, color: "text-green-500" },
                  { icon: IndianRupee, label: "Average Annual Fees", value: formatCurrency(course.avgFees), color: "text-orange-500" },
                  ...(course.avgSalary
                    ? [{ icon: TrendingUp, label: "Average Starting Salary", value: `${(course.avgSalary / 100000).toFixed(1)} LPA`, color: "text-emerald-500" }]
                    : []),
                  { icon: Users, label: "Stream", value: course.stream, color: "text-indigo-500" },
                ].map(({ icon: ItemIcon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <ItemIcon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Career Scope */}
            {course.avgSalary && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  Career Scope
                </h2>
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">Average Starting Salary</p>
                      <p className="text-2xl font-black text-green-600">{(course.avgSalary / 100000).toFixed(1)} LPA</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Graduates of {course.name} can expect competitive salaries across industries. The average salary figure is based on entry-level positions for fresh graduates from reputed institutions.
                  </p>
                </div>
              </section>
            )}

            {/* How to Apply */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary-600" />
                How to Apply
              </h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Research Colleges", desc: "Shortlist colleges offering this course based on ranking, fees, location, and placement record." },
                  { step: "2", title: "Check Eligibility", desc: "Verify the eligibility criteria — most programs require 10+2 or graduation depending on the level." },
                  { step: "3", title: "Appear for Entrance Exams", desc: "Prepare and appear for relevant entrance exams accepted by your target colleges." },
                  { step: "4", title: "Fill Applications", desc: "Apply to shortlisted colleges through their official portals or centralized counselling." },
                  { step: "5", title: "Attend Counselling", desc: "Participate in merit-based or exam-based counselling and secure your admission." },
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
                  Find Colleges for {course.name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-900">{course.duration}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Avg Annual Fees</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(course.avgFees)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Colleges</span>
                  <span className="font-semibold text-gray-900">{course.topColleges.toLocaleString()}+</span>
                </div>
                {course.avgSalary && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Avg Salary</span>
                    <span className="font-semibold text-green-600">{(course.avgSalary / 100000).toFixed(1)} LPA</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Related Courses</h3>
                <div className="space-y-3">
                  {relatedCourses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      className="flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">{c.duration}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{c.level}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
