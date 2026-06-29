"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";

type CountryData = {
  id: string;
  name: string;
  flag: string;
  universities: number;
  avgCost: string;
  popularCourses: string[];
  description: string;
};

function CountryCard({ country }: { country: CountryData }) {
  return (
    <Link href="/study-abroad">
      <article className="group card-premium p-5 cursor-pointer h-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{country.flag}</span>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{country.name}</h3>
            <p className="text-xs text-gray-500">{country.universities}+ universities</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{country.description.slice(0, 90)}...</p>
        <div className="bg-indigo-50/50 rounded-xl p-2.5 mb-3 border border-indigo-100/30">
          <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mb-0.5">Average Cost</p>
          <p className="text-xs font-bold text-gray-800">{country.avgCost}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {country.popularCourses.slice(0, 3).map((course) => (
            <span key={course} className="px-2 py-0.5 bg-gray-50 border border-gray-100/80 rounded-lg text-[10px] text-gray-500 font-medium">{course}</span>
          ))}
        </div>
      </article>
    </Link>
  );
}

type Props = {
  countries: CountryData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function StudyAbroadTeaserClient({ countries, title, subtitle, ctaLabel, ctaLink }: Props) {
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
    <section className="section-padding bg-white relative" ref={ref}>
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-base max-w-lg">{subtitle}</p>
          </div>
          <Link href={ctaLink} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all duration-300 whitespace-nowrap group">
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children", revealed && "revealed")}>
          {countries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>

        {/* CTA Banners */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700" />
            <div className="absolute inset-0 hero-grid opacity-15" />
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-400/20 blur-[50px]" />
            <div className="relative p-8 text-white">
              <h3 className="text-xl font-black mb-2 tracking-tight">Free IELTS/TOEFL Preparation</h3>
              <p className="text-indigo-200/70 text-sm mb-6 leading-relaxed">Get access to 1000+ practice questions, mock tests, and expert tips to ace your English proficiency exam.</p>
              <button suppressHydrationWarning className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                Start Preparing Free
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-orange-500" />
            <div className="absolute inset-0 hero-grid opacity-15" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-yellow-400/20 blur-[50px]" />
            <div className="relative p-8 text-white">
              <h3 className="text-xl font-black mb-2 tracking-tight">Free Study Abroad Counseling</h3>
              <p className="text-orange-100/80 text-sm mb-6 leading-relaxed">Our expert counselors will guide you through university selection, SOP writing, visa process, and scholarships.</p>
              <button suppressHydrationWarning className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-700 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                Book Free Session
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
