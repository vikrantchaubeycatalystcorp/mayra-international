import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { courses } from "../../data/courses";
import { formatCurrency } from "../../lib/utils";
import { cn } from "../../lib/utils";

function CourseCard({ course }: { course: typeof courses[0] }) {
  return (
    <Link href={`/courses`}>
      <article className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 cursor-pointer">
        {/* Icon */}
        <div className={cn(
          "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 duration-300",
          course.color || "from-blue-600 to-blue-400"
        )}>
          {course.icon || "📚"}
        </div>

        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-primary-600 transition-colors">
          {course.name}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {course.description.slice(0, 80)}...
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-xs font-bold text-gray-800">{course.duration}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400">Avg Fees</p>
            <p className="text-xs font-bold text-gray-800">{formatCurrency(course.avgFees)}/yr</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{course.topColleges.toLocaleString()}+ colleges</span>
          {course.avgSalary && (
            <span className="text-green-600 font-semibold">
              {(course.avgSalary / 100000).toFixed(1)} LPA avg
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

export function FeaturedCourses() {
  const featuredCourses = courses.filter((c) => c.isFeatured);
  const popularCourses = courses.slice(0, 8);

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Popular Courses
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Explore 800+ courses across engineering, medicine, law, management and more
            </p>
          </div>
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap ml-4 mt-1"
          >
            View All Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Bottom banner */}
        <div className="mt-10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl sm:text-2xl font-black mb-2">
            Not Sure Which Course to Choose?
          </h3>
          <p className="text-blue-200 mb-5 text-sm sm:text-base max-w-xl mx-auto">
            Take our free career aptitude test and get personalized course recommendations based on your interests and strengths.
          </p>
          <button suppressHydrationWarning className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-semibold transition-colors">
            Take Free Career Test
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
