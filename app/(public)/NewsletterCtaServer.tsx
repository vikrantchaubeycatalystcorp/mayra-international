import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "../../lib/db";

export async function NewsletterCtaServer() {
  const cta = await prisma.ctaSection.findUnique({
    where: { sectionKey: "newsletter" },
  });

  const badge = cta?.badge || "Free for students — always";
  const heading = cta?.heading || "Start Your Education Journey Today";
  const subheading = cta?.subheading || "Join 10 lakh+ students who use Mayra to make smarter education decisions. Get personalized recommendations, exam alerts, and expert guidance.";
  const primaryText = cta?.ctaPrimaryText || "Get Started Free";
  const primaryLink = cta?.ctaPrimaryLink || "/sign-up";
  const secondaryText = cta?.ctaSecondaryText || "Explore Colleges";
  const secondaryLink = cta?.ctaSecondaryLink || "/colleges";
  const footnote = cta?.footnote || "No credit card required. No spam. Just good guidance.";

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900" />
      <div className="absolute inset-0 hero-grid opacity-20" />
      {/* Decorative orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/15 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-400/5 blur-[80px]" />

      <div className="container mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.07] border border-white/[0.1] text-white/90 text-sm mb-8 backdrop-blur-xl">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400">
            <Sparkles className="h-3 w-3 text-white" />
          </span>
          <span className="font-medium">{badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight max-w-3xl mx-auto leading-[1.15]">
          {heading}
        </h2>
        <p className="text-indigo-200/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          {subheading}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={primaryLink}>
            <button suppressHydrationWarning className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
              {primaryText}
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <Link href={secondaryLink}>
            <button suppressHydrationWarning className="px-8 py-4 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.2] text-white rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-xl">
              {secondaryText}
            </button>
          </Link>
        </div>
        <p className="text-indigo-300/40 text-sm mt-8">{footnote}</p>
      </div>
    </section>
  );
}
