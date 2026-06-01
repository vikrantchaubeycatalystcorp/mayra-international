import Link from "next/link";
import { prisma } from "../../lib/db";

export async function NewsletterCtaServer() {
  const cta = await prisma.ctaSection.findUnique({
    where: { sectionKey: "newsletter" },
  });

  const badge = cta?.badge || "Free for every student";
  const heading = cta?.heading || "Make your next decision the right one.";
  const subheading =
    cta?.subheading ||
    "Join 10 lakh+ students who use Mayra to compare, plan and apply — guidance from real counsellors, not bots.";
  const primaryText = cta?.ctaPrimaryText || "Explore colleges";
  const primaryLink = cta?.ctaPrimaryLink || "/colleges";
  const secondaryText = cta?.ctaSecondaryText || "Talk to a counsellor";
  const secondaryLink = cta?.ctaSecondaryLink || "/contact";

  return (
    <section className="cta-band">
      <div className="container">
        <div>
          <span className="kicker is-plain" style={{ color: "var(--gold)" }}>{badge}</span>
          <h2 style={{ marginTop: 10 }}>{heading}</h2>
          <p>{subheading}</p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-gold btn-lg" href={primaryLink}>
            {primaryText} <span className="ar">→</span>
          </Link>
          <Link className="btn btn-outline btn-lg" href={secondaryLink}>
            {secondaryText}
          </Link>
        </div>
      </div>
    </section>
  );
}
