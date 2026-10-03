// Catalogue sizes quoted in copy and metadata. Rounded down from the live counts of
// active records (Oct 2026: 18,089 colleges, 386 exams, 687 courses) so they stay true
// as the catalogue grows. Update when the counts move into the next bracket.
export const CATALOG = {
  colleges: "18,000+",
  exams: "380+",
  courses: "680+",
} as const;

export const SITE_DESCRIPTION = `Mayra International is an education consultancy in Vashi, Navi Mumbai. Explore ${CATALOG.colleges} colleges, ${CATALOG.exams} entrance exams and ${CATALOG.courses} courses, and get admission and career counselling.`;

/**
 * Rewrites outdated catalogue figures in CMS copy ("25,000+ colleges", "500+ exams",
 * "800+ courses") to the current CATALOG values, and drops unverifiable user counts.
 */
export function correctCatalogCopy(text: string): string;
export function correctCatalogCopy(text: string | null): string | null;
export function correctCatalogCopy(text: string | null): string | null {
  if (!text) return text;
  return text
    .replace(/25,000\+|25000\+|25K\+/gi, CATALOG.colleges)
    .replace(/500\+(?=\s*(entrance\s+)?exams)/gi, CATALOG.exams)
    .replace(/800\+(?=\s*courses)/gi, CATALOG.courses)
    .replace(/\s*(Join|Trusted by)\s+[\d.,]+\s*(lakh|million|L|M)\+?\s+students[^.]*\.?/gi, "")
    .trim();
}
