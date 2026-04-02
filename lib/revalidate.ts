import { revalidatePath } from "next/cache";

/**
 * Maps admin entity types to the public paths that need revalidation
 * when that entity is created, updated, or deleted.
 */
const ENTITY_PATH_MAP: Record<string, string[]> = {
  // Content entities
  College: ["/", "/colleges", "/compare", "/map"],
  Course: ["/", "/courses"],
  Exam: ["/", "/exams"],
  News: ["/", "/news", "/articles"],
  StudyAbroad: ["/", "/study-abroad"],

  // Homepage settings
  HeroBanner: ["/"],
  HomeSection: ["/"],
  HomeStat: ["/"],
  CtaSection: ["/"],
  Announcement: ["/"],
  WorldCollegeStat: ["/", "/map"],

  // Layout-wide (navbar, footer, etc.) — revalidate all via layout
  NavigationItem: ["__layout__"],
  FooterSection: ["__layout__"],
  FooterLink: ["__layout__"],
  SocialLink: ["__layout__"],
  CompanyInfo: ["__layout__"],
  LegalLink: ["__layout__"],
  AppDownload: ["__layout__"],
  TrustBadge: ["__layout__"],

  // SEO
  PageSeo: ["__layout__"],

  // Master data (filters, dropdowns)
  Stream: ["__layout__"],
  State: ["__layout__"],
  City: ["__layout__"],
  Accreditation: ["__layout__"],
  Tag: ["__layout__"],
  NewsCategory: ["__layout__"],
  CollegeType: ["__layout__"],
  CourseLevel: ["__layout__"],
  ExamMode: ["__layout__"],
};

/**
 * Revalidates all public paths affected by a change to the given entity.
 * Call this after any admin CREATE, UPDATE, PATCH, or DELETE operation.
 *
 * @param entity - The entity type (e.g., "College", "News", "HeroBanner")
 * @param slug - Optional slug for detail page revalidation (e.g., college slug)
 */
export function revalidateEntity(entity: string, slug?: string) {
  try {
    const paths = ENTITY_PATH_MAP[entity];
    if (!paths) {
      // Unknown entity — revalidate homepage as safe fallback
      revalidatePath("/");
      return;
    }

    for (const path of paths) {
      if (path === "__layout__") {
        // Revalidate the root layout, which covers all pages
        revalidatePath("/", "layout");
      } else {
        revalidatePath(path);
      }
    }

    // Revalidate the specific detail page if slug is provided
    if (slug) {
      const detailPathMap: Record<string, string> = {
        College: `/colleges/${slug}`,
        Course: `/courses/${slug}`,
        Exam: `/exams/${slug}`,
        News: `/news/${slug}`,
      };
      const detailPath = detailPathMap[entity];
      if (detailPath) {
        revalidatePath(detailPath);
      }
    }
  } catch (error) {
    // Revalidation failures should never break admin operations
    console.error(`Revalidation failed for entity ${entity}:`, error);
  }
}
