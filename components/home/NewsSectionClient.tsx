"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Eye, Tag } from "lucide-react";
import { Badge } from "../ui/badge";
import { LiveBadge } from "../shared/LiveBadge";
import { cn, formatDate, getReadTime, truncate } from "../../lib/utils";

type ArticleData = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  publishedAt: string;
  imageColor: string;
  author: string;
  isLive: boolean;
  tags: string[];
  views: number | null;
};

function NewsCard({ article, variant = "default" }: { article: ArticleData; variant?: "default" | "featured" }) {
  if (variant === "featured") {
    return (
      <article className="group card-premium overflow-hidden h-full flex flex-col">
        <div className={`h-52 bg-gradient-to-br ${article.imageColor} relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800 backdrop-blur-sm">{article.category}</Badge>
            {article.isLive && <LiveBadge />}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 text-white/80 text-xs">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{getReadTime(article.content)} min read</span>
              {article.views && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(article.views / 1000).toFixed(0)}K views</span>}
            </div>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <Link href={`/news/${article.slug}`}>
            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-indigo-600 transition-colors mb-2.5 line-clamp-3 tracking-tight">{article.title}</h3>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{article.summary}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100/50">
            <span className="font-medium">By {article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-4 p-4 rounded-xl hover:bg-indigo-50/30 transition-all duration-300 border border-transparent hover:border-indigo-100/30">
      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${article.imageColor} flex-shrink-0 shadow-sm`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="secondary" className="text-xs py-0">{article.category}</Badge>
          {article.isLive && <LiveBadge size="sm" />}
        </div>
        <Link href={`/news/${article.slug}`}>
          <h4 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 tracking-tight">{article.title}</h4>
        </Link>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{formatDate(article.publishedAt)}</span>
          <span>{getReadTime(article.content)} min read</span>
        </div>
      </div>
    </article>
  );
}

type Props = {
  articles: ArticleData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function NewsSectionClient({ articles, title, subtitle, ctaLabel, ctaLink }: Props) {
  const liveArticle = articles.find((n) => n.isLive);
  const featuredArticle = articles[0];
  const tickerNews = articles.slice(0, 10);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-white relative" ref={ref}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
              {liveArticle && <LiveBadge />}
            </div>
            <p className="text-gray-500 text-sm sm:text-base">{subtitle}</p>
          </div>
          <Link href={ctaLink} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all duration-300 whitespace-nowrap group flex-shrink-0">
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* News Ticker */}
        {tickerNews.length > 0 && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50/50 border border-indigo-100/50 rounded-2xl p-3.5 mb-10 overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold flex-shrink-0 shadow-sm">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
              LATEST
            </div>
            <div className="ticker-wrap flex-1 overflow-hidden">
              <div className="ticker-content">
                {[...tickerNews, ...tickerNews].map((article, idx) => (
                  <Link
                    key={`${article.id}-${idx}`}
                    href={`/news/${article.slug}`}
                    className="inline-flex items-center gap-2 mr-12 text-sm text-gray-700 hover:text-indigo-600 transition-colors whitespace-nowrap font-medium"
                  >
                    <Tag className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                    {truncate(article.title, 80)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        {articles.length > 0 && (
          <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", revealed && "revealed")}>
            <div className="lg:col-span-1">
              {featuredArticle && <NewsCard article={featuredArticle} variant="featured" />}
            </div>
            <div className="lg:col-span-2">
              <div className="card-premium overflow-hidden h-full flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100/50">
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Top Stories</h3>
                </div>
                <div className="divide-y divide-gray-50 flex-1">
                  {articles.slice(0, 6).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100/50">
                  <Link href={ctaLink} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 group">
                    View all articles
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
