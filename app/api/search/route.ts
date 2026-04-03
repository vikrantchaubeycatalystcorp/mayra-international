import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q     = searchParams.get("q") || "";
  const type  = searchParams.get("type") || "all";
  const limit = Math.min(20, parseInt(searchParams.get("limit") || "10", 10));

  const hasQuery = q.trim().length > 0;
  const query = q.trim();

  // Multi-field search filters
  const collegeWhere = hasQuery
    ? {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { city: { contains: query, mode: "insensitive" as const } },
          { state: { contains: query, mode: "insensitive" as const } },
          { streams: { has: query } },
          { type: { contains: query, mode: "insensitive" as const } },
          { courses: { has: query } },
          { description: { contains: query, mode: "insensitive" as const } },
          { accreditation: { has: query } },
        ],
      }
    : { isFeatured: true, isActive: true };

  const examWhere = hasQuery
    ? {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { fullName: { contains: query, mode: "insensitive" as const } },
          { conductingBody: { contains: query, mode: "insensitive" as const } },
          { streams: { has: query } },
          { level: { contains: query, mode: "insensitive" as const } },
          { mode: { contains: query, mode: "insensitive" as const } },
          { eligibility: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isFeatured: true, isActive: true };

  const courseWhere = hasQuery
    ? {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { stream: { contains: query, mode: "insensitive" as const } },
          { level: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isFeatured: true, isActive: true };

  const articleWhere = hasQuery
    ? {
        isActive: true,
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { category: { contains: query, mode: "insensitive" as const } },
          { summary: { contains: query, mode: "insensitive" as const } },
          { content: { contains: query, mode: "insensitive" as const } },
          { tags: { has: query } },
          { author: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isActive: true };

  // Quick links / pages that students can navigate to
  const quickLinks = [
    { id: "ql-colleges", title: "Browse Colleges", description: "Explore 25,000+ colleges across India", href: "/colleges", category: "page", icon: "GraduationCap" },
    { id: "ql-exams", title: "Entrance Exams", description: "Find exam dates, eligibility & registration", href: "/exams", category: "page", icon: "FileText" },
    { id: "ql-courses", title: "Explore Courses", description: "Browse 800+ courses across all streams", href: "/courses", category: "page", icon: "BookOpen" },
    { id: "ql-news", title: "Latest News & Articles", description: "Education news, updates & articles", href: "/news", category: "page", icon: "Newspaper" },
    { id: "ql-compare", title: "Compare Colleges", description: "Side-by-side college comparison tool", href: "/compare", category: "page", icon: "Scale" },
    { id: "ql-study-abroad", title: "Study Abroad", description: "Explore international education options", href: "/study-abroad", category: "page", icon: "Globe" },
    { id: "ql-resume", title: "Resume Builder", description: "Create a professional resume for college applications", href: "/resume-builder", category: "page", icon: "FileText" },
    { id: "ql-map", title: "College Map", description: "Find colleges near you on the map", href: "/map", category: "page", icon: "MapPin" },
    { id: "ql-contact", title: "Contact Us", description: "Get in touch with our counselors", href: "/contact", category: "page", icon: "Phone" },
    { id: "ql-dashboard", title: "My Dashboard", description: "View your saved colleges & applications", href: "/dashboard", category: "page", icon: "LayoutDashboard" },
    { id: "ql-saved", title: "Saved Colleges", description: "View your shortlisted colleges", href: "/dashboard/saved", category: "page", icon: "Heart" },
    { id: "ql-enquiries", title: "My Enquiries", description: "Track your college application enquiries", href: "/dashboard/enquiries", category: "page", icon: "MessageSquare" },
    // Stream-specific shortcuts
    { id: "ql-engineering", title: "Engineering Colleges", description: "Top B.Tech & engineering colleges in India", href: "/colleges?streams=Engineering", category: "shortcut", icon: "Cpu" },
    { id: "ql-medical", title: "Medical Colleges", description: "Top MBBS & medical colleges in India", href: "/colleges?streams=Medical", category: "shortcut", icon: "Stethoscope" },
    { id: "ql-management", title: "MBA & Management Colleges", description: "Top MBA & business schools in India", href: "/colleges?streams=Management", category: "shortcut", icon: "Briefcase" },
    { id: "ql-law", title: "Law Colleges", description: "Top LLB & law colleges in India", href: "/colleges?streams=Law", category: "shortcut", icon: "Scale" },
    { id: "ql-science", title: "Science Colleges", description: "Top B.Sc & science colleges in India", href: "/colleges?streams=Science", category: "shortcut", icon: "FlaskConical" },
    { id: "ql-arts", title: "Arts & Humanities Colleges", description: "Top B.A. & arts colleges in India", href: "/colleges?streams=Arts", category: "shortcut", icon: "BookOpen" },
    { id: "ql-commerce", title: "Commerce Colleges", description: "Top B.Com & commerce colleges in India", href: "/colleges?streams=Commerce", category: "shortcut", icon: "BarChart3" },
    // Exam shortcuts
    { id: "ql-jee", title: "JEE Main 2026", description: "Joint Entrance Examination for engineering", href: "/exams/jee-main", category: "shortcut", icon: "Trophy" },
    { id: "ql-neet", title: "NEET UG 2026", description: "National Eligibility Entrance Test for medical", href: "/exams/neet-ug", category: "shortcut", icon: "Stethoscope" },
    { id: "ql-cat", title: "CAT 2025", description: "Common Admission Test for MBA", href: "/exams/cat", category: "shortcut", icon: "Briefcase" },
    { id: "ql-gate", title: "GATE 2026", description: "Graduate Aptitude Test in Engineering", href: "/exams/gate", category: "shortcut", icon: "Cpu" },
  ];

  // Filter quick links by query
  const filteredQuickLinks = hasQuery
    ? quickLinks.filter((link) => {
        const searchText = `${link.title} ${link.description}`.toLowerCase();
        const queryLower = query.toLowerCase();
        // Match if any word in the query appears in the link
        return queryLower.split(/\s+/).some((word) => searchText.includes(word));
      })
    : [];

  const [colleges, exams, courses, articles] = await Promise.all([
    type === "all" || type === "colleges"
      ? prisma.college.findMany({
          where: collegeWhere,
          select: {
            id: true, name: true, slug: true, city: true, state: true,
            nirfRank: true, isFeatured: true, type: true, streams: true,
            rating: true, feesMin: true, feesMax: true,
          },
          take: limit,
          orderBy: hasQuery ? { viewCount: "desc" } : { nirfRank: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "exams"
      ? prisma.exam.findMany({
          where: examWhere,
          select: {
            id: true, name: true, slug: true, fullName: true,
            conductingBody: true, isFeatured: true, examDate: true,
            level: true, streams: true,
          },
          take: limit,
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "courses"
      ? prisma.course.findMany({
          where: courseWhere,
          select: {
            id: true, name: true, slug: true, level: true,
            duration: true, isFeatured: true, stream: true,
            avgFees: true, avgSalary: true,
          },
          take: limit,
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    type === "all" || type === "articles"
      ? prisma.newsArticle.findMany({
          where: articleWhere,
          select: {
            id: true, title: true, slug: true, category: true,
            imageColor: true, summary: true, publishedAt: true,
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    colleges,
    exams,
    courses,
    articles,
    quickLinks: filteredQuickLinks.slice(0, 5),
    query: query,
    total: colleges.length + exams.length + courses.length + articles.length + filteredQuickLinks.length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const q = typeof body.query === "string" ? body.query.slice(0, 200) : "";
  const url = new URL(req.url);
  url.searchParams.set("q", q);
  return GET(new NextRequest(url, { method: "GET" }));
}
