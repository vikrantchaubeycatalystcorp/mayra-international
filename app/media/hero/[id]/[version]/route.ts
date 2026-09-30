import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

// Admin-uploaded hero images are stored inline as base64 data: URLs. Rendering
// them straight into the page put ~350 KB of base64 into <head> (as an image
// preload) and repeated it in the RSC payload, pushing the favicon <link> tags
// so deep that Google never picked them up. Serve the bytes from a real URL
// instead. `version` is the banner's updatedAt, so a new upload gets a new URL
// and the response can be cached as immutable.

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const DATA_URL_RE = /^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=\s]+)$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id, version } = await params;
  if (!/^[a-z0-9]{1,40}$/i.test(id) || !/^\d{1,16}$/.test(version)) {
    return new NextResponse(null, { status: 404 });
  }

  const banner = await prisma.heroBanner.findUnique({
    where: { id },
    select: { bgImage: true, updatedAt: true },
  });
  const match = banner?.bgImage?.match(DATA_URL_RE);
  if (!banner || !match || !ALLOWED_TYPES.has(match[1])) {
    return new NextResponse(null, { status: 404 });
  }

  // A stale version still gets the current image, but only briefly cached.
  const current = String(banner.updatedAt.getTime()) === version;
  const body = Buffer.from(match[2], "base64");

  return new NextResponse(body, {
    headers: {
      "Content-Type": match[1],
      "Content-Length": String(body.length),
      "Cache-Control": current
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
