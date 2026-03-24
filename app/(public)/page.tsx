import { HeroBanner } from "../../components/home/HeroBanner";
import { StatsSection } from "../../components/home/StatsSection";
import { TopColleges } from "../../components/home/TopColleges";
import { TopExams } from "../../components/home/TopExams";
import { NewsSection } from "../../components/home/NewsSection";
import { FeaturedCourses } from "../../components/home/FeaturedCourses";
import { StudyAbroadTeaser } from "../../components/home/StudyAbroadTeaser";
import { CompareBar } from "../../components/colleges/CompareBar";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

function NewsletterCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-20" />
      <div className="container mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6">
          <Sparkles className="h-4 w-4 text-accent-400" />
          <span>Free for students — always</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
          Start Your Education Journey Today
        </h2>
        <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
          Join 10 lakh+ students who use Mayra to make smarter education decisions. Get personalized recommendations, exam alerts, and expert guidance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up">
            <button suppressHydrationWarning className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl font-bold text-lg transition-all hover:shadow-orange-glow">
              Get Started Free
              <ArrowRight className="inline ml-2 h-5 w-5" />
            </button>
          </Link>
          <Link href="/colleges">
            <button suppressHydrationWarning className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold text-lg transition-all backdrop-blur-sm">
              Explore Colleges
            </button>
          </Link>
        </div>
        <p className="text-blue-300/60 text-sm mt-6">
          No credit card required. No spam. Just good guidance.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <StatsSection />
      <TopColleges />
      <TopExams />
      <NewsSection />
      <FeaturedCourses />
      <StudyAbroadTeaser />
      <NewsletterCTA />
      <CompareBar />
    </>
  );
}
