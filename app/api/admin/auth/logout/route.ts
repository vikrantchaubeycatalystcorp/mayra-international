import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/admin/auth";

export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ success: true, data: { message: "Logged out" } });
}
