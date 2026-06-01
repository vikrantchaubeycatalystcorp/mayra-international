# YouTube Shorts Carousel — Home Page (Student) Section

## Overview

A polished, swipeable **YouTube Shorts / Videos carousel** on the public home page that
students browse, with all videos managed by admins through a dedicated admin screen —
mirroring how Announcements, Hero Banners, and other Site-Experience content are managed.

- **Format:** Supports both **Shorts** (vertical 9:16) and **regular Videos** (16:9).
  Admin picks a `type` per item; the carousel adapts the card shape.
- **Playback:** **In-site modal player** — clicking a card opens a lightbox that plays
  the privacy-friendly `youtube-nocookie` embed without leaving the site.
- **Placement:** Home page, immediately after the **Top Exams** section.

## Data Model — `YouTubeShort` (`prisma/schema.prisma`)

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(cuid())` | |
| `title` | `String` | |
| `url` | `String` | Original link admin pasted |
| `videoId` | `String` | Extracted 11-char YouTube ID |
| `type` | `String @default("short")` | `"short"` (9:16) or `"video"` (16:9) |
| `thumbnail` | `String @default("")` | Optional override; else derived from `videoId` |
| `description` | `String @default("")` | |
| `category` | `String?` | Optional badge/grouping label |
| `isFeatured` | `Boolean @default(false)` | |
| `isActive` | `Boolean @default(true)` | Inactive items are hidden on the home page |
| `sortOrder` | `Int @default(0)` | Carousel order (asc) |
| `viewCount` | `Int @default(0)` | |
| `createdBy` / `updatedBy` | `String?` | Audit |
| `createdAt` / `updatedAt` | `DateTime` | |

Indexes: `type`, `isActive`, `sortOrder`. Apply via `npx prisma db push && npx prisma generate`.

## Components & Files

**New**
- `lib/youtube.ts` — `parseYouTubeId`, `youTubeThumb`, `youTubeEmbedUrl`
- `app/api/admin/youtube-shorts/route.ts` — `GET` list, `POST` create
- `app/api/admin/youtube-shorts/[id]/route.ts` — `GET` / `PUT` / `DELETE`
- `app/admin/(dashboard)/youtube-shorts/page.tsx` — admin CRUD screen
- `components/home/ShortsCarouselServer.tsx` — server fetch + CMS title
- `components/home/ShortsCarouselClient.tsx` — Embla carousel of cards
- `components/home/ShortsPlayerModal.tsx` — lightbox player

**Edited**
- `prisma/schema.prisma` — add `YouTubeShort`
- `next.config.ts` — allow `i.ytimg.com` / `img.youtube.com` image hosts
- `lib/revalidate.ts` — `ENTITY_PATH_MAP.YouTubeShort = ["/"]`
- `components/admin/layout/AdminSidebar.tsx` — nav item under "Site Experience"
- `app/(public)/page.tsx` — insert `<ShortsCarouselServer />` after Top Exams

## Patterns Reused (no new infrastructure)

- **Auth/permissions:** reuses the `"settings"` resource (same as Announcements/Media),
  so `lib/admin/permissions.ts` is untouched.
- **Admin CRUD:** `useAdminCRUD`, `AdminDataTable`, `ConfirmDialog`, `StatusBadge`.
- **API helpers:** `requireAdmin`, `success`, `badRequest`, `notFound`, `logActivity`,
  `revalidateEntity`.
- **Home section:** server/client split + `HomeSection` (`sectionKey: "youtube-shorts"`)
  for editable title/subtitle, mirroring `TopExamsServer`/`TopExamsClient`.
- **Carousel:** Embla (`embla-carousel-react`, `embla-carousel-autoplay`) — already
  installed dependencies.

## Admin Usage

`/admin` → **Site Experience → YouTube Shorts** → *Add*. Paste any YouTube or Shorts URL
(`youtube.com/shorts/…`, `youtu.be/…`, `watch?v=…`), choose Short/Video, set order, and
toggle active/featured. The video ID and thumbnail are derived automatically.

## Verification

1. `npx prisma db push && npx prisma generate` — no errors, `youTubeShort` delegate exists.
2. `npm run build` and `npm run lint` pass.
3. Admin: add a Short and a Video → both save, thumbnails show, edit/delete/toggle work.
4. Public: carousel appears after Top Exams → swipe/arrows/dots work → click opens modal
   that plays via `youtube-nocookie`; arrow keys step prev/next; `Esc`/backdrop close.
5. Empty state: with no active items the section is hidden (`ShortsCarouselServer` → `null`).
6. Responsive across mobile/tablet/desktop; modal video stays within the viewport.
