import Link from "next/link";
import { BROWSE_LABELS, browsePath, type BrowseType } from "../../lib/browse";

// Server-rendered link from a hub page to its crawlable A–Z directory.
export function BrowseAllLink({ type }: { type: BrowseType }) {
  const plural = BROWSE_LABELS[type].plural.toLowerCase();
  return (
    <div className="container mx-auto pb-10 text-sm text-gray-600">
      Looking for a specific one?{" "}
      <Link href={browsePath(type, 1)} prefetch={false} className="font-medium text-primary-600 hover:underline">
        Browse all {plural} A–Z
      </Link>
    </div>
  );
}
