type Props = { params: Promise<{ slug: string }> };

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <main>Article: {slug}</main>;
}
