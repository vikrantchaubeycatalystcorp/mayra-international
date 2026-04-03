import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "This feature is coming soon" } },
    { status: 501 }
  );
}
