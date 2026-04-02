# Admin Portal: User-Visible Data and Metadata CRUD Contract

**Objective:** Admin must be able to create, read, update, and delete all data and metadata that students/users can see on the public side.  
**Non-objective:** Avoid internal-only or low-value admin clutter. If a model is not visible to users, it should not be in the core content workflow.

**Source of truth:** `prisma/schema.prisma`, `app/(public)/**`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`.

---

## 1) What “useful” means for admin

A thing is in scope only if it satisfies at least one of these:

1. It is rendered on a public/student page.
2. It controls public metadata (SEO/Open Graph/canonical/JSON-LD).
3. It controls discoverability of public pages (`sitemap`, `robots`).
4. It is the source/provenance of public facts shown to users.

Anything else should be secondary/ops, not mixed into core content CRUD.

---

## 2) Canonical public surface inventory (must be CRUD-manageable)

### 2.1 Public routes and required admin ownership

| Public route/surface | What user sees | Models/records admin must CRUD |
|---|---|---|
| `/` Home | Hero, counters, sections, featured cards, CTA/newsletter block | `HeroBanner` + child models, `HomeStat`, `HomeSection`, `CtaSection`, featured flags/content in `College`, `Course`, `Exam`, `NewsArticle`, `StudyAbroadCountry` |
| Global header/nav | Menus, mega menu text, links | `NavigationItem` |
| Global footer | Footer sections/links, legal links, trust badges, social, app links, brand block | `FooterSection`, `FooterLink`, `LegalLink`, `TrustBadge`, `SocialLink`, `AppDownloadLink`, `CompanyInfo` |
| `/colleges`, `/colleges/[slug]` | Listing + detail page with profile blocks | `College`, `CollegeGallery`, `CollegeRecruiter`, `CollegeFeeStructure`, `CollegeAdmissionInfo` |
| `/courses`, `/courses/[slug]` | Listing + detail page | `Course` |
| `/exams`, `/exams/[slug]` | Listing + detail page + syllabus | `Exam` (including `syllabus` JSON) |
| `/news`, `/news/[slug]` | Listing + article detail | `NewsArticle` |
| `/study-abroad` | Countries/cards + descriptions | `StudyAbroadCountry` |
| `/map` | Country aggregates + college geo points | `WorldCollegeStat`, geo fields in `College` |
| `/compare` | Side-by-side college data | `College` fields used in compare |
| Public search UI | Search results across entities | data from `College`, `Course`, `Exam`, `NewsArticle`, `StudyAbroadCountry` |
| Public contact/lead forms | Inquiry/newsletter confirmations and messaging content | `Enquiry`, `NewsletterSubscriber`, related visible copy/CTA text in `CtaSection` |
| Discoverability | XML sitemap, robots policy effects, route-level indexing signals | `PageSeo` plus route mapping that drives `sitemap`/`robots` behavior |

### 2.2 Public metadata and schema data (must be managed, not hardcoded)

| Metadata surface | What should be admin-editable |
|---|---|
| Per-page SEO | `title`, `description`, `keywords`, OG fields, canonical, `noIndex` via `PageSeo` |
| Global metadata defaults | Brand/site identity values from `CompanyInfo` plus default SEO fallback |
| Structured data JSON-LD | Publicly emitted organization/page/entity schema text and links |
| Social share media | OG image URLs/media assets via `MediaAsset` / page records |
| Sitemap discoverability | Which public URLs get emitted and freshness timestamps |
| Robots policy implications | Public indexing rules and route blocking impacts |

**Rule:** If metadata appears in browser source, search previews, or crawler outputs, admin must own it.

---

## 3) Master data and sourcing (must be first-class, not “CMS leftovers”)

### 3.1 Master data (reference entities)

Admin must have dedicated CRUD screens for:

- `Stream`
- `State`
- `City`
- `AccreditationBody`
- `Tag`

These must be used as authoritative values for public content forms, replacing free-form duplication where possible.

### 3.2 Independent sourcing/provenance

Current string field `source` in content models is not enough for governance.  
Admin needs source catalog CRUD as a separate concern:

- Source master (`DataSource`-style entity): name, type, URL, status, notes.
- Optional source links per content row/field (for auditable claims).
- Import batch history for bulk loads (who loaded what, from where, when).

**Outcome:** sourcing is editable independently from page layout/content text.

---

## 4) Strict CRUD completeness requirement by model

For every user-visible model, admin must support:

1. **Create** all business fields (not only minimal subset).
2. **Read/list** with filters used by public UX (`isActive`, `isFeatured`, category, stream, etc.).
3. **Update** all editable fields including arrays/JSON/nested children.
4. **Delete/Archive** with safe strategy (hard delete or soft disable based on model).
5. **Preview/verification** to confirm public rendering impact.

### 4.1 High-priority content models

- `College` + `CollegeGallery` + `CollegeRecruiter` + `CollegeFeeStructure` + `CollegeAdmissionInfo`
- `Course`
- `Exam`
- `NewsArticle`
- `StudyAbroadCountry`

### 4.2 High-priority metadata/presentation models

- `PageSeo`
- `NavigationItem`
- `FooterSection` / `FooterLink`
- `HeroBanner` and related child tables
- `HomeStat`
- `HomeSection`
- `CtaSection`
- `CompanyInfo`
- `SocialLink`, `LegalLink`, `TrustBadge`, `AppDownloadLink`
- `MediaAsset`
- `WorldCollegeStat`

---

## 5) What to exclude from “core content CRUD”

Keep these out of the primary “content” workflow because they are not student-facing data objects:

- `Admin`, `AdminActivity` (platform ops/security)
- Internal analytics/log plumbing not shown to students
- Placeholder/stub endpoints that do not persist user-visible outcomes

They can exist in separate “Platform/Operations” area.

---

## 6) Current gaps to fix so contract is truly complete

1. `State`, `City`, `AccreditationBody`, `Tag`, `SiteSetting` need clear admin CRUD coverage if they affect public rendering/filters.
2. `PageSeo` must control all intended public listing/detail route metadata, not only home defaults.
3. Public flows for enquiry/newsletter/compare/resume should persist and map to real models where users expect outcomes.
4. `sitemap` output must match real public routes (avoid emitting non-existent detail URLs).
5. Content visibility rules must be consistent (`isActive`, `isLive`, publish timing) across list/detail/home surfaces.
6. Anything visible in JSON-LD should be editable from admin or clearly derived from editable fields.

---

## 7) Dropdown/chip/select governance (table vs enum)

This section is mandatory: any value used in UI selects, chips, filters, or tag-pickers must come from a governed source.

### 7.1 Rule

1. **User-visible taxonomy/filter options** -> must be **table-backed with admin CRUD**.
2. **Workflow/status/security options** -> can be **enum-backed** (managed via schema migration, not day-to-day admin CRUD).
3. **No long-lived hardcoded arrays** in UI for domain choices.

### 7.2 Exact findings from current codebase

| Current option source | Where used (examples) | Current type | Required target |
|---|---|---|---|
| `STREAMS` in `types/admin.ts` | college/exam create-edit forms (chip/select UI, including screenshot scenario) | Hardcoded array | Replace with table-backed `Stream` CRUD source |
| `INDIAN_STATES` in `types/admin.ts` | college forms state dropdown | Hardcoded array | Replace with table-backed `State` CRUD source |
| `NEWS_CATEGORIES` in `types/admin.ts` | news create/edit/category filters | Hardcoded array | Move to table-backed taxonomy (recommended `Tag`/`NewsCategory`) or enum if intentionally fixed |
| `COURSE_LEVELS` in `types/admin.ts` | course/exam level selects | Hardcoded array | Prefer enum if truly fixed academic lifecycle; otherwise table-backed master |
| `EXAM_MODES` in `types/admin.ts` | exam mode select | Hardcoded array | Prefer enum if fixed (`ONLINE/OFFLINE/BOTH`) |
| `COLLEGE_TYPES` in `types/admin.ts` | college type select | Hardcoded array | Prefer enum if fixed set; else master table |
| `CLASS_OPTIONS` in `FloatingInquiryForm` | public inquiry form current qualification select | Hardcoded array | Table-backed lead taxonomy CRUD |
| `COURSE_OPTIONS` in `FloatingInquiryForm` | public inquiry form course-interest select | Hardcoded array | Derive from master `Stream`/course taxonomy via CRUD |
| public exam stream filter chips | `app/(public)/exams/ExamsClient.tsx` | Hardcoded array | Drive from `Stream` table or derived from active `Exam.streams` |
| public college tabs/stream chips | hero/top-college/client widgets | Mixed hardcoded | Drive from `Stream` + `HomeSection`/hero config |

### 7.3 Image-linked requirement (streams chip selector)

The attached UI (stream chips like Engineering/Medical/Management) is currently a hardcoded option set pattern in admin forms.  
**Required behavior:** this must be fed from admin-manageable master data (`Stream` table), with full CRUD page (`/admin/streams`) and used consistently everywhere that asks for streams (admin create/edit + public filters/search chips).

### 7.4 Enum inventory from Prisma (system-governed choices)

Current Prisma enums:

- `AdminRole` -> `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`
- `EnquiryStatus` -> `PENDING`, `UNDER_REVIEW`, `RESPONDED`, `CLOSED`, `SPAM`
- `Priority` -> `LOW`, `NORMAL`, `HIGH`, `URGENT`

**Policy for enums in this project:**

- Enums are acceptable for system workflow values and permissions.
- Admin can CRUD records that use enum values (for example, update enquiry status), but changing the enum option set itself is a schema migration activity.
- If business asks for frequent option changes by non-technical admins, convert that option set from enum/hardcoded array to master table.

---

## 8) NetSuite-style dependent records matrix (authoritative)

This section defines parent/child dependencies like custom-record driven systems: parent records are admin-managed once, and all dependent dropdown/chip values are fetched from those records.

### 8.1 Required dependency model

| Parent/master record | Dependent fields/surfaces | Current status | Required admin behavior |
|---|---|---|---|
| `Stream` | `College.streams[]`, `Exam.streams[]`, `Course.stream`, public stream filters/chips | Mixed: partly table (`Stream` exists), partly hardcoded arrays | All stream options must come from `Stream` CRUD; no hardcoded stream chips |
| `State` | college state dropdown/filter, `College.state`; plus city dependency | Table exists but UI still hardcoded in places | State options must come from `State` CRUD |
| `City` (child of `State`) | college city select (state-dependent list), map/filters | Table exists but not wired to admin/public selectors | City CRUD must be dependent on selected state (`State -> City`) |
| `AccreditationBody` | college accreditation multiselect (`College.accreditation[]`) | Table exists; college field still free-text array | Accreditation options must be fetched from table CRUD |
| `Tag` / `NewsCategory` | `NewsArticle.category`, `NewsArticle.tags[]`, news filters | Mixed/hardcoded categories on public/admin | Use one taxonomy authority and fetch options dynamically |
| `CollegeType` (new master or enum) | college type filters and form (`College.type`) | Hardcoded array | Govern via table CRUD (preferred) or locked enum policy |
| `CourseLevel` (new master or enum) | `Course.level`, `Exam.level`, related filters | Hardcoded array | Govern via table CRUD or locked enum policy |
| `ExamMode` (new master or enum) | `Exam.mode` | Hardcoded array | Govern via enum/table policy and remove hardcoded lists |
| `LeadQualification` (new master) | inquiry form `currentClass` options | Hardcoded `CLASS_OPTIONS` | Admin CRUD to control lead qualification values |
| `LeadInterest` (new master) | inquiry form `courseInterest` options | Hardcoded `COURSE_OPTIONS` | Admin CRUD to control enquiry interest taxonomy |
| `DataSource` (new master) | `source` across content entities/imports | Currently free-text string | Source catalog CRUD + selectable source references |

### 8.2 Existing relational dependencies that require explicit child CRUD

| Parent | Child | Why separate CRUD is required |
|---|---|---|
| `College` | `CollegeGallery` | Images and order are independent rows |
| `College` | `CollegeRecruiter` | Recruiter list is repeatable and ordered |
| `College` | `CollegeFeeStructure` | Program-fee rows are repeatable structured data |
| `College` | `CollegeAdmissionInfo` | Separate detail block with document/date metadata |
| `HeroBanner` | `HeroStat`, `HeroSearchTab`, `HeroQuickFilter`, `HeroPopularSearch`, `HeroFloatingCard` | Hero UI is assembled from dependent child records |
| `FooterSection` | `FooterLink` | Footer links are dependent rows |
| `NavigationItem` | `NavigationItem` (self tree) | Parent-child menu hierarchy |
| `State` | `City` | Core geo dependency |

### 8.3 Student-side hardcoded dependencies found (must be table/enum sourced)

- `components/colleges/CollegeFilters.tsx`
  - hardcoded `indianStates`, `streams`, `collegeTypes`
- `app/(public)/exams/ExamsClient.tsx`
  - hardcoded `levelFilters`, `streamFilters`
- `app/(public)/news/NewsClient.tsx`
  - hardcoded `categories` and category icon behavior
- `components/shared/FloatingInquiryForm.tsx`
  - hardcoded `CLASS_OPTIONS`, `COURSE_OPTIONS`
- `app/(public)/courses/CoursesClient.tsx`
  - hardcoded stream icon map; stream values are data-driven but icon taxonomy is not

**Contract:** every item above must be backed by an admin-governed source (master table or documented enum policy), and UI must fetch/render from that source.

### 8.4 Minimum admin CRUD pages required for dependent data

At minimum, admin must expose (direct pages or modular dialogs):

1. Streams
2. States
3. Cities (state-dependent)
4. Accreditation bodies
5. News categories/tags taxonomy
6. College types (if table-based)
7. Course levels (if table-based)
8. Exam modes (if table-based)
9. Lead qualification options
10. Lead interest options
11. Data sources (provenance catalog)

---

## 9) Recommended admin IA (replace “CMS”)

1. **Content Catalogs**  
   Colleges, Courses, Exams, News, Study Abroad.
2. **Master Data**  
   Streams, States, Cities, Accreditation Bodies, Tags.
3. **Site Experience**  
   Navigation, Hero, Home Sections/Stats, Footer, CTA, Announcements, Media.
4. **SEO & Discoverability**  
   Page SEO, structured-data controls, sitemap/robots governance.
5. **Sourcing & Imports**  
   Source catalog, provenance links, import batches.
6. **Leads & Community**  
   Enquiries, Newsletter, Users (student-visible lifecycle touchpoints).
7. **Platform (separate)**  
   Admin users, logs, operational settings.

This removes the “useless CMS bucket” and maps directly to what users actually consume.

---

## 10) Acceptance checklist (definition of done)

The admin redesign is complete only when all are true:

- [ ] Every student-visible block on public pages maps to one admin-editable model or derived editable field.
- [ ] Every public metadata field (SEO/OG/canonical/JSON-LD) is admin-controlled or explicitly derived from admin-controlled content.
- [ ] Every user-visible list/detail route has corresponding CRUD for its backing records.
- [ ] Master data cannot drift from content due to uncontrolled free text.
- [ ] Sourcing/provenance is first-class and independently manageable.
- [ ] Every dropdown/chip/select option is sourced from either a governed table (admin CRUD) or a documented enum policy.
- [ ] Parent-child dependent record chains (for example `State -> City`, `College -> FeeStructure`) are editable from admin without direct DB edits.
- [ ] No broken discoverability outputs (`sitemap`/`robots` contradictions).
- [ ] No “dummy admin pages” that edit data never shown to users.

---

## Document history

| Version | Date | Notes |
|---|---|---|
| 1.3 | 2026-04-01 | Added NetSuite-style dependent records matrix and mandatory CRUD pages for all dependent option sources |
| 1.2 | 2026-04-01 | Added dropdown/chip governance audit: hardcoded options, enum policy, and stream chip CRUD requirement |
| 1.1 | 2026-04-01 | Deep update: strict user-visible CRUD contract + metadata/discoverability + sourcing governance |
| 1.0 | 2026-04-01 | Initial IA draft |
