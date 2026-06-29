"use client";

import React, { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderTs] = useState(() => Date.now());
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    _hp: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { _hp, ...fields } = form;
      await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, _hp, _ts: renderTs }),
      });
      setSubmitted(true);
      window.dispatchEvent(new Event("inquiry-submitted"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce-in">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          Thank You!
        </h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Your inquiry has been submitted successfully. Our expert counsellor
          will contact you within 24 hours.
        </p>
        <button
          type="button"
          suppressHydrationWarning
          className="text-sm text-indigo-600 font-medium hover:underline mt-2"
          onClick={() => {
            setSubmitted(false);
            setForm({
              name: "",
              email: "",
              phone: "",
              _hp: "",
            });
          }}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
      {/* Row 1: Name + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className="h-11"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
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
            className="h-11"
          />
        </div>
      </div>

      {/* Row 2: Email */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Email Address
        </label>
        <Input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@email.com"
          type="email"
          className="h-11"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full text-sm"
        disabled={loading || !form.name || !form.phone}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Inquiry
          </>
        )}
      </Button>

      {/* Honeypot — hidden from real users, attracts bots */}
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

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to our privacy policy. Your information is safe
        with us and will never be shared.
      </p>
    </form>
  );
}
