# Resume Builder — Claude Code Implementation Spec

> **Goal**: Build the most profitable student resume platform in India. Not a template editor — a career conversion engine that students will pay ₹500–₹2000/month for because it makes them feel like they hired a personal career coach.

---

## 0. Tech Stack Decision (Lock This First)

```
Framework:        Next.js 14+ (App Router, Server Actions, RSC)
Language:         TypeScript (strict mode)
Styling:          Tailwind CSS 4 + Framer Motion 11
State:            Zustand (editor state) + React Query (server state)
Rich Text:        Tiptap (for bullet editing with inline AI actions)
PDF Engine:       react-pdf/renderer (@react-pdf/renderer) for client-side PDF
DOCX Engine:      docx (npm: docx) for .docx generation
AI:               Anthropic Claude API (claude-sonnet-4-20250514)
DB:               PostgreSQL via Prisma ORM
Auth:             NextAuth.js v5
Storage:          S3-compatible (Cloudflare R2 or AWS S3)
Payments:         Razorpay (India-first)
Deployment:       Vercel
```

---

## 1. Product Positioning

**One-liner**: "Create your best resume for every opportunity — ATS-ready, recruiter-optimized, AI-powered — in 12 minutes."

**Why students will pay**: Every other tool is either pretty-but-ATS-broken OR ATS-safe-but-ugly-and-dumb. This is the first that is **beautiful + ATS-perfect + AI-intelligent + student-aware**. It doesn't just format — it *thinks with you*.

---

## 2. User Segments & Their Entry Points

| Segment | Primary Need | Onboarding Path |
|---|---|---|
| Fresher (0 exp) | Guided writing, strong defaults | "Write With Me" wizard → template pick |
| Internship seeker | Projects + skills emphasis | Quick start from GitHub/LinkedIn import |
| Experienced (1-5 yr) | Role targeting, quantified impact | Paste existing resume → AI audit → fix flow |
| Study-abroad applicant | Region variants (US/UK/EU/India) | Template variant picker with region flags |

**Implementation note**: Store `userSegment` on the `User` model. Use it to personalize placeholders, example bullets, template recommendations, and AI prompt context throughout the app.

---

## 3. Information Architecture — Every Screen

### 3.1 Screen Map

```
/dashboard
  ├── /resumes                     → Resume list + "Create New" CTA
  │     ├── /resumes/new           → Template picker + segment wizard
  │     └── /resumes/[id]          → Editor workspace (THE core screen)
  │           ├── ?panel=jd-match  → JD Match side panel
  │           ├── ?panel=score     → Score & Fix side panel
  │           ├── ?panel=versions  → Version manager side panel
  │           └── ?panel=share     → Export / Share / Collaborate panel
  └── /profile                     → Master profile (single source of truth)
```

### 3.2 Editor Workspace Layout (THE money screen)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Top Bar: [Resume Title editable] [Target Role tag] [Score chip 78] │
│           [Undo] [Redo] [Template ▾] [Export ▾] [Share]             │
├────────┬──────────────────────────────────┬─────────────────────────┤
│ LEFT   │  CENTER                          │  RIGHT                  │
│ 220px  │  flex-1                          │  420px (collapsible)    │
│        │                                  │                         │
│ Sections│ Form editor (active section)    │  Live PDF preview       │
│ nav     │ OR freeform Tiptap editor       │  (pixel-accurate)       │
│         │                                 │                         │
│ [Personal]│ ┌──────────────────────────┐  │  Zoom: [50%][75%][100%] │
│ [Summary] │ │ Work Experience          │  │  Template switch tabs   │
│ [Education]│ │                          │  │                         │
│ [Experience]│ │ Company: [___________]  │  │  ┌───────────────────┐ │
│ [Projects] │ │ Role:    [___________]  │  │  │                   │ │
│ [Skills]   │ │ Date:    [___] - [___]  │  │  │   PDF renders     │ │
│ [Certs]    │ │                          │  │  │   here in         │ │
│ [Achieve]  │ │ Bullet 1: [__________]  │  │  │   real-time       │ │
│ [Extra]    │ │   [✨Improve][📊Metrics] │  │  │                   │ │
│            │ │   [🎯Tailor to JD]      │  │  │                   │ │
│ + Add sect │ │                          │  │  └───────────────────┘ │
│            │ │ Bullet 2: [__________]  │  │                         │
│ ─────────  │ │   [✨Improve][📊Metrics] │  │                         │
│ Score: 78  │ │                          │  │                         │
│ [See fixes]│ │ [+ Add bullet]          │  │                         │
│            │ └──────────────────────────┘  │                         │
├────────┴──────────────────────────────────┴─────────────────────────┤
│  Bottom Bar: [✨ Improve Bullet] [📊 Add Metrics] [🎯 Tailor to JD] │
│              [🔍 ATS Check] [💡 Write With Me]                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Critical UX rules for Claude Code**:
- LEFT panel: fixed width, scrollable, drag-to-reorder sections via `@dnd-kit/sortable`
- CENTER panel: form fields with inline AI action buttons on EVERY bullet point
- RIGHT panel: `@react-pdf/renderer` output, re-renders on debounced state change (300ms)
- BOTTOM bar: sticky, contextual — buttons change based on what's focused
- Mobile: bottom sheet editor, swipe between edit/preview, collapsible panels

---

## 4. Database Schema (Prisma)

```prisma
// Claude Code: generate this EXACTLY, then extend as needed

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  segment       UserSegment @default(FRESHER)
  masterProfile Json?     // single source of truth for all resume data
  resumes       Resume[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserSegment {
  FRESHER
  INTERNSHIP
  EXPERIENCED
  STUDY_ABROAD
}

model Resume {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  title         String    @default("Untitled Resume")
  targetRole    String?
  targetLocation String?
  targetRegion  ResumeRegion @default(INDIA)
  status        ResumeStatus @default(DRAFT)
  templateId    String
  template      ResumeTemplate @relation(fields: [templateId], references: [id])
  versions      ResumeVersion[]
  exports       ResumeExport[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
}

enum ResumeRegion {
  INDIA
  US
  UK
  EUROPE
  CUSTOM
}

enum ResumeStatus {
  DRAFT
  REVIEW
  FINAL
  ARCHIVED
}

model ResumeVersion {
  id            String    @id @default(cuid())
  resumeId      String
  resume        Resume    @relation(fields: [resumeId], references: [id])
  versionName   String    @default("v1")
  isPrimary     Boolean   @default(true)
  content       Json      // ResumeContent type (see section 5)
  score         Json?     // ScoreResult type
  jdContext     Json?     // { rawJd, parsedKeywords, matchResult }
  comments      ResumeComment[]
  suggestions   AiSuggestion[]
  exports       ResumeExport[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([resumeId])
}

model ResumeTemplate {
  id            String    @id @default(cuid())
  key           String    @unique  // e.g., "ats-classic", "modern-slate"
  name          String
  category      TemplateCategory
  thumbnail     String    // URL to preview image
  config        Json      // TemplateConfig type (fonts, spacing, colors, layout rules)
  isActive      Boolean   @default(true)
  isPremium     Boolean   @default(false)
  resumes       Resume[]
  createdAt     DateTime  @default(now())
}

enum TemplateCategory {
  ATS_SAFE
  MODERN
  ACADEMIC
  CREATIVE
}

model ResumeExport {
  id              String    @id @default(cuid())
  resumeVersionId String
  resumeVersion   ResumeVersion @relation(fields: [resumeVersionId], references: [id])
  resumeId        String
  resume          Resume    @relation(fields: [resumeId], references: [id])
  format          ExportFormat
  fileUrl         String
  fileSize        Int?
  createdAt       DateTime  @default(now())
}

enum ExportFormat {
  PDF
  DOCX
  WEB_LINK
}

model ResumeComment {
  id              String    @id @default(cuid())
  resumeVersionId String
  resumeVersion   ResumeVersion @relation(fields: [resumeVersionId], references: [id])
  authorId        String
  anchorPath      String    // JSON path like "experience.0.bullets.2"
  message         String
  resolved        Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

model AiSuggestion {
  id              String    @id @default(cuid())
  resumeVersionId String
  resumeVersion   ResumeVersion @relation(fields: [resumeVersionId], references: [id])
  sectionKey      String    // "experience.0.bullets.1"
  inputText       String
  outputVariants  Json      // string[] of 3 alternatives
  suggestionType  SuggestionType
  accepted        Boolean   @default(false)
  acceptedVariant Int?      // which of the 3 was picked
  createdAt       DateTime  @default(now())
}

enum SuggestionType {
  IMPROVE_BULLET
  ADD_METRICS
  TAILOR_TO_JD
  REWRITE_CONCISE
  GENERATE_SUMMARY
  FIX_GRAMMAR
}
```

---

## 5. Content JSON Contract (TypeScript types)

```typescript
// Claude Code: use this as the canonical type for resume content everywhere

interface ResumeContent {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;         // "Mumbai, India"
    linkedIn?: string;
    github?: string;
    portfolio?: string;
    customLinks?: { label: string; url: string }[];
  };
  summary?: {
    text: string;
    isAiGenerated: boolean;
  };
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillGroup[];
  certifications: CertEntry[];
  achievements: AchievementEntry[];
  extracurricular: ExtracurricularEntry[];
  languages: { name: string; proficiency: string }[];
  customSections: CustomSection[];
  sectionOrder: string[];     // ["personal","summary","education","experience","projects","skills","certifications","achievements"]
  hiddenSections: string[];   // sections toggled off for THIS version
}

interface EducationEntry {
  id: string;                 // nanoid
  institution: string;
  degree: string;
  field: string;
  startDate: string;          // "2021-07" (YYYY-MM)
  endDate: string;            // "2025-05" or "present"
  gpa?: string;
  highlights: string[];       // dean's list, coursework, thesis
  location?: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location?: string;
  bullets: BulletPoint[];
  isCurrentRole: boolean;
}

interface BulletPoint {
  id: string;
  text: string;
  aiScore?: number;           // 0-100 quality score for this specific bullet
  aiSuggestions?: string[];   // cached suggestions if user hasn't acted yet
  metrics?: string[];         // extracted quantified values ["40%", "200 users"]
}

interface ProjectEntry {
  id: string;
  name: string;
  description?: string;
  techStack: string[];
  bullets: BulletPoint[];
  liveUrl?: string;
  repoUrl?: string;
  startDate?: string;
  endDate?: string;
}

interface SkillGroup {
  id: string;
  category: string;           // "Programming Languages", "Frameworks", "Tools", "Soft Skills"
  skills: string[];
}

interface CertEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  credentialId?: string;
}

interface AchievementEntry {
  id: string;
  text: string;
  category?: string;          // "academic", "competition", "scholarship", "publication"
}

interface ExtracurricularEntry {
  id: string;
  activity: string;
  role?: string;
  organization?: string;
  bullets: BulletPoint[];
}

interface CustomSection {
  id: string;
  title: string;
  items: { id: string; text: string }[];
}
```

---

## 6. Template System Architecture

### 6.1 Template Config Contract

```typescript
interface TemplateConfig {
  layout: {
    type: "single-column" | "two-column" | "sidebar";
    margins: { top: number; right: number; bottom: number; left: number }; // in mm
    sectionSpacing: number;    // in mm
    bulletSpacing: number;     // in mm
  };
  typography: {
    nameFont: string;          // Google Font name
    headingFont: string;
    bodyFont: string;
    nameFontSize: number;      // in pt
    headingFontSize: number;
    bodyFontSize: number;
    lineHeight: number;        // 1.2 - 1.6
  };
  colors: {
    primary: string;           // accent color hex
    text: string;
    muted: string;
    divider: string;
    background: string;        // usually #ffffff
  };
  decorations: {
    sectionDivider: "line" | "dot" | "none" | "double-line";
    headingStyle: "uppercase" | "bold" | "underline" | "color-accent" | "pill-badge";
    bulletIcon: "disc" | "dash" | "arrow" | "none";
  };
}
```

### 6.2 Ship These 8 Templates

| # | Key | Name | Category | Personality |
|---|-----|------|----------|-------------|
| 1 | `ats-classic` | Classic ATS | ATS_SAFE | Times New Roman feel, maximum parser safety, ultra-clean |
| 2 | `ats-modern` | Modern ATS | ATS_SAFE | Clean sans-serif, subtle color accent, recruiter-friendly |
| 3 | `ats-compact` | Compact ATS | ATS_SAFE | Dense layout, fits more content, engineering-optimized |
| 4 | `ats-executive` | Executive ATS | ATS_SAFE | Spacious, elegant, for experienced roles |
| 5 | `modern-slate` | Slate | MODERN | Dark accent sidebar, modern typography, strong visual hierarchy |
| 6 | `modern-spark` | Spark | MODERN | Color-forward, bold headings, creative-professional |
| 7 | `academic-cv` | Academic CV | ACADEMIC | Multi-page friendly, publications section, research emphasis |
| 8 | `creative-minimal` | Minimal Creative | CREATIVE | Whitespace-heavy, typographic hierarchy, portfolio-ready |

**Implementation**: Each template is a React component that receives `ResumeContent` + `TemplateConfig` and renders to `@react-pdf/renderer` primitives. One-click template switching = same data, different renderer component.

### 6.3 Template Switching Logic

```typescript
// Claude Code: implement this exact pattern
function ResumePreview({ content, templateKey, config }: Props) {
  const TemplateComponent = TEMPLATE_REGISTRY[templateKey];
  // TEMPLATE_REGISTRY maps key -> lazy-loaded React component
  // Every template component has the SAME props interface
  return (
    <PDFViewer width="100%" height="100%">
      <TemplateComponent content={content} config={config} />
    </PDFViewer>
  );
}
```

---

## 7. AI System — Prompts, Guardrails, Architecture

### 7.1 AI Action Catalog

| Action | Trigger | Input | Output | Latency Target |
|--------|---------|-------|--------|----------------|
| Improve Bullet | Button on each bullet | bullet text + role context | 3 variants: concise / balanced / impact-heavy | <3s |
| Add Metrics | Button on each bullet | bullet text | same bullet with metric placeholders + probing questions | <2s |
| Tailor to JD | Button or panel | bullet + JD keywords | rewritten bullet emphasizing JD-relevant skills | <3s |
| Generate Summary | Summary section | target role + segment + top skills + experience summary | 3 variants: ATS-concise / storytelling / leadership | <4s |
| Fix Grammar | Auto or manual | full resume text | corrections with tracked-change style diff | <3s |
| Write With Me | Wizard mode | micro Q&A answers | constructed bullet from answers | <3s per step |
| Project → Bullets | Project section | project name + description + tech stack (+ optional GitHub README) | 3-4 strong project bullets | <4s |

### 7.2 Master Prompt Template (for bullet improvement)

```
Claude Code: use this exact prompt structure for the IMPROVE_BULLET action.
Adapt the pattern for other actions.

---
SYSTEM:
You are an expert resume writer specializing in resumes for the Indian job market.
You help students and early-career professionals write powerful, honest resume bullets.

RULES (NON-NEGOTIABLE):
1. NEVER invent achievements, metrics, technologies, or experiences not present in the input.
2. NEVER add company names, tools, or frameworks the user did not mention.
3. If the bullet lacks quantified impact, suggest WHERE the user could add a number — but use a placeholder like [X%] or [N users], never a fabricated number.
4. Start every bullet with a strong, specific action verb. Avoid: "Responsible for", "Worked on", "Helped with".
5. Keep bullets to 1-2 lines (15-25 words ideal).
6. Prioritize: Action → What you did → Result/Impact.

OUTPUT FORMAT (JSON):
{
  "variants": [
    {
      "style": "concise",
      "text": "...",
      "changes": "what was changed and why"
    },
    {
      "style": "balanced",
      "text": "...",
      "changes": "what was changed and why"
    },
    {
      "style": "impact_heavy",
      "text": "...",
      "changes": "what was changed and why"
    }
  ],
  "metrics_prompt": "optional question to ask user for missing numbers, or null",
  "confidence": "high | medium | low",
  "confidence_note": "why this confidence level"
}

---
USER:
Original bullet: "{originalBullet}"
Target role: "{targetRole}"
User segment: "{segment}"
Additional context: "{additionalContext}"
Job description keywords (if available): "{jdKeywords}"

Rewrite this bullet in 3 styles. Follow all rules strictly.
```

### 7.3 Anti-Hallucination Pipeline

```
Step 1: User writes bullet (raw input captured and stored)
Step 2: AI generates variants
Step 3: UI shows variants with DIFF HIGHLIGHTING against original
         - Green = enhanced phrasing
         - Yellow = new structure (same facts)
         - Red = potentially new claim (FLAGGED for user verification)
Step 4: User picks variant or edits manually
Step 5: AiSuggestion record saved with inputText, outputVariants, accepted status
```

**Claude Code must implement**: A `diffWords()` comparison (use `diff` npm package) between original and each variant. Highlight tokens that appear in variant but NOT in original with a yellow badge saying "Verify this". This is the trust mechanism.

### 7.4 API Route Structure

```
/api/ai/improve-bullet     POST  { bullet, targetRole, segment, jdKeywords? }
/api/ai/add-metrics         POST  { bullet, targetRole }
/api/ai/tailor-to-jd        POST  { bullet, jdText }
/api/ai/generate-summary    POST  { targetRole, segment, skills, experienceSummary }
/api/ai/fix-grammar         POST  { fullText }
/api/ai/write-with-me       POST  { questionIndex, answers[], sectionType }
/api/ai/project-to-bullets  POST  { projectName, description, techStack, readmeText? }
/api/ai/parse-jd            POST  { jdText }
/api/ai/score-resume        POST  { content: ResumeContent, jdContext? }
```

Each route: validate input with Zod → call Claude API → parse JSON response → return typed result. Use streaming where latency > 2s.

---

## 8. JD Match Engine — The Massive Differentiator

### 8.1 Flow

```
User pastes JD text
       ↓
/api/ai/parse-jd extracts:
  - required skills[]
  - preferred skills[]
  - experience keywords[]
  - role-specific verbs[]
  - company values/culture words[]
  - education requirements
       ↓
Client-side matcher compares against ResumeContent:
  - skill overlap score
  - keyword presence in bullets
  - experience alignment
  - education match
       ↓
Output:
  {
    overallMatch: 73,
    breakdown: {
      skills: { score: 80, matched: [...], missing: [...] },
      experience: { score: 65, matchedKeywords: [...], missingKeywords: [...] },
      education: { score: 90, notes: "..." },
      language: { score: 60, weakVerbs: [...], genericPhrases: [...] }
    },
    recommendations: [
      { priority: "critical", section: "skills", action: "Add React and TypeScript to skills" },
      { priority: "high", section: "experience.0.bullets.1", action: "Mention API development experience" },
      ...
    ]
  }
```

### 8.2 "One-Click Targeted Copy" Feature

Button: "Create JD-Targeted Version" →
1. Clones current version
2. Auto-applies top 5 non-hallucination-risk fixes (reordering skills, adding missing skill tags, adjusting summary)
3. Flags bullets that COULD be tailored (user must approve each AI rewrite)
4. Names the version after the company/role: "Google SWE Intern — May 2026"

---

## 9. Resume Scoring Engine — Actionable, Not Vanity

### 9.1 Score Breakdown

```typescript
interface ScoreResult {
  overall: number;             // 0-100
  breakdown: {
    atsStructure: ScoreItem;   // correct headings, format, parseable
    impactLanguage: ScoreItem; // action verbs, outcome framing
    quantification: ScoreItem; // % of bullets with numbers
    readability: ScoreItem;    // length, clarity, jargon level
    roleFit: ScoreItem;        // alignment with targetRole
    completeness: ScoreItem;   // no empty sections, all fields filled
    consistency: ScoreItem;    // date formats, tense, style uniformity
  };
  issues: ScoreIssue[];
}

interface ScoreItem {
  score: number;               // 0-100
  label: string;
  weight: number;              // contribution to overall (sums to 1.0)
}

interface ScoreIssue {
  severity: "critical" | "warning" | "suggestion";
  category: string;
  message: string;
  anchorPath: string;          // "experience.0.bullets.2"
  fixAction?: {
    type: "auto" | "ai-assisted" | "manual";
    label: string;             // "Fix this" button text
    payload?: any;             // data needed to execute the fix
  };
}
```

### 9.2 Rules Engine (Client-Side, Instant)

**Critical checks** (block export if present):
- Missing name or email
- No content in any section
- Date in the future without "expected" qualifier

**Warning checks**:
- Non-standard section headings (map to standard equivalents)
- Bullet starts with "Responsible for" / "Worked on" / "Helped"
- Bullet longer than 30 words
- No quantified metrics in any experience bullet
- Empty bullets or sections toggled visible
- Inconsistent date formats
- Passive voice in >50% of bullets
- Repeated verbs across multiple bullets

**Suggestion checks**:
- Summary missing
- No LinkedIn/GitHub link
- Skills not categorized
- Less than 3 bullets per experience entry
- No projects section (for freshers)

Each check returns: `{ severity, message, anchorPath, fixAction }`.
The Score & Fix panel groups by severity and each item is clickable → scrolls to the exact field in the editor.

---

## 10. PDF & DOCX Export

### 10.1 PDF (Primary)

Use `@react-pdf/renderer` to render the SAME template components used in preview.
- Register Google Fonts via `Font.register()`
- Render to blob → upload to S3 → return download URL
- Target: pixel-identical match between preview and export
- Page break logic: never split a section heading from its first item; never orphan a single bullet on a new page

### 10.2 DOCX (ATS-optimized)

Use the `docx` npm package. Generate a **separate, simpler single-column layout** optimized purely for ATS parsing:
- No text boxes, no tables for layout, no columns
- Standard heading styles (Heading1, Heading2, Normal)
- Hyperlinks preserved
- Clean bullet lists

### 10.3 Shareable Web Link

Server-rendered page at `/r/[shareId]` with:
- Beautiful responsive web resume
- OG meta tags (for LinkedIn/WhatsApp preview)
- Optional password protection
- View count tracking
- Optional QR code linking to this URL

---

## 11. Multi-Version Management

### 11.1 UX

- Master Profile → single source of truth (all experiences, projects, skills ever entered)
- Each Resume can have multiple Versions
- Version Dashboard: cards with version name, target role, score, last edited
- "Compare" mode: side-by-side diff of two versions (section by section)
- "Duplicate" any version as starting point for a new one
- Version history: auto-saved snapshots every 5 minutes, restorable

### 11.2 Naming Convention Suggestions (auto-generated)

```
"{Company} {Role} — {Month} {Year}"
e.g., "Google SWE Intern — May 2026"
e.g., "MS CS Applications — Fall 2026"
```

---

## 12. Student-Specific Superpowers

### 12.1 "Write With Me" Mode

A conversational wizard for students who stare at a blank page:

```
Step 1: "What did you do?" → free text answer
Step 2: "What tools/tech did you use?" → tag input
Step 3: "What was the result? Any numbers?" → free text
Step 4: AI assembles a bullet → user picks from 3 variants → edits → done
```

Repeat for each bullet. This mode is toggled ON by default for FRESHER segment.

### 12.2 Project-to-Resume Converter

Input: GitHub repo URL OR manual entry (name + description + tech stack)
Optional: paste README content for richer context
Output: 3-4 strong project bullets, tech stack tags, suggested project title

### 12.3 "No Experience?" Alternative Generator

For freshers with no work experience:
- Prompt: "Have you done any of these?" → checkboxes: hackathons, college clubs, freelance, open source, volunteering, coursework projects, teaching/tutoring
- For each checked item: guided entry with AI-powered bullet generation
- Auto-suggests which section to place it in (Projects, Extracurricular, Experience)

### 12.4 Smart Placeholders by Stream

When `userSegment` and `education.field` are known, populate placeholder text:

| Field | Engineering | Commerce | Medical | Arts/Humanities |
|-------|------------|----------|---------|-----------------|
| Experience bullet | "Built a REST API serving 500 daily users using Node.js and PostgreSQL" | "Analyzed quarterly sales data for 3 product lines using Excel and Tableau" | "Assisted in 50+ patient consultations across cardiology and orthopedics" | "Wrote and edited 15 articles for the college magazine reaching 2,000 readers" |
| Skills example | "Python, React, AWS, Docker, Git" | "Financial Modeling, Tally, SAP, Advanced Excel" | "Clinical Research, SPSS, Patient Assessment" | "Content Writing, Adobe Suite, Research, SEO" |

---

## 13. Collaboration (Lightweight MVP)

- Share link with role: `viewer` or `reviewer`
- Reviewers can pin comments on specific bullet lines (anchored via `anchorPath`)
- Comment thread per anchor point
- "Accept Suggestion" button applies the reviewer's suggested text
- Email notification when comments are added
- Resolve/unresolve comments

---

## 14. Monetization — Where the Millions Come From

### 14.1 Pricing Tiers

| Tier | Price | Includes |
|------|-------|----------|
| Free | ₹0 | 1 resume, 1 version, 2 templates, 3 AI rewrites/day, PDF export with watermark |
| Pro | ₹499/month or ₹2999/year | Unlimited resumes + versions, all templates, unlimited AI, JD match, DOCX export, no watermark, web link sharing |
| Campus | ₹199/month (student verified) | Same as Pro, student discount with .edu email or college ID verification |
| Placement Bundle | ₹1999 one-time | Pro for 6 months + 1 expert resume review + mock interview AI sessions |

### 14.2 Conversion Triggers (build these into the UX)

- Free user hits AI limit → "Unlock unlimited AI rewrites" modal with testimonial
- Free user tries to export without watermark → upgrade gate
- Free user tries to create second resume → upgrade gate with "Most students need 3-5 versions" copy
- Score reaches 90+ → "Your resume is in the top 5% — share it with a Pro web link" → upgrade prompt
- JD Match shows <60% → "Upgrade to auto-fix with one click" → upgrade prompt

### 14.3 Revenue Math

```
Target: 100,000 active users in Year 1
Conversion to paid: 8% = 8,000 paying users
Average revenue per paid user: ₹350/month (blended)
Monthly revenue: ₹28,00,000 (~$33,500/month)
Annual revenue: ₹3.36 Cr (~$400,000/year)

Year 2 with campus partnerships and word-of-mouth:
500,000 active users, 10% conversion = 50,000 paid
Monthly revenue: ₹1.75 Cr (~$210,000/month)
Annual revenue: ₹21 Cr (~$2.5M/year)
```

---

## 15. UX Polish That Makes It Addictive

### 15.1 Micro-interactions (Claude Code: implement ALL of these)

- **Score counter animation**: score animates up/down like a game health bar when changes are made
- **Bullet quality dot**: green/yellow/red dot next to each bullet that updates in real-time as user types
- **Confetti on 90+ score**: subtle confetti animation when overall score crosses 90
- **"Resume is ATS-Ready" badge**: animated badge appears when all critical checks pass
- **Smooth section reorder**: drag-and-drop with spring physics animation
- **AI streaming**: show AI-generated text streaming in character-by-character (like ChatGPT) for improve/summary actions
- **Template switch animation**: crossfade transition when switching templates in preview
- **Auto-save indicator**: subtle "Saved" → "Saving..." → "Saved ✓" in top bar
- **Progress ring**: circular progress around the score chip showing completeness

### 15.2 Keyboard Shortcuts (Power Users)

```
Cmd/Ctrl + S        → Force save
Cmd/Ctrl + P        → Toggle preview panel
Cmd/Ctrl + E        → Export menu
Cmd/Ctrl + /        → Keyboard shortcut cheat sheet
Cmd/Ctrl + Shift+I  → Improve focused bullet (AI)
Cmd/Ctrl + Shift+M  → Add metrics to focused bullet (AI)
Cmd/Ctrl + Shift+J  → Open JD match panel
Tab / Shift+Tab     → Navigate between fields
```

### 15.3 Gamification

- **Milestone badges** (displayed on profile):
  - "First Resume Created"
  - "ATS Ready" (all critical checks passed)
  - "90 Club" (score ≥ 90)
  - "Version Master" (3+ versions)
  - "JD Sniper" (JD match ≥ 85)
  - "Impact Writer" (all bullets have metrics)
- **Resume Health Timeline**: chart showing score improvement over time (Recharts line chart)
- **Streak tracker**: "You've improved your resume 5 days in a row!"

---

## 16. Component Architecture (For Claude Code)

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                  → Dashboard shell with sidebar nav
│   │   ├── resumes/
│   │   │   ├── page.tsx                → Resume list grid
│   │   │   ├── new/page.tsx            → Template picker + onboarding
│   │   │   └── [id]/
│   │   │       ├── page.tsx            → Editor workspace (CORE)
│   │   │       └── loading.tsx
│   │   └── profile/page.tsx            → Master profile editor
│   ├── r/[shareId]/page.tsx            → Public shareable resume page
│   └── api/
│       ├── ai/
│       │   ├── improve-bullet/route.ts
│       │   ├── add-metrics/route.ts
│       │   ├── tailor-to-jd/route.ts
│       │   ├── generate-summary/route.ts
│       │   ├── fix-grammar/route.ts
│       │   ├── write-with-me/route.ts
│       │   ├── project-to-bullets/route.ts
│       │   ├── parse-jd/route.ts
│       │   └── score-resume/route.ts
│       ├── resumes/
│       │   ├── route.ts                → CRUD
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── versions/route.ts
│       │       └── export/route.ts
│       └── templates/route.ts
├── components/
│   ├── editor/
│   │   ├── EditorWorkspace.tsx          → Main 3-panel layout
│   │   ├── SectionNavigator.tsx         → Left panel
│   │   ├── FormEditor.tsx               → Center panel router
│   │   ├── sections/
│   │   │   ├── PersonalSection.tsx
│   │   │   ├── SummarySection.tsx
│   │   │   ├── EducationSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   ├── CertificationsSection.tsx
│   │   │   ├── AchievementsSection.tsx
│   │   │   └── ExtracurricularSection.tsx
│   │   ├── BulletEditor.tsx             → Tiptap editor for single bullet with AI buttons
│   │   ├── AiActionBar.tsx              → Floating/sticky AI actions
│   │   ├── WriteWithMeWizard.tsx        → Step-by-step guided writing
│   │   └── BottomToolbar.tsx
│   ├── preview/
│   │   ├── ResumePreview.tsx            → @react-pdf/renderer viewer wrapper
│   │   └── TemplateSwitcher.tsx
│   ├── templates/
│   │   ├── registry.ts                  → TEMPLATE_REGISTRY map
│   │   ├── AtsClassic.tsx
│   │   ├── AtsModern.tsx
│   │   ├── AtsCompact.tsx
│   │   ├── AtsExecutive.tsx
│   │   ├── ModernSlate.tsx
│   │   ├── ModernSpark.tsx
│   │   ├── AcademicCv.tsx
│   │   └── CreativeMinimal.tsx
│   ├── scoring/
│   │   ├── ScorePanel.tsx               → Score breakdown + fix list
│   │   ├── ScoreChip.tsx                → Animated score number in top bar
│   │   ├── IssueCard.tsx                → Single issue with fix CTA
│   │   └── rules/
│   │       ├── atsRules.ts
│   │       ├── languageRules.ts
│   │       ├── completenessRules.ts
│   │       └── consistencyRules.ts
│   ├── jd-match/
│   │   ├── JdMatchPanel.tsx
│   │   ├── JdInput.tsx                  → Paste JD textarea
│   │   ├── MatchBreakdown.tsx
│   │   └── RecommendationList.tsx
│   ├── versions/
│   │   ├── VersionDashboard.tsx
│   │   ├── VersionCard.tsx
│   │   └── VersionCompare.tsx
│   ├── collaboration/
│   │   ├── CommentPin.tsx
│   │   ├── CommentThread.tsx
│   │   └── ShareModal.tsx
│   ├── export/
│   │   ├── ExportModal.tsx
│   │   ├── PdfExporter.ts
│   │   └── DocxExporter.ts
│   └── ui/                              → Shared design system components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       ├── Tooltip.tsx
│       ├── ConfettiOverlay.tsx
│       └── ...
├── lib/
│   ├── ai/
│   │   ├── client.ts                    → Anthropic SDK wrapper
│   │   ├── prompts.ts                   → All prompt templates
│   │   └── parseAiResponse.ts
│   ├── scoring/
│   │   ├── engine.ts                    → Main scoring orchestrator
│   │   └── rules.ts                     → All rule definitions
│   ├── jd/
│   │   └── matcher.ts                   → JD parsing + matching logic
│   ├── export/
│   │   ├── pdf.ts
│   │   └── docx.ts
│   └── utils/
│       ├── dates.ts
│       ├── diff.ts                      → diffWords wrapper for AI trust UI
│       └── validators.ts                → Zod schemas for all inputs
├── stores/
│   └── editorStore.ts                   → Zustand store for editor state
└── prisma/
    └── schema.prisma
```

---

## 17. Design System Requirements

### 17.1 Visual Identity

- **Aesthetic**: Premium editorial meets modern SaaS. Think Notion's clarity + Linear's polish + Canva's approachability.
- **Primary palette**: Deep navy (#0F172A) + Electric blue accent (#3B82F6) + Clean whites
- **Typography**: Use a distinctive display font (e.g., Satoshi, Cabinet Grotesk, or General Sans for headings) + clean body font (e.g., Plus Jakarta Sans). Load via Google Fonts or Fontsource.
- **Spacing**: 4px base unit, generous whitespace, nothing feels cramped
- **Shadows**: Soft, layered shadows (no harsh drop shadows)
- **Border radius**: 8px default, 12px for cards, 16px for modals
- **Animations**: Framer Motion for all transitions, spring physics preferred over linear easing

### 17.2 Dark Mode

Full dark mode support via Tailwind's `dark:` classes. Default to system preference, user toggle available.

---

## 18. Implementation Phases

### Phase 1 — Ship MVP (4-6 weeks)

**Goal**: A student can create, edit, preview, and export a PDF resume with AI assistance.

Build order:
1. Project setup (Next.js + Prisma + Tailwind + Auth)
2. Database schema migration
3. Master profile + resume CRUD
4. Editor workspace (3-panel layout)
5. All section form editors (Personal through Extracurricular)
6. 4 ATS template components (`@react-pdf/renderer`)
7. Live preview with template switching
8. Score engine v1 (client-side rules)
9. AI bullet improver + summary generator (2 API routes)
10. PDF export
11. Basic JD paste + keyword gap display
12. Auto-save + undo/redo
13. Payment gate (Razorpay) + free tier limits
14. Deploy to Vercel

### Phase 2 — Growth (2-4 weeks after MVP)

- DOCX export
- 4 more templates (Modern + Academic + Creative)
- Full JD Match engine with one-click targeted copy
- Version management + compare
- Write With Me wizard
- Comment/collaboration system
- Shareable web link
- Gamification badges + score timeline

### Phase 3 — Category Leadership (ongoing)

- GitHub import for projects
- LinkedIn import (if API access available)
- Campus partnership admin panel
- AI mock interview linked from resume bullets
- Recruiter analytics (who viewed your shared link)
- Resume playbooks by target company (FAANG prep, startup prep, consulting prep)
- Multi-language resume support

---

## 19. Quality Assurance Checklist

Before each release, verify:

- [ ] All 8 templates render correctly with: empty content, minimal content, maximum content, long names/titles, special characters
- [ ] PDF export matches preview pixel-for-pixel
- [ ] PDF links are clickable
- [ ] PDF page breaks don't orphan headings or single bullets
- [ ] DOCX opens correctly in Word, Google Docs, and LibreOffice
- [ ] JD match handles: empty JD, very long JD (5000+ words), non-English characters
- [ ] Score engine produces no false critical errors on a well-written resume
- [ ] AI responses never contain hallucinated data (test with 50 diverse inputs)
- [ ] AI streaming works on slow connections
- [ ] Auto-save doesn't lose data on tab close, navigation, refresh
- [ ] Mobile editor is usable (all sections accessible, preview swipeable)
- [ ] Keyboard navigation works for all editor fields
- [ ] Payment flow completes without errors (test/sandbox mode)
- [ ] Free tier limits enforced correctly
- [ ] Shared link renders correctly with OG tags (test on LinkedIn, WhatsApp, Twitter)
- [ ] Dark mode renders all templates and UI correctly
- [ ] Performance: editor page loads in <2s, preview updates in <500ms, PDF export in <5s

---

## 20. Success Metrics

| Metric | Target (Month 1) | Target (Month 6) |
|--------|-------------------|-------------------|
| Resume completion rate (created → exported) | 40% | 60% |
| Exports per active user per month | 1.5 | 3.0 |
| 7-day return rate | 25% | 45% |
| Avg versions per user | 1.2 | 2.8 |
| Avg score improvement (first draft → export) | +15 points | +22 points |
| % resumes with quantified bullets | 30% | 55% |
| % resumes passing ATS critical checks | 70% | 90% |
| Free → Paid conversion | 5% | 10% |
| NPS score | 40 | 60 |

---

## FINAL NOTE FOR CLAUDE CODE

This document is your complete blueprint. When building:

1. **Start with the data layer** — Prisma schema, TypeScript types, Zustand store
2. **Build the editor workspace shell** — 3-panel layout with responsive behavior
3. **Add section editors one by one** — Personal → Summary → Education → Experience → Projects → Skills (this order matches user flow)
4. **Build ONE template first** (`ats-modern`) — get the `@react-pdf/renderer` pipeline working end-to-end
5. **Add scoring engine** — client-side rules that light up the Score Chip in real-time
6. **Add AI routes** — improve-bullet first, then summary generator
7. **Add PDF export** — reuse the same template component
8. **Add payment gates** — enforce free tier limits
9. **Polish** — animations, keyboard shortcuts, dark mode, gamification

Every component should be production-grade from day one. No placeholder UI. No "TODO" comments. Ship quality that makes students think "this is better than anything I've used before."

The user experience should feel like having a brilliant career mentor sitting next to you — one who never judges, always helps, and makes your resume undeniably strong.