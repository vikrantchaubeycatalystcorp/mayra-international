"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, X, Check, Search, Loader2 } from "lucide-react";

interface Recruiter {
  id: string;
  name: string;
  isActive: boolean;
}

interface RecruiterMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function RecruiterMultiSelect({ value, onChange }: RecruiterMultiSelectProps) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/recruiters", { credentials: "include" });
        const json = await res.json();
        if (json.success) setRecruiters(json.data || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = useMemo(
    () => recruiters.filter((r) => value.includes(r.id)),
    [recruiters, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recruiters;
    return recruiters.filter((r) => r.name.toLowerCase().includes(q));
  }, [recruiters, query]);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const inputClass =
    "w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className="relative" ref={containerRef}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium"
            >
              {r.name}
              <button
                type="button"
                onClick={() => toggle(r.id)}
                className="text-blue-400 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className="text-gray-500">
          {selected.length > 0 ? `${selected.length} selected` : "Select recruiters..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recruiters..."
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {loading ? (
              <div className="p-4 text-center"><Loader2 className="w-4 h-4 text-blue-500 animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-400">
                {recruiters.length === 0 ? "No recruiters yet — add some in Top Recruiters." : "No matches."}
              </p>
            ) : (
              filtered.map((r) => {
                const isChecked = value.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggle(r.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-blue-50/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {r.name}
                      {!r.isActive && <span className="text-[10px] text-gray-400">(inactive)</span>}
                    </span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? "bg-blue-600 border-blue-600" : "border-gray-300"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
