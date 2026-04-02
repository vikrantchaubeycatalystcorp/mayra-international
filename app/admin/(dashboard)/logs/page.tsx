"use client";

import { useEffect, useState } from "react";
import { Activity, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ActivityLog { id: string; action: string; entity: string; entityId: string | null; details: string | null; createdAt: string; }

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/analytics/overview");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data?.recentActivity || []);
        }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-50 text-green-700",
    UPDATE: "bg-blue-50 text-blue-700",
    DELETE: "bg-red-50 text-red-700",
    LOGIN: "bg-violet-50 text-violet-700",
    LOGOUT: "bg-gray-50 text-gray-700",
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Activity Logs</h1>
      <p className="text-sm text-gray-500 mb-6">Recent admin activity</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12"><Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">No activity logs yet</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Activity className="w-4 h-4 text-blue-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.details || `${log.action} ${log.entity}`}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${actionColors[log.action] || "bg-gray-50 text-gray-600"}`}>{log.action}</span>
                    <span className="text-[10px] text-gray-400">{log.entity}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3" />{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
