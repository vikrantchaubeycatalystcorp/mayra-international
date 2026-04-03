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
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.mayrainternational.com").replace(/\/$/, "");
  const logoUrl = `${appUrl}/images/mayra-logo-clean.png`;
  const location = [lead.city, lead.state].filter((v): v is string => Boolean(v)).map(escapeHtml).join(", ");
  const emailValue = lead.email ? escapeHtml(lead.email) : "Not provided";

  const messageBlock = lead.message
    ? `<tr>
        <td style="padding:24px 0 0;">
          <p style="margin:0 0 10px;color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;">Student Message</p>
          <div style="background:#f8fafc;border:1px solid #f1f3f5;border-radius:12px;padding:16px 18px;color:#374151;font-size:14px;line-height:1.7;font-style:italic;">
            &#8220;${escapeHtml(lead.message)}&#8221;
          </div>
        </td>
      </tr>`
    : "";

  const detailRows: string[] = [];

  detailRows.push(makeDetailRow("Full Name", escapeHtml(lead.fullName), true));
  detailRows.push(makeDetailRow("Email Address", lead.email ? `<a href="mailto:${emailValue}" style="color:#1e40af;text-decoration:none;font-weight:500;">${emailValue}</a>` : '<span style="color:#9ca3af;">Not provided</span>'));
  detailRows.push(makeDetailRow("Phone Number", `<a href="tel:${escapeHtml(lead.phone)}" style="color:#1e40af;text-decoration:none;font-weight:500;">${escapeHtml(lead.phone)}</a>`));

  if (location) {
    detailRows.push(makeDetailRow("Location", location));
  }
  if (lead.currentClass) {
    detailRows.push(makeDetailRow("Class / Qualification", escapeHtml(lead.currentClass)));
  }
  if (lead.courseInterested) {
    detailRows.push(makeDetailRow("Course Interest", `<span style="color:#1e40af;font-weight:600;">${escapeHtml(lead.courseInterested)}</span>`));
  }

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>New Lead Alert</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Inter','Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a2e;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#f0f2f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    New lead: ${escapeHtml(lead.fullName)} via ${sourceLabel} on ${date}
    ${"&zwnj;&nbsp;".repeat(30)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

          <!-- Logo + Badge Header -->
          <tr>
            <td style="padding:0 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:12px;">
                          <img src="${logoUrl}" alt="Mayra International" width="40" style="display:block;height:auto;width:40px;max-width:40px;border:0;outline:none;text-decoration:none;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:17px;font-weight:700;color:#1a1a2e;letter-spacing:-0.3px;">Mayra International</p>
                          <p style="margin:1px 0 0;font-size:11px;font-weight:500;color:#6b7280;letter-spacing:0.3px;">Admin Dashboard</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:6px 14px;border-radius:8px;">
                          <span style="color:#ffffff;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">New Lead</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 12px 48px rgba(0,0,0,0.04);">

                <!-- Hero Section -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#3b82f6 100%);padding:36px 40px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin:0;color:#bfdbfe;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Incoming Lead</p>
                          <h1 style="margin:10px 0 0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.25;letter-spacing:-0.5px;">
                            ${escapeHtml(lead.fullName)}
                          </h1>
                          <p style="margin:8px 0 0;color:#dbeafe;font-size:13px;font-weight:400;">
                            ${sourceLabel} &middot; ${date}
                          </p>
                        </td>
                        <td align="right" style="vertical-align:top;padding-top:4px;">
                          <!-- User Avatar Circle -->
                          <div style="width:52px;height:52px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50%;text-align:center;line-height:52px;color:#ffffff;font-size:20px;font-weight:700;">
                            ${escapeHtml(lead.fullName.charAt(0).toUpperCase())}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Lead Details -->
                <tr>
                  <td style="padding:32px 40px 8px;">
                    <p style="margin:0 0 18px;font-size:11px;font-weight:600;color:#6b7280;letter-spacing:0.8px;text-transform:uppercase;">Lead Details</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafbfc;border:1px solid #f1f3f5;border-radius:14px;overflow:hidden;">
                      ${detailRows.join("")}
                    </table>
                  </td>
                </tr>

                <!-- Message Block -->
                ${messageBlock ? `<tr><td style="padding:0 40px;">${messageBlock.replace(/<tr>\s*<td/,"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'><tr><td").replace(/<\/td>\s*<\/tr>/,"</td></tr></table>")}</td></tr>` : ""}

                <!-- Divider -->
                <tr>
                  <td style="padding:28px 40px 24px;">
                    <div style="height:1px;background:linear-gradient(to right,transparent,#e5e7eb,transparent);"></div>
                  </td>
                </tr>

                <!-- Action Buttons -->
                <tr>
                  <td style="padding:0 40px 36px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="border-radius:12px;background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);">
                                <a href="${appUrl}/admin/leads" target="_blank" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                                  Open Dashboard &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="border-radius:12px;border:1px solid #e5e7eb;">
                                <a href="mailto:${emailValue}" target="_blank" style="display:inline-block;padding:12px 22px;color:#374151;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                                  Reply to Lead
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 20px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td style="background:#f8fafc;border:1px solid #f1f3f5;border-radius:8px;padding:8px 16px;">
                          <p style="margin:0;color:#9ca3af;font-size:10px;font-weight:500;">Lead ID: <span style="color:#6b7280;font-weight:600;">${escapeHtml(lead.id)}</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#9ca3af;font-size:12px;font-weight:500;">Mayra International</p>
                    <p style="margin:6px 0 0;color:#d1d5db;font-size:10px;">Automated admin notification &middot; Do not forward this email.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <div style="height:1px;width:60px;background:#e5e7eb;margin:0 auto;"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <p style="margin:0;color:#d1d5db;font-size:10px;">&copy; ${new Date().getFullYear()} Mayra International. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function makeDetailRow(label: string, value: string, isFirst = false): string {
  const borderTop = isFirst ? "" : "border-top:1px solid #f1f3f5;";
  return `<tr>
    <td style="padding:14px 20px;${borderTop}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:140px;vertical-align:top;">
            <p style="margin:0;color:#9ca3af;font-size:12px;font-weight:500;">${label}</p>
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;line-height:1.4;">${value}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
