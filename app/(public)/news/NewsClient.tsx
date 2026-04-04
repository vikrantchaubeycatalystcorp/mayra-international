"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Clock, Eye, Search, Tag, ArrowRight, ChevronLeft, ChevronRight,
  BookOpen, Award, BarChart2, GraduationCap, FileText, Briefcase, Globe, Newspaper, Gift, School
} from "lucide-react";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { LiveBadge } from "../../../components/shared/LiveBadge";
import { formatDate, getReadTime, truncate } from "../../../lib/utils";
import { cn } from "../../../lib/utils";
import { useMasterData } from "../../../hooks/useMasterData";

const fallbackCategories = ["All", "Exams", "Results", "Rankings", "Admissions", "Policy", "Scholarships", "Placements", "Careers", "Study Abroad", "School"];

const ITEMS_PER_PAGE = 9; // 1 featured + 8 grid

const categoryIconMap: Record<string, React.ElementType> = {
  Exams: BookOpen,
  Results: Award,
  Rankings: BarChart2,
  Admissions: GraduationCap,
  Policy: FileText,
  Scholarships: Gift,
  Placements: Briefcase,
  Careers: BarChart2,
  "Study Abroad": Globe,
  School: School,
};

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  publishedAt: string;
  imageUrl?: string | null;
  imageColor: string;
  author: string;
  isLive: boolean;
  tags: string[];
  views: number | null;
}

function CategoryImage({ category, imageColor, imageUrl, isLive, featured = false, title }: {
  category: string;
  imageColor: string;
  imageUrl?: string | null;
  isLive?: boolean;
  featured?: boolean;
  title?: string;
}) {
  const Icon = categoryIconMap[category] ?? Newspaper;
  return (
    <div className={cn(
      `${imageUrl ? "" : `bg-gradient-to-br ${imageColor}`} flex items-center justify-center relative overflow-hidden`,
      featured ? "lg:w-72 h-48 lg:h-auto flex-shrink-0" : "h-40"
    )}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title || category} className="w-full h-full object-cover" />
      ) : (
        <Icon className="h-14 w-14 text-white/70" strokeWidth={1.5} />
      )}
      {isLive && (
        <div className="absolute top-3 left-3">
          <LiveBadge />
        </div>
      )}
    </div>
  );
}

function NewsCard({ article, featured = false }: { article: NewsItem; featured?: boolean }) {
  return (
    <article className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group",
      featured && "lg:flex"
    )}>
      <CategoryImage
        category={article.category}
        imageColor={article.imageColor}
        imageUrl={article.imageUrl}
        isLive={article.isLive}
        featured={featured}
        title={article.title}
      />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">{article.category}</Badge>
          {article.isLive && <LiveBadge size="sm" />}
        </div>
        <Link href={`/news/${article.slug}`}>
          <h3 className={cn(
            "font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug mb-2",
            featured ? "text-lg" : "text-sm"
          )}>
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2 flex-1">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span>{formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getReadTime(article.content)} min
            </span>
          </div>
          {article.views && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {(article.views / 1000).toFixed(0)}K
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "h-9 w-9 rounded-lg text-sm font-medium border transition-all",
              p === page
                ? "bg-primary-600 text-white border-primary-600"
                : "border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

interface NewsClientProps {
  news: NewsItem[];
  categoryCounts: Record<string, number>;
}

export function NewsClient({ news, categoryCounts }: NewsClientProps) {
  const { data: masterData } = useMasterData();
  const categories = masterData?.newsCategories
    ? ["All", ...masterData.newsCategories.map((c) => c.name)]
    : fallbackCategories;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category]);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || n.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, news]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageArticles = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const featuredArticle = pageArticles[0];
  const remainingArticles = pageArticles.slice(1);

  const trending = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const liveArticles = news.filter((n) => n.isLive);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: "News & Updates" }]} className="mb-4" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">Education News</h1>
                {liveArticles.length > 0 && <LiveBadge />}
              </div>
              <p className="text-gray-500">Latest updates on exams, admissions, rankings, and education policy</p>
            </div>
          </div>
        </div>

        {/* News Ticker */}
        <div className="border-t border-gray-100">
          <div className="container mx-auto py-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold flex-shrink-0">
                <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                LATEST
              </div>
              <div className="ticker-wrap flex-1 overflow-hidden">
                <div className="ticker-content">
                  {[...news.slice(0, 8), ...news.slice(0, 8)].map((article, idx) => (
                    <Link
                      key={`${article.id}-${idx}`}
                      href={`/news/${article.slug}`}
                      className="inline-flex items-center gap-2 mr-12 text-sm text-gray-700 hover:text-primary-600 whitespace-nowrap"
                    >
                      <Tag className="h-3 w-3 text-primary-400" />
                      {truncate(article.title, 70)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            {categories.map((cat) => (
              <button suppressHydrationWarning
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  category === cat
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Featured */}
            {featuredArticle && (
              <NewsCard article={featuredArticle} featured />
            )}

            {/* Grid */}
            {remainingArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {remainingArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                No articles found for your search
              </div>
            )}

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

            {filtered.length > 0 && (
              <p className="text-center text-xs text-gray-400">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} articles
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Trending */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Trending Articles
              </h3>
              <div className="space-y-4">
                {trending.map((article, idx) => (
                  <Link key={article.id} href={`/news/${article.slug}`} className="flex gap-3 group">
                    <span className="text-2xl font-black text-gray-200 leading-none">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(article.publishedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Categories</h3>
              <div className="space-y-2">
                {categories.slice(1).map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  if (!count) return null;
                  return (
                    <button suppressHydrationWarning
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="flex items-center justify-between w-full py-2 hover:text-primary-600 transition-colors text-sm group"
                    >
                      <span className="text-gray-700 group-hover:text-primary-600">{cat}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
