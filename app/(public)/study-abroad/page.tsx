import Link from "next/link";
import { ExternalLink, Globe, BookOpen, DollarSign, GraduationCap, ArrowRight, Users, MapPin, BadgeDollarSign, BadgeCheck, Target, FileText, Send, Trophy, Plane } from "lucide-react";
import { prisma } from "../../../lib/db";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { JsonLd, studyAbroadHowToJsonLd, studyAbroadFaqJsonLd, breadcrumbJsonLd } from "../../../lib/seo";

export const revalidate = 60;

interface StudyAbroadCountryRow {
  id: string;
  name: string;
  slug: string;
  flag: string;
  universities: number;
  avgCost: string;
  popularCourses: string[];
  description: string;
  topUniversities: unknown;
}

function CountryCard({ country }: { country: StudyAbroadCountryRow }) {
  const rawUnis = Array.isArray(country.topUniversities) ? country.topUniversities : [];
  const topUniversities = rawUnis.map((u: unknown) =>
    typeof u === "string" ? u : (u as { name?: string })?.name || String(u)
  );
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Flag Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 text-center border-b border-gray-100">
        <span className="text-7xl">{country.flag}</span>
        <h3 className="font-black text-xl text-gray-900 mt-3">{country.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{country.universities}+ universities</p>
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {country.description}
        </p>

        {/* Average Cost */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl mb-4">
          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-green-600 font-medium">Average Annual Cost</p>
            <p className="text-sm font-bold text-gray-800">{country.avgCost}</p>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Popular Courses</p>
          <div className="flex flex-wrap gap-1.5">
            {country.popularCourses.slice(0, 3).map((c) => (
              <Badge key={c} variant="blue" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>

        {/* Top Universities */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Top Universities</p>
          <ul className="space-y-1">
            {topUniversities.slice(0, 3).map((u) => (
              <li key={u} className="text-xs text-gray-600 flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3 text-primary-400" />
                {u}
              </li>
            ))}
          </ul>
        </div>

        <Button variant="gradient" className="w-full text-sm gap-1.5">
          Explore {country.name}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default async function StudyAbroadPage() {
  const studyAbroadCountries = await prisma.studyAbroadCountry.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={studyAbroadHowToJsonLd()} />
      <JsonLd data={studyAbroadFaqJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Study Abroad" }])} />
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="container mx-auto py-16 relative z-10">
          <Breadcrumb
            items={[{ label: "Study Abroad" }]}
            className="mb-5 [&_*]:text-white/70 [&_a:hover]:text-white"
          />
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-6 w-6 text-accent-400" />
              <span className="text-accent-400 font-semibold text-sm uppercase tracking-wider">Study Abroad Guide</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Study at World&apos;s{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-yellow-300">
                Best Universities
              </span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Join 3.3 lakh+ Indian students studying abroad. Get expert guidance on university selection, scholarship, visa, and accommodation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="accent" size="lg">
                Get Free Counseling
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                Explore Scholarships
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "3.3L+", label: "Indians Studying Abroad", Icon: GraduationCap },
              { value: "10+", label: "Top Destinations", Icon: MapPin },
              { value: "$50K+", label: "Scholarships Available", Icon: BadgeDollarSign },
              { value: "85%", label: "F-1 Visa Approval Rate", Icon: BadgeCheck },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <stat.Icon className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="container mx-auto py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Top Study Destinations</h2>
          <p className="text-gray-500">Choose from 10 countries with world-class universities and student-friendly policies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studyAbroadCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>

        {/* Process Section */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
            How to Apply for Study Abroad?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: "1", Icon: Target, title: "Choose University", desc: "Shortlist universities based on ranking, program, and budget" },
              { step: "2", Icon: FileText, title: "Prepare Documents", desc: "SOP, LOR, transcripts, CV, language test scores" },
              { step: "3", Icon: Send, title: "Apply Online", desc: "Submit applications with required documents and fees" },
              { step: "4", Icon: Trophy, title: "Get Admission", desc: "Receive offer letter and confirm enrollment" },
              { step: "5", Icon: Plane, title: "Get Visa", desc: "Apply for student visa with admission letter" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-14 w-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <item.Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-black mb-3">Ready to Study Abroad?</h3>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">
            Our expert counselors have helped 50,000+ students get admission in top global universities. Get your free session today.
          </p>
          <Button variant="accent" size="xl">
            Book Free Counseling Session
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
