"use client";

import { useState, useEffect } from "react";

export interface MasterData {
  streams: { id: string; name: string; slug: string; icon?: string; color?: string }[];
  states: { id: string; name: string; code: string }[];
  collegeTypes: { id: string; name: string }[];
  courseLevels: { id: string; name: string; code: string }[];
  examModes: { id: string; name: string }[];
  newsCategories: { id: string; name: string; slug: string; icon?: string; color?: string }[];
  leadQualifications: { id: string; label: string; value: string }[];
  leadInterests: { id: string; label: string; value: string }[];
}

export function useMasterData() {
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/master-data")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data ?? d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}
