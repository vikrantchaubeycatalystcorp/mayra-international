interface ConfirmationData {
  fullName: string;
  courseInterested?: string | null;
  source: string;
}

export function studentConfirmationHtml(data: ConfirmationData): string {
  const sourceLabel = data.source === "INQUIRY" ? "inquiry" : "counselling request";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Thank You, ${escapeHtml(data.fullName)}!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">We have received your ${sourceLabel}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
            We appreciate your interest${data.courseInterested ? ` in <strong>${escapeHtml(data.courseInterested)}</strong>` : ""}. Our expert counsellor will review your details and get in touch with you shortly.
          </p>

          <div style="background-color:#f0f4ff;border-radius:10px;padding:20px 24px;margin:20px 0;">
            <h3 style="margin:0 0 12px;color:#4f46e5;font-size:15px;font-weight:600;">What happens next?</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">
                <span style="display:inline-block;width:24px;height:24px;background:#4f46e5;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:600;margin-right:10px;">1</span>
                Our counsellor reviews your profile
              </td></tr>
              <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">
                <span style="display:inline-block;width:24px;height:24px;background:#4f46e5;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:600;margin-right:10px;">2</span>
                You will receive a call within 24 hours
              </td></tr>
              <tr><td style="padding:6px 0;color:#4b5563;font-size:14px;">
                <span style="display:inline-block;width:24px;height:24px;background:#4f46e5;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:600;margin-right:10px;">3</span>
                Personalized guidance based on your goals
              </td></tr>
            </table>
          </div>

          <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:16px 0 0;">
            If you have any immediate questions, feel free to reach out to us. We are here to help you find the right path for your career.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #f0f0f3;text-align:center;">
          <p style="margin:0;color:#4f46e5;font-size:14px;font-weight:600;">Mayra International</p>
          <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">Your trusted education consultants</p>
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
