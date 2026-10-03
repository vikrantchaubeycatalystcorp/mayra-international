import { HelpCircle } from "lucide-react";
import type { Faq } from "../../lib/seo";

/** Visible FAQ list. Pass the same array to faqJsonLd so the markup matches the page. */
export function FaqSection({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  if (faqs.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary-600" />
        {title}
      </h2>
      <div className="divide-y divide-gray-100">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
            <h3 className="font-semibold text-gray-900">{faq.question}</h3>
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
