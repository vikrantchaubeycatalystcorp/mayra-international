"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Cpu, Stethoscope, Briefcase, Scale, Monitor, FlaskConical, BarChart3, BookOpen, Building, Pill, Tv, Microscope, Palette, Leaf, PenLine, Heart, type LucideIcon } from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";

const streamIconMap: Record<string, LucideIcon> = {
  Engineering: Cpu, Medical: Stethoscope, Management: Briefcase, Law: Scale,
  "Computer Science": Monitor, Science: FlaskConical, Commerce: BarChart3,
  "Arts & Humanities": BookOpen, Architecture: Building, Pharmacy: Pill,
  Hospitality: Heart, "Media & Communication": Tv, Research: Microscope,
  Design: Palette, Agriculture: Leaf, Education: PenLine,
};

type CourseData = {
  id: string;
  name: string;
  slug: string;
  stream: string;
  level: string;
  duration: string;
  description: string;
  topColleges: number;
  avgFees: number;
  avgSalary: number | null;
  icon: string | null;
  color: string | null;
};

function CourseCard({ course }: { course: CourseData }) {
  const Icon = streamIconMap[course.stream] ?? BookOpen;

  return (
    <Link href={`/courses/${course.slug}`}>
      <article className="group card-premium p-5 cursor-pointer h-full flex flex-col">
        <div className={cn(
          "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg",
          course.color || "from-indigo-600 to-purple-500"
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-indigo-600 transition-colors tracking-tight">{course.name}</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">{course.description.slice(0, 80)}...</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center border border-gray-100/50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Duration</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{course.duration}</p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-2.5 text-center border border-gray-100/50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Avg Fees</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{formatCurrency(course.avgFees)}/yr</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100/50">
          <span className="text-gray-400 font-medium">{course.topColleges.toLocaleString()}+ colleges</span>
          {course.avgSalary && (
            <span className="text-emerald-600 font-semibold">{(course.avgSalary / 100000).toFixed(1)} LPA avg</span>
          )}
        </div>
      </article>
    </Link>
  );
}

type Props = {
  courses: CourseData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  careerCtaHeading: string;
  careerCtaSubheading: string;
  careerCtaButtonText: string;
};

export function FeaturedCoursesClient({
  courses, title, subtitle, ctaLabel, ctaLink,
  careerCtaHeading, careerCtaSubheading, careerCtaButtonText,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50/50 via-white to-white relative" ref={ref}>
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="container mx-auto relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-lg">{subtitle}</p>
          </div>
          <Link href={ctaLink} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all duration-300 whitespace-nowrap group flex-shrink-0">
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className={cn("grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children", revealed && "revealed")}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Career CTA Banner */}
        <div className="mt-14 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-900" />
          <div className="absolute inset-0 hero-grid opacity-20" />
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-indigo-500/20 blur-[60px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-purple-500/15 blur-[60px]" />
          <div className="relative p-8 sm:p-10 text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">{careerCtaHeading}</h3>
            <p className="text-indigo-200/70 mb-6 text-sm sm:text-base max-w-xl mx-auto">{careerCtaSubheading}</p>
            <button suppressHydrationWarning className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]">
              {careerCtaButtonText}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
