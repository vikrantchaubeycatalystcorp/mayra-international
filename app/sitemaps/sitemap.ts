import type { MetadataRoute } from "next";
import {
  PAGES_SITEMAP_ID,
  buildCollegesSitemap,
  buildPagesSitemap,
  getSitemapIds,
  withSitemapFailureLog,
} from "../../lib/sitemap";

// Child sitemaps served at /sitemaps/sitemap/[id].xml; /sitemap.xml is the index (app/sitemap.xml/route.ts).
// Lives in a subfolder because a root app/sitemap.ts would claim /sitemap.xml itself.
// Regenerated at most every 6 hours. If regeneration throws, the previous cached copy keeps serving.
export const revalidate = 21600;

export async function generateSitemaps() {
  const ids = await withSitemapFailureLog("list shards", getSitemapIds);
  return ids.map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const shard = Number(await props.id);
  return withSitemapFailureLog(`shard ${shard}`, () =>
    shard === PAGES_SITEMAP_ID ? buildPagesSitemap() : buildCollegesSitemap(shard)
  );
}
