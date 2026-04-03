"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Activity, Calendar, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Clock, User, Shield, Download, X, RefreshCw,
  Plus, Pencil, Trash2, LogIn, LogOut, FileDown, ToggleLeft, ToggleRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
} from "lucide-react";

/* ─── types ─── */
interface Admin { id: string; name: string; email: string; avatar: string | null }
interface ActivityLog {
  id: string; action: string; entity: string; entityId: string | null;
  details: string | null; ipAddress: string | null; createdAt: string;
  admin: Admin;
}
interface FilterOption { value: string; count: number }
interface AdminOption { id: string; name: string; email: string }
interface ApiResponse {
  success: boolean; data: ActivityLog[]; total: number;
  page: number; limit: number; pages: number;
  filters: { actions: FilterOption[]; entities: FilterOption[]; admins: AdminOption[] };
}

/* ─── constants ─── */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ACTION_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  CREATE: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: Plus },
  UPDATE: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Pencil },
  DELETE: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: Trash2 },
  LOGIN: { color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: LogIn },
  LOGOUT: { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: LogOut },
  EXPORT: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: FileDown },
  ACTIVATE: { color: "text-teal-700", bg: "bg-teal-50 border-teal-200", icon: ToggleRight },
  DEACTIVATE: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: ToggleLeft },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: Activity };
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  return { date, time };
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return "";
}

/* ─── main component ─── */
export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    actions: FilterOption[]; entities: FilterOption[]; admins: AdminOption[];
  }>({ actions: [], entities: [], admins: [] });
  const [exporting, setExporting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit), sortBy, sortOrder,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity", entityFilter);
      if (adminFilter) params.set("adminId", adminFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const json: ApiResponse = await res.json();
        setLogs(json.data);
        setTotal(json.total);
        setPages(json.pages);
        setFilterOptions(json.filters);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, actionFilter, entityFilter, adminFilter, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const activeFilterCount = [actionFilter, entityFilter, adminFilter, dateFrom, dateTo].filter(Boolean).length;

  const clearFilters = () => {
    setActionFilter(""); setEntityFilter(""); setAdminFilter("");
    setDateFrom(""); setDateTo(""); setSearch(""); setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "10000", sortBy, sortOrder });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity", entityFilter);
      if (adminFilter) params.set("adminId", adminFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) return;
      const json: ApiResponse = await res.json();

      const rows = [
        ["Timestamp", "Admin", "Email", "Action", "Entity", "Entity ID", "Details", "IP Address"],
        ...json.data.map((l) => [
          new Date(l.createdAt).toISOString(),
          l.admin.name, l.admin.email, l.action, l.entity,
          l.entityId || "", l.details || "", l.ipAddress || "",
        ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
    return sortOrder === "desc"
      ? <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
      : <ArrowUp className="w-3.5 h-3.5 text-blue-600" />;
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Complete record of all admin actions &middot; {total.toLocaleString()} total entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={exportCSV} disabled={exporting || total === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <Download className={`w-3.5 h-3.5 ${exporting ? "animate-spin" : ""}`} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin name, email, action, entity, or details..."
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Toggle filters */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border rounded-lg transition-all whitespace-nowrap ${
              showFilters || activeFilterCount > 0
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Action filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Action</label>
              <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                <option value="">All Actions</option>
                {filterOptions.actions.map((a) => (
                  <option key={a.value} value={a.value}>{a.value} ({a.count})</option>
                ))}
              </select>
            </div>
            {/* Entity filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entity</label>
              <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                <option value="">All Entities</option>
                {filterOptions.entities.map((e) => (
                  <option key={e.value} value={e.value}>{e.value} ({e.count})</option>
                ))}
              </select>
            </div>
            {/* Admin filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Admin</label>
              <select value={adminFilter} onChange={(e) => { setAdminFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                <option value="">All Admins</option>
                {filterOptions.admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            {/* Date from */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            {/* Date to */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {actionFilter && (
              <FilterChip label={`Action: ${actionFilter}`} onRemove={() => setActionFilter("")} />
            )}
            {entityFilter && (
              <FilterChip label={`Entity: ${entityFilter}`} onRemove={() => setEntityFilter("")} />
            )}
            {adminFilter && (
              <FilterChip
                label={`Admin: ${filterOptions.admins.find((a) => a.id === adminFilter)?.name || adminFilter}`}
                onRemove={() => setAdminFilter("")}
              />
            )}
            {dateFrom && (
              <FilterChip label={`From: ${dateFrom}`} onRemove={() => setDateFrom("")} />
            )}
            {dateTo && (
              <FilterChip label={`To: ${dateTo}`} onRemove={() => setDateTo("")} />
            )}
            <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-medium ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Logs table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_120px_140px_180px_100px] gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100">
          <button onClick={() => handleSort("entity")} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 text-left">
            Event <SortIcon field="entity" />
          </button>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Action</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Admin</span>
          <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 text-left">
            Timestamp <SortIcon field="createdAt" />
          </button>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Details</span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: limit > 10 ? 10 : limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/3" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">No audit logs found</p>
            <p className="text-xs text-gray-300 mt-1">
              {debouncedSearch || activeFilterCount > 0
                ? "Try adjusting your search or filters"
                : "Activity will appear here as admins perform actions"}
            </p>
            {(debouncedSearch || activeFilterCount > 0) && (
              <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => {
              const config = getActionConfig(log.action);
              const ActionIcon = config.icon;
              const { date, time } = formatDateTime(log.createdAt);
              const ago = timeAgo(log.createdAt);
              const isExpanded = expandedRow === log.id;

              return (
                <div key={log.id}>
                  {/* Desktop row */}
                  <div
                    onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    className="hidden lg:grid lg:grid-cols-[1fr_120px_140px_180px_100px] gap-4 items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    {/* Event */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg border ${config.bg} flex items-center justify-center shrink-0`}>
                        <ActionIcon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">
                          {log.details || `${log.action} ${log.entity}`}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                        </p>
                      </div>
                    </div>
                    {/* Action badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border ${config.bg} ${config.color}`}>
                        {log.action}
                      </span>
                    </div>
                    {/* Admin */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-white">{log.admin.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-gray-600 truncate">{log.admin.name}</span>
                    </div>
                    {/* Timestamp */}
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-gray-400">{time}</span>
                        {ago && <span className="text-gray-300 ml-1">({ago})</span>}
                      </div>
                    </div>
                    {/* Expand */}
                    <div className="text-right">
                      <button className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile row */}
                  <div
                    onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    className="lg:hidden flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-lg border ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <ActionIcon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{log.details || `${log.action} ${log.entity}`}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.bg} ${config.color}`}>
                          {log.action}
                        </span>
                        <span className="text-[11px] text-gray-400">{log.entity}</span>
                        <span className="text-[11px] text-gray-300">&middot;</span>
                        <span className="text-[11px] text-gray-400">{log.admin.name}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-[11px] text-gray-400">{date} {time}</span>
                        {ago && <span className="text-[11px] text-gray-300 ml-1">{ago}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="bg-gray-50/60 border-t border-gray-100 px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <DetailItem icon={Shield} label="Log ID" value={log.id} mono />
                        <DetailItem icon={User} label="Admin" value={`${log.admin.name} (${log.admin.email})`} />
                        <DetailItem icon={Activity} label="Entity / ID" value={`${log.entity}${log.entityId ? ` / ${log.entityId}` : ""}`} />
                        <DetailItem icon={Clock} label="Full Timestamp" value={new Date(log.createdAt).toLocaleString("en-IN", {
                          dateStyle: "full", timeStyle: "medium",
                        })} />
                        {log.ipAddress && <DetailItem icon={Shield} label="IP Address" value={log.ipAddress} mono />}
                        {log.details && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <DetailItem icon={Activity} label="Details" value={log.details} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-gray-50/50 border-t border-gray-100">
            {/* Left: rows per page + showing info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <span>
                Showing <span className="font-semibold text-gray-700">{startItem}</span>
                {" - "}
                <span className="font-semibold text-gray-700">{endItem}</span>
                {" of "}
                <span className="font-semibold text-gray-700">{total.toLocaleString()}</span>
              </span>
            </div>
            {/* Right: page controls */}
            <div className="flex items-center gap-1">
              <PaginationBtn onClick={() => setPage(1)} disabled={page <= 1} title="First page">
                <ChevronsLeft className="w-4 h-4" />
              </PaginationBtn>
              <PaginationBtn onClick={() => setPage(page - 1)} disabled={page <= 1} title="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </PaginationBtn>
              <PageNumbers current={page} total={pages} onSelect={setPage} />
              <PaginationBtn onClick={() => setPage(page + 1)} disabled={page >= pages} title="Next page">
                <ChevronRight className="w-4 h-4" />
              </PaginationBtn>
              <PaginationBtn onClick={() => setPage(pages)} disabled={page >= pages} title="Last page">
                <ChevronsRight className="w-4 h-4" />
              </PaginationBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── subcomponents ─── */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
      {label}
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:text-blue-900">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function DetailItem({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-400 mb-0.5">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-gray-700 text-xs break-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function PaginationBtn({ onClick, disabled, title, children }: { onClick: () => void; disabled: boolean; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-700 border border-transparent hover:border-gray-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:cursor-not-allowed">
      {children}
    </button>
  );
}

function PageNumbers({ current, total, onSelect }: { current: number; total: number; onSelect: (p: number) => void }) {
  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return (
    <div className="flex items-center gap-0.5 mx-1">
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">...</span>
        ) : (
          <button key={p} onClick={() => onSelect(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all ${
              p === current
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:border-gray-200 border border-transparent"
            }`}>
            {p}
          </button>
        )
      )}
    </div>
  );
}
