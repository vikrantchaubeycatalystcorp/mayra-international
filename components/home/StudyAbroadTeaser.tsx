import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { studyAbroadCountries } from "../../data/studyAbroad";

function CountryCard({ country }: { country: typeof studyAbroadCountries[0] }) {
  return (
    <Link href="/study-abroad">
      <article className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 cursor-pointer">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{country.flag}</span>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {country.name}
            </h3>
            <p className="text-xs text-gray-500">{country.universities}+ universities</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {country.description.slice(0, 90)}...
        </p>

        <div className="bg-blue-50 rounded-xl p-2.5 mb-3">
          <p className="text-xs text-blue-600 font-medium mb-0.5">Average Cost</p>
          <p className="text-xs font-bold text-gray-800">{country.avgCost}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {country.popularCourses.slice(0, 3).map((course) => (
            <span
              key={course}
              className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-500"
            >
              {course}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}

export function StudyAbroadTeaser() {
  const topCountries = studyAbroadCountries.slice(0, 6);

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Study Abroad
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Explore world-class universities in 10+ countries. Over 3 lakh Indian students study abroad annually.
            </p>
          </div>
          <Link
            href="/study-abroad"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap ml-4 mt-1"
          >
            Explore All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {topCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-7 text-white">
            <h3 className="text-xl font-black mb-2">Free IELTS/TOEFL Preparation</h3>
            <p className="text-blue-200 text-sm mb-5">
              Get access to 1000+ practice questions, mock tests, and expert tips to ace your English proficiency exam.
            </p>
            <button suppressHydrationWarning className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
              Start Preparing Free
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-accent-600 to-orange-500 rounded-2xl p-7 text-white">
            <h3 className="text-xl font-black mb-2">Free Study Abroad Counseling</h3>
            <p className="text-orange-100 text-sm mb-5">
              Our expert counselors will guide you through university selection, SOP writing, visa process, and scholarships.
            </p>
            <button suppressHydrationWarning className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-700 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors">
              Book Free Session
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
