interface LeadData {
  id: string;
  source: string;
  fullName: string;
  email?: string | null;
  phone: string;
  city?: string | null;
  state?: string | null;
  currentClass?: string | null;
  courseInterested?: string | null;
  message?: string | null;
  createdAt: Date | string;
}

export function adminNotificationHtml(lead: LeadData): string {
  const sourceLabel = lead.source === "INQUIRY" ? "Inquiry Form" : "Free Counselling Form";
  const date = new Date(lead.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">New Lead Received</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Source: ${sourceLabel}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f3;">
              <span style="display:inline-block;width:140px;color:#6b7280;font-size:13px;">Name</span>
              <strong style="color:#111827;font-size:14px;">${escapeHtml(lead.fullName)}</strong>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f3;">
              <span style="display:inline-block;width:140px;color:#6b7280;font-size:13px;">Email</span>
              <span style="color:#111827;font-size:14px;">${lead.email ? escapeHtml(lead.email) : "Not provided"}</span>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f3;">
              <span style="display:inline-block;width:140px;color:#6b7280;font-size:13px;">Phone</span>
              <span style="color:#111827;font-size:14px;">${escapeHtml(lead.phone)}</span>
            </td></tr>
            ${lead.city || lead.state ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f3;">
              <span style="display:inline-block;width:140px;color:#6b7280;font-size:13px;">Location</span>
              <span style="color:#111827;font-size:14px;">${[lead.city, lead.state].filter((v): v is string => Boolean(v)).map(escapeHtml).join(", ")}</span>
            </td></tr>` : ""}
            ${lead.currentClass ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f3;">
              <span style="display:inline-block;width:140px;color:#6b7280;font-size:13px;">Class / Qualification</span>
              <span style="color:#111827;font-size:14px;">${escapeHtml(lead.currentClass)}</span>
            </td></tr>` : ""}
            ${lead.courseInterested ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f3;">
              <span style="display:inline-block;width:140px;color:#6b7280;font-size:13px;">Course Interest</span>
              <span style="color:#111827;font-size:14px;">${escapeHtml(lead.courseInterested)}</span>
            </td></tr>` : ""}
            ${lead.message ? `<tr><td style="padding:12px 0;">
              <span style="display:block;color:#6b7280;font-size:13px;margin-bottom:6px;">Message</span>
              <div style="background-color:#f9fafb;border-radius:8px;padding:12px 16px;color:#374151;font-size:14px;line-height:1.5;">${escapeHtml(lead.message)}</div>
            </td></tr>` : ""}
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #f0f0f3;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">Lead ID: ${lead.id} &middot; Submitted: ${date}</p>
          <p style="margin:6px 0 0;color:#9ca3af;font-size:11px;">This is an automated notification from Mayra International Admin.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
