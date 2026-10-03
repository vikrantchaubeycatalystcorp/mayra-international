// Corrects CMS data that undermines SEO and trust: placeholder company details,
// old-domain canonicals, inflated catalogue figures, unverifiable claims, dead
// social links, and empty visa/scholarship sections on study-abroad countries.
//
// Dry run (prints every change, writes nothing):   node scripts/seo-data-fixes.mjs
// Apply:                                            node scripts/seo-data-fixes.mjs --apply
//
// Only fields matching a known-bad pattern (or empty) are touched.
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient();

// Keep in sync with lib/site-stats.ts.
const CATALOG = { colleges: "18,000+", exams: "380+", courses: "680+" };
const SITE_URL = "https://www.mayrainternational.com";
const ADDRESS = "Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Phase 2, Sector 19D, Vashi, Navi Mumbai 400703, Maharashtra";
const DESCRIPTION = `Mayra International is an education consultancy in Vashi, Navi Mumbai. Explore ${CATALOG.colleges} colleges, ${CATALOG.exams} entrance exams and ${CATALOG.courses} courses, and get admission and career counselling.`;
const TAGLINE = "Education consultancy in Vashi, Navi Mumbai. Helping students choose the right college, exam and career since 2015.";

function correctCopy(text) {
  if (!text) return text;
  return text
    .replace(/https?:\/\/(www\.)?mayra\.in/g, SITE_URL)
    .replace(/^Mayra —/, "Mayra International —")
    .replace(/25,000\+|25000\+|25K\+/gi, CATALOG.colleges)
    .replace(/500\+(?=\s*(entrance\s+)?exams)/gi, CATALOG.exams)
    .replace(/800\+(?=\s*courses)/gi, CATALOG.courses)
    .replace(/India's most (trusted|comprehensive) education (portal|platform)/gi, "Education consultancy in Vashi, Navi Mumbai")
    .replace(/\s*(Join|Trusted by)\s+[\d.,]+\s*(lakh|million|L|M)\+?\s+students[^.]*\.?/gi, "")
    .replace(/\s*Over \d+ lakh Indian students study abroad annually\.?/gi, "")
    .trim();
}

const changes = [];
async function update(model, id, label, before, data) {
  const diff = Object.fromEntries(Object.entries(data).filter(([k, v]) => before[k] !== v));
  if (Object.keys(diff).length === 0) return;
  for (const [k, v] of Object.entries(diff)) {
    changes.push(`${model}.${label}.${k}: ${JSON.stringify(before[k])}\n    -> ${JSON.stringify(v)}`);
  }
  if (APPLY) await prisma[model].update({ where: { id }, data: diff });
}

// ── Company info ──────────────────────────────────────────────────────────
for (const c of await prisma.companyInfo.findMany()) {
  await update("companyInfo", c.id, c.name, c, {
    address: /bangalore/i.test(c.address) || !c.address ? ADDRESS : c.address,
    phone: /1800-?123-?4567/.test(c.phone) || !c.phone ? "+91 7506799678" : c.phone,
    email: /@mayra\.in$/i.test(c.email) || !c.email ? "info@mayrainternational.com" : c.email,
    tagline: /most trusted|since 2020/i.test(c.tagline) || !c.tagline ? TAGLINE : c.tagline,
    description: /most trusted/i.test(c.description) || !c.description ? DESCRIPTION : c.description,
    siteUrl: /mayra\.in/.test(c.siteUrl) && !/mayrainternational/.test(c.siteUrl) ? SITE_URL : c.siteUrl,
    foundedYear: c.foundedYear === 2020 ? 2015 : c.foundedYear,
  });
}

// ── Page SEO ──────────────────────────────────────────────────────────────
for (const s of await prisma.pageSeo.findMany()) {
  const home = s.pageSlug === "home";
  await update("pageSeo", s.id, s.pageSlug, s, {
    title: home && /25,000\+|^Mayra —/.test(s.title) ? "Mayra International — Colleges, Exams & Admission Counselling" : correctCopy(s.title),
    description: home && /most trusted|25,000\+/.test(s.description) ? DESCRIPTION : correctCopy(s.description),
    canonical: s.canonical ? correctCopy(s.canonical) : s.canonical,
    ogTitle: correctCopy(s.ogTitle),
    ogDescription: correctCopy(s.ogDescription),
  });
}

// ── Homepage stats: drop unverifiable stats and duplicate seed rows ─────────
const seenStat = new Set();
for (const st of await prisma.homeStat.findMany({ orderBy: { sortOrder: "asc" } })) {
  const key = st.label.trim().toLowerCase();
  const duplicate = seenStat.has(key);
  seenStat.add(key);
  const unverified = /students guided|accuracy|satisfaction/i.test(st.label);
  const label = st.label.toLowerCase();
  const value = label.includes("college") ? 18000 : label.includes("exam") ? 380 : label.includes("course") ? 680 : label.includes("countr") ? 21 : st.value;
  await update("homeStat", st.id, `${st.label}#${st.sortOrder}`, st, {
    isActive: duplicate || unverified ? false : st.isActive,
    value,
    suffix: label.includes("countr") ? "" : st.suffix,
  });
}

// ── Homepage copy ─────────────────────────────────────────────────────────
for (const h of await prisma.homeSection.findMany()) {
  await update("homeSection", h.id, h.sectionKey, h, {
    title: /Trusted by Millions/i.test(h.title) ? "Explore Colleges, Exams and Courses" : correctCopy(h.title),
    subtitle: /most (comprehensive|trusted)/i.test(h.subtitle ?? "")
      ? "Data on colleges, entrance exams, courses and study abroad destinations, with counselling from our Vashi office"
      : correctCopy(h.subtitle) || h.subtitle,
  });
}
for (const c of await prisma.ctaSection.findMany()) {
  await update("ctaSection", c.id, c.sectionKey, c, {
    subheading: /lakh\+|million/i.test(c.subheading ?? "")
      ? "Get exam alerts, admission updates and expert guidance to help you make smarter education decisions."
      : c.subheading,
  });
}
for (const b of await prisma.heroBanner.findMany({ include: { stats: true, searchTabs: true, floatingCards: true } })) {
  await update("heroBanner", b.id, b.heading, b, { heading: correctCopy(b.heading), subheading: correctCopy(b.subheading), badgeText: correctCopy(b.badgeText) });
  for (const st of b.stats) {
    const label = st.label.toLowerCase();
    const value = label.includes("college") ? CATALOG.colleges : label.includes("exam") ? CATALOG.exams : label.includes("course") ? CATALOG.courses : st.value;
    await update("heroStat", st.id, st.label, st, { value });
  }
  for (const t of b.searchTabs) await update("heroSearchTab", t.id, t.label, t, { placeholder: correctCopy(t.placeholder) });
  for (const f of b.floatingCards) await update("heroFloatingCard", f.id, f.title, f, { title: correctCopy(f.title), subtitle: correctCopy(f.subtitle) });
}

// ── Social links that point nowhere ("#") render as dead footer icons ──────
for (const l of await prisma.socialLink.findMany()) {
  await update("socialLink", l.id, l.platform, l, { isActive: /^https:\/\//.test(l.url) ? l.isActive : false });
}

// ── Study abroad: visa and scholarship sections (filled only where empty) ──
// Stable facts with a pointer to the official source; review before applying.
const mbbsVisa = (name) =>
  `Indian students need a student visa for ${name}, issued on the basis of an admission or invitation letter from the university. Apply through the Embassy of ${name} in New Delhi. Documents, medical tests and fees change from time to time, so confirm the current requirements with the embassy before applying.`;
const COUNTRY_CONTENT = {
  usa: {
    visaInfo: "Indian students need an F-1 student visa. After admission, the university issues Form I-20; you then pay the SEVIS I-901 fee, complete the DS-160 application and attend a visa interview at a US Embassy or Consulate in India. Check current requirements on travel.state.gov and the US Embassy in India website.",
    scholarships: "Fulbright-Nehru fellowships (administered by USIEF) support master's and doctoral study. Most other funding comes from universities as merit scholarships, tuition waivers and teaching or research assistantships.",
  },
  uk: {
    visaInfo: "Students need a UK Student visa. The university issues a Confirmation of Acceptance for Studies (CAS); you then apply online, show proof of funds and English ability, pay the Immigration Health Surcharge and give biometrics at a visa application centre. Check gov.uk/student-visa for current rules.",
    scholarships: "Chevening Scholarships (UK government) and Commonwealth Scholarships support master's and PhD study. GREAT Scholarships for Indian students are offered at participating universities, alongside university merit scholarships.",
  },
  canada: {
    visaInfo: "You need a study permit from Immigration, Refugees and Citizenship Canada (IRCC), based on a letter of acceptance from a Designated Learning Institution (DLI) and proof of funds. Rules for study permits change frequently, so check canada.ca before applying.",
    scholarships: "Most funding for international students comes from universities as entrance and merit scholarships. Graduate students may also receive research or teaching assistantships.",
  },
  australia: {
    visaInfo: "Apply for the Student visa (subclass 500) with a Confirmation of Enrolment (CoE) from your university, proof of funds, English test results and Overseas Student Health Cover (OSHC). Check immi.homeaffairs.gov.au for current requirements.",
    scholarships: "Universities offer merit scholarships for international students, and the Research Training Program (RTP) funds many PhD places.",
  },
  germany: {
    visaInfo: "Indian students need a national (D) student visa from the German Embassy or Consulates in India. Applications typically require the university admission letter, proof of funds (usually a blocked account), health insurance and academic documents. Check india.diplo.de for current requirements.",
    scholarships: "DAAD scholarships support master's and doctoral study. Public universities charge little or no tuition, which keeps overall costs low.",
  },
  ireland: {
    visaInfo: "Indian students apply for an Irish long-stay (D) study visa with a letter of acceptance from a recognised college and proof of fees paid and funds. After arrival, students register with immigration for Stamp 2 permission. Check irishimmigration.ie.",
    scholarships: "The Government of Ireland International Education Scholarships and university merit scholarships are available to Indian students.",
  },
  "new-zealand": {
    visaInfo: "You need a Student Visa from Immigration New Zealand, based on an offer of place from an approved education provider and proof of funds for tuition and living costs. Check immigration.govt.nz for current requirements.",
  },
  singapore: {
    visaInfo: "International students need a Student's Pass issued by the Immigration & Checkpoints Authority (ICA). Your institution registers you through the SOLAR system before you apply. Check ica.gov.sg.",
  },
  france: {
    visaInfo: "Indian students apply through the Études en France procedure run by Campus France India, then apply for a long-stay student visa (VLS-TS). Check india.campusfrance.org for the current process.",
    scholarships: "The Charpak Scholarships (French Embassy in India) and the Eiffel Excellence Scholarship support master's and PhD study.",
  },
  netherlands: {
    visaInfo: "For programmes longer than 90 days, Indian students need an entry visa (MVV) and residence permit. The Dutch university applies on your behalf after you accept the offer and show proof of funds. Check ind.nl.",
    scholarships: "The NL Scholarship (formerly the Holland Scholarship) and university-specific scholarships are available to Indian students.",
  },
  nepal: {
    visaInfo: "Indian citizens do not need a visa to study in Nepal. Carry a valid passport or voter ID card for travel and admission formalities.",
  },
  china: {
    visaInfo: "Students need an X1 student visa for long-term study, issued on the basis of the university's admission notice and the JW201/JW202 form. Apply through the Chinese Visa Application Service Center in India and confirm current requirements before applying.",
  },
  russia: { visaInfo: mbbsVisa("Russia") },
  georgia: { visaInfo: mbbsVisa("Georgia") },
  kazakhstan: { visaInfo: mbbsVisa("Kazakhstan") },
  kyrgyzstan: { visaInfo: mbbsVisa("Kyrgyzstan") },
  uzbekistan: { visaInfo: mbbsVisa("Uzbekistan") },
  tajikistan: { visaInfo: mbbsVisa("Tajikistan") },
  egypt: { visaInfo: mbbsVisa("Egypt") },
  bangladesh: { visaInfo: mbbsVisa("Bangladesh") },
  // ukraine: deliberately left empty — check current Government of India travel advisories first.
};
for (const c of await prisma.studyAbroadCountry.findMany()) {
  const content = COUNTRY_CONTENT[c.slug];
  if (!content) continue;
  await update("studyAbroadCountry", c.id, c.slug, c, {
    visaInfo: c.visaInfo.trim() ? c.visaInfo : content.visaInfo ?? c.visaInfo,
    scholarships: c.scholarships.trim() ? c.scholarships : content.scholarships ?? c.scholarships,
  });
}

console.log(changes.length ? changes.join("\n") : "No changes needed.");
console.log(`\n${changes.length} field change(s) ${APPLY ? "APPLIED" : "found (dry run — re-run with --apply to write)"}.`);
await prisma.$disconnect();
