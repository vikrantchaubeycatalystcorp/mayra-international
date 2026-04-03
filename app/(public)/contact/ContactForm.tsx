"use client";

import React, { useState } from "react";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { useMasterData } from "../../../hooks/useMasterData";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

const FALLBACK_COURSE_OPTIONS = [
  "Engineering (B.Tech / M.Tech)",
  "Medical (MBBS / BDS)",
  "Management (MBA / BBA)",
  "Law (LLB / LLM)",
  "Science (B.Sc / M.Sc)",
  "Arts & Humanities",
  "Commerce (B.Com / M.Com)",
  "Design & Architecture",
  "Study Abroad",
  "Other",
];

const FALLBACK_CLASS_OPTIONS = [
  "Class 10 (Appearing)",
  "Class 10 (Passed)",
  "Class 12 (Appearing)",
  "Class 12 (Passed)",
  "Graduate (Appearing)",
  "Graduate (Passed)",
  "Post Graduate",
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

export function ContactForm() {
  const { data: masterData } = useMasterData();
  const classOptions = masterData?.leadQualifications
    ? masterData.leadQualifications.map((q) => q.label)
    : FALLBACK_CLASS_OPTIONS;
  const courseOptions = masterData?.leadInterests
    ? masterData.leadInterests.map((i) => i.label)
    : FALLBACK_COURSE_OPTIONS;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    currentClass: "",
    courseInterest: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSelect(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
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
              city: "",
              state: "",
              currentClass: "",
              courseInterest: "",
              message: "",
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

      {/* Row 2: Email + City */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@email.com"
            required
            type="email"
            className="h-11"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            City
          </label>
          <Input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Your city"
            className="h-11"
          />
        </div>
      </div>

      {/* Row 3: State + Class */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            State
          </label>
          <Select
            value={form.state}
            onValueChange={(v) => handleSelect("state", v)}
          >
            <SelectTrigger className="h-11" aria-label="State">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Current Class / Qualification <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.currentClass}
            onValueChange={(v) => handleSelect("currentClass", v)}
            required
          >
            <SelectTrigger className="h-11" aria-label="Current class or qualification">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Course Interest */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Course Interest <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.courseInterest}
          onValueChange={(v) => handleSelect("courseInterest", v)}
          required
        >
          <SelectTrigger className="h-11" aria-label="Course interest">
            <SelectValue placeholder="Select course you're interested in" />
          </SelectTrigger>
          <SelectContent>
            {courseOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 5: Message */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          Your Message / Query
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your goals, preferred colleges, budget, or any specific questions..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 resize-none transition-all"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full text-sm"
        disabled={
          loading ||
          !form.name ||
          !form.phone ||
          !form.email ||
          !form.currentClass ||
          !form.courseInterest
        }
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

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to our privacy policy. Your information is safe
        with us and will never be shared.
      </p>
    </form>
  );
}
