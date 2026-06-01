"use client";

import Link from "next/link";
import { formatCurrency } from "../../lib/utils";

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
  courses, title, subtitle, ctaLink,
  careerCtaHeading, careerCtaSubheading, careerCtaButtonText,
}: Props) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Find your fit</span>
            <h2 className="h-2" style={{ marginTop: 12 }}>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link className="link-arrow" href={ctaLink}>
            All courses <span className="ar">→</span>
          </Link>
        </div>

        <div className="card teaser">
          <div className="course-rows">
            {courses.slice(0, 6).map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="course-row">
                <div>
                  <div className="cr-name">{course.name}</div>
                  <div className="cr-meta">
                    {course.duration} · {course.level} · {course.topColleges.toLocaleString("en-IN")}+ colleges
                  </div>
                </div>
                <div className="cr-fee">{formatCurrency(course.avgFees)}</div>
              </Link>
            ))}
          </div>
          <div className="mini-cta">
            <span className="mc-ico">?</span>
            <div style={{ flex: 1 }}>
              <div className="mc-t">{careerCtaHeading}</div>
              <div className="mc-s">{careerCtaSubheading}</div>
            </div>
            <Link className="btn btn-primary btn-sm" href="/contact">
              {careerCtaButtonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
