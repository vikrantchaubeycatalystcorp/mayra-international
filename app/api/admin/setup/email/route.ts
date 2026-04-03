import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { emailSetupSchema } from "@/types/admin";

const EMAIL_KEYS = [
  { key: "email.toEmail", type: "string" },
  { key: "email.fromEmail", type: "string" },
  { key: "email.replyToEmail", type: "string" },
  { key: "email.emailEnabled", type: "boolean" },
  { key: "email.studentAutoReplyEnabled", type: "boolean" },
] as const;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const settings = await prisma.siteSetting.findMany({
    where: { group: "email" },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));

  const config = {
    toEmail: map.get("email.toEmail") || "",
    fromEmail: map.get("email.fromEmail") || "",
    replyToEmail: map.get("email.replyToEmail") || "",
    emailEnabled: map.get("email.emailEnabled") !== "false",
    studentAutoReplyEnabled: map.get("email.studentAutoReplyEnabled") !== "false",
  };

  return success(config);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = emailSetupSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        "Validation failed",
        parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
      );
    }

    const data = parsed.data;
    const values: Record<string, string> = {
      "email.toEmail": data.toEmail,
      "email.fromEmail": data.fromEmail,
      "email.replyToEmail": data.replyToEmail || "",
      "email.emailEnabled": String(data.emailEnabled),
      "email.studentAutoReplyEnabled": String(data.studentAutoReplyEnabled),
    };

    await Promise.all(
      EMAIL_KEYS.map(({ key, type }) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: values[key], type, group: "email" },
          update: { value: values[key] },
        })
      )
    );

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "EmailSetup",
      details: "Updated email configuration",
    });

    return success(data);
  } catch (error) {
    console.error("Email setup update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
