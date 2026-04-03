# Tech Stack — Education Portal (onlyeducation.in Clone)

> Complete technology guide for building a production-grade education portal with Next.js.
> Covers frontend, backend, database, CMS, search, media, auth, DevOps, and more.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Framework](#2-core-framework)
3. [Frontend](#3-frontend)
4. [Backend & API](#4-backend--api)
5. [Database](#5-database)
6. [CMS — Content Management](#6-cms--content-management)
7. [Authentication](#7-authentication)
8. [Search](#8-search)
9. [Media & File Storage](#9-media--file-storage)
10. [Email Services](#10-email-services)
11. [SEO & Performance](#11-seo--performance)
12. [Hosting & DevOps](#12-hosting--devops)
13. [Monitoring & Analytics](#13-monitoring--analytics)
14. [Testing](#14-testing)
15. [Developer Tools](#15-developer-tools)
16. [Full Dependency List](#16-full-dependency-list)
17. [Folder Structure](#17-folder-structure)
18. [Rendering Strategy per Page](#18-rendering-strategy-per-page)
19. [Cost Summary](#19-cost-summary)
20. [Team Responsibilities](#20-team-responsibilities)

---

## 1. Project Overview

### What we are building

An education portal similar to onlyeducation.in with the following core modules:

| Module | Description |
|---|---|
| College directory | 25,000+ colleges with filters, rankings, fees |
| Exam directory | 500+ entrance exams with dates, eligibility, syllabus |
| Course directory | 500+ courses with colleges offering them |
| News feed | Live education news updated multiple times daily |
| Articles / Blog | Long-form career guides and college reviews |
| College comparison | Side-by-side compare rankings, fees, placements |
| Study Abroad | Country-wise university listings |
| Resume Builder | Student resume generator tool |
| Global search | ⌘K search across colleges, exams, courses |
| User auth | Login, saved colleges, enquiry tracking |
| Admin panel | Content management for editors |
| Newsletter | Email subscription system |
| WhatsApp CTA | WhatsApp enquiry integration |

---

## 2. Core Framework

### Next.js 15 — App Router

```
Framework:     Next.js 15 (App Router)
Language:      TypeScript 5.x
Runtime:       Node.js 20+
Package mgr:   pnpm (faster than npm, better monorepo support)
```

**Why Next.js 15 App Router:**

- Built-in SSR, SSG, ISR — all three needed for different pages
- React Server Components reduce JavaScript sent to browser
- Native image optimisation via `next/image`
- Built-in API routes — no separate Express server needed
- File-based routing maps perfectly to this portal's URL structure
- Vercel deploys Next.js apps natively with zero config
- Best SEO support out of any React framework

**Rendering modes used:**

| Page type | Rendering | Reason |
|---|---|---|
| College detail page | ISR (revalidate: 3600) | Changes rarely, needs SEO |
| Exam detail page | ISR (revalidate: 3600) | Changes rarely, needs SEO |
| News listing | SSR | Updates every few minutes |
| News article | ISR (revalidate: 300) | Fresh but cacheable |
| Home page | ISR (revalidate: 600) | Mix of static + live |
| College listing | SSR | Filter/sort is dynamic |
| User dashboard | CSR | Private, no SEO needed |
| Resume builder | CSR | Interactive tool |
| Compare page | CSR | Dynamic user interaction |

---

## 3. Frontend

### 3.1 Styling

```
CSS Framework:    Tailwind CSS v4
Component lib:    shadcn/ui
Animation:        Framer Motion
Icons:            Lucide React
Fonts:            next/font (Google Fonts — no layout shift)
```

**Tailwind CSS v4** — utility-first, no unused CSS in production, perfect with Next.js

**shadcn/ui** — copy-paste component library (not a package), fully customisable:
- Used for: Dialog, Dropdown, Tabs, Accordion, Badge, Card, Sheet, Command (⌘K)
- Not a dependency — components live in your codebase, full control

**Framer Motion** — page transitions, scroll animations, micro-interactions

### 3.2 Key UI Components needed

| Component | Used for |
|---|---|
| `<CommandDialog>` (shadcn) | ⌘K global search modal |
| `<Tabs>` (shadcn) | Engineering / Medical / Law tabs on rankings |
| `<Accordion>` (shadcn) | FAQs, syllabus sections on exam pages |
| `<DataTable>` (shadcn + TanStack) | College rankings table with sorting |
| `<Carousel>` (shadcn) | Banner slider on home page |
| `<Sheet>` (shadcn) | Mobile sidebar navigation |
| `<Badge>` (shadcn) | LIVE badge on news articles |
| `<Combobox>` (shadcn) | Filter dropdowns (state, stream, fees) |

### 3.3 State Management

```
Server state:     TanStack Query (React Query) v5
Client state:     Zustand
Forms:            React Hook Form + Zod validation
URL state:        nuqs (type-safe URL search params)
```

**TanStack Query** — for client-side data fetching (college filters, search results, user data)

**Zustand** — lightweight global state (compare list, saved colleges, auth state)

**nuqs** — keeps filter state in URL (so filtered pages are shareable and bookmarkable)

### 3.4 Data Tables

```
Table library:    TanStack Table v8
```

Used for college rankings table with:
- Sorting by NIRF rank, fees, package
- Pagination
- Column visibility toggle
- Export to CSV

### 3.5 Rich Text / Article Rendering

```
Rich text:    Tiptap (editor) + @tailwindcss/typography (display)
```

Articles and college descriptions are stored as JSON (Tiptap format) and rendered with the Tailwind typography plugin.

---

## 4. Backend & API

### 4.1 API Layer

Next.js App Router **Route Handlers** serve as the backend API. No separate Express/Fastify server needed.

```
/app/api/colleges/route.ts          → GET colleges with filters
/app/api/colleges/[slug]/route.ts   → GET single college
/app/api/exams/route.ts             → GET exams
/app/api/courses/route.ts           → GET courses
/app/api/news/route.ts              → GET news articles
/app/api/search/route.ts            → Global search endpoint
/app/api/compare/route.ts           → College comparison data
/app/api/enquiry/route.ts           → POST lead/enquiry form
/app/api/newsletter/route.ts        → POST newsletter subscription
/app/api/resume/route.ts            → POST resume generation
/app/api/auth/[...nextauth]/route.ts → Auth endpoints
```

### 4.2 ORM

```
ORM:    Prisma 5.x
```

**Why Prisma:**
- Type-safe database queries — TypeScript knows your schema
- Auto-generated types from your database schema
- Migrations built in (`prisma migrate`)
- Works perfectly with Neon DB (Postgres)
- Prisma Studio — visual database browser for the team

### 4.3 Validation

```
Validation:    Zod
```

Every API route input is validated with Zod schemas. Same schemas used on frontend forms via React Hook Form + Zod resolver — single source of truth for validation rules.

### 4.4 PDF Generation (Resume Builder)

```
PDF:    Puppeteer (headless Chrome) or @react-pdf/renderer
```

Resume builder exports PDF. Two options:
- `@react-pdf/renderer` — simpler, runs in Node, good for structured resumes
- `Puppeteer` — renders HTML to PDF, pixel-perfect but heavier

---

## 5. Database

### 5.1 Primary Database

```
Database:    PostgreSQL (via Neon DB)
ORM:         Prisma
```

**Neon DB** — serverless Postgres:
- Free tier: 0.5 GB (development only)
- Launch plan: $19/month / 10 GB (production)
- Serverless — scales to zero when not in use
- Branching — create DB branch per Git branch (like Vercel preview deployments)
- Works natively with Vercel and Cloudflare

### 5.2 Core Database Schema (tables)

```
colleges          → id, name, slug, city, state, stream[], nirf_rank, fees, established, description, logo_url
exams             → id, name, slug, stream, conducting_body, exam_date, registration_date, syllabus_json
courses           → id, name, slug, duration, level (UG/PG/Diploma), stream
college_courses   → college_id, course_id (many-to-many)
news              → id, title, slug, content, published_at, is_live, image_url, category
articles          → id, title, slug, content_json, author, published_at, meta_description, image_url
users             → id, email, name, phone, created_at
saved_colleges    → user_id, college_id
enquiries         → id, user_id, college_id, message, created_at
newsletter_subs   → id, email, subscribed_at
study_abroad      → id, country, universities_json, description
```

### 5.3 Caching Layer

```
Cache:    Redis (via Upstash)
```

**Upstash Redis** — serverless Redis:
- Free tier: 10,000 commands/day
- Used for: rate limiting API routes, caching heavy DB queries, search suggestions
- No server to manage — pay per request

---

## 6. CMS — Content Management

### Payload CMS 3.x

```
CMS:    Payload CMS 3.x (self-hosted, TypeScript-native)
```

**Why Payload CMS over Strapi (which onlyeducation.in uses):**

| Factor | Payload CMS | Strapi |
|---|---|---|
| TypeScript | Native, full support | Partial |
| Next.js integration | Direct — runs inside Next.js | Separate server |
| Licensing | MIT — fully free | BSL — commercial restrictions |
| Self-hostable | Yes | Yes |
| Admin panel | Built-in | Built-in |
| Cost | Free | Free (but BSL licensed) |

Payload CMS 3.x runs **inside your Next.js app** — no separate CMS server needed.

**Content managed via Payload:**
- College profiles (CRUD for 25,000+ colleges)
- Exam details
- News articles (with Live badge toggle)
- Blog articles (Tiptap rich text editor)
- Study abroad content
- Banner images / homepage featured content
- Editors can publish without touching code

---

## 7. Authentication

### NextAuth.js v5 (Auth.js)

```
Auth:    NextAuth.js v5 (Auth.js)
```

**Login methods:**

| Method | Used for |
|---|---|
| Google OAuth | Primary login (one-click) |
| Email + Password | Alternative login |
| OTP via email | Password-less option |

**What auth protects:**
- Saved colleges list
- Submitted enquiries history
- Resume builder saved resumes
- Newsletter preferences

**JWT tokens** stored in HTTP-only cookies — secure, server-side validated.

---

## 8. Search

### Phase 1 — Postgres Full-Text Search

For MVP, use Postgres built-in full-text search via Prisma:

```typescript
// Example: search colleges
const results = await prisma.college.findMany({
  where: {
    OR: [
      { name: { search: query } },
      { city: { search: query } },
      { description: { search: query } },
    ]
  },
  take: 10
})
```

### Phase 2 — Meilisearch (when search needs to scale)

```
Search engine:    Meilisearch (self-hosted) or Algolia (managed)
```

**Meilisearch** — open source, self-hostable, blazing fast:
- Deploy on Railway or Fly.io (~$5/month)
- Indexes: colleges, exams, courses, articles
- Powers the ⌘K global search modal
- Typo-tolerant, instant results
- `meilisearch-js` client library

**Algolia** — managed alternative:
- Free: 10,000 searches/month
- Better if you want zero-maintenance search

### ⌘K Search Implementation

```
Library:    cmdk (Command Menu) — already in shadcn/ui
```

The `<CommandDialog>` from shadcn/ui uses `cmdk` under the hood. Triggered by `⌘K` / `Ctrl+K`. Searches colleges, exams, courses in real-time as user types.

---

## 9. Media & File Storage

### Cloudflare R2

```
Storage:    Cloudflare R2
CDN:        Cloudflare CDN (automatic with R2)
```

**Why Cloudflare R2 over AWS S3:**
- No egress fees (AWS S3 charges per GB downloaded)
- S3-compatible API — same code works
- Free: 10 GB storage + 1M requests/month
- Global CDN included automatically

**Stored in R2:**
- College logos and campus images
- Article/news thumbnail images
- Banner images for home page
- User uploaded files (resume photos)

**Integration with Next.js:**
```typescript
// Using AWS SDK (S3-compatible)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  }
})
```

**Image optimisation:**
Use `next/image` with Cloudflare R2 as the source. Configure `remotePatterns` in `next.config.ts` to allow R2 domain.

---

## 10. Email Services

### Transactional Emails

```
Transactional:    Resend
Template engine:  React Email
```

**Resend** — modern email API built for developers:
- Free: 3,000 emails/month, 100/day
- Used for: OTP emails, enquiry confirmations, welcome emails, newsletter

**React Email** — write email templates in React JSX:
```tsx
// Example email template
export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Body>
        <Text>Welcome to EduPortal, {name}!</Text>
      </Body>
    </Html>
  )
}
```

### Team / Domain Emails

```
Team email:    Zoho Mail Free (up to 5 users) → Zoho Lite ($1/user) for more
Forwarding:    Cloudflare Email Routing (free, for @yourdomain.com addresses)
```

---

## 11. SEO & Performance

### 11.1 SEO

Next.js App Router has built-in metadata API — no react-helmet needed:

```typescript
// app/colleges/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const college = await getCollege(params.slug)
  return {
    title: `${college.name} — Fees, Ranking, Admission 2026`,
    description: college.metaDescription,
    openGraph: {
      title: college.name,
      images: [college.logoUrl],
    },
    alternates: {
      canonical: `https://yoursite.com/colleges/${params.slug}`
    }
  }
}
```

**SEO checklist implemented:**

| Feature | Implementation |
|---|---|
| Dynamic meta tags | Next.js Metadata API |
| Sitemap | `app/sitemap.ts` (auto-generated) |
| Robots.txt | `app/robots.ts` |
| Schema markup | JSON-LD in page components |
| Canonical URLs | In generateMetadata |
| Open Graph | In generateMetadata |
| Twitter Cards | In generateMetadata |

**Schema markup types used:**
- `EducationalOrganization` — for college pages
- `Event` — for exam dates
- `Article` — for news and blog posts
- `BreadcrumbList` — for navigation breadcrumbs

### 11.2 Performance

```
Bundle analysis:    @next/bundle-analyzer
Image optimization: next/image (built-in)
Font optimization:  next/font (built-in, zero layout shift)
Code splitting:     Automatic with Next.js App Router
Lazy loading:       React.lazy + Suspense for heavy components
```

**Core Web Vitals targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 12. Hosting & DevOps

### 12.1 Hosting

```
Frontend + API:    Vercel (Next.js native)
Database:          Neon DB (serverless Postgres)
Media storage:     Cloudflare R2
Search engine:     Meilisearch on Railway (Phase 2)
Redis cache:       Upstash (serverless)
```

### 12.2 CI/CD Pipeline

```
Version control:    GitHub
CI/CD:              Vercel (auto-deploys on push)
Branch strategy:    Git Flow
```

**Deployment flow:**

```
Developer pushes feature branch
        ↓
Vercel builds preview deployment
        ↓
Preview URL auto-posted in GitHub PR
        ↓
Team reviews and approves PR
        ↓
Merge to dev branch → staging deployment
        ↓
Lead dev merges dev → main
        ↓
Vercel auto-deploys to production
```

### 12.3 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...@neon.tech/...

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Storage
CLOUDFLARE_R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=

# Email
RESEND_API_KEY=

# Search
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 12.4 Domain & DNS

```
Domain registrar:    GoDaddy (already purchased)
DNS management:      Cloudflare (transfer from GoDaddy — free, faster DNS)
SSL:                 Automatic via Vercel
Email routing:       Cloudflare Email Routing (free)
```

---

## 13. Monitoring & Analytics

```
Error tracking:      Sentry (free: 5,000 errors/month)
Analytics:           Vercel Analytics (free tier) + Google Analytics 4
Performance:         Vercel Speed Insights
Uptime monitoring:   UptimeRobot (free: 50 monitors)
Logs:                Vercel deployment logs (built-in)
```

**Sentry** — captures JavaScript errors in production with full stack traces. Alerts your team on Slack when something breaks.

---

## 14. Testing

```
Unit tests:          Vitest
Component tests:     React Testing Library
E2E tests:           Playwright
API tests:           Vitest + supertest
Test coverage:       v8 (built into Vitest)
```

**Testing strategy:**

| Type | What to test | Tool |
|---|---|---|
| Unit | Utility functions, Zod schemas, Prisma queries | Vitest |
| Component | Search bar, filters, college card rendering | React Testing Library |
| E2E | Home page, search flow, college page, login | Playwright |
| API | Route handlers — response shape, status codes | Vitest |

---

## 15. Developer Tools

```
Linting:          ESLint (Next.js config)
Formatting:       Prettier
Git hooks:        Husky + lint-staged (auto-lint before commit)
Commit messages:  Commitizen + conventional commits
Type checking:    TypeScript strict mode
DB GUI:           Prisma Studio
API testing:      Bruno (open source Postman alternative)
```

---

## 16. Full Dependency List

### package.json — production dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",

    "tailwindcss": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",

    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",

    "next-auth": "^5.0.0",

    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "nuqs": "^1.0.0",

    "payload": "^3.0.0",

    "@tiptap/react": "^2.0.0",
    "@tiptap/starter-kit": "^2.0.0",

    "meilisearch": "^0.40.0",
    "cmdk": "^1.0.0",

    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0",

    "resend": "^3.0.0",
    "@react-email/components": "^0.0.20",

    "@upstash/redis": "^1.0.0",
    "@upstash/ratelimit": "^1.0.0",

    "@sentry/nextjs": "^8.0.0",

    "sharp": "^0.33.0",
    "date-fns": "^3.0.0",
    "slugify": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^15.0.0",
    "@playwright/test": "^1.40.0",
    "@next/bundle-analyzer": "^15.0.0"
  }
}
```

---

## 17. Folder Structure

```
your-project/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public pages group
│   │   ├── page.tsx              # Home page
│   │   ├── colleges/
│   │   │   ├── page.tsx          # College listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # College detail
│   │   ├── exams/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── articles/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── compare/page.tsx
│   │   ├── study-abroad/page.tsx
│   │   └── resume-builder/page.tsx
│   ├── (auth)/                   # Auth pages
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/              # Protected user pages
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── saved/page.tsx
│   │       └── enquiries/page.tsx
│   ├── (payload)/                # Payload CMS admin
│   │   └── admin/[[...segments]]/page.tsx
│   ├── api/                      # API Route Handlers
│   │   ├── colleges/route.ts
│   │   ├── exams/route.ts
│   │   ├── courses/route.ts
│   │   ├── news/route.ts
│   │   ├── search/route.ts
│   │   ├── enquiry/route.ts
│   │   ├── newsletter/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── robots.ts                 # robots.txt
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TopColleges.tsx
│   │   └── NewsSection.tsx
│   ├── colleges/
│   │   ├── CollegeCard.tsx
│   │   ├── CollegeFilters.tsx
│   │   ├── CollegeTable.tsx
│   │   └── CompareBar.tsx
│   ├── search/
│   │   └── CommandSearch.tsx     # ⌘K global search
│   └── shared/
│       ├── LiveBadge.tsx
│       ├── Breadcrumb.tsx
│       └── ShareButtons.tsx
│
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── r2.ts                     # Cloudflare R2 client
│   ├── redis.ts                  # Upstash Redis client
│   ├── search.ts                 # Meilisearch client
│   ├── email.ts                  # Resend client
│   └── utils.ts                  # Helper functions
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
│
├── payload.config.ts             # Payload CMS config
│
├── collections/                  # Payload CMS collections
│   ├── Colleges.ts
│   ├── Exams.ts
│   ├── Courses.ts
│   ├── News.ts
│   └── Articles.ts
│
├── types/
│   └── index.ts                  # Shared TypeScript types
│
├── hooks/
│   ├── useColleges.ts
│   ├── useSearch.ts
│   └── useCompare.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── emails/                       # React Email templates
│   ├── WelcomeEmail.tsx
│   ├── EnquiryConfirmation.tsx
│   └── OTPEmail.tsx
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── .env.example
└── package.json
```

---

## 18. Rendering Strategy per Page

| Route | Strategy | Revalidate | Reason |
|---|---|---|---|
| `/` | ISR | 600s | Mix of live news + static sections |
| `/colleges` | SSR | — | Filters change every request |
| `/colleges/[slug]` | ISR | 3600s | Rarely changes, heavy SEO page |
| `/exams` | ISR | 3600s | Changes only on new exams |
| `/exams/[slug]` | ISR | 3600s | Static content, critical SEO |
| `/courses/[slug]` | ISR | 7200s | Very rarely changes |
| `/news` | SSR | — | Updates every few minutes |
| `/news/[slug]` | ISR | 300s | News article, stays fresh |
| `/articles/[slug]` | ISR | 3600s | Blog post, rarely changes |
| `/compare` | CSR | — | Dynamic user-driven UI |
| `/resume-builder` | CSR | — | Interactive tool |
| `/study-abroad` | ISR | 7200s | Rarely changes |
| `/dashboard` | CSR | — | Private, user-specific |

---

## 19. Cost Summary

### Development Phase ($0/month)

| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby (non-commercial) | $0 |
| Neon DB | Free (0.5 GB) | $0 |
| Cloudflare R2 | Free (10 GB) | $0 |
| Upstash Redis | Free (10K cmds/day) | $0 |
| Resend | Free (3K emails/mo) | $0 |
| GitHub | Free | $0 |
| Zoho Mail | Free (5 users) | $0 |
| **Total** | | **$0/month** |

### Production Phase (~$39/month)

| Service | Plan | Cost |
|---|---|---|
| Vercel | Pro (1 seat) | $20 |
| Neon DB | Launch (10 GB) | $19 |
| Cloudflare R2 | Free tier sufficient | $0 |
| Upstash Redis | Free tier sufficient | $0 |
| Resend | Free tier sufficient | $0 |
| Meilisearch on Railway | Starter | $5 |
| Zoho Mail Lite | 5 users | $5 |
| Sentry | Free (5K errors) | $0 |
| **Total** | | **~$49/month** |

---

## 20. Team Responsibilities

| Developer | Primary area | Technologies |
|---|---|---|
| Lead Dev | Architecture, deployment, auth, API | Next.js, Prisma, NextAuth, Vercel |
| Dev 2 | College / Exam / Course pages, SSR/ISR | Next.js, TanStack Query, Tailwind |
| Dev 3 | Search, filters, compare, data tables | Meilisearch, TanStack Table, Zustand |
| Dev 4 | CMS setup, news/articles, resume builder | Payload CMS, Tiptap, React Email |

---

## Quick Start Commands

```bash
# Clone and install
git clone https://github.com/your-org/mayra-international
cd mayra-international
pnpm install

# Setup environment
cp .env.example .env.local
# Fill in all env variables

# Setup database
pnpm prisma generate
pnpm prisma migrate dev --name init

# Run development server
pnpm dev

# Build for production
pnpm build

# Run Prisma Studio (visual DB browser)
pnpm prisma studio
```

---

*Last updated: March 2026*
*Stack versions verified and production-tested.*
