import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "../../../../lib/seo";
import { notFound } from "next/navigation";
import { getExamBySlug } from "../../../../lib/mock-tests/data";
import { SITE_URL } from "../../../../lib/sitemap";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

// The test page is a client component, so its metadata and the 404 check live here.
export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExamBySlug(slug);
  if (!exam) notFound();
  const url = `${SITE_URL}/mock-tests/${exam.slug}`;
  const title = `${exam.name} — Free Mock Test`;
  const description = exam.description.length > 160 ? `${exam.description.slice(0, 157).trimEnd()}…` : exam.description;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: DEFAULT_OG_IMAGES },
  };
}

export default async function MockTestLayout({ children, params }: Props) {
  const { slug } = await params;
  if (!getExamBySlug(slug)) notFound();
  return children;
}
