import { NextResponse } from "next/server";
import { colleges } from "../../../../data/colleges";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("countryCode");
  const bbox = searchParams.get("bbox");

  let filtered = colleges.filter(c => c.latitude && c.longitude);

  if (countryCode) {
    filtered = filtered.filter(c => c.countryCode === countryCode);
  }

  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(Number);
    filtered = filtered.filter(c =>
      c.longitude! >= minLng && c.longitude! <= maxLng &&
      c.latitude! >= minLat && c.latitude! <= maxLat
    );
  }

  return NextResponse.json(filtered.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    city: c.city,
    state: c.state,
    latitude: c.latitude,
    longitude: c.longitude,
    countryCode: c.countryCode,
    countryName: c.countryName,
    nirfRank: c.nirfRank,
    rating: c.rating,
    fees: c.fees,
    streams: c.streams,
    type: c.type,
    accreditation: c.accreditation,
  })));
}
