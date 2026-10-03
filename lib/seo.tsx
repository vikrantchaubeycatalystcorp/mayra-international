import type { College, Course, Exam, NewsArticle } from "../types";
import { SITE_DESCRIPTION } from "./site-stats";

const SITE_URL = "https://www.mayrainternational.com";
const SITE_NAME = "Mayra International";
const ORG_LOGO = `${SITE_URL}/icon.png`;

/**
 * Default share image (app/opengraph-image.tsx). A page that sets its own `openGraph`
 * replaces the inherited block entirely, so it must list the image again.
 */
export const DEFAULT_OG_IMAGES = [
  { url: "/opengraph-image", width: 1200, height: 630, alt: "Mayra International — colleges, exams and admission counselling" },
];

/**
 * Page <title> that stays within ~60 characters: the brand suffix is added only when
 * it fits. Returned as `absolute` so the root layout template doesn't append it again.
 */
export function pageTitle(base: string): { absolute: string } {
  const branded = `${base} | ${SITE_NAME}`;
  return { absolute: branded.length <= 60 ? branded : base };
}

// ── Organization Schema (root level) ───────────────────────────────────────
/** `sameAs` comes from the CMS social links; placeholder ("#") links are filtered out by the caller. */
export function organizationJsonLd(sameAs: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    ...(sameAs.length ? { sameAs } : {}),
    description: SITE_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-7506799678",
      email: "info@mayrainternational.com",
      contactType: "customer support",
      availableLanguage: ["English", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Phase 2, Sector 19D",
      addressLocality: "Vashi, Navi Mumbai",
      postalCode: "400703",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
  };
}

// ── WebSite Schema ─────────────────────────────────────────────────────────
// No SearchAction: Google retired the sitelinks search box in November 2024.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

// ── Breadcrumb Schema ──────────────────────────────────────────────────────
export function breadcrumbJsonLd(
  items: { name: string; url?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
      })),
    ],
  };
}

// ── College Detail Schema ──────────────────────────────────────────────────
export function collegeJsonLd(college: College) {
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college.name,
    url: `${SITE_URL}/colleges/${college.slug}`,
    description: college.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: college.address,
      addressLocality: college.city,
      addressRegion: college.state,
      addressCountry: "IN",
    },
    ...(college.established ? { foundingDate: String(college.established) } : {}),
    ...(college.website ? { sameAs: [college.website] } : {}),
    ...(college.nirfRank
      ? {
          award: `NIRF Rank #${college.nirfRank}`,
        }
      : {}),
    numberOfStudents: college.totalStudents,
    ...(college.phone
      ? { telephone: college.phone }
      : {}),
  };
}

// ── FAQs ───────────────────────────────────────────────────────────────────
// Each builder returns only questions answerable from our own data. Pages render
// the same list visibly (components/shared/FaqSection) and pass it to faqJsonLd,
// so the FAQPage markup always matches what users can see.
export type Faq = { question: string; answer: string };

const lakh = (n: number) => (n / 100000).toFixed(1);

export function collegeFaqs(college: College): Faq[] {
  const faqs: Faq[] = [];
  if (college.fees.min > 0 && college.fees.max > 0) {
    faqs.push({
      question: `What is the fee structure of ${college.name}?`,
      answer: `The annual fees at ${college.name} range from ₹${lakh(college.fees.min)} lakh to ₹${lakh(college.fees.max)} lakh depending on the programme.`,
    });
  }
  if (college.avgPackage) {
    faqs.push({
      question: `What is the placement record of ${college.name}?`,
      answer: `${college.placementRate ? `${college.name} has a placement rate of ${college.placementRate}%. ` : ""}The average package is ₹${lakh(college.avgPackage)} LPA${college.topPackage ? ` and the highest package is ₹${(college.topPackage / 100000).toFixed(0)} LPA` : ""}.`,
    });
  }
  if (college.courses.length > 0) {
    faqs.push({
      question: `What courses are offered at ${college.name}?`,
      answer: `${college.name} offers ${college.courses.join(", ")}.`,
    });
  }
  if (college.nirfRank) {
    faqs.push({
      question: `What is the NIRF ranking of ${college.name}?`,
      answer: `${college.name} is ranked #${college.nirfRank} in the NIRF rankings.`,
    });
  }
  if (college.accreditation.length > 0) {
    faqs.push({
      question: `Is ${college.name} accredited?`,
      answer: `${college.name} is accredited by ${college.accreditation.join(", ")}.`,
    });
  }
  return faqs;
}

// ── Course Detail Schema ───────────────────────────────────────────────────
export function courseJsonLd(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    url: `${SITE_URL}/courses/${course.slug}`,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    timeRequired: course.duration,
    educationalLevel: course.level === "UG" ? "Undergraduate" : course.level === "PG" ? "Postgraduate" : course.level,
    ...(course.avgFees
      ? {
          offers: {
            "@type": "Offer",
            category: "Tuition",
            priceSpecification: {
              "@type": "PriceSpecification",
              price: course.avgFees,
              priceCurrency: "INR",
              unitText: "per year",
            },
          },
        }
      : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "full-time",
      courseWorkload: course.duration,
    },
  };
}

export function courseFaqs(course: Course): Faq[] {
  const level = course.level === "UG" ? "undergraduate" : course.level === "PG" ? "postgraduate" : course.level;
  const faqs: Faq[] = [];
  if (course.duration) {
    faqs.push({ question: `What is the duration of ${course.name}?`, answer: `${course.name} is a ${course.duration} ${level} programme.` });
  }
  if (course.avgFees > 0) {
    faqs.push({
      question: `What is the average fee for ${course.name} in India?`,
      answer: `The average annual fee for ${course.name} in India is approximately ₹${lakh(course.avgFees)} lakh. Fees vary across institutions.`,
    });
  }
  if (course.avgSalary) {
    faqs.push({
      question: `What is the salary after ${course.name}?`,
      answer: `The average starting salary after ${course.name} is approximately ₹${lakh(course.avgSalary)} LPA. Salaries vary by college, specialisation and location.`,
    });
  }
  if (course.topColleges > 0) {
    faqs.push({
      question: `How many colleges offer ${course.name} in India?`,
      answer: `More than ${course.topColleges.toLocaleString("en-IN")} colleges offer ${course.name} in India across government and private institutions.`,
    });
  }
  return faqs;
}

// ── Exam Detail Schema ─────────────────────────────────────────────────────
function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

/** Event markup requires a real start date; returns null when the exam date is unknown. */
export function examJsonLd(exam: Exam) {
  const startDate = isoDate(exam.examDate);
  if (!startDate) return null;
  const validFrom = isoDate(exam.registrationStart);
  const validThrough = isoDate(exam.registrationEnd);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: exam.fullName || exam.name,
    url: `${SITE_URL}/exams/${exam.slug}`,
    description: exam.description,
    organizer: {
      "@type": "Organization",
      name: exam.conductingBody,
    },
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    startDate,
    location: {
      "@type": "VirtualLocation",
      url: `${SITE_URL}/exams/${exam.slug}`,
    },
    ...(exam.applicationFee.general
      ? {
          offers: {
            "@type": "Offer",
            price: exam.applicationFee.general,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            ...(validFrom ? { validFrom } : {}),
            ...(validThrough ? { validThrough } : {}),
          },
        }
      : {}),
  };
}

export function examFaqs(exam: Exam): Faq[] {
  const faqs: Faq[] = [];
  if (exam.examDate) {
    faqs.push({ question: `When is the ${exam.name} exam?`, answer: `${exam.name} is scheduled for ${exam.examDate}.${exam.registrationStart ? ` Registration opens on ${exam.registrationStart}.` : ""}` });
  }
  if (exam.applicationFee.general) {
    faqs.push({
      question: `What is the application fee for ${exam.name}?`,
      answer: `The application fee for ${exam.name} is ₹${exam.applicationFee.general} for the General category${exam.applicationFee.sc_st ? ` and ₹${exam.applicationFee.sc_st} for SC/ST/PwD candidates` : ""}.`,
    });
  }
  if (exam.eligibility) {
    faqs.push({ question: `What is the eligibility for ${exam.name}?`, answer: exam.eligibility });
  }
  if (exam.conductingBody) {
    faqs.push({ question: `Who conducts ${exam.name}?`, answer: `${exam.fullName && exam.fullName !== exam.name ? `${exam.name} (${exam.fullName})` : exam.name} is conducted by ${exam.conductingBody}.` });
  }
  if (exam.mode) {
    faqs.push({ question: `Is ${exam.name} conducted online or offline?`, answer: `${exam.name} is conducted in ${exam.mode} mode.${exam.frequency ? ` It is held ${exam.frequency.toLowerCase()}.` : ""}` });
  }
  return faqs;
}

// ── News Article Schema ────────────────────────────────────────────────────
export function newsArticleJsonLd(article: NewsArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    url: `${SITE_URL}/news/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: ORG_LOGO,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/news/${article.slug}`,
    },
    articleSection: article.category,
    keywords: article.tags.join(", "),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-summary"],
    },
  };
}

// ── Study Abroad FAQs (rendered on /study-abroad) ──────────────────────────
export const STUDY_ABROAD_FAQS: Faq[] = [
  {
    question: "Which country is best for Indian students to study abroad?",
    answer:
      "The USA, UK, Canada, Australia and Germany are among the most popular destinations for Indian students. The USA has the widest choice of universities, the UK offers one-year master's programmes, Canada and Australia offer post-study work options, and Germany's public universities charge little or no tuition. The best choice depends on your course, budget and career plans.",
  },
  {
    question: "How much does it cost to study abroad from India?",
    answer:
      "Costs vary widely by country, university and course. Each destination guide on this page lists typical annual costs. Remember to add living expenses, insurance, travel and visa fees, and check scholarships that can reduce the total.",
  },
  {
    question: "What exams are required to study abroad?",
    answer:
      "Common exams include IELTS, TOEFL or PTE (English proficiency), GRE (many MS and PhD programmes), GMAT (MBA), SAT (undergraduate study in the USA) and NEET UG (for MBBS abroad). Requirements vary by university and country.",
  },
  {
    question: "Can I get a scholarship to study abroad?",
    answer:
      "Yes. Options include government scholarships such as Fulbright-Nehru (USA), Chevening and Commonwealth (UK) and DAAD (Germany), as well as merit scholarships offered by individual universities. Eligibility and deadlines differ for each.",
  },
];

// ── Study Abroad Country Schema ────────────────────────────────────────────
export function studyAbroadCountryJsonLd(country: { name: string; slug: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Study in ${country.name} from India`,
    url: `${SITE_URL}/study-abroad/${country.slug}`,
    description: country.description,
    about: { "@type": "Country", name: country.name },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

// ── Vashi Office (LocalBusiness) Schema ────────────────────────────────────
// The only physical office. Local service pages reference it as the provider;
// other localities appear only in areaServed, never as an address.
const VASHI_OFFICE_ID = `${SITE_URL}/#vashi-office`;

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EducationalOrganization"],
    "@id": VASHI_OFFICE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    image: ORG_LOGO,
    telephone: "+91-7506799678",
    email: "info@mayrainternational.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Phase 2, Sector 19D",
      addressLocality: "Vashi, Navi Mumbai",
      postalCode: "400703",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
    areaServed: [
      { "@type": "City", name: "Navi Mumbai" },
      { "@type": "City", name: "Mumbai" },
    ],
  };
}

export function localServiceJsonLd(page: { slug: string; serviceName: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.serviceName,
    serviceType: page.serviceName,
    url: `${SITE_URL}/${page.slug}`,
    description: page.description,
    provider: localBusinessJsonLd(),
    areaServed: [
      { "@type": "City", name: "Navi Mumbai" },
      { "@type": "City", name: "Mumbai" },
    ],
  };
}

// ── Generic FAQ Schema (only for FAQs rendered visibly on the page) ────────
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

// ── ItemList Schema for Listing Pages (AEO: enables carousel in search) ──
export function collegeListJsonLd(colleges: College[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Colleges in India",
    numberOfItems: colleges.length,
    itemListElement: colleges.slice(0, 10).map((college, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: college.name,
      url: `${SITE_URL}/colleges/${college.slug}`,
    })),
  };
}

export function courseListJsonLd(courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Courses in India",
    numberOfItems: courses.length,
    itemListElement: courses.slice(0, 10).map((course, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: course.name,
      url: `${SITE_URL}/courses/${course.slug}`,
    })),
  };
}

export function examListJsonLd(exams: Exam[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Entrance Exams in India",
    numberOfItems: exams.length,
    itemListElement: exams.slice(0, 10).map((exam, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: exam.name,
      url: `${SITE_URL}/exams/${exam.slug}`,
    })),
  };
}

// ── JSON-LD Script Tag Helper ──────────────────────────────────────────────
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
