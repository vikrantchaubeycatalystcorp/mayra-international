"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMasterData } from "../../hooks/useMasterData";

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

export function FloatingInquiryForm() {
  const { data: masterData } = useMasterData();
  const CLASS_OPTIONS = masterData?.leadQualifications
    ? masterData.leadQualifications.map((q) => q.label)
    : FALLBACK_CLASS_OPTIONS;
  const COURSE_OPTIONS = masterData?.leadInterests
    ? masterData.leadInterests.map((i) => i.label)
    : FALLBACK_COURSE_OPTIONS;
  const [minimized, setMinimized] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    currentClass: "",
    courseInterest: "",
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSelect(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/free-counselling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-sm">Free Counselling</span>
        </div>
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
                  setForm({ name: "", email: "", phone: "", city: "", currentClass: "", courseInterest: "", message: "" });
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

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  City
                </label>
                <Input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  Current Class / Qualification <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.currentClass}
                  onValueChange={(v) => handleSelect("currentClass", v)}
                  required
                >
                  <SelectTrigger className="h-8 text-xs" aria-label="Current class or qualification">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  Course Interest <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.courseInterest}
                  onValueChange={(v) => handleSelect("courseInterest", v)}
                  required
                >
                  <SelectTrigger className="h-8 text-xs" aria-label="Course interest">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-600 mb-0.5 block">
                  Message / Query
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Any specific questions or requirements..."
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none transition-colors"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="sm"
                className="w-full mt-0.5 text-xs"
                disabled={loading || !form.name || !form.phone || !form.currentClass || !form.courseInterest}
              >
                {loading ? "Submitting..." : "Get Free Counselling"}
              </Button>

              {errorMsg && (
                <p className="text-[10px] text-red-600 text-center font-medium">{errorMsg}</p>
              )}

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
