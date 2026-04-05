import { NextRequest, NextResponse } from "next/server";
import { createLeadFromForm } from "@/lib/lead-service";
import { prisma } from "@/lib/db";
import { validateBotProtection } from "@/lib/bot-protection";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const count = await prisma.lead.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    return NextResponse.json({ count }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const botError = validateBotProtection(body);
    if (botError) {
      return NextResponse.json(
        { success: false, error: { code: "BOT_DETECTED", message: botError } },
        { status: 422 }
      );
    }

    const result = await createLeadFromForm(body, "INQUIRY");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error, details: result.details } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Inquiry submission error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}
