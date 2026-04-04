/**
 * Migration script to add imageUrl to existing news articles in the database.
 * Run with: node prisma/migrate-news-images.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Category-based fallback images
const categoryImages = {
  "Exams": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  "Results": "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80",
  "Rankings": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
  "Admissions": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
  "Policy": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
  "Scholarships": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
  "Placements": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
  "Careers": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
  "Study Abroad": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  "School": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "Courses": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
  "General": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  "News": "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80",
};

// Specific images for featured articles
const specificImages = {
  "jee-main-2026-registration": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
  "nirf-2025-rankings": "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80",
  "neet-ug-2026-exam-date": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  "cat-2025-result": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  "iit-cutoff-2025": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
  "ugc-new-education-policy": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
  "gate-2026-registration": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
  "study-abroad-india-us": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
  "iit-placement-2025": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
  "clat-2025-analysis": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  "scholarship-pm-vidyalaxmi": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  "iim-live-gdpi": "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80",
  "nta-reform-2025": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  "engineering-jobs-2025": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
  "cbse-board-exam-2026": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "cuet-2026-new-features": "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
  "iit-new-courses-2026": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  "top-mba-salary-2025": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  "state-board-reform": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  "google-microsoft-hiring-india": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
};

async function main() {
  console.log("Updating news articles with imageUrl...\n");

  const articles = await prisma.newsArticle.findMany({
    where: { imageUrl: null },
    select: { id: true, slug: true, category: true },
  });

  console.log(`Found ${articles.length} articles without imageUrl\n`);

  let updated = 0;
  for (const article of articles) {
    const imageUrl =
      specificImages[article.slug] ||
      categoryImages[article.category] ||
      categoryImages["General"];

    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { imageUrl },
    });
    updated++;
  }

  console.log(`Updated ${updated} articles with imageUrl`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
