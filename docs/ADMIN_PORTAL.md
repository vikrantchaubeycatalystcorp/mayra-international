# Mayra International - Admin Portal

## Complete Technical Specification & Implementation Guide

**Version:** 1.0
**Date:** April 1, 2026
**Project:** Mayra International Education Portal - Admin Dashboard
**Tech Stack:** Next.js 15 | React 19 | Prisma 5 | PostgreSQL | Tailwind CSS 3.4 | Zustand 5 | NextAuth.js

---

## Table of Contents

1. [Overview](#1-overview)
2. [Admin Authentication System](#2-admin-authentication-system)
3. [Admin Dashboard Layout](#3-admin-dashboard-layout)
4. [College Management (CRUD)](#4-college-management-crud)
5. [Course Management (CRUD)](#5-course-management-crud)
6. [Exam Management (CRUD)](#6-exam-management-crud)
7. [News & Articles Management (CRUD)](#7-news--articles-management-crud)
8. [Study Abroad Management (CRUD)](#8-study-abroad-management-crud)
9. [Enquiry Management](#9-enquiry-management)
10. [Newsletter Subscriber Management](#10-newsletter-subscriber-management)
11. [User Management](#11-user-management)
12. [Analytics & Dashboard Widgets](#12-analytics--dashboard-widgets)
13. [Database Schema Changes](#13-database-schema-changes)
14. [API Routes Specification](#14-api-routes-specification)
15. [File & Folder Structure](#15-file--folder-structure)
16. [UI/UX Design Guidelines](#16-uiux-design-guidelines)
17. [Role-Based Access Control (RBAC)](#17-role-based-access-control-rbac)
18. [Security Considerations](#18-security-considerations)
19. [Deployment & Environment Variables](#19-deployment--environment-variables)
20. [Implementation Phases](#20-implementation-phases)

---

## 1. Overview

### Purpose

Build a full-featured Admin Portal for the Mayra International Education Portal that enables administrators to **Create, Read, Update, and Delete (CRUD)** every piece of data visible to students/public users. The admin portal will be a separate authenticated section of the application with its own layout, navigation, and permissions.

### What Students Currently See (Public Pages)

| Page | Route | Data Source |
|------|-------|-------------|
| Home | `/` | Colleges, Courses, Exams, News (featured) |
| College Listing | `/colleges` | 200+ colleges with filters & sorting |
| College Details | `/colleges/[slug]` | Individual college full profile |
| Course Listing | `/courses` | 100+ courses across 14 streams |
| Course Details | `/courses/[slug]` | Individual course details |
| Exam Listing | `/exams` | 50+ entrance exams with status badges |
| Exam Details | `/exams/[slug]` | Exam details + syllabus |
| News Listing | `/news` | News articles by category |
| News Details | `/news/[slug]` | Full article content |
| Articles | `/articles` | Articles listing & details |
| Study Abroad | `/study-abroad` | 8+ countries with universities |
| College Map | `/map` | Interactive map with college locations |
| Compare | `/compare` | Side-by-side college comparison |
| Resume Builder | `/resume-builder` | Resume creation tool |

### What Admin Can Manage

Everything the student sees, plus:
- All data entities (Colleges, Courses, Exams, News, Study Abroad)
- User accounts and enquiries
- Newsletter subscribers
- Site settings and analytics
- Featured/promoted content toggles

---

## 2. Admin Authentication System

### 2.1 Database Schema - Admin User

```prisma
model Admin {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String    // bcrypt hashed
  role          AdminRole @default(EDITOR)
  avatar        String?
  phone         String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  loginAttempts Int       @default(0)
  lockedUntil   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

enum AdminRole {
  SUPER_ADMIN   // Full access, can manage other admins
  ADMIN         // Full CRUD on all entities
  EDITOR        // Can create/edit content, cannot delete
  VIEWER        // Read-only access to dashboard
}
```

### 2.2 Admin Registration Page

**Route:** `/admin/register`
**Access:** Only accessible by SUPER_ADMIN (first admin is seeded)

#### Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Full Name | Text | Min 2, Max 100 chars | Yes |
| Email | Email | Valid email, unique in admin table | Yes |
| Password | Password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char | Yes |
| Confirm Password | Password | Must match password | Yes |
| Phone | Tel | Valid phone format (optional) | No |
| Role | Select | One of: ADMIN, EDITOR, VIEWER | Yes |
| Avatar | File Upload | JPG/PNG, max 2MB | No |

#### Registration Flow

```
1. SUPER_ADMIN navigates to /admin/register
2. Fills registration form with new admin details
3. Frontend validates all fields (Zod schema)
4. POST /api/admin/auth/register
5. Backend:
   a. Verify requesting admin is SUPER_ADMIN
   b. Check email uniqueness
   c. Hash password with bcrypt (12 rounds)
   d. Create admin record
   e. Send welcome email to new admin
6. Redirect to Admin User Management page
7. New admin receives welcome email with login link
```

#### UI Wireframe

```
+--------------------------------------------------+
|  MAYRA INTERNATIONAL - ADMIN PORTAL               |
|  ================================================ |
|                                                    |
|  Register New Admin                                |
|  ------------------------------------------------ |
|                                                    |
|  [Avatar Upload - Circle with camera icon]         |
|                                                    |
|  Full Name *                                       |
|  [________________________]                        |
|                                                    |
|  Email Address *                                   |
|  [________________________]                        |
|                                                    |
|  Phone Number                                      |
|  [________________________]                        |
|                                                    |
|  Password *                                        |
|  [________________________] [eye icon]             |
|  - Min 8 chars - 1 uppercase - 1 number - 1 special|
|                                                    |
|  Confirm Password *                                |
|  [________________________] [eye icon]             |
|                                                    |
|  Role *                                            |
|  [ ADMIN          v ]                              |
|                                                    |
|  [ Register Admin ]                                |
|                                                    |
+--------------------------------------------------+
```

### 2.3 Admin Login Page

**Route:** `/admin/login`
**Access:** Public (unauthenticated admins)

#### Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Email | Email | Valid email format | Yes |
| Password | Password | Non-empty | Yes |
| Remember Me | Checkbox | Boolean | No |

#### Login Flow

```
1. Admin navigates to /admin/login
2. Enters email and password
3. Frontend validates fields (Zod schema)
4. POST /api/admin/auth/login
5. Backend:
   a. Find admin by email
   b. Check if account is active
   c. Check if account is locked (too many failed attempts)
   d. Compare bcrypt password hash
   e. If failed: increment loginAttempts, lock after 5 attempts (30 min)
   f. If success: reset loginAttempts, update lastLoginAt
   g. Generate JWT token (access + refresh) via NextAuth
   h. Set HTTP-only secure cookie
6. Redirect to /admin/dashboard
```

#### Security Features

- **Rate Limiting:** Max 5 login attempts per 15 minutes per IP
- **Account Lockout:** Lock after 5 failed attempts for 30 minutes
- **Password Hashing:** bcrypt with 12 salt rounds
- **Session Management:** JWT with 24h access token, 7d refresh token
- **CSRF Protection:** Built-in Next.js CSRF tokens
- **HTTP-Only Cookies:** Tokens stored in HTTP-only secure cookies

#### Login UI Wireframe

```
+--------------------------------------------------+
|                                                    |
|        [Mayra International Logo]                  |
|                                                    |
|        Admin Portal Login                          |
|        ========================                    |
|                                                    |
|        Email Address                               |
|        [________________________]                  |
|                                                    |
|        Password                                    |
|        [________________________] [eye]            |
|                                                    |
|        [x] Remember me     Forgot password?        |
|                                                    |
|        [ Sign In to Admin Portal ]                 |
|                                                    |
|        --------  or  --------                      |
|                                                    |
|        [ Sign in with Google ]                     |
|                                                    |
+--------------------------------------------------+
```

### 2.4 Forgot Password / Reset Flow

```
1. Admin clicks "Forgot password?" on login page
2. Route: /admin/forgot-password
3. Enter registered email
4. POST /api/admin/auth/forgot-password
5. Backend generates a secure reset token (expires in 1 hour)
6. Send password reset email with link: /admin/reset-password?token=xxx
7. Admin clicks link, enters new password
8. POST /api/admin/auth/reset-password
9. Backend validates token, updates password hash
10. Redirect to login page with success message
```

---

## 3. Admin Dashboard Layout

### 3.1 Layout Structure

```
+-------+--------------------------------------------------+
| SIDE  |  HEADER BAR                                       |
| BAR   |  [Hamburger] [Search...] [Notifications] [Avatar] |
|       |=================================================  |
| [Logo]|                                                    |
|       |  MAIN CONTENT AREA                                 |
| Nav   |                                                    |
| Items |  +--------------------------------------------+    |
|       |  |  Page Title          [Action Buttons]     |    |
| ----  |  +--------------------------------------------+    |
|       |  |                                            |    |
| Dash  |  |  Content / Tables / Forms / Charts         |    |
| board |  |                                            |    |
|       |  |                                            |    |
| Coll  |  |                                            |    |
| eges  |  |                                            |    |
|       |  |                                            |    |
| Cour  |  +--------------------------------------------+    |
| ses   |                                                    |
|       |  FOOTER                                            |
| Exams |  Mayra International (c) 2026                      |
|       |                                                    |
| News  +--------------------------------------------------+
|       |
| Study |
| Abrd  |
|       |
| ----  |
| Users |
| Enq.  |
| News  |
| letter|
| ----  |
| Settn |
| Logs  |
+-------+
```

### 3.2 Sidebar Navigation

```
MAIN
  - Dashboard              /admin/dashboard
  - Analytics              /admin/analytics

CONTENT MANAGEMENT
  - Colleges               /admin/colleges
  - Courses                /admin/courses
  - Exams                  /admin/exams
  - News & Articles        /admin/news
  - Study Abroad           /admin/study-abroad

USER MANAGEMENT
  - Students / Users       /admin/users
  - Enquiries              /admin/enquiries
  - Newsletter             /admin/newsletter

ADMINISTRATION
  - Admin Users            /admin/admins          (SUPER_ADMIN only)
  - Site Settings          /admin/settings
  - Activity Logs          /admin/logs
```

### 3.3 Header Bar Components

| Component | Description |
|-----------|-------------|
| Hamburger Menu | Toggle sidebar collapse (mobile responsive) |
| Global Search | Search across all entities (Cmd+K shortcut) |
| Notifications Bell | New enquiries, system alerts, pending reviews |
| Admin Avatar + Dropdown | Profile, Settings, Theme Toggle, Logout |

### 3.4 Dashboard Overview Widgets

```
+------------------+------------------+------------------+------------------+
| Total Colleges   | Total Courses    | Total Exams      | Total Articles   |
|      245         |      112         |       58         |       24         |
| +5 this week     | +2 this week     | +0 this week     | +3 this week     |
+------------------+------------------+------------------+------------------+

+------------------+------------------+------------------+------------------+
| Total Users      | Active Enquiries | Newsletter Subs  | Page Views (7d)  |
|     1,245        |       18         |      2,340       |     45,230       |
| +120 this week   | 5 pending        | +45 this week    | +12% vs last wk  |
+------------------+------------------+------------------+------------------+

+-------------------------------------+  +-------------------------------------+
| Recent Enquiries                    |  | Recent Activity                     |
| ----------------------------------- |  | ----------------------------------- |
| Rahul S. - IIT Delhi - 2h ago      |  | Admin Priya edited IIT Bombay       |
| Priya M. - BITS Pilani - 5h ago    |  | Admin Raj added new course          |
| Amit K. - IIM Bangalore - 1d ago   |  | Admin Priya published article       |
| [View All Enquiries ->]            |  | [View All Activity ->]              |
+-------------------------------------+  +-------------------------------------+

+-------------------------------------+  +-------------------------------------+
| Popular Colleges (7d views)         |  | Content Status                      |
| ----------------------------------- |  | ----------------------------------- |
| 1. IIT Madras - 2,340 views        |  | Published: 423                      |
| 2. IIT Delhi - 2,100 views         |  | Draft: 12                           |
| 3. IIT Bombay - 1,890 views        |  | Under Review: 5                     |
| 4. BITS Pilani - 1,200 views       |  | Archived: 34                        |
| 5. IIM Ahmedabad - 1,100 views     |  |                                     |
+-------------------------------------+  +-------------------------------------+
```

---

## 4. College Management (CRUD)

### 4.1 College List View

**Route:** `/admin/colleges`

#### Features
- **Data Table** with sortable columns (using TanStack Table)
- **Columns:** Checkbox, Logo, Name, City/State, NIRF Rank, Rating, Type, Featured, Status, Actions
- **Bulk Actions:** Delete selected, Mark as featured, Export CSV
- **Filters:** Stream, Type, State, Featured status, Date range
- **Search:** By name, city, state
- **Pagination:** 20 per page with page size selector (10, 20, 50, 100)
- **Quick Actions:** Edit, View, Delete, Toggle Featured

#### Table Wireframe

```
+------------------------------------------------------------------------------+
| Colleges                                    [+ Add College] [Export CSV]      |
+------------------------------------------------------------------------------+
| Search: [_______________]  Stream: [All v]  Type: [All v]  State: [All v]    |
+------------------------------------------------------------------------------+
| [x] | Logo | Name           | City      | NIRF | Rating | Type    | Actions  |
+-----+------+----------------+-----------+------+--------+---------+----------+
| [ ] | [img]| IIT Madras     | Chennai   |  1   |  4.8   | Govt    | [E][D]   |
| [ ] | [img]| IIT Delhi      | New Delhi |  2   |  4.7   | Govt    | [E][D]   |
| [ ] | [img]| IIT Bombay     | Mumbai    |  3   |  4.7   | Govt    | [E][D]   |
| [ ] | [img]| BITS Pilani    | Pilani    |  --  |  4.5   | Private | [E][D]   |
+-----+------+----------------+-----------+------+--------+---------+----------+
| [Bulk Actions v]        Showing 1-20 of 245       [< 1 2 3 ... 13 >]        |
+------------------------------------------------------------------------------+
```

### 4.2 Create / Edit College Form

**Routes:**
- Create: `/admin/colleges/new`
- Edit: `/admin/colleges/[id]/edit`

#### Form Sections & Fields

**Section 1: Basic Information**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Name | Text | Min 2, Max 200 chars | Yes |
| Slug | Text (auto-generated from name) | Unique, URL-safe | Yes |
| Logo | Image Upload | JPG/PNG/WebP, max 5MB | No |
| Description | Rich Text Editor | Max 5000 chars | No |
| Type | Select | Government / Private / Deemed / Autonomous | Yes |
| Established Year | Number | 1800 - current year | Yes |
| Is Featured | Toggle | Boolean | No |

**Section 2: Location**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Address | Textarea | Max 500 chars | Yes |
| City | Text | Max 100 chars | Yes |
| State | Text / Select | Indian states list | Yes |
| Country Code | Select | ISO country code | Yes |
| Country Name | Text | Auto-filled from code | Yes |
| Latitude | Number | -90 to 90, 6 decimal places | No |
| Longitude | Number | -180 to 180, 6 decimal places | No |

**Section 3: Academic Details**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Streams | Multi-Select | Engineering, Medical, Management, Law, Science, Arts, Commerce, Design, Pharmacy, Agriculture, Hospitality, Education, Architecture, Computer Applications | Yes |
| Courses Offered | Tag Input | Free-text tags | No |
| Accreditation | Multi-Select | NAAC A++, NAAC A+, NAAC A, NAAC B++, NAAC B+, NBA, AICTE, UGC, NIRF Top 100 | No |
| NIRF Rank | Number | 1 - 1000 (nullable) | No |

**Section 4: Fees & Placement**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Minimum Fees (INR) | Number | 0 - 10,000,000 | Yes |
| Maximum Fees (INR) | Number | >= Minimum Fees | Yes |
| Average Package (INR LPA) | Number | 0 - 100,000,000 | No |
| Top Package (INR LPA) | Number | >= Average Package | No |
| Placement Rate (%) | Number | 0 - 100, 1 decimal | No |

**Section 5: Additional Details**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Rating | Number / Slider | 0.0 - 5.0, step 0.1 | Yes |
| Review Count | Number | 0 - 100,000 | No |
| Total Students | Number | 0 - 500,000 | No |
| Faculty Count | Number | 0 - 50,000 | No |
| Website | URL | Valid URL format | No |
| Phone | Tel | Valid phone format | No |
| Highlights | Tag Input | Repeatable text entries | No |

#### Form UI Wireframe

```
+------------------------------------------------------------------------------+
| Add New College                                         [Cancel] [Save Draft]|
+------------------------------------------------------------------------------+
|                                                                              |
| BASIC INFORMATION                                                            |
| ================                                                             |
|                                                                              |
| College Name *                          Slug (auto-generated)                |
| [____________________________]          [____________________________]       |
|                                                                              |
| [Logo Upload Area - drag & drop]        Type *                               |
|                                         [ Government      v ]               |
|                                                                              |
| Established Year *                      Is Featured                          |
| [ 2000 ]                                [ Toggle OFF ]                       |
|                                                                              |
| Description                                                                  |
| +----------------------------------------------------------------------+    |
| | Rich Text Editor                                                     |    |
| | [B] [I] [U] [H1] [H2] [Link] [List] [Image]                       |    |
| |                                                                      |    |
| |                                                                      |    |
| +----------------------------------------------------------------------+    |
|                                                                              |
| LOCATION                                                                     |
| ========                                                                     |
|                                                                              |
| Address *                                                                    |
| [____________________________]                                               |
|                                                                              |
| City *              State *              Country *                           |
| [__________]        [ Tamil Nadu v ]     [ India      v ]                   |
|                                                                              |
| Latitude                    Longitude                                        |
| [__________]                [__________]                                     |
|                             [Pick on Map]                                    |
|                                                                              |
| ACADEMIC DETAILS                                                             |
| ================                                                             |
|                                                                              |
| Streams *                                                                    |
| [x] Engineering  [x] Medical  [ ] Management  [ ] Law  [ ] Science         |
| [ ] Arts  [ ] Commerce  [ ] Design  [ ] Pharmacy  [ ] Agriculture           |
|                                                                              |
| Accreditation                                                                |
| [NAAC A++ x] [NBA x] [+Add]                                                |
|                                                                              |
| NIRF Rank                    Courses Offered                                 |
| [____]                       [B.Tech x] [M.Tech x] [MBA x] [+Add]          |
|                                                                              |
| FEES & PLACEMENT                                                             |
| ================                                                             |
|                                                                              |
| Min Fees (INR) *     Max Fees (INR) *     Avg Package (LPA)                 |
| [__________]         [__________]         [__________]                      |
|                                                                              |
| Top Package (LPA)    Placement Rate (%)                                      |
| [__________]         [__________]                                           |
|                                                                              |
| ADDITIONAL DETAILS                                                           |
| ==================                                                           |
|                                                                              |
| Rating *             Review Count         Total Students                     |
| [4.0 ====O===]       [__________]         [__________]                      |
|                                                                              |
| Faculty              Website              Phone                              |
| [__________]         [__________]         [__________]                      |
|                                                                              |
| Highlights                                                                   |
| [World-class faculty x] [Strong alumni network x] [+Add]                   |
|                                                                              |
+------------------------------------------------------------------------------+
|                                           [Cancel]  [Save as Draft]  [Save] |
+------------------------------------------------------------------------------+
```

### 4.3 View College Detail (Admin)

**Route:** `/admin/colleges/[id]`

Displays all college data in a read-only card layout with:
- Quick stats (rank, rating, students, fees)
- Edit and Delete action buttons
- Preview link to public page (`/colleges/[slug]`)
- Activity log (created by, last edited by, timestamps)

### 4.4 Delete College

- **Soft Delete:** Mark as archived (set `isActive: false`), don't permanently remove
- **Confirmation Dialog:** "Are you sure you want to delete IIT Madras? This will remove it from public listings."
- **Bulk Delete:** Select multiple colleges from table, confirm bulk deletion
- **Audit Trail:** Log who deleted what and when

---

## 5. Course Management (CRUD)

### 5.1 Course List View

**Route:** `/admin/courses`

#### Table Columns
| Column | Sortable | Filterable |
|--------|----------|------------|
| Checkbox | No | No |
| Icon | No | No |
| Course Name | Yes | Search |
| Stream | Yes | Dropdown |
| Level | Yes | Dropdown |
| Duration | Yes | No |
| Avg Fees | Yes | Range |
| Avg Salary | Yes | Range |
| Featured | Yes | Toggle |
| Actions | No | No |

### 5.2 Create / Edit Course Form

**Routes:**
- Create: `/admin/courses/new`
- Edit: `/admin/courses/[id]/edit`

#### Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Course Name | Text | Min 2, Max 200 chars | Yes |
| Slug | Text | Auto-generated, unique, URL-safe | Yes |
| Stream | Select | Engineering, Medical, Management, Law, Science, Arts, Commerce, Design, Pharmacy, Agriculture, Hospitality, Education, Architecture, Computer Applications | Yes |
| Level | Select | UG, PG, Diploma, Certificate, PhD | Yes |
| Duration | Text | e.g., "4 Years", "2 Years", "6 Months" | Yes |
| Description | Rich Text Editor | Max 5000 chars | No |
| Top Colleges Count | Number | 0 - 10,000 | No |
| Average Fees (INR) | Number | 0 - 50,000,000 | Yes |
| Average Salary (INR LPA) | Number | 0 - 100,000,000 | No |
| Icon | Icon Picker / Text | Emoji or icon class | No |
| Color | Color Picker | Valid hex color | No |
| Is Featured | Toggle | Boolean | No |

### 5.3 Course Form Wireframe

```
+------------------------------------------------------------------------------+
| Add New Course                                           [Cancel] [Save]     |
+------------------------------------------------------------------------------+
|                                                                              |
| Course Name *                           Slug                                 |
| [____________________________]          [auto-generated_____________]        |
|                                                                              |
| Stream *                     Level *                  Duration *             |
| [ Engineering     v ]        [ UG          v ]        [___________]         |
|                                                                              |
| Description                                                                  |
| +----------------------------------------------------------------------+    |
| | Rich Text Editor                                                     |    |
| +----------------------------------------------------------------------+    |
|                                                                              |
| Top Colleges                  Avg Fees (INR) *        Avg Salary (LPA)      |
| [____]                        [___________]           [___________]         |
|                                                                              |
| Icon                          Color                   Featured              |
| [Icon Picker]                 [#3B82F6 ====]          [Toggle]              |
|                                                                              |
+------------------------------------------------------------------------------+
```

---

## 6. Exam Management (CRUD)

### 6.1 Exam List View

**Route:** `/admin/exams`

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Checkbox | No | Bulk select |
| Exam Name | Yes | Full name + abbreviation |
| Conducting Body | Yes | Organization |
| Level | Yes | UG / PG / PhD / Diploma |
| Streams | No | Associated streams |
| Exam Date | Yes | Upcoming exam date |
| Mode | Yes | Online / Offline / Both |
| Featured | Yes | Toggle |
| Status | No | Computed: Open / Upcoming / Concluded |
| Actions | No | Edit / View / Delete |

### 6.2 Create / Edit Exam Form

**Routes:**
- Create: `/admin/exams/new`
- Edit: `/admin/exams/[id]/edit`

#### Form Sections

**Section 1: Basic Information**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Exam Name (Abbreviation) | Text | Min 2, Max 100 chars | Yes |
| Full Name | Text | Min 5, Max 300 chars | Yes |
| Slug | Text | Auto-generated, unique | Yes |
| Conducting Body | Text | Max 200 chars | Yes |
| Level | Select | UG / PG / PhD / Diploma | Yes |
| Streams | Multi-Select | Same as colleges | Yes |
| Mode | Select | Online / Offline / Both | Yes |
| Frequency | Select | Annual / Biannual / Monthly / As Scheduled | Yes |
| Description | Rich Text Editor | Max 5000 chars | No |
| Is Featured | Toggle | Boolean | No |

**Section 2: Important Dates**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Registration Start | Date | Valid date | No |
| Registration End | Date | After registration start | No |
| Exam Date | Date / Text | Valid date or "May 2026" | No |
| Result Date | Date / Text | After exam date | No |

**Section 3: Fees & Participation**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Application Fee (General) | Number (INR) | 0 - 100,000 | Yes |
| Application Fee (SC/ST) | Number (INR) | 0 - 100,000 | No |
| Total Seats | Number | 0 - 10,000,000 | No |
| Participating Colleges | Number | 0 - 100,000 | No |

**Section 4: Eligibility**

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Eligibility Criteria | Rich Text Editor | Max 3000 chars | No |

**Section 5: Syllabus Builder**

This is a **dynamic repeatable section** for building exam syllabi.

```
Syllabus
+-----------------------------------------------------------------+
| Section 1                                           [Remove]     |
| Section Name: [ Physics                           ]              |
| Topics:                                                          |
| [Mechanics x] [Thermodynamics x] [Optics x] [+Add Topic]       |
+-----------------------------------------------------------------+
| Section 2                                           [Remove]     |
| Section Name: [ Chemistry                         ]              |
| Topics:                                                          |
| [Organic x] [Inorganic x] [Physical x] [+Add Topic]            |
+-----------------------------------------------------------------+
| Section 3                                           [Remove]     |
| Section Name: [ Mathematics                       ]              |
| Topics:                                                          |
| [Calculus x] [Algebra x] [Trigonometry x] [+Add Topic]          |
+-----------------------------------------------------------------+
| [+ Add Section]                                                  |
+-----------------------------------------------------------------+
```

**Syllabus Data Structure:**

```typescript
interface SyllabusSection {
  section: string;      // e.g., "Physics"
  topics: string[];     // e.g., ["Mechanics", "Thermodynamics", "Optics"]
}

// Stored as JSON array in Prisma
syllabus: SyllabusSection[]
```

---

## 7. News & Articles Management (CRUD)

### 7.1 News List View

**Route:** `/admin/news`

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Checkbox | No | Bulk select |
| Title | Yes | Article title (truncated) |
| Category | Yes | Exams / Rankings / News / Admissions / Policy |
| Author | Yes | Writer name |
| Published Date | Yes | Publication date |
| Is Live | Yes | Toggle live/draft |
| Views | Yes | View count |
| Actions | No | Edit / View / Delete |

### 7.2 Create / Edit News Article Form

**Routes:**
- Create: `/admin/news/new`
- Edit: `/admin/news/[id]/edit`

#### Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Title | Text | Min 10, Max 300 chars | Yes |
| Slug | Text | Auto-generated, unique | Yes |
| Category | Select | Exams, Rankings, Admissions, Policy Updates, News, Scholarships, Study Abroad, Career | Yes |
| Summary | Textarea | Max 500 chars | Yes |
| Content | Rich Text Editor (Markdown) | Min 100, Max 50,000 chars | Yes |
| Author | Text | Max 100 chars, default "Editorial Team" | Yes |
| Published Date | Date + Time | Valid datetime | Yes |
| Image Color | Color Picker | Hex color for card bg | No |
| Tags | Tag Input | Max 10 tags | No |
| Is Live | Toggle | Boolean (default: false) | No |

#### Content Editor Features

The rich text editor for news content should support:
- **Headings:** H1, H2, H3
- **Formatting:** Bold, Italic, Underline, Strikethrough
- **Lists:** Ordered, Unordered
- **Links:** Inline links with target options
- **Images:** Upload and embed images
- **Tables:** Basic table support
- **Code Blocks:** For technical content
- **Blockquotes:** For citations
- **Preview Mode:** Toggle between edit and preview
- **Markdown Source:** Toggle to edit raw markdown

```
+------------------------------------------------------------------------------+
| Add New Article                                          [Cancel] [Publish]  |
+------------------------------------------------------------------------------+
|                                                                              |
| Title *                                                                      |
| [____________________________________________________]                      |
|                                                                              |
| Category *                   Author *                                        |
| [ Exams             v ]      [ Editorial Team_________]                     |
|                                                                              |
| Summary *                                                                    |
| +----------------------------------------------------------------------+    |
| |                                                                      |    |
| +----------------------------------------------------------------------+    |
|                                                                              |
| Content *                                              [Edit] [Preview]      |
| +----------------------------------------------------------------------+    |
| | [B] [I] [U] [H1] [H2] [H3] [Link] [Img] [Table] [Code] [Quote]   |    |
| |----------------------------------------------------------------------|    |
| |                                                                      |    |
| |  # JEE Main 2026 Registration: Key Dates and Updates                |    |
| |                                                                      |    |
| |  The National Testing Agency (NTA) has announced...                  |    |
| |                                                                      |    |
| |                                                                      |    |
| +----------------------------------------------------------------------+    |
|                                                                              |
| Published Date *             Image Color               Is Live              |
| [ 2026-04-01 10:00 ]        [#3B82F6 ====]            [ Toggle ]           |
|                                                                              |
| Tags                                                                         |
| [JEE Main x] [2026 x] [Registration x] [+Add]                             |
|                                                                              |
+------------------------------------------------------------------------------+
```

---

## 8. Study Abroad Management (CRUD)

### 8.1 Database Schema - Study Abroad Country

```prisma
model StudyAbroadCountry {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  flag            String              // emoji flag (e.g., "🇺🇸")
  universities    Int      @default(0)
  avgCost         String              // e.g., "$20,000 - $50,000/year"
  popularCourses  String[]
  description     String   @default("")
  topUniversities Json     @default("[]")  // Array of { name, rank }
  whyStudyHere    String   @default("")    // Rich text
  visaInfo        String   @default("")    // Visa requirements
  scholarships    String   @default("")    // Scholarship details
  livingCost      String   @default("")    // Cost of living info
  isFeatured      Boolean  @default(false)
  sortOrder       Int      @default(0)
  source          String   @default("static")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([slug])
  @@index([isFeatured])
}
```

### 8.2 Study Abroad List View

**Route:** `/admin/study-abroad`

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Flag + Name | Yes | Country name with flag emoji |
| Universities | Yes | Number of listed universities |
| Avg Cost | No | Annual cost range |
| Popular Courses | No | Tags |
| Featured | Yes | Toggle |
| Sort Order | Yes | Display order |
| Actions | No | Edit / View / Delete |

### 8.3 Create / Edit Study Abroad Country Form

#### Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| Country Name | Text | Min 2, Max 100 chars | Yes |
| Slug | Text | Auto-generated, unique | Yes |
| Flag Emoji | Emoji Picker / Text | Valid emoji | Yes |
| Number of Universities | Number | 0 - 50,000 | Yes |
| Average Cost | Text | e.g., "$20,000 - $50,000/year" | Yes |
| Popular Courses | Tag Input | Max 20 courses | No |
| Description | Rich Text | Max 5000 chars | Yes |
| Why Study Here | Rich Text | Max 5000 chars | No |
| Visa Information | Rich Text | Max 5000 chars | No |
| Scholarships | Rich Text | Max 5000 chars | No |
| Living Cost Info | Rich Text | Max 3000 chars | No |
| Sort Order | Number | 0 - 100 | No |
| Is Featured | Toggle | Boolean | No |

#### Top Universities (Dynamic Repeatable)

```
Top Universities
+----------------------------------------------+
| University 1                       [Remove]   |
| Name: [ MIT                      ]            |
| Rank: [ 1                        ]            |
+----------------------------------------------+
| University 2                       [Remove]   |
| Name: [ Stanford University      ]            |
| Rank: [ 2                        ]            |
+----------------------------------------------+
| [+ Add University]                             |
+----------------------------------------------+
```

---

## 9. Enquiry Management

### 9.1 Database Schema - Enquiry

```prisma
model Enquiry {
  id            String        @id @default(cuid())
  studentName   String
  email         String
  phone         String?
  collegeName   String
  collegeId     String?
  program       String?
  message       String        @default("")
  status        EnquiryStatus @default(PENDING)
  priority      Priority      @default(NORMAL)
  assignedTo    String?       // Admin ID
  response      String?
  respondedAt   DateTime?
  notes         String?       // Internal admin notes
  source        String        @default("website")  // website, mobile, api
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([status])
  @@index([createdAt])
  @@index([collegeId])
}

enum EnquiryStatus {
  PENDING
  UNDER_REVIEW
  RESPONDED
  CLOSED
  SPAM
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

### 9.2 Enquiry List View

**Route:** `/admin/enquiries`

#### Features
- **Status Tabs:** All | Pending | Under Review | Responded | Closed | Spam
- **Filters:** Date range, Priority, Assigned to, College
- **Bulk Actions:** Mark as spam, Assign to admin, Change status
- **Quick Reply:** Inline response without opening detail page
- **Export:** CSV/Excel export of enquiries

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Checkbox | No | Bulk select |
| Student Name | Yes | Name + email |
| College | Yes | Enquired college |
| Program | Yes | Interested program |
| Status | Yes | Badge: Pending/Review/Responded/Closed |
| Priority | Yes | Badge: Low/Normal/High/Urgent |
| Assigned To | Yes | Admin name |
| Date | Yes | Submission date |
| Actions | No | View / Reply / Archive |

### 9.3 Enquiry Detail & Response

**Route:** `/admin/enquiries/[id]`

```
+------------------------------------------------------------------------------+
| Enquiry #EN-2026-0042                        Status: [Under Review v]        |
+------------------------------------------------------------------------------+
|                                                                              |
| STUDENT INFORMATION                                                          |
| ===================                                                          |
| Name:    Rahul Sharma                                                        |
| Email:   rahul.sharma@email.com                                              |
| Phone:   +91 98765 43210                                                     |
| Source:  Website                                                             |
|                                                                              |
| ENQUIRY DETAILS                                                              |
| ===============                                                              |
| College:  IIT Delhi                                                          |
| Program:  B.Tech Computer Science                                            |
| Date:     April 1, 2026, 2:30 PM                                            |
|                                                                              |
| Message:                                                                     |
| "I would like to know about the admission process for B.Tech CSE at          |
|  IIT Delhi. What are the cutoff marks for JEE Advanced 2026?"               |
|                                                                              |
| RESPONSE                                                                     |
| ========                                                                     |
| Priority: [Normal v]     Assign To: [Admin Name v]                          |
|                                                                              |
| +----------------------------------------------------------------------+    |
| | Type your response here...                                           |    |
| |                                                                      |    |
| +----------------------------------------------------------------------+    |
|                                                                              |
| Internal Notes (not visible to student):                                     |
| +----------------------------------------------------------------------+    |
| | Follow up after JEE results                                          |    |
| +----------------------------------------------------------------------+    |
|                                                                              |
| [Send Response via Email]    [Save Notes]    [Mark as Closed]               |
|                                                                              |
+------------------------------------------------------------------------------+
```

---

## 10. Newsletter Subscriber Management

### 10.1 Database Schema

```prisma
model NewsletterSubscriber {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  isActive      Boolean  @default(true)
  subscribedAt  DateTime @default(now())
  unsubscribedAt DateTime?
  source        String   @default("website")
  tags          String[]

  @@index([email])
  @@index([isActive])
}
```

### 10.2 Newsletter List View

**Route:** `/admin/newsletter`

#### Features
- **Total subscriber count** and active/inactive breakdown
- **Search** by email or name
- **Filter** by status (active/inactive), date range, source
- **Export** subscriber list as CSV
- **Bulk Actions:** Deactivate, Delete, Add tags
- **Compose Newsletter:** Send email to all active subscribers (integration with email service)

#### Table Columns
| Column | Description |
|--------|-------------|
| Checkbox | Bulk select |
| Email | Subscriber email |
| Name | Optional name |
| Status | Active / Inactive badge |
| Subscribed Date | When they subscribed |
| Source | Where they signed up |
| Actions | View / Deactivate / Delete |

---

## 11. User Management

### 11.1 Database Schema - Student/Public User

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  phone         String?
  password      String?   // null if Google OAuth
  provider      String    @default("email")  // email, google
  providerId    String?
  avatar        String?
  goal          String?   // "Get into IIT/NIT", "MBBS", "MBA", etc.
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)
  savedColleges String[]
  compareList   String[]
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([provider])
}
```

### 11.2 User List View

**Route:** `/admin/users`

#### Features
- **User statistics:** Total, Active, Verified, By provider (email/Google)
- **Search:** By name, email, phone
- **Filters:** Provider, Goal, Active status, Date range
- **View user details:** Saved colleges, compare list, enquiries, activity
- **Actions:** Activate/Deactivate, Verify, View profile, Delete

#### Table Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| Avatar + Name | Yes | User avatar and full name |
| Email | Yes | Email address |
| Provider | Yes | Email / Google |
| Goal | Yes | Selected education goal |
| Saved Colleges | Yes | Count of saved colleges |
| Status | Yes | Active/Inactive badge |
| Joined | Yes | Registration date |
| Last Login | Yes | Last activity |
| Actions | No | View / Deactivate |

---

## 12. Analytics & Dashboard Widgets

### 12.1 Analytics Page

**Route:** `/admin/analytics`

#### Charts & Metrics

**Traffic Overview (Line Chart)**
- Page views over time (7d / 30d / 90d / 1y)
- Unique visitors
- Bounce rate

**Content Performance (Bar Chart)**
- Most viewed colleges (top 10)
- Most viewed courses (top 10)
- Most viewed exams (top 10)
- Most read articles (top 10)

**User Growth (Area Chart)**
- New registrations over time
- Active users over time
- Retention rate

**Enquiry Analytics (Pie/Donut Chart)**
- Enquiries by status
- Enquiries by college
- Response time distribution
- Enquiries by source

**Search Analytics (Table/Word Cloud)**
- Top search queries
- Search with no results
- Search-to-click conversion

**Geographic Distribution (Map/Heatmap)**
- Users by state/city
- College views by region

---

## 13. Database Schema Changes

### Complete Prisma Schema Addition

```prisma
// ============================================================
// ADMIN PORTAL - NEW MODELS
// ============================================================

// --- Admin User ---
model Admin {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          AdminRole @default(EDITOR)
  avatar        String?
  phone         String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  loginAttempts Int       @default(0)
  lockedUntil   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  activities    AdminActivity[]

  @@index([email])
  @@index([role])
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
  VIEWER
}

// --- Public User ---
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  phone         String?
  password      String?
  provider      String    @default("email")
  providerId    String?
  avatar        String?
  goal          String?
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)
  savedColleges String[]
  compareList   String[]
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  enquiries     Enquiry[]

  @@index([email])
  @@index([provider])
}

// --- Enquiry ---
model Enquiry {
  id            String        @id @default(cuid())
  studentName   String
  email         String
  phone         String?
  collegeName   String
  collegeId     String?
  program       String?
  message       String        @default("")
  status        EnquiryStatus @default(PENDING)
  priority      Priority      @default(NORMAL)
  assignedTo    String?
  response      String?
  respondedAt   DateTime?
  notes         String?
  source        String        @default("website")
  userId        String?
  user          User?         @relation(fields: [userId], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([status])
  @@index([createdAt])
  @@index([collegeId])
  @@index([userId])
}

enum EnquiryStatus {
  PENDING
  UNDER_REVIEW
  RESPONDED
  CLOSED
  SPAM
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

// --- Newsletter ---
model NewsletterSubscriber {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  isActive       Boolean   @default(true)
  subscribedAt   DateTime  @default(now())
  unsubscribedAt DateTime?
  source         String    @default("website")
  tags           String[]

  @@index([email])
  @@index([isActive])
}

// --- Study Abroad ---
model StudyAbroadCountry {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  flag            String
  universities    Int      @default(0)
  avgCost         String
  popularCourses  String[]
  description     String   @default("")
  topUniversities Json     @default("[]")
  whyStudyHere    String   @default("")
  visaInfo        String   @default("")
  scholarships    String   @default("")
  livingCost      String   @default("")
  isFeatured      Boolean  @default(false)
  sortOrder       Int      @default(0)
  source          String   @default("static")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([slug])
  @@index([isFeatured])
}

// --- Activity Log ---
model AdminActivity {
  id          String   @id @default(cuid())
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  action      String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity      String   // College, Course, Exam, News, etc.
  entityId    String?
  details     String?  // JSON string with change details
  ipAddress   String?
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([entity])
  @@index([createdAt])
}

// --- Site Settings ---
model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  type      String   @default("string")  // string, number, boolean, json
  group     String   @default("general") // general, seo, email, social
  updatedAt DateTime @updatedAt

  @@index([key])
  @@index([group])
}
```

### Modifications to Existing Models

Add these fields to existing models:

```prisma
// Add to College model:
  isActive    Boolean  @default(true)    // Soft delete support
  status      String   @default("published")  // draft, published, archived
  createdBy   String?  // Admin who created
  updatedBy   String?  // Admin who last updated
  viewCount   Int      @default(0)

// Add to Exam model:
  isActive    Boolean  @default(true)
  status      String   @default("published")
  createdBy   String?
  updatedBy   String?
  viewCount   Int      @default(0)

// Add to Course model:
  isActive    Boolean  @default(true)
  status      String   @default("published")
  createdBy   String?
  updatedBy   String?
  viewCount   Int      @default(0)

// Add to NewsArticle model:
  isActive    Boolean  @default(true)
  status      String   @default("draft")  // draft, published, archived
  createdBy   String?
  updatedBy   String?
```

---

## 14. API Routes Specification

### 14.1 Admin Authentication APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/admin/auth/login` | Admin login | Public |
| POST | `/api/admin/auth/register` | Register new admin | SUPER_ADMIN |
| POST | `/api/admin/auth/logout` | Logout admin | Admin |
| POST | `/api/admin/auth/forgot-password` | Send reset email | Public |
| POST | `/api/admin/auth/reset-password` | Reset password | Public (with token) |
| GET | `/api/admin/auth/me` | Get current admin profile | Admin |
| PUT | `/api/admin/auth/me` | Update own profile | Admin |
| PUT | `/api/admin/auth/change-password` | Change own password | Admin |

### 14.2 College CRUD APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/colleges` | List all colleges (paginated, filterable) | VIEWER+ |
| GET | `/api/admin/colleges/[id]` | Get single college by ID | VIEWER+ |
| POST | `/api/admin/colleges` | Create new college | EDITOR+ |
| PUT | `/api/admin/colleges/[id]` | Update college | EDITOR+ |
| DELETE | `/api/admin/colleges/[id]` | Soft-delete college | ADMIN+ |
| POST | `/api/admin/colleges/bulk-delete` | Bulk soft-delete | ADMIN+ |
| POST | `/api/admin/colleges/bulk-feature` | Bulk toggle featured | EDITOR+ |
| GET | `/api/admin/colleges/export` | Export as CSV | VIEWER+ |
| POST | `/api/admin/colleges/import` | Import from CSV | ADMIN+ |

### 14.3 Course CRUD APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/courses` | List all courses | VIEWER+ |
| GET | `/api/admin/courses/[id]` | Get single course | VIEWER+ |
| POST | `/api/admin/courses` | Create course | EDITOR+ |
| PUT | `/api/admin/courses/[id]` | Update course | EDITOR+ |
| DELETE | `/api/admin/courses/[id]` | Soft-delete course | ADMIN+ |
| POST | `/api/admin/courses/bulk-delete` | Bulk soft-delete | ADMIN+ |
| GET | `/api/admin/courses/export` | Export CSV | VIEWER+ |

### 14.4 Exam CRUD APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/exams` | List all exams | VIEWER+ |
| GET | `/api/admin/exams/[id]` | Get single exam | VIEWER+ |
| POST | `/api/admin/exams` | Create exam | EDITOR+ |
| PUT | `/api/admin/exams/[id]` | Update exam | EDITOR+ |
| DELETE | `/api/admin/exams/[id]` | Soft-delete exam | ADMIN+ |
| POST | `/api/admin/exams/bulk-delete` | Bulk soft-delete | ADMIN+ |
| GET | `/api/admin/exams/export` | Export CSV | VIEWER+ |

### 14.5 News CRUD APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/news` | List all articles | VIEWER+ |
| GET | `/api/admin/news/[id]` | Get single article | VIEWER+ |
| POST | `/api/admin/news` | Create article | EDITOR+ |
| PUT | `/api/admin/news/[id]` | Update article | EDITOR+ |
| DELETE | `/api/admin/news/[id]` | Soft-delete article | ADMIN+ |
| PUT | `/api/admin/news/[id]/publish` | Toggle publish status | EDITOR+ |
| GET | `/api/admin/news/export` | Export CSV | VIEWER+ |

### 14.6 Study Abroad CRUD APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/study-abroad` | List countries | VIEWER+ |
| GET | `/api/admin/study-abroad/[id]` | Get single country | VIEWER+ |
| POST | `/api/admin/study-abroad` | Create country | EDITOR+ |
| PUT | `/api/admin/study-abroad/[id]` | Update country | EDITOR+ |
| DELETE | `/api/admin/study-abroad/[id]` | Delete country | ADMIN+ |

### 14.7 Enquiry Management APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/enquiries` | List enquiries | VIEWER+ |
| GET | `/api/admin/enquiries/[id]` | Get single enquiry | VIEWER+ |
| PUT | `/api/admin/enquiries/[id]` | Update status/assignment | EDITOR+ |
| POST | `/api/admin/enquiries/[id]/respond` | Send response email | EDITOR+ |
| POST | `/api/admin/enquiries/bulk-status` | Bulk status change | EDITOR+ |
| GET | `/api/admin/enquiries/export` | Export CSV | VIEWER+ |
| GET | `/api/admin/enquiries/stats` | Enquiry statistics | VIEWER+ |

### 14.8 Newsletter APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/newsletter` | List subscribers | VIEWER+ |
| DELETE | `/api/admin/newsletter/[id]` | Remove subscriber | ADMIN+ |
| PUT | `/api/admin/newsletter/[id]` | Update subscriber | EDITOR+ |
| GET | `/api/admin/newsletter/export` | Export subscribers | VIEWER+ |
| GET | `/api/admin/newsletter/stats` | Subscriber stats | VIEWER+ |

### 14.9 User Management APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/users` | List all users | VIEWER+ |
| GET | `/api/admin/users/[id]` | Get user details | VIEWER+ |
| PUT | `/api/admin/users/[id]` | Update user (activate/deactivate) | ADMIN+ |
| DELETE | `/api/admin/users/[id]` | Soft-delete user | SUPER_ADMIN |
| GET | `/api/admin/users/export` | Export users CSV | ADMIN+ |
| GET | `/api/admin/users/stats` | User statistics | VIEWER+ |

### 14.10 Admin Management APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/admins` | List all admins | SUPER_ADMIN |
| GET | `/api/admin/admins/[id]` | Get admin details | SUPER_ADMIN |
| PUT | `/api/admin/admins/[id]` | Update admin role/status | SUPER_ADMIN |
| DELETE | `/api/admin/admins/[id]` | Deactivate admin | SUPER_ADMIN |

### 14.11 Analytics APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/analytics/overview` | Dashboard stats | VIEWER+ |
| GET | `/api/admin/analytics/traffic` | Page view metrics | VIEWER+ |
| GET | `/api/admin/analytics/content` | Content performance | VIEWER+ |
| GET | `/api/admin/analytics/users` | User growth metrics | VIEWER+ |
| GET | `/api/admin/analytics/enquiries` | Enquiry analytics | VIEWER+ |
| GET | `/api/admin/analytics/search` | Search analytics | VIEWER+ |

### 14.12 Utility APIs

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/admin/upload` | File upload (images) | EDITOR+ |
| GET | `/api/admin/activity` | Activity log | ADMIN+ |
| GET | `/api/admin/settings` | Get site settings | ADMIN+ |
| PUT | `/api/admin/settings` | Update site settings | SUPER_ADMIN |
| POST | `/api/admin/seed` | Seed database from static data | SUPER_ADMIN |

### API Request/Response Examples

#### Create College - POST `/api/admin/colleges`

**Request:**
```json
{
  "name": "Indian Institute of Technology Madras",
  "type": "Government",
  "established": 1959,
  "city": "Chennai",
  "state": "Tamil Nadu",
  "address": "IIT P.O., Chennai, Tamil Nadu 600036",
  "countryCode": "IN",
  "streams": ["Engineering", "Science", "Management"],
  "nirfRank": 1,
  "rating": 4.8,
  "feesMin": 200000,
  "feesMax": 300000,
  "avgPackage": 2100000,
  "topPackage": 18000000,
  "placementRate": 95.5,
  "accreditation": ["NAAC A++", "NBA", "NIRF Top 100"],
  "courses": ["B.Tech", "M.Tech", "MBA", "MS", "PhD"],
  "description": "IIT Madras is India's top engineering institute...",
  "highlights": ["#1 in India", "Strong research output"],
  "website": "https://www.iitm.ac.in",
  "latitude": 12.9916,
  "longitude": 80.2336,
  "isFeatured": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "Indian Institute of Technology Madras",
    "slug": "iit-madras",
    ...all fields,
    "createdAt": "2026-04-01T10:00:00.000Z",
    "createdBy": "admin_id_123"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "name", "message": "Name is required" },
      { "field": "feesMax", "message": "Max fees must be greater than min fees" }
    ]
  }
}
```

---

## 15. File & Folder Structure

```
app/
├── (admin)/                          # Admin route group
│   ├── layout.tsx                    # Admin layout (sidebar + header)
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx             # Admin login page
│   │   ├── forgot-password/
│   │   │   └── page.tsx             # Forgot password page
│   │   ├── reset-password/
│   │   │   └── page.tsx             # Reset password page
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Admin dashboard overview
│   │   ├── analytics/
│   │   │   └── page.tsx             # Analytics & charts
│   │   ├── colleges/
│   │   │   ├── page.tsx             # College list (data table)
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create college form
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # View college detail
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit college form
│   │   ├── courses/
│   │   │   ├── page.tsx             # Course list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create course form
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # View course detail
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit course form
│   │   ├── exams/
│   │   │   ├── page.tsx             # Exam list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create exam form
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # View exam detail
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit exam form
│   │   ├── news/
│   │   │   ├── page.tsx             # News list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create article
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # View article
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit article
│   │   ├── study-abroad/
│   │   │   ├── page.tsx             # Study abroad list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Add country
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit country
│   │   ├── enquiries/
│   │   │   ├── page.tsx             # Enquiry list
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Enquiry detail + response
│   │   ├── newsletter/
│   │   │   └── page.tsx             # Newsletter subscribers
│   │   ├── users/
│   │   │   ├── page.tsx             # User list
│   │   │   └── [id]/
│   │   │       └── page.tsx         # User detail
│   │   ├── admins/
│   │   │   ├── page.tsx             # Admin user list
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Register new admin
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Admin detail
│   │   ├── settings/
│   │   │   └── page.tsx             # Site settings
│   │   └── logs/
│   │       └── page.tsx             # Activity logs
│
├── api/
│   └── admin/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   ├── forgot-password/route.ts
│       │   ├── reset-password/route.ts
│       │   └── me/route.ts
│       ├── colleges/
│       │   ├── route.ts             # GET (list) + POST (create)
│       │   ├── [id]/route.ts        # GET + PUT + DELETE
│       │   ├── bulk-delete/route.ts
│       │   ├── bulk-feature/route.ts
│       │   ├── export/route.ts
│       │   └── import/route.ts
│       ├── courses/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── bulk-delete/route.ts
│       │   └── export/route.ts
│       ├── exams/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── bulk-delete/route.ts
│       │   └── export/route.ts
│       ├── news/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── [id]/publish/route.ts
│       │   └── export/route.ts
│       ├── study-abroad/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── enquiries/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── [id]/respond/route.ts
│       │   ├── bulk-status/route.ts
│       │   ├── export/route.ts
│       │   └── stats/route.ts
│       ├── newsletter/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── export/route.ts
│       │   └── stats/route.ts
│       ├── users/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── export/route.ts
│       │   └── stats/route.ts
│       ├── admins/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── analytics/
│       │   ├── overview/route.ts
│       │   ├── traffic/route.ts
│       │   ├── content/route.ts
│       │   ├── users/route.ts
│       │   ├── enquiries/route.ts
│       │   └── search/route.ts
│       ├── upload/route.ts
│       ├── activity/route.ts
│       ├── settings/route.ts
│       └── seed/route.ts

components/
├── admin/
│   ├── layout/
│   │   ├── AdminSidebar.tsx          # Sidebar navigation
│   │   ├── AdminHeader.tsx           # Top header bar
│   │   ├── AdminBreadcrumb.tsx       # Breadcrumb navigation
│   │   └── AdminFooter.tsx           # Footer
│   ├── shared/
│   │   ├── DataTable.tsx             # Reusable data table (TanStack)
│   │   ├── DataTablePagination.tsx   # Pagination controls
│   │   ├── DataTableToolbar.tsx      # Filter/search toolbar
│   │   ├── FormSection.tsx           # Form section wrapper
│   │   ├── ImageUpload.tsx           # Image upload with preview
│   │   ├── RichTextEditor.tsx        # Markdown/WYSIWYG editor
│   │   ├── TagInput.tsx              # Tag/chip input
│   │   ├── ColorPicker.tsx           # Color picker
│   │   ├── ConfirmDialog.tsx         # Confirmation modal
│   │   ├── StatusBadge.tsx           # Status badge component
│   │   ├── StatsCard.tsx             # Dashboard stat card
│   │   └── EmptyState.tsx            # Empty state placeholder
│   ├── colleges/
│   │   ├── CollegeForm.tsx           # Create/Edit college form
│   │   ├── CollegeColumns.tsx        # Table column definitions
│   │   └── CollegeActions.tsx        # Row action buttons
│   ├── courses/
│   │   ├── CourseForm.tsx
│   │   ├── CourseColumns.tsx
│   │   └── CourseActions.tsx
│   ├── exams/
│   │   ├── ExamForm.tsx
│   │   ├── ExamColumns.tsx
│   │   ├── ExamActions.tsx
│   │   └── SyllabusBuilder.tsx       # Dynamic syllabus editor
│   ├── news/
│   │   ├── NewsForm.tsx
│   │   ├── NewsColumns.tsx
│   │   └── NewsActions.tsx
│   ├── study-abroad/
│   │   ├── StudyAbroadForm.tsx
│   │   └── UniversityListBuilder.tsx # Dynamic university list
│   ├── enquiries/
│   │   ├── EnquiryColumns.tsx
│   │   ├── EnquiryDetail.tsx
│   │   └── EnquiryResponse.tsx
│   ├── dashboard/
│   │   ├── OverviewCards.tsx
│   │   ├── RecentEnquiries.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── PopularContent.tsx
│   │   └── ContentStatusChart.tsx
│   └── analytics/
│       ├── TrafficChart.tsx
│       ├── ContentPerformance.tsx
│       ├── UserGrowthChart.tsx
│       └── EnquiryAnalytics.tsx

lib/
├── admin/
│   ├── auth.ts                       # Admin auth utilities
│   ├── middleware.ts                  # Admin route protection middleware
│   ├── permissions.ts                # RBAC permission checks
│   └── activity-logger.ts            # Activity logging utility

hooks/
├── admin/
│   ├── useAdminAuth.ts               # Admin auth hook
│   ├── useAdminColleges.ts           # College CRUD hook
│   ├── useAdminCourses.ts            # Course CRUD hook
│   ├── useAdminExams.ts              # Exam CRUD hook
│   ├── useAdminNews.ts               # News CRUD hook
│   ├── useAdminStudyAbroad.ts        # Study abroad CRUD hook
│   ├── useAdminEnquiries.ts          # Enquiry management hook
│   ├── useAdminUsers.ts              # User management hook
│   ├── useAdminAnalytics.ts          # Analytics data hook
│   └── useAdminUpload.ts             # File upload hook

types/
├── admin.ts                          # Admin-specific type definitions
```

---

## 16. UI/UX Design Guidelines

### 16.1 Design System

| Element | Specification |
|---------|--------------|
| **Primary Color** | `#1E40AF` (Blue 800) |
| **Secondary Color** | `#0F172A` (Slate 900) |
| **Success** | `#16A34A` (Green 600) |
| **Warning** | `#D97706` (Amber 600) |
| **Danger** | `#DC2626` (Red 600) |
| **Background** | `#F8FAFC` (Slate 50) |
| **Surface** | `#FFFFFF` |
| **Text Primary** | `#0F172A` (Slate 900) |
| **Text Secondary** | `#64748B` (Slate 500) |
| **Border** | `#E2E8F0` (Slate 200) |
| **Font** | Inter (sans-serif) |
| **Border Radius** | `8px` (default), `12px` (cards), `6px` (inputs) |
| **Spacing Scale** | 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64) |

### 16.2 Component Standards

**Data Tables:**
- Use TanStack Table for all data tables
- Sticky header on scroll
- Row hover highlight
- Alternating row backgrounds (optional)
- Responsive: horizontal scroll on mobile
- Loading skeleton while fetching

**Forms:**
- Inline validation (on blur + on submit)
- Field-level error messages in red below input
- Required fields marked with red asterisk (*)
- Auto-save draft every 30 seconds
- Unsaved changes warning on navigation
- Clear visual sections with headers

**Modals & Dialogs:**
- Use Radix UI Dialog component
- Confirmation dialogs for destructive actions
- Loading state with spinner on submit

**Notifications:**
- Toast notifications (top-right) for success/error
- Persistent banner for critical alerts
- Badge count on notification bell

### 16.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Sidebar hidden, hamburger menu, stacked forms |
| Tablet | 768px - 1024px | Collapsed sidebar (icons only), 2-column forms |
| Desktop | > 1024px | Full sidebar, 2-3 column forms |

### 16.4 Dark Mode Support

- Toggle in header dropdown
- CSS variables for all colors
- Persistent preference (localStorage)
- System preference detection

---

## 17. Role-Based Access Control (RBAC)

### Permission Matrix

| Resource | Action | SUPER_ADMIN | ADMIN | EDITOR | VIEWER |
|----------|--------|:-----------:|:-----:|:------:|:------:|
| **Colleges** | View | Yes | Yes | Yes | Yes |
| | Create | Yes | Yes | Yes | No |
| | Edit | Yes | Yes | Yes | No |
| | Delete | Yes | Yes | No | No |
| | Import/Export | Yes | Yes | No | Yes (export only) |
| **Courses** | View | Yes | Yes | Yes | Yes |
| | Create | Yes | Yes | Yes | No |
| | Edit | Yes | Yes | Yes | No |
| | Delete | Yes | Yes | No | No |
| **Exams** | View | Yes | Yes | Yes | Yes |
| | Create | Yes | Yes | Yes | No |
| | Edit | Yes | Yes | Yes | No |
| | Delete | Yes | Yes | No | No |
| **News** | View | Yes | Yes | Yes | Yes |
| | Create | Yes | Yes | Yes | No |
| | Edit | Yes | Yes | Yes | No |
| | Publish | Yes | Yes | Yes | No |
| | Delete | Yes | Yes | No | No |
| **Study Abroad** | View | Yes | Yes | Yes | Yes |
| | Create | Yes | Yes | Yes | No |
| | Edit | Yes | Yes | Yes | No |
| | Delete | Yes | Yes | No | No |
| **Enquiries** | View | Yes | Yes | Yes | Yes |
| | Respond | Yes | Yes | Yes | No |
| | Change Status | Yes | Yes | Yes | No |
| | Delete | Yes | Yes | No | No |
| **Newsletter** | View | Yes | Yes | Yes | Yes |
| | Manage | Yes | Yes | No | No |
| | Export | Yes | Yes | No | Yes |
| **Users** | View | Yes | Yes | Yes | Yes |
| | Manage | Yes | Yes | No | No |
| | Delete | Yes | No | No | No |
| **Admin Users** | View | Yes | No | No | No |
| | Create | Yes | No | No | No |
| | Manage | Yes | No | No | No |
| **Settings** | View | Yes | Yes | No | No |
| | Edit | Yes | No | No | No |
| **Analytics** | View | Yes | Yes | Yes | Yes |
| **Activity Logs** | View | Yes | Yes | No | No |

### Middleware Implementation

```typescript
// lib/admin/permissions.ts

type Permission = 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'export' | 'import' | 'manage';
type Resource = 'colleges' | 'courses' | 'exams' | 'news' | 'study-abroad'
  | 'enquiries' | 'newsletter' | 'users' | 'admins' | 'settings' | 'analytics' | 'logs';

function hasPermission(role: AdminRole, resource: Resource, action: Permission): boolean {
  // Permission check logic based on matrix above
}

// Middleware for API routes
function requirePermission(resource: Resource, action: Permission) {
  return async (req: NextRequest) => {
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) return unauthorized();
    if (!hasPermission(admin.role, resource, action)) return forbidden();
    return null; // Allowed
  };
}
```

---

## 18. Security Considerations

### 18.1 Authentication Security

| Measure | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with 12 salt rounds |
| JWT Tokens | Access token (24h) + Refresh token (7d) |
| Token Storage | HTTP-only, Secure, SameSite=Strict cookies |
| CSRF Protection | Next.js built-in CSRF tokens |
| Rate Limiting | 5 login attempts per 15min per IP |
| Account Lockout | 5 failed attempts = 30min lock |
| Session Invalidation | Server-side session store (Redis) |

### 18.2 API Security

| Measure | Implementation |
|---------|---------------|
| Input Validation | Zod schemas on all API inputs |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS Prevention | React auto-escaping + sanitize-html for rich text |
| File Upload | Type validation, size limits, virus scan |
| CORS | Restrict to same-origin only |
| Request Size Limit | 10MB max payload |
| Audit Logging | Log all admin actions with IP, timestamp, details |

### 18.3 Data Security

| Measure | Implementation |
|---------|---------------|
| Soft Deletes | Never hard-delete, mark as inactive |
| Data Backup | Automated daily PostgreSQL backups |
| Encryption at Rest | PostgreSQL TDE (if supported) |
| Encryption in Transit | HTTPS everywhere (TLS 1.3) |
| PII Protection | Encrypt sensitive user data fields |
| Export Controls | Only authorized roles can export data |

### 18.4 Infrastructure Security

| Measure | Implementation |
|---------|---------------|
| Environment Variables | All secrets in .env (never committed) |
| Dependency Audit | `npm audit` in CI pipeline |
| CSP Headers | Strict Content Security Policy |
| Security Headers | X-Frame-Options, X-Content-Type-Options, etc. |

---

## 19. Deployment & Environment Variables

### 19.1 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/mayra_international

# Redis (Session Store & Cache)
REDIS_URL=redis://host:6379

# Admin Auth
ADMIN_JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
ADMIN_SESSION_EXPIRY=86400        # 24 hours in seconds
ADMIN_REFRESH_EXPIRY=604800       # 7 days in seconds

# Email (for admin notifications & password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=admin@mayrainternational.com
SMTP_PASS=email-password
EMAIL_FROM=noreply@mayrainternational.com

# File Upload (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
R2_BUCKET_NAME=mayra-uploads
R2_PUBLIC_URL=https://cdn.mayrainternational.com

# Google OAuth (optional for admin)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# App
NEXT_PUBLIC_APP_URL=https://mayrainternational.com
NEXT_PUBLIC_ADMIN_URL=https://mayrainternational.com/admin
NODE_ENV=production
```

### 19.2 Database Migration Steps

```bash
# 1. Add new models to prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add_admin_portal_models

# 3. Seed initial SUPER_ADMIN
npx prisma db seed

# 4. Migrate static data to database
# Run: POST /api/admin/seed (authenticated as SUPER_ADMIN)
```

### 19.3 Seed Script

```typescript
// prisma/seed-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@2026!', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@mayrainternational.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@mayrainternational.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Super Admin seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 20. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Priority | Description |
|------|----------|-------------|
| Database Schema | HIGH | Add all new Prisma models, run migrations |
| Admin Auth | HIGH | Login, registration, JWT, middleware |
| Admin Layout | HIGH | Sidebar, header, responsive shell |
| Admin Dashboard | HIGH | Overview page with stat cards |
| RBAC System | HIGH | Permission checks on all routes |

**Deliverables:** Working admin login, dashboard, and protected routes.

### Phase 2: Core CRUD (Week 3-5)

| Task | Priority | Description |
|------|----------|-------------|
| College CRUD | HIGH | List, Create, Edit, Delete, Bulk actions |
| Course CRUD | HIGH | List, Create, Edit, Delete |
| Exam CRUD | HIGH | List, Create, Edit, Delete, Syllabus builder |
| News CRUD | HIGH | List, Create, Edit, Delete, Rich text editor |
| Study Abroad CRUD | MEDIUM | List, Create, Edit, Delete |
| Data Migration | HIGH | Move static data files to database |

**Deliverables:** Full CRUD for all content entities.

### Phase 3: User & Enquiry Management (Week 6-7)

| Task | Priority | Description |
|------|----------|-------------|
| User Management | MEDIUM | User list, details, activate/deactivate |
| Enquiry System | HIGH | Enquiry list, detail, response, email |
| Newsletter Mgmt | MEDIUM | Subscriber list, export |
| Activity Logging | MEDIUM | Log all admin actions |
| Admin User Mgmt | MEDIUM | SUPER_ADMIN can manage other admins |

**Deliverables:** Complete user and enquiry management.

### Phase 4: Analytics & Polish (Week 8-9)

| Task | Priority | Description |
|------|----------|-------------|
| Analytics Dashboard | MEDIUM | Charts, metrics, content performance |
| Search Analytics | LOW | Top queries, no-result queries |
| CSV Export/Import | MEDIUM | Bulk data operations |
| Dark Mode | LOW | Theme toggle with persistence |
| Performance | MEDIUM | Pagination optimization, caching |
| Testing | HIGH | E2E tests for critical flows |

**Deliverables:** Analytics, data operations, polished UI.

### Phase 5: Advanced Features (Week 10+)

| Task | Priority | Description |
|------|----------|-------------|
| Email Templates | MEDIUM | Welcome, enquiry response, password reset |
| Notification System | LOW | Real-time admin notifications |
| Audit Trail | MEDIUM | Detailed change history per entity |
| Image Management | MEDIUM | Gallery, R2 upload, optimization |
| SEO Settings | LOW | Meta tags, sitemap config from admin |
| Scheduled Publishing | LOW | Schedule articles for future publish |

---

## Appendix A: Zod Validation Schemas

```typescript
// types/admin.ts

import { z } from 'zod';

// Admin Login
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Admin Registration
export const adminRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// College Form
export const collegeFormSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['Government', 'Private', 'Deemed', 'Autonomous']),
  established: z.number().min(1800).max(new Date().getFullYear()),
  city: z.string().min(1).max(100),
  state: z.string().min(1),
  address: z.string().min(1).max(500),
  countryCode: z.string().default('IN'),
  streams: z.array(z.string()).min(1, 'Select at least one stream'),
  nirfRank: z.number().min(1).max(1000).nullable().optional(),
  rating: z.number().min(0).max(5).default(4.0),
  reviewCount: z.number().min(0).default(50),
  feesMin: z.number().min(0),
  feesMax: z.number().min(0),
  avgPackage: z.number().min(0).nullable().optional(),
  topPackage: z.number().min(0).nullable().optional(),
  placementRate: z.number().min(0).max(100).nullable().optional(),
  accreditation: z.array(z.string()).optional(),
  courses: z.array(z.string()).optional(),
  description: z.string().max(5000).optional(),
  highlights: z.array(z.string()).optional(),
  website: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
  totalStudents: z.number().nullable().optional(),
  faculty: z.number().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isFeatured: z.boolean().default(false),
}).refine(data => data.feesMax >= data.feesMin, {
  message: 'Max fees must be >= min fees',
  path: ['feesMax'],
});

// Course Form
export const courseFormSchema = z.object({
  name: z.string().min(2).max(200),
  stream: z.string().min(1),
  level: z.enum(['UG', 'PG', 'Diploma', 'Certificate', 'PhD']),
  duration: z.string().min(1),
  description: z.string().max(5000).optional(),
  topColleges: z.number().min(0).default(10),
  avgFees: z.number().min(0),
  avgSalary: z.number().min(0).nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
});

// Exam Form
export const examFormSchema = z.object({
  name: z.string().min(2).max(100),
  fullName: z.string().min(5).max(300),
  conductingBody: z.string().min(1).max(200),
  level: z.enum(['UG', 'PG', 'PhD', 'Diploma']),
  streams: z.array(z.string()).min(1),
  mode: z.enum(['Online', 'Offline', 'Both']),
  frequency: z.enum(['Annual', 'Biannual', 'Monthly', 'As Scheduled']),
  registrationStart: z.string().nullable().optional(),
  registrationEnd: z.string().nullable().optional(),
  examDate: z.string().nullable().optional(),
  resultDate: z.string().nullable().optional(),
  applicationFeeGeneral: z.number().min(0),
  applicationFeeSCST: z.number().min(0).nullable().optional(),
  totalSeats: z.number().nullable().optional(),
  participatingColleges: z.number().nullable().optional(),
  eligibility: z.string().max(3000).optional(),
  description: z.string().max(5000).optional(),
  syllabus: z.array(z.object({
    section: z.string().min(1),
    topics: z.array(z.string().min(1)).min(1),
  })).optional(),
  isFeatured: z.boolean().default(false),
});

// News Article Form
export const newsFormSchema = z.object({
  title: z.string().min(10).max(300),
  category: z.enum([
    'Exams', 'Rankings', 'Admissions', 'Policy Updates',
    'News', 'Scholarships', 'Study Abroad', 'Career'
  ]),
  summary: z.string().min(1).max(500),
  content: z.string().min(100).max(50000),
  author: z.string().max(100).default('Editorial Team'),
  publishedAt: z.string(),
  imageColor: z.string().default('#3B82F6'),
  tags: z.array(z.string()).max(10).optional(),
  isLive: z.boolean().default(false),
});

// Enquiry Response
export const enquiryResponseSchema = z.object({
  response: z.string().min(10).max(5000),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESPONDED', 'CLOSED', 'SPAM']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  notes: z.string().max(2000).optional(),
});
```

---

## Appendix B: Key React Query Hooks Pattern

```typescript
// hooks/admin/useAdminColleges.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CollegeFilters {
  page?: number;
  limit?: number;
  search?: string;
  stream?: string;
  type?: string;
  state?: string;
  featured?: boolean;
}

export function useAdminColleges(filters: CollegeFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'colleges', filters],
    queryFn: () => fetchAdminColleges(filters),
  });
}

export function useAdminCollege(id: string) {
  return useQuery({
    queryKey: ['admin', 'colleges', id],
    queryFn: () => fetchAdminCollege(id),
    enabled: !!id,
  });
}

export function useCreateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges'] });
    },
  });
}

export function useUpdateCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollegeFormData }) =>
      updateCollege(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges', id] });
    },
  });
}

export function useDeleteCollege() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges'] });
    },
  });
}
```

---

## Appendix C: Admin Middleware Pattern

```typescript
// lib/admin/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './auth';
import { hasPermission, Resource, Permission } from './permissions';

export function withAdminAuth(
  handler: (req: NextRequest, admin: AdminPayload) => Promise<NextResponse>,
  resource?: Resource,
  action?: Permission
) {
  return async (req: NextRequest) => {
    // 1. Extract token from cookies
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // 2. Verify JWT
    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }

    // 3. Check account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Account deactivated' } },
        { status: 403 }
      );
    }

    // 4. Check permissions (if resource and action specified)
    if (resource && action && !hasPermission(admin.role, resource, action)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    // 5. Execute handler
    return handler(req, admin);
  };
}
```

---

## Summary

This document provides a complete blueprint for building the Mayra International Admin Portal. It covers:

- **4 core entities** (Colleges, Courses, Exams, News) with full CRUD
- **2 additional entities** (Study Abroad, Enquiries) with management
- **3 user-facing modules** (Users, Newsletter, Admin Users)
- **50+ API endpoints** with full specifications
- **70+ pages/components** with wireframes
- **4 admin roles** with detailed permission matrix
- **5 implementation phases** with prioritized tasks
- **Complete Prisma schemas**, Zod validation, and React Query patterns
- **Security, deployment, and environment configuration**

Every field, every validation rule, every API endpoint, and every UI component has been specified to enable a development team to implement this admin portal with minimal ambiguity.

---

*Document created for Mayra International Education Portal by Admin Portal Architecture Team.*
