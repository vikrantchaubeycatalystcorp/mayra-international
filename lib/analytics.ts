// Google Analytics 4. Loaded only when NEXT_PUBLIC_GA_ID is set (components/shared/GoogleAnalytics.tsx).

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Gtag = (command: "event", eventName: string, params?: Record<string, unknown>) => void;

/** Records a successful enquiry as a GA4 `generate_lead` conversion. No-op when GA is not loaded. */
export function trackLead(form: string) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", "generate_lead", { form_name: form, page_path: window.location.pathname });
}
