# Email Setup + Leads Management (Inquiry / Free Counselling)

## Objective

When a student submits either:
- `Submit Inquiry` form, or
- `Free Counselling` form

the system should:
1. Save lead details in admin (`Leads` section).
2. Send one email to admin (notification with full lead details).
3. Send one email to student (acknowledgement/confirmation).

This must be configurable from admin and **must not use hardcoded email addresses**.

---

## Mandatory Database Persistence Rule

All new entities introduced in this feature must be stored in database (not in code constants, not in-memory only):
- `Setup` email configuration
- Lead records from both forms
- Email delivery status for admin and student emails
- Email error logs / last failure reason (if any)
- Any additional fields added later in `Setup` or `Leads`

If app/server restarts, all configuration and lead history must remain intact.

---

## Admin Panel Changes

### 1) New Section: `Setup`

Create a new admin section called `Setup` for email configuration.

#### Required fields (Phase 1)
- `toEmail` (string, required)  
  - Admin receiver email where lead notifications are sent.
- `fromEmail` (string, required)  
  - Sender email used in outgoing emails.

> Note: If business wants same sender and receiver, both fields can be set to the same value.

#### Recommended fields (Optimization)
- `replyToEmail` (string, optional)  
  - Useful for handling replies directly.
- `emailEnabled` (boolean, default `true`)  
  - Toggle to temporarily disable sending.
- `studentAutoReplyEnabled` (boolean, default `true`)  
  - Toggle student confirmation emails.
- `updatedBy`, `updatedAt` for audit.

#### Validation
- Validate valid email format.
- Save only when required fields are present.
- Show clear admin error message if misconfigured.

---

### 2) New Section: `Leads`

Create a new admin section called `Leads` to store all incoming leads from both forms.

#### Lead fields (minimum)
- `id`
- `source` (`inquiry` | `free-counselling`)
- `fullName`
- `email`
- `phone`
- `courseInterested` (if available)
- `message` / `query` (if available)
- `rawPayload` (optional JSON for future-proofing)
- `createdAt`
- `status` (`new`, `contacted`, `closed`) default `new`

#### Leads UI (recommended)
- Table list with filters:
  - by `source`
  - by `status`
  - by date range
- Search by name/email/phone.
- Lead detail drawer/page with full form payload.
- Export CSV (optional, useful for sales team).

---

## Submission Flow (Both Forms)

1. Student submits form.
2. Backend validates required fields.
3. Lead is inserted into `Leads`.
4. Read active email config from `Setup`.
5. Send Admin Notification Email.
6. If student email exists and auto-reply enabled, send Student Confirmation Email.
7. Return success response to frontend.

If email sending fails:
- Lead should still remain saved in DB.
- Log failure reason.
- Optionally mark email status fields in lead record.

---

## Email Behavior

### A) Admin Notification Email
- **To:** `Setup.toEmail`
- **From:** `Setup.fromEmail`
- **Subject:** `New Lead - {source} - {studentName}`
- **Body should include:**
  - Source form
  - Name
  - Email
  - Phone
  - Course / Interest
  - Message
  - Submission date/time
  - Lead ID

### B) Student Confirmation Email
- **To:** student email from form
- **From:** `Setup.fromEmail`
- **Subject:** `We received your request`
- **Body should include:**
  - Thank-you message
  - Brief confirmation of received request
  - Optional next-step timeline
  - Support contact info

---

## Data Model Suggestion

### `settings` / `setup` collection
```json
{
  "key": "emailSetup",
  "fromEmail": "info@domain.com",
  "toEmail": "admissions@domain.com",
  "replyToEmail": "support@domain.com",
  "emailEnabled": true,
  "studentAutoReplyEnabled": true,
  "updatedBy": "adminUserId",
  "updatedAt": "ISO_DATE"
}
```

### `leads` collection
```json
{
  "id": "lead_123",
  "source": "inquiry",
  "fullName": "Student Name",
  "email": "student@email.com",
  "phone": "9999999999",
  "courseInterested": "BBA",
  "message": "Need details for fees",
  "rawPayload": {},
  "adminEmailStatus": "pending",
  "studentEmailStatus": "pending",
  "emailFailureReason": null,
  "status": "new",
  "createdAt": "ISO_DATE"
}
```

---

## API Suggestions

### Admin Setup
- `GET /api/admin/setup/email` -> fetch current setup
- `PUT /api/admin/setup/email` -> update setup

### Leads
- `GET /api/admin/leads` -> list/filter/search leads
- `GET /api/admin/leads/:id` -> lead details
- `PATCH /api/admin/leads/:id` -> update status/notes

### Public Form Submit
- `POST /api/inquiry`
- `POST /api/free-counselling`

Both should:
- save lead
- trigger admin + student emails

---

## Reliability + Security Recommendations

- Use server-side rate limiting on submit APIs.
- Add captcha/anti-bot protection.
- Queue emails (recommended) instead of blocking request thread.
- Retry failed email jobs with backoff.
- Store `emailDeliveryStatus` (`pending`, `sent`, `failed`) per lead.
- Mask sensitive data in logs.

---

## Future Expandability

`Setup` section is intentionally generic so more fields can be added later, e.g.:
- WhatsApp notification config
- SMS provider config
- Different destination emails by lead source
- Email templates per campaign/source
- Office hours auto-response settings

---

## Acceptance Criteria

- No hardcoded email IDs in code.
- Admin can configure sender/receiver via `Setup`.
- On each valid form submit:
  - Lead is stored in `Leads`.
  - Admin receives notification email.
  - Student receives confirmation email (if student email exists).
- Admin can view all leads with source and details.
- System remains functional even if email provider temporarily fails (lead still saved).

