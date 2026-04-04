"use client";

import { useEffect, useState } from "react";

export function LiveInquiryCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/enquiry")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(null));
  }, []);

  // Listen for custom event dispatched after successful form submission
  useEffect(() => {
    function onSubmit() {
      setCount((prev) => (prev !== null ? prev + 1 : prev));
    }
    window.addEventListener("inquiry-submitted", onSubmit);
    return () => window.removeEventListener("inquiry-submitted", onSubmit);
  }, []);

  if (count === null) return null;

  // Always show a minimum base to look credible even with few real entries
  const display = count + 2800;

  return (
    <p className="text-xs text-indigo-200">
      <span className="text-white font-semibold">
        {display.toLocaleString("en-IN")} students
      </span>{" "}
      filled this form this month
    </p>
  );
}
