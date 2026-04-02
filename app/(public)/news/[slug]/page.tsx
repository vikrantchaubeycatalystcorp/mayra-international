import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Eye, Tag, ArrowRight, ArrowLeft, BookOpen, Award, BarChart2, GraduationCap, FileText, Gift, Briefcase, Globe, Newspaper, School } from "lucide-react";
import { prisma } from "../../../../lib/db";
import { Breadcrumb } from "../../../../components/shared/Breadcrumb";
import { Badge } from "../../../../components/ui/badge";
import { ShareButtons } from "../../../../components/shared/ShareButtons";
import { LiveBadge } from "../../../../components/shared/LiveBadge";
import { formatDate, getReadTime } from "../../../../lib/utils";
import { JsonLd, newsArticleJsonLd, breadcrumbJsonLd } from "../../../../lib/seo";

export const revalidate = 60;

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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await prisma.newsArticle.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return articles.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { slug } });
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://mayra.in/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags,
    },
    alternates: {
      canonical: `https://mayra.in/news/${article.slug}`,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { slug } });
  if (!article) notFound();

  const relatedArticles = await prisma.newsArticle.findMany({
    where: {
      isActive: true,
      id: { not: article.id },
      OR: [
        { category: article.category },
        { tags: { hasSome: article.tags } },
      ],
    },
    take: 4,
    orderBy: { publishedAt: "desc" },
  });

  const latestArticles = await prisma.newsArticle.findMany({
    where: { isActive: true },
    take: 5,
    orderBy: { publishedAt: "desc" },
  });

  const CategoryIcon = categoryIconMap[article.category] ?? Newspaper;
  const readTime = getReadTime(article.content);

  // Convert markdown-style content to HTML-ish for display
  const paragraphs = article.content.split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={newsArticleJsonLd(article as any)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "News", url: "/news" },
        { name: article.category },
        { name: article.title },
      ])} />
      <div className="container mx-auto py-8">
        <Breadcrumb
          items={[
            { label: "News", href: "/news" },
            { label: article.category, href: `/news?category=${article.category}` },
            { label: article.title },
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              {/* Hero Image */}
              <div className={`h-64 bg-gradient-to-br ${article.imageColor} relative flex items-center justify-center`}>
                <CategoryIcon className="h-24 w-24 text-white/30" strokeWidth={1} />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {article.category}
                    </Badge>
                    {article.isLive && <LiveBadge />}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {readTime} min read
                  </span>
                  {article.views && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {(article.views / 1000).toFixed(0)}K views
                    </span>
                  )}
                  <span className="font-medium text-gray-700">
                    By {article.author}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4">
                  {article.title}
                </h1>

                <p className="article-summary text-lg text-gray-600 leading-relaxed mb-6 font-medium border-l-4 border-primary-300 pl-4 bg-primary-50/50 py-3 rounded-r-xl">
                  {article.summary}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-blue max-w-none">
                  {paragraphs.map((para, idx) => {
                    if (para.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                          {para.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (para.startsWith("### ")) {
                      return (
                        <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">
                          {para.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (para.startsWith("- ") || para.includes("\n- ")) {
                      const items = para.split("\n").filter((l) => l.startsWith("- "));
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 my-3 text-gray-600">
                          {items.map((item, i) => (
                            <li key={i}>{item.replace("- ", "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (para.includes("|") && para.includes("---")) {
                      return (
                        <div key={idx} className="overflow-x-auto my-4 rounded-xl border border-gray-100">
                          <table className="w-full text-sm">
                            {para.split("\n").filter(l => l.includes("|") && !l.includes("---")).map((row, r) => (
                              <tr key={r} className={r === 0 ? "bg-gray-50 font-semibold" : "border-t border-gray-100"}>
                                {row.split("|").filter(Boolean).map((cell, c) => (
                                  <td key={c} className="px-4 py-2 text-gray-700">{cell.trim()}</td>
                                ))}
                              </tr>
                            ))}
                          </table>
                        </div>
                      );
                    }
                    // Bold formatting
                    const parts = para.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={idx} className="text-gray-600 leading-relaxed my-3">
                        {parts.map((part, i) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={i} className="font-semibold text-gray-800">
                              {part.slice(2, -2)}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  })}
                </div>

                {/* Share */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <ShareButtons title={article.title} />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/news"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to News
                  </Link>
                  {relatedArticles[0] && (
                    <Link
                      href={`/news/${relatedArticles[0].slug}`}
                      className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Next Article
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Related Articles */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Related Articles</h3>
              <div className="space-y-4">
                {relatedArticles.map((a) => {
                  const RelIcon = categoryIconMap[a.category] ?? Newspaper;
                  return (
                  <Link key={a.id} href={`/news/${a.slug}`} className="flex gap-3 group">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${a.imageColor} flex-shrink-0 flex items-center justify-center`}>
                      <RelIcon className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(a.publishedAt)}</p>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Latest Updates</h3>
              <div className="space-y-3">
                {latestArticles.map((a) => (
                  <Link key={a.id} href={`/news/${a.slug}`} className="flex gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0 mt-2" />
                    <p className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                      {a.title}
                    </p>
                  </Link>
                ))}
              </div>
              <Link href="/news" className="flex items-center gap-1 mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700">
                View all news
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
