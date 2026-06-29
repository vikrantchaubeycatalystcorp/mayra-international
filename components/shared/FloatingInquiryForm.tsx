"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquarePlus, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const CONTACT_PHONE = "+917506799678";
const WHATSAPP_NUMBER = "917506799678";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FloatingInquiryForm() {
  const [minimized, setMinimized] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [renderTs] = useState(() => Date.now());
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    _hp: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { _hp, ...fields } = form;
      const response = await fetch("/api/free-counselling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, _hp, _ts: renderTs }),
      });
      if (!response.ok) {
        setErrorMsg("Failed to submit inquiry. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[300px] max-w-[300px] shadow-premium-lg rounded-3xl overflow-hidden transition-all duration-500 ease-out-expo"
      style={{ maxHeight: minimized ? "52px" : "80vh" }}
    >
      {/* Header — always visible */}
      <div
        className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-indigo-700 to-purple-700 text-white cursor-pointer select-none"
        onClick={() => setMinimized((m) => !m)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-sm truncate">Free Counselling</span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`tel:${CONTACT_PHONE}`}
            aria-label="Call us"
            title="Call us"
            onClick={(e) => e.stopPropagation()}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
            onClick={(e) => e.stopPropagation()}
            className="text-white/80 hover:text-white transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
          <button
            type="button"
            suppressHydrationWarning
            aria-label={minimized ? "Expand inquiry form" : "Minimize inquiry form"}
            className="text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((m) => !m);
            }}
          >
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="bg-white overflow-y-auto" style={{ maxHeight: "calc(80vh - 48px)" }}>
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800">Inquiry Submitted!</p>
              <p className="text-sm text-gray-500">
                Our counsellor will contact you within 24 hours.
              </p>
              <button
                type="button"
                suppressHydrationWarning
                className="text-xs text-primary-600 underline mt-1"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", phone: "", _hp: "" });
                }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3" suppressHydrationWarning>
              <p className="text-xs text-gray-500">
                Get free expert guidance.
              </p>

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  type="tel"
                  pattern="[0-9+\s\-]{7,15}"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  Email Address
                </label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  type="email"
                  className="h-8 text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="sm"
                className="w-full mt-0.5 text-xs"
                disabled={loading || !form.name || !form.phone}
              >
                {loading ? "Submitting..." : "Get Free Counselling"}
              </Button>

              {errorMsg && (
                <p className="text-[10px] text-red-600 text-center font-medium">{errorMsg}</p>
              )}

              {/* Honeypot — hidden from real users */}
              <input
                type="text"
                name="_hp"
                value={form._hp}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
              />

              <p className="text-[10px] text-gray-500 text-center">
                By submitting, you agree to our privacy policy. We won&apos;t spam you.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
