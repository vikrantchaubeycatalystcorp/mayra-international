import { prisma } from "./db";
import { processLeadEmails } from "./email-service";
import { leadSubmitSchema } from "@/types/admin";

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
      rawPayload: body as object,
      adminEmailStatus: "PENDING",
      studentEmailStatus: "PENDING",
      status: "NEW",
    },
  });

  if (lead.id) {
    processLeadEmails(lead.id).catch((err) =>
      console.error("Lead email processing failed:", err)
    );
  }

  return { success: true };
}
