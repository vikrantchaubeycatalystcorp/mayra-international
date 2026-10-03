import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";

// Runs outside this segment's loading.tsx boundary, so a missing record returns a
// real 404 status instead of a streamed 200 "soft 404".
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await prisma.newsArticle.findUnique({ where: { slug }, select: { id: true } });
  if (!record) notFound();
  return children;
}
