"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCRUDOptions {
  endpoint: string;
  limit?: number;
}

export function useAdminCRUD<T extends { id: string }>({ endpoint, limit = 20 }: UseCRUDOptions) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...filters,
      });
      const res = await fetch(`${endpoint}?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTotal(json.total);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteItem = async (id: string) => {
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchData();
      return true;
    }
    return false;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      await fetchData();
      return true;
    }
    return false;
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPage(1);
  };

  const handleSort = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
  };

  return {
    data,
    total,
    page,
    limit,
    search,
    loading,
    sortBy,
    sortOrder,
    setPage,
    setSearch: handleSearch,
    setFilter: handleFilter,
    setSort: handleSort,
    deleteItem,
    toggleActive,
    refetch: fetchData,
  };
}

export async function fetchOne<T>(endpoint: string, id: string): Promise<T | null> {
  const res = await fetch(`${endpoint}/${id}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function createItem<T>(endpoint: string, data: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { success: false, error: json.error?.message || "Failed to create" };
  return { success: true, data: json.data };
}

export async function updateItem<T>(endpoint: string, id: string, data: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  const res = await fetch(`${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { success: false, error: json.error?.message || "Failed to update" };
  return { success: true, data: json.data };
}
