"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "../../lib/store";
import { cn } from "../../lib/utils";

interface CompareCollege {
  id: string;
  name: string;
  slug: string;
}

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [selectedColleges, setSelectedColleges] = useState<CompareCollege[]>([]);

  useEffect(() => {
    setVisible(compareList.length >= 2);
  }, [compareList]);

  useEffect(() => {
    if (compareList.length === 0) {
      setSelectedColleges([]);
      return;
    }
    const ids = compareList.join(",");
    fetch(`/api/colleges?ids=${encodeURIComponent(ids)}&limit=${compareList.length}`)
      .then((r) => r.json())
      .then((res) => {
        const data = res.data || res;
        setSelectedColleges(Array.isArray(data) ? data : []);
      })
      .catch(() => setSelectedColleges([]));
  }, [compareList]);

  return (
    <div className={cn("compare-tray", visible && "show")}>
      <div className="container" style={{ paddingInline: "var(--gut)" }}>
        <div className="inner">
          <span className="ct-label">
            Compare <span style={{ color: "#fff" }}>{compareList.length}/3</span>
          </span>
          <div className="ct-slots">
            {selectedColleges.map((college) =>
              college ? (
                <div key={college.id} className="slot">
                  {college.name}
                  <button onClick={() => removeFromCompare(college.id)} aria-label={`Remove ${college.name}`}>
                    ✕
                  </button>
                </div>
              ) : null
            )}
            <button
              onClick={clearCompare}
              style={{ background: "none", border: "none", color: "#B8AE9E", fontSize: 13, marginLeft: 4 }}
            >
              Clear
            </button>
          </div>
          <Link className="btn btn-gold btn-sm" href="/compare">
            Compare <span>{compareList.length}</span> →
          </Link>
        </div>
      </div>
    </div>
  );
}
