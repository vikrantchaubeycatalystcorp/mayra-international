"use client";

import Link from "next/link";

type CountryData = {
  id: string;
  name: string;
  flag: string;
  universities: number;
  avgCost: string;
  popularCourses: string[];
  description: string;
};

const ISO: Record<string, string> = {
  Canada: "CA", Australia: "AU", Germany: "DE", "United Kingdom": "GB", UK: "GB",
  "United States": "US", USA: "US", France: "FR", Ireland: "IE", "New Zealand": "NZ",
  Singapore: "SG", Netherlands: "NL", Italy: "IT", Sweden: "SE", Switzerland: "CH",
  Japan: "JP", "United Arab Emirates": "AE", UAE: "AE",
};

const PALETTE = ["#C9302C", "#1C5A42", "#5C564E", "#1C3A6E", "#2B4C7E", "#0E6E78", "#A96A0F", "#6E6457"];

function isoFor(name: string) {
  return ISO[name] || name.slice(0, 2).toUpperCase();
}

function openEnquiry() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mayra:open-enquiry"));
}

type Props = {
  countries: CountryData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function StudyAbroadTeaserClient({ countries, title, subtitle, ctaLabel, ctaLink }: Props) {
  return (
    <section className="section" style={{ background: "var(--surface-2)", borderBlock: "1px solid var(--line)" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Beyond India</span>
            <h2 className="h-2" style={{ marginTop: 12 }}>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link className="link-arrow" href={ctaLink}>
            {ctaLabel} <span className="ar">→</span>
          </Link>
        </div>

        <div className="card teaser">
          <div className="country-tiles">
            {countries.map((country, i) => (
              <Link key={country.id} href={ctaLink} className="country-tile">
                <span className="iso" style={{ background: PALETTE[i % PALETTE.length] }}>
                  {isoFor(country.name)}
                </span>
                <div className="cn">{country.name}</div>
                <div className="cu">{country.universities}+ universities</div>
              </Link>
            ))}
          </div>
          <div className="mini-cta">
            <span className="mc-ico">✓</span>
            <div style={{ flex: 1 }}>
              <div className="mc-t">Free counselling + IELTS prep</div>
              <div className="mc-s">Shortlisting, SOPs, visa and 1,000+ practice questions.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openEnquiry}>
              Book
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
