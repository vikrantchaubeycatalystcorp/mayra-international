import nodemailer from "nodemailer";
import { prisma } from "./db";
import { adminNotificationHtml } from "@/emails/AdminNotification";
import { studentConfirmationHtml } from "@/emails/EnquiryConfirmation";

interface EmailConfig {
  toEmail: string;
  fromEmail: string;
  replyToEmail?: string;
  emailEnabled: boolean;
  studentAutoReplyEnabled: boolean;
}

export async function getEmailConfig(): Promise<EmailConfig | null> {
  const settings = await prisma.siteSetting.findMany({
    where: { group: "email" },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));
  const toEmail = map.get("email.toEmail");
  const fromEmail = map.get("email.fromEmail");

  if (!toEmail || !fromEmail) return null;

  return {
    toEmail,
    fromEmail,
    replyToEmail: map.get("email.replyToEmail") || undefined,
    emailEnabled: map.get("email.emailEnabled") !== "false",
    studentAutoReplyEnabled: map.get("email.studentAutoReplyEnabled") !== "false",
  };
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendEmail(options: {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars." };
  }

  try {
    await transporter.sendMail({
      from: options.from,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("Email send failed:", message);
    return { success: false, error: message };
  }
}

export async function processLeadEmails(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  const config = await getEmailConfig();
  if (!config || !config.emailEnabled) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        adminEmailStatus: "SKIPPED",
        studentEmailStatus: "SKIPPED",
        emailFailureReason: !config ? "Email not configured in Setup" : "Email sending disabled",
      },
    });
    return;
  }

  const sourceLabel = lead.source === "INQUIRY" ? "Inquiry" : "Free Counselling";
  const adminSubject = `New Lead - ${sourceLabel} - ${lead.fullName}`;
  const adminHtml = adminNotificationHtml(lead);

  const adminResult = await sendEmail({
    to: config.toEmail,
    from: config.fromEmail,
    replyTo: config.replyToEmail,
    subject: adminSubject,
    html: adminHtml,
  });

  let studentStatus: "SENT" | "FAILED" | "SKIPPED" = "SKIPPED";
  let failureReason = adminResult.success ? null : adminResult.error || null;

  if (config.studentAutoReplyEnabled && lead.email) {
    const studentHtml = studentConfirmationHtml({
      fullName: lead.fullName,
      courseInterested: lead.courseInterested,
      source: lead.source,
    });

    const studentResult = await sendEmail({
      to: lead.email,
      from: config.fromEmail,
      replyTo: config.replyToEmail,
      subject: "We received your request - Mayra International",
      html: studentHtml,
    });

    studentStatus = studentResult.success ? "SENT" : "FAILED";
    if (!studentResult.success) {
      failureReason = [failureReason, studentResult.error].filter(Boolean).join("; ");
    }
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      adminEmailStatus: adminResult.success ? "SENT" : "FAILED",
      studentEmailStatus: studentStatus,
      emailFailureReason: failureReason,
    },
  });
}
