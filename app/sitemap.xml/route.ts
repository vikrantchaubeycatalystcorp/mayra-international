import { childSitemapUrl, getSitemapIds, renderSitemapIndex, withSitemapFailureLog } from "../../lib/sitemap";

// Sitemap index at /sitemap.xml (the URL submitted in Search Console), listing /sitemaps/sitemap/[id].xml.
// Regenerated at most every 6 hours. If regeneration throws, the previous cached copy keeps serving.
export const revalidate = 21600;

export async function GET(): Promise<Response> {
  const ids = await withSitemapFailureLog("index", getSitemapIds);
  return new Response(renderSitemapIndex(ids.map(childSitemapUrl)), {
    headers: { "Content-Type": "application/xml" },
  });
}
