"use client";

import Link from "next/link";
import { ArrowRight, Clock, Eye, Tag } from "lucide-react";
import { Badge } from "../ui/badge";
import { LiveBadge } from "../shared/LiveBadge";
import { news } from "../../data/news";
import { formatDate, getReadTime, truncate } from "../../lib/utils";

const liveArticle = news.find((n) => n.isLive);
const featuredArticle = news[3]; // CAT results
const sideArticles = news.slice(0, 4).filter((n) => n.id !== featuredArticle.id);

function NewsCard({
  article,
  variant = "default",
}: {
  article: (typeof news)[0];
  variant?: "default" | "featured" | "horizontal";
}) {
  if (variant === "featured") {
    return (
      <article className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div
          className={`h-48 bg-gradient-to-br ${article.imageColor} relative overflow-hidden flex-shrink-0`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {article.category}
            </Badge>
            {article.isLive && <LiveBadge />}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 text-white/80 text-xs mb-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getReadTime(article.content)} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views
                  ? `${(article.views / 1000).toFixed(0)}K views`
                  : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <Link href={`/news/${article.slug}`}>
            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-600 transition-colors mb-2 line-clamp-3">
              {article.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
            {article.summary}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>By {article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div
        className={`h-16 w-16 rounded-xl bg-gradient-to-br ${article.imageColor} flex-shrink-0`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs py-0">
            {article.category}
          </Badge>
          {article.isLive && <LiveBadge size="sm" />}
        </div>
        <Link href={`/news/${article.slug}`}>
          <h4 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
            {article.title}
          </h4>
        </Link>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span>{formatDate(article.publishedAt)}</span>
          <span>{getReadTime(article.content)} min read</span>
        </div>
      </div>
    </article>
  );
}

export function NewsSection() {
  const tickerNews = news.slice(0, 10);

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Latest News & Updates
              </h2>
              {liveArticle && <LiveBadge />}
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              Stay updated with latest exam dates, results, and education news
            </p>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap ml-4 mt-1"
          >
            View All News
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* News Ticker */}
        <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl p-3 mb-8 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold flex-shrink-0">
            <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
            LATEST
          </div>
          <div className="ticker-wrap flex-1 overflow-hidden">
            <div className="ticker-content">
              {[...tickerNews, ...tickerNews].map((article, idx) => (
                <Link
                  key={`${article.id}-${idx}`}
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center gap-2 mr-12 text-sm text-gray-700 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <Tag className="h-3 w-3 text-primary-400 flex-shrink-0" />
                  {truncate(article.title, 80)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Article */}
          <div className="lg:col-span-1">
            <NewsCard article={featuredArticle} variant="featured" />
          </div>

          {/* Side Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">
                  Top Stories
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {news.slice(0, 6).map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <Link
                  href="/news"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all {news.length} articles
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
