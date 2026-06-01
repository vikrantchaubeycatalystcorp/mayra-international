"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CollegeCard } from "../../../components/colleges/CollegeCard";
import { CompareBar } from "../../../components/colleges/CompareBar";
import { useMasterData } from "../../../hooks/useMasterData";
import { cn } from "../../../lib/utils";
import type { College } from "../../../types";

type SortOption = "nirf" | "name" | "fees-asc" | "fees-desc" | "rating" | "placement";

const PAGE_SIZE = 8;
const FEE_MAX = 2000000;

interface CollegesClientProps {
  totalCount: number;
}

interface ApiResponse {
  data: Array<{
    id: string; name: string; slug: string; logo: string; city: string; state: string;
    streams: string[]; nirfRank: number | null; rating: number; reviewCount: number;
    established: number; type: string; feesMin: number; feesMax: number;
    avgPackage: number | null; topPackage: number | null; placementRate: number | null;
    accreditation: string[]; courses: string[]; description: string; highlights: string[];
    address: string; website: string | null; phone: string | null; totalStudents: number | null;
    faculty: number | null; isFeatured: boolean; latitude: number | null; longitude: number | null;
    countryCode: string; countryName: string;
  }>;
  total: number;
  page: number;
  pages: number;
}

function mapToCollege(c: ApiResponse["data"][number]): College {
  return {
    id: c.id, name: c.name, slug: c.slug, logo: c.logo, city: c.city, state: c.state,
    streams: c.streams, nirfRank: c.nirfRank ?? undefined, rating: c.rating,
    reviewCount: c.reviewCount, established: c.established, type: c.type as College["type"],
    fees: { min: c.feesMin, max: c.feesMax }, avgPackage: c.avgPackage ?? undefined,
    topPackage: c.topPackage ?? undefined, placementRate: c.placementRate ?? undefined,
    accreditation: c.accreditation, courses: c.courses, description: c.description,
    highlights: c.highlights, address: c.address, website: c.website ?? undefined,
    phone: c.phone ?? undefined, totalStudents: c.totalStudents ?? undefined,
    faculty: c.faculty ?? undefined, isFeatured: c.isFeatured, latitude: c.latitude ?? undefined,
    longitude: c.longitude ?? undefined, countryCode: c.countryCode, countryName: c.countryName,
  };
}

function fmtFee(n: number) {
  if (n >= FEE_MAX) return "₹20L+";
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L`;
  return `₹${n / 1000}K`;
}

export function CollegesClient({ totalCount }: CollegesClientProps) {
  const { data: masterData } = useMasterData();
  const allStreams = masterData?.streams.map((s) => s.name) ?? ["Engineering", "Medical", "Management", "Law", "Arts", "Science", "Commerce"];
  const allStates = masterData?.states.map((s) => s.name) ?? ["Delhi", "Maharashtra", "Tamil Nadu", "Karnataka", "Uttar Pradesh", "West Bengal", "Telangana"];

  const [sort, setSort] = useState<SortOption>("nirf");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "Government" | "Private">("all");
  const [streams, setStreams] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [feesMax, setFeesMax] = useState(FEE_MAX);
  const [ratingMin, setRatingMin] = useState(0);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(totalCount);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / PAGE_SIZE));
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchColleges = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (streams.length) params.set("streams", streams.join(","));
    if (type !== "all") params.set("types", type);
    if (states.length) params.set("states", states.join(","));
    if (feesMax < FEE_MAX) params.set("feesMax", String(feesMax));
    if (ratingMin > 0) params.set("ratingMin", String(ratingMin));

    try {
      const res = await fetch(`/api/colleges?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: ApiResponse = await res.json();
      setColleges(json.data.map(mapToCollege));
      setTotal(json.total);
      setTotalPages(json.pages);
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error("Failed to fetch colleges:", err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, sort, search, type, streams, states, feesMax, ratingMin]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const toggle = (list: string[], v: string, set: (x: string[]) => void) => {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    setPage(1);
  };

  const clearAll = () => {
    setSearch(""); setType("all"); setStreams([]); setStates([]);
    setFeesMax(FEE_MAX); setRatingMin(0); setPage(1);
  };

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (type !== "all") activeChips.push({ key: "type", label: type, clear: () => setType("all") });
  streams.forEach((s) => activeChips.push({ key: `stream-${s}`, label: s, clear: () => toggle(streams, s, setStreams) }));
  states.forEach((s) => activeChips.push({ key: `state-${s}`, label: s, clear: () => toggle(states, s, setStates) }));
  if (ratingMin > 0) activeChips.push({ key: "rating", label: `${ratingMin}★ & up`, clear: () => setRatingMin(0) });
  if (feesMax < FEE_MAX) activeChips.push({ key: "fee", label: `Under ${fmtFee(feesMax)}`, clear: () => setFeesMax(FEE_MAX) });

  const Drop = ({ id, label, count, children }: { id: string; label: string; count?: number; children: React.ReactNode }) => (
    <div className={cn("fb-drop", openDrop === id && "open")}>
      <button className="fb-btn" onClick={() => setOpenDrop(openDrop === id ? null : id)}>
        {label}
        {count ? <span className="cnt show">{count}</span> : null}
        <span className="car">▾</span>
      </button>
      <div className="fb-pop">{children}</div>
    </div>
  );

  return (
    <>
      {/* clicking outside closes any open dropdown */}
      {openDrop && (
        <div style={{ position: "fixed", inset: 0, zIndex: 44 }} onClick={() => setOpenDrop(null)} />
      )}

      <section className="list-top">
        <div className="container">
          <div className="crumb">
            <Link href="/">Home</Link> <span>/</span> <span style={{ color: "var(--ink-2)" }}>Colleges</span>
          </div>
          <div className="list-title">
            <div>
              <h1>Colleges in India</h1>
              <div className="count">
                Showing <b>{total.toLocaleString("en-IN")}</b> of {totalCount.toLocaleString("en-IN")} verified colleges
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="filterbar">
        <div className="container">
          <div className="fb-row">
            <div className="fb-search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="var(--ink-3)" strokeWidth="1.6" />
                <path d="M11 11l3.5 3.5" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                placeholder="College or city…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div className="seg">
              {(["all", "Government", "Private"] as const).map((t) => (
                <button
                  key={t}
                  className={type === t ? "on" : ""}
                  onClick={() => { setType(t); setPage(1); }}
                >
                  {t === "all" ? "All" : t === "Government" ? "Govt" : "Private"}
                </button>
              ))}
            </div>

            <span className="fb-sep" />

            <Drop id="stream" label="Stream" count={streams.length}>
              <h4>Stream</h4>
              {allStreams.slice(0, 10).map((s) => (
                <label key={s} className="check">
                  <input type="checkbox" checked={streams.includes(s)} onChange={() => toggle(streams, s, setStreams)} />
                  {s}
                </label>
              ))}
            </Drop>

            <Drop id="state" label="State" count={states.length}>
              <h4>State</h4>
              {allStates.slice(0, 12).map((s) => (
                <label key={s} className="check">
                  <input type="checkbox" checked={states.includes(s)} onChange={() => toggle(states, s, setStates)} />
                  {s}
                </label>
              ))}
            </Drop>

            <Drop id="fees" label="Fees">
              <div className="fee-pop">
                <h4>Max annual fees</h4>
                <div className="range-val"><span>Up to</span><span className="v">{fmtFee(feesMax)}</span></div>
                <input
                  type="range" min={0} max={FEE_MAX} step={50000} value={feesMax}
                  style={{ minWidth: 220 }}
                  onChange={(e) => { setFeesMax(Number(e.target.value)); setPage(1); }}
                />
              </div>
            </Drop>

            <Drop id="rating" label="Rating">
              <h4>Minimum rating</h4>
              <div className="rate-opts">
                {[0, 4, 4.5].map((r) => (
                  <button key={r} className={ratingMin === r ? "on" : ""} onClick={() => { setRatingMin(r); setPage(1); }}>
                    {r === 0 ? "Any" : <><span className="star">★</span>{r.toFixed(1)}+</>}
                  </button>
                ))}
              </div>
            </Drop>

            {activeChips.length > 0 && (
              <button className="fb-clear" onClick={clearAll}>Clear all</button>
            )}

            <span className="fb-spacer" />

            <div className="fb-sort">
              <label htmlFor="sortSel">Sort</label>
              <select
                id="sortSel" className="select" value={sort}
                onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
              >
                <option value="nirf">NIRF rank</option>
                <option value="rating">Rating</option>
                <option value="fees-asc">Fees: low → high</option>
                <option value="fees-desc">Fees: high → low</option>
                <option value="placement">Placements</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container list-wrap">
        {activeChips.length > 0 && (
          <div className="active-chips">
            {activeChips.map((c) => (
              <span key={c.key} className="ac">
                {c.label}
                <button onClick={c.clear} aria-label={`Remove ${c.label}`}>✕</button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--pine)" }} />
          </div>
        ) : colleges.length === 0 ? (
          <div className="empty">
            <div className="ico">🔍</div>
            <h3 className="h-3">No colleges match these filters</h3>
            <p className="muted" style={{ marginTop: 8, maxWidth: "38ch", marginInline: "auto" }}>
              Try widening the fee range or removing a stream filter.
            </p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 18 }} onClick={clearAll}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="results">
            {colleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="pager">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button key={p} className={page === p ? "on" : ""} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>

      <CompareBar />
    </>
  );
}
