import { prisma } from "./db";
import { processLeadEmails } from "./email-service";
import { leadSubmitSchema } from "@/types/admin";
import { createAdminNotification } from "./admin/notify";

interface CreateLeadResult {
  success: boolean;
  error?: string;
  details?: { field: string; message: string }[];
}

export async function createLeadFromForm(
  body: unknown,
  source: "INQUIRY" | "FREE_COUNSELLING"
): Promise<CreateLeadResult> {
  const parsed = leadSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      details: parsed.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  const data = parsed.data;

  // Store only the validated fields as raw payload (not the unvalidated body)
  const safePayload = {
    name: data.name,
    email: data.email || null,
    phone: data.phone,
    city: data.city || null,
    state: data.state || null,
    currentClass: data.currentClass || null,
    courseInterest: data.courseInterest || null,
    message: data.message || null,
  };

  const lead = await prisma.lead.create({
    data: {
      source,
      fullName: data.name,
      email: data.email || null,
      phone: data.phone,
      city: data.city || null,
      state: data.state || null,
      currentClass: data.currentClass || null,
      courseInterested: data.courseInterest || null,
      message: data.message || null,
      rawPayload: safePayload,
      adminEmailStatus: "PENDING",
      studentEmailStatus: "PENDING",
      status: "NEW",
    },
  });

  if (lead.id) {
    processLeadEmails(lead.id).catch((err) =>
      console.error("Lead email processing failed:", err)
    );

    const notifTitle = source === "INQUIRY" ? "New enquiry received" : "New counselling request";
    const notifMessage = `${data.name} ${source === "INQUIRY" ? "enquired" : "requested free counselling"}${data.courseInterest ? ` about ${data.courseInterest}` : ""}`;
    createAdminNotification({
      type: "enquiry",
      title: notifTitle,
      message: notifMessage,
      entityType: "Lead",
      entityId: lead.id,
    }).catch(() => {});
  }

  return { success: true };
}
