"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  MoreHorizontal,
  CheckSquare,
  Square,
  X,
  Filter,
  LayoutGrid,
  LayoutList,
  RefreshCw,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  width?: string;
  hidden?: boolean;
}

interface AdminDataTableProps<T extends { id: string }> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, order: "asc" | "desc") => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  createHref?: string;
  createLabel?: string;
  onEdit?: (item: T) => void;
  editHref?: (item: T) => string;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  viewHref?: (item: T) => string;
  filters?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  onBulkDelete?: (ids: string[]) => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export function AdminDataTable<T extends { id: string }>({
  title,
  description,
  columns,
  data,
  total,
  page,
  limit,
  loading,
  searchValue = "",
  onSearchChange,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  createHref,
  createLabel = "Add New",
  editHref,
  onDelete,
  viewHref,
  filters,
  emptyIcon,
  emptyMessage = "No data found",
  onBulkDelete,
  onExport,
  onRefresh,
}: AdminDataTableProps<T>) {
  const pages = Math.ceil(total / limit);
  const start = total > 0 ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const allSelected = data.length > 0 && data.every((item) => selectedIds.has(item.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)));
    }
  }, [allSelected, data]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    onSort(key, newOrder);
  };

  const visibleColumns = columns.filter((c) => !c.hidden);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center justify-center w-9 h-9 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-500 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
          )}
          {createHref && (
            <Link
              href={createHref}
              className="inline-flex items-center gap-2 h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              {createLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl bulk-bar-enter">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              {selectedIds.size} selected
            </span>
          </div>
          <div className="h-4 w-px bg-blue-200" />
          {onBulkDelete && (
            <button
              onClick={() => onBulkDelete(Array.from(selectedIds))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={clearSelection}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="p-4 border-b border-gray-100/80">
          <div className="flex flex-col sm:flex-row gap-3">
            {onSearchChange && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all"
                />
                {searchValue && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              {filters && (
                <>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "sm:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium transition-all",
                      showFilters
                        ? "border-blue-200 bg-blue-50 text-blue-600"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filters
                  </button>
                  <div className="hidden sm:flex items-center gap-2">
                    {filters}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && filters && (
            <div className="sm:hidden flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {filters}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {(onBulkDelete || onDelete) && (
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3",
                      col.sortable && "cursor-pointer select-none group hover:text-gray-700",
                      col.className
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <span className="text-gray-300 group-hover:text-gray-400 transition-colors">
                          {sortBy === col.key ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="w-3 h-3 text-blue-500" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-500" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {(onBulkDelete || onDelete) && (
                      <td className="px-4 py-4">
                        <div className="w-4 h-4 skeleton rounded" />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-4 py-4">
                        <div className="h-4 skeleton w-3/4 rounded-md" style={{ animationDelay: `${i * 100}ms` }} />
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <div className="h-4 skeleton w-16 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                        {emptyIcon || <Search className="w-6 h-6 text-gray-300" />}
                      </div>
                      <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                      {createHref && (
                        <Link
                          href={createHref}
                          className="mt-4 inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          {createLabel}
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "admin-table-row",
                        isSelected && "bg-blue-50/40"
                      )}
                    >
                      {(onBulkDelete || onDelete) && (
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleSelect(item.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={cn("px-4 py-3.5 text-sm text-gray-700", col.className)}
                        >
                          {col.render
                            ? col.render(item)
                            : String((item as Record<string, unknown>)[col.key] ?? "")}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {viewHref && (
                            <Link
                              href={viewHref(item)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          {editHref && (
                            <Link
                              href={editHref(item)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100/80">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{start}</span> to{" "}
              <span className="font-semibold text-gray-700">{end}</span> of{" "}
              <span className="font-semibold text-gray-700">{total}</span> results
            </p>
            <div className="flex items-center gap-1">
              {/* First page */}
              <button
                onClick={() => onPageChange?.(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let pageNum: number;
                if (pages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pages - 2) {
                  pageNum = pages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                      page === pageNum
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Last page */}
              <button
                onClick={() => onPageChange?.(pages)}
                disabled={page >= pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
