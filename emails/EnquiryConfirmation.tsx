interface ConfirmationData {
  fullName: string;
  courseInterested?: string | null;
  source: string;
}

export function studentConfirmationHtml(data: ConfirmationData): string {
  const sourceLabel = data.source === "INQUIRY" ? "inquiry" : "counselling request";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.mayrainternational.com").replace(/\/$/, "");
  const logoUrl = `${appUrl}/images/mayra-logo-clean.png`;
  const courseNote = data.courseInterested
    ? `for <strong style="color:#1e40af;font-weight:600;">${escapeHtml(data.courseInterested)}</strong>`
    : "for your preferred program";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>Your enquiry has been received</title>
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
    We received your ${sourceLabel}. Our expert counselling team will reach out within 24 hours.
    ${"&zwnj;&nbsp;".repeat(30)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding:0 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${logoUrl}" alt="Mayra International" width="44" style="display:block;height:auto;width:44px;max-width:44px;border:0;outline:none;text-decoration:none;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a2e;letter-spacing:-0.3px;">Mayra International</p>
                    <p style="margin:2px 0 0;font-size:11px;font-weight:500;color:#6b7280;letter-spacing:0.5px;text-transform:uppercase;">Global Education Consultants</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 12px 48px rgba(0,0,0,0.04);">

                <!-- Hero Banner -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#3b82f6 100%);padding:44px 40px 40px;text-align:center;">
                    <!-- Checkmark Icon -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                      <tr>
                        <td style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;text-align:center;line-height:56px;">
                          <span style="font-size:28px;color:#ffffff;">&#10003;</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.25;letter-spacing:-0.5px;">
                      Thank you, ${escapeHtml(data.fullName)}.
                    </h1>
                    <p style="margin:12px auto 0;max-width:420px;color:#e0ecff;font-size:15px;line-height:1.6;font-weight:400;">
                      Your ${sourceLabel} has been successfully received. We're excited to help you begin your journey.
                    </p>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding:36px 40px 12px;">
                    <p style="margin:0;color:#374151;font-size:15px;line-height:1.75;font-weight:400;">
                      We appreciate your interest ${courseNote}. Our expert counselling team will carefully review your profile and reach out with personalized guidance tailored to your academic goals.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:20px 40px;">
                    <div style="height:1px;background:linear-gradient(to right,transparent,#e5e7eb,transparent);"></div>
                  </td>
                </tr>

                <!-- Timeline Steps -->
                <tr>
                  <td style="padding:0 40px;">
                    <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#6b7280;letter-spacing:0.8px;text-transform:uppercase;">What happens next</p>

                    <!-- Step 1 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;">
                          <div style="width:32px;height:32px;background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:10px;text-align:center;line-height:32px;color:#ffffff;font-size:13px;font-weight:700;">1</div>
                        </td>
                        <td style="vertical-align:top;padding-left:12px;">
                          <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;line-height:1.4;">Profile Evaluation</p>
                          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">Our counsellor reviews your academic background and aspirations.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;">
                          <div style="width:32px;height:32px;background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:10px;text-align:center;line-height:32px;color:#ffffff;font-size:13px;font-weight:700;">2</div>
                        </td>
                        <td style="vertical-align:top;padding-left:12px;">
                          <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;line-height:1.4;">Personalized Guidance Call</p>
                          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">You'll receive a call within 24 business hours with tailored advice.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:4px;">
                      <tr>
                        <td style="width:40px;vertical-align:top;padding-top:2px;">
                          <div style="width:32px;height:32px;background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:10px;text-align:center;line-height:32px;color:#ffffff;font-size:13px;font-weight:700;">3</div>
                        </td>
                        <td style="vertical-align:top;padding-left:12px;">
                          <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;line-height:1.4;">Your Custom Roadmap</p>
                          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">We share a curated shortlist and step-by-step admission roadmap.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:24px 40px;">
                    <div style="height:1px;background:linear-gradient(to right,transparent,#e5e7eb,transparent);"></div>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding:0 40px 8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-radius:12px;background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);">
                          <a href="${appUrl}/courses" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                            Explore Our Programs &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Support Note -->
                <tr>
                  <td style="padding:16px 40px 36px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #f1f3f5;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0;color:#374151;font-size:13px;line-height:1.65;">
                            <strong style="font-weight:600;">Need immediate help?</strong><br/>
                            Simply reply to this email and our team will get back to you promptly.
                          </p>
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
            <td style="padding:32px 20px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#9ca3af;font-size:12px;font-weight:500;letter-spacing:0.2px;">Mayra International</p>
                    <p style="margin:6px 0 0;color:#9ca3af;font-size:11px;line-height:1.6;">Trusted education consultants helping students achieve their global academic dreams.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <!-- Social Links -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="${appUrl}" target="_blank" style="color:#9ca3af;font-size:11px;text-decoration:none;font-weight:500;">Website</a>
                        </td>
                        <td style="color:#d1d5db;font-size:11px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="${appUrl}/courses" target="_blank" style="color:#9ca3af;font-size:11px;text-decoration:none;font-weight:500;">Programs</a>
                        </td>
                        <td style="color:#d1d5db;font-size:11px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="${appUrl}/contact" target="_blank" style="color:#9ca3af;font-size:11px;text-decoration:none;font-weight:500;">Contact</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:20px;">
                    <div style="height:1px;width:60px;background:#e5e7eb;margin:0 auto;"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <p style="margin:0;color:#d1d5db;font-size:10px;line-height:1.6;">
                      This is an automated confirmation for your submitted ${sourceLabel}.<br/>
                      &copy; ${new Date().getFullYear()} Mayra International. All rights reserved.
                    </p>
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
