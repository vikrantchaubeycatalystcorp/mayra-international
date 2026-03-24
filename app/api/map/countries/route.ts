import { NextResponse } from "next/server";
import { worldCollegeStats } from "../../../../data/worldCollegeStats";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(worldCollegeStats);
}
