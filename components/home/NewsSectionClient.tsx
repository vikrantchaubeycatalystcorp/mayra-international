"use client";

import Link from "next/link";
import { formatDate, getReadTime } from "../../lib/utils";

type ArticleData = {
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
};

function catClass(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("rank")) return "cat-rankings";
  if (c.includes("exam")) return "cat-exams";
  if (c.includes("scholar")) return "cat-scholarships";
  if (c.includes("career") || c.includes("placement")) return "cat-careers";
  return "cat-admissions";
}

type Props = {
  articles: ArticleData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function NewsSectionClient({ articles, title, ctaLink }: Props) {
  if (articles.length === 0) return null;
  const lead = articles[0];
  const rest = articles.slice(1, 5);

  return (
    <section className="news section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">The desk</span>
            <h2 className="h-2" style={{ marginTop: 12 }}>{title}</h2>
          </div>
          <Link className="link-arrow" href={ctaLink}>
            All articles <span className="ar">→</span>
          </Link>
        </div>

        <div className="news-grid">
          <article className="lead-story">
            <div className="lead-cat">
              <span className={`cat-label ${catClass(lead.category)}`}>{lead.category}</span>
              <span className="byline">
                {formatDate(lead.publishedAt)} <span className="divider-dot">·</span> {getReadTime(lead.content)} min read
              </span>
            </div>
            <h2 className="lead-head">
              <Link href={`/news/${lead.slug}`}>{lead.title}</Link>
            </h2>
            {lead.summary && <p className="lead-dek">{lead.summary}</p>}
            <div className="byline">
              <b>By {lead.author}</b>
            </div>
            <div style={{ marginTop: 8 }}>
              <Link className="link-arrow" href={`/news/${lead.slug}`}>
                Read the analysis <span className="ar">→</span>
              </Link>
            </div>
          </article>

          <div className="news-list">
            {rest.map((article) => (
              <article key={article.id} className="news-item">
                <div>
                  <span className={`cat-label ${catClass(article.category)}`}>{article.category}</span>
                </div>
                <h4>
                  <Link href={`/news/${article.slug}`}>{article.title}</Link>
                </h4>
                <div className="meta">
                  {formatDate(article.publishedAt)} <span className="divider-dot">·</span> {getReadTime(article.content)} min read
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
