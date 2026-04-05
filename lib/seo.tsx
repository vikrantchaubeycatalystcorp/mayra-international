import type { College, Course, Exam, NewsArticle, StudyAbroadCountry } from "../types";

const SITE_URL = "https://www.mayrainternational.com";
const SITE_NAME = "Mayra International";
const ORG_LOGO = `${SITE_URL}/icon`;

// ── Organization Schema (root level) ───────────────────────────────────────
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    sameAs: [
      "https://twitter.com/mayraintl",
      "https://facebook.com/mayrainternational",
      "https://instagram.com/mayrainternational",
      "https://linkedin.com/company/mayra-international",
    ],
    description:
      "India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses with expert guidance.",
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

// ── WebSite Schema with SearchAction (AEO: enables sitelinks search box) ──
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/colleges?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
    foundingDate: String(college.established),
    ...(college.website ? { sameAs: [college.website] } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: college.rating.toFixed(1),
      bestRating: "5",
      ratingCount: String(college.reviewCount),
    },
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

// ── College FAQ Schema (AEO: direct answers for voice/AI) ─────────────────
export function collegeFaqJsonLd(college: College) {
  const faqs = [
    {
      question: `What is the fee structure of ${college.name}?`,
      answer: `The annual fees at ${college.name} range from ₹${(college.fees.min / 100000).toFixed(1)} Lakhs to ₹${(college.fees.max / 100000).toFixed(1)} Lakhs depending on the program.`,
    },
    {
      question: `What is the placement record of ${college.name}?`,
      answer: college.avgPackage
        ? `${college.name} has a placement rate of ${college.placementRate}%. The average package is ₹${(college.avgPackage / 100000).toFixed(1)} LPA${college.topPackage ? ` and the highest package is ₹${(college.topPackage / 100000).toFixed(0)} LPA` : ""}.`
        : `${college.name} provides excellent placement support to its students. Contact the college for detailed placement statistics.`,
    },
    {
      question: `What courses are offered at ${college.name}?`,
      answer: `${college.name} offers the following courses: ${college.courses.join(", ")}.`,
    },
    {
      question: `What is the NIRF ranking of ${college.name}?`,
      answer: college.nirfRank
        ? `${college.name} is ranked #${college.nirfRank} in the NIRF Rankings.`
        : `${college.name} is accredited with ${college.accreditation.join(", ")}.`,
    },
    {
      question: `How to get admission in ${college.name}?`,
      answer: `Admission to ${college.name} is through national entrance exams. Engineering programs require JEE Main/Advanced qualification. Management programs require CAT/XAT scores. Check the official website for specific cutoffs.`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
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

// ── Course FAQ Schema ──────────────────────────────────────────────────────
export function courseFaqJsonLd(course: Course) {
  const faqs = [
    {
      question: `What is the duration of ${course.name}?`,
      answer: `${course.name} is a ${course.duration} ${course.level === "UG" ? "undergraduate" : course.level === "PG" ? "postgraduate" : course.level} program.`,
    },
    {
      question: `What is the average fee for ${course.name} in India?`,
      answer: `The average annual fee for ${course.name} in India is approximately ₹${(course.avgFees / 100000).toFixed(1)} Lakhs. Fees vary across institutions.`,
    },
    {
      question: `What is the salary after ${course.name}?`,
      answer: course.avgSalary
        ? `The average starting salary after ${course.name} is approximately ₹${(course.avgSalary / 100000).toFixed(1)} LPA. Salaries vary based on college, specialization, and location.`
        : `Salary after ${course.name} varies based on the institution, specialization, and industry.`,
    },
    {
      question: `How many colleges offer ${course.name} in India?`,
      answer: `There are ${course.topColleges.toLocaleString()}+ colleges offering ${course.name} in India across government and private institutions.`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ── Exam Detail Schema ─────────────────────────────────────────────────────
export function examJsonLd(exam: Exam) {
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
    startDate: exam.examDate,
    location: {
      "@type": "VirtualLocation",
      url: `${SITE_URL}/exams/${exam.slug}`,
    },
    offers: {
      "@type": "Offer",
      price: exam.applicationFee.general,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: exam.registrationStart,
      validThrough: exam.registrationEnd,
    },
  };
}

// ── Exam FAQ Schema ────────────────────────────────────────────────────────
export function examFaqJsonLd(exam: Exam) {
  const faqs = [
    {
      question: `When is ${exam.name} ${new Date().getFullYear() + 1} exam date?`,
      answer: `${exam.name} ${new Date().getFullYear() + 1} is scheduled for ${exam.examDate}. Registration ${exam.registrationStart ? `opens on ${exam.registrationStart}` : "dates will be announced soon"}.`,
    },
    {
      question: `What is the application fee for ${exam.name}?`,
      answer: `The application fee for ${exam.name} is ₹${exam.applicationFee.general} for General/OBC category${exam.applicationFee.sc_st ? ` and ₹${exam.applicationFee.sc_st} for SC/ST/PwD category` : ""}.`,
    },
    {
      question: `What is the eligibility for ${exam.name}?`,
      answer: exam.eligibility,
    },
    {
      question: `Who conducts ${exam.name}?`,
      answer: `${exam.name} (${exam.fullName}) is conducted by ${exam.conductingBody}.`,
    },
    {
      question: `Is ${exam.name} conducted online or offline?`,
      answer: `${exam.name} is conducted in ${exam.mode} mode. ${exam.frequency || ""}`.trim(),
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
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

// ── Study Abroad HowTo Schema (AEO) ───────────────────────────────────────
export function studyAbroadHowToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Apply for Study Abroad from India",
    description:
      "Step-by-step guide for Indian students to apply to international universities.",
    step: [
      {
        "@type": "HowToStep",
        name: "Choose University",
        text: "Shortlist universities based on ranking, program, budget, and location. Research admission requirements and deadlines.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Prepare Documents",
        text: "Prepare your Statement of Purpose (SOP), Letters of Recommendation (LOR), academic transcripts, CV/Resume, and language test scores (IELTS/TOEFL/GRE/GMAT).",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Apply Online",
        text: "Submit applications through university portals or common application platforms. Pay the application fees and upload required documents.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Get Admission",
        text: "Receive the offer letter from the university. Confirm your enrollment by paying the deposit and accepting the offer.",
        position: 4,
      },
      {
        "@type": "HowToStep",
        name: "Get Visa",
        text: "Apply for student visa with your admission letter, financial proof, and other required documents at the embassy/consulate.",
        position: 5,
      },
    ],
  };
}

// ── Study Abroad FAQ Schema ────────────────────────────────────────────────
export function studyAbroadFaqJsonLd() {
  const faqs = [
    {
      question: "Which country is best for Indian students to study abroad?",
      answer:
        "The USA, UK, Canada, Australia, and Germany are the top study abroad destinations for Indian students. The USA offers the best research opportunities, the UK has shorter program durations, Canada has friendly immigration policies, and Germany offers near-free tuition at public universities.",
    },
    {
      question: "How much does it cost to study abroad from India?",
      answer:
        "The cost varies by country: USA ($45,000–$85,000/year), UK (£25,000–£40,000/year), Canada (CAD $25,000–$45,000/year), Germany (€500–€3,000/semester at public universities). Scholarships can significantly reduce costs.",
    },
    {
      question: "What exams are required to study abroad?",
      answer:
        "Common exams include IELTS/TOEFL (English proficiency), GRE (for MS/PhD programs), GMAT (for MBA), SAT/ACT (for undergraduate in the US), and NEET (for MBBS abroad). Requirements vary by university and country.",
    },
    {
      question: "Can I get a scholarship to study abroad?",
      answer:
        "Yes, numerous scholarships are available for Indian students including Fulbright, Chevening, DAAD, Commonwealth, and university-specific merit scholarships. Over $50,000+ in scholarships are available across destinations.",
    },
    {
      question: "How many Indian students study abroad?",
      answer:
        "Over 3.3 lakh Indian students study abroad annually, making India one of the largest source countries for international students globally. The numbers are growing by 10-15% every year.",
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
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
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
