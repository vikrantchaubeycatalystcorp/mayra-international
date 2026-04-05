/**
 * Lightweight bot protection using honeypot field + submission timing.
 * Works without external CAPTCHA services.
 */

/** Minimum milliseconds between form render and submit (bots submit instantly) */
const MIN_SUBMIT_TIME_MS = 2000;

/**
 * Validates bot protection fields on the server side.
 * Returns an error message if the submission looks automated, or null if clean.
 */
export function validateBotProtection(body: {
  _hp?: string;
  _ts?: string | number;
}): string | null {
  // Honeypot field should be empty — bots tend to fill hidden fields
  if (body._hp) {
    return "Submission rejected";
  }

  // Timestamp check — form must have been rendered for at least MIN_SUBMIT_TIME_MS
  if (body._ts) {
    const renderTime = typeof body._ts === "string" ? parseInt(body._ts, 10) : body._ts;
    if (!isNaN(renderTime) && Date.now() - renderTime < MIN_SUBMIT_TIME_MS) {
      return "Please wait a moment before submitting";
    }
  }

  return null;
}
