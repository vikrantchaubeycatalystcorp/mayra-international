"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Edit3, Trash2, X, Loader2, Search, ChevronDown, ChevronRight } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface City {
  id: string;
  name: string;
  stateId: string;
  isActive: boolean;
}

interface State {
  id: string;
  name: string;
  code: string;
  countryCode: string;
  isActive: boolean;
  _count?: { cities: number };
  cities?: City[];
}

interface StateFormData {
  name: string;
  code: string;
  countryCode: string;
  isActive: boolean;
}

interface CityFormData {
  name: string;
  isActive: boolean;
}

const EMPTY_STATE_FORM: StateFormData = { name: "", code: "", countryCode: "IN", isActive: true };
const EMPTY_CITY_FORM: CityFormData = { name: "", isActive: true };

export default function AdminStatesPage() {
  const [items, setItems] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "state" | "city"; item: State | City; stateName?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StateFormData>(EMPTY_STATE_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // City state
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [cityForm, setCityForm] = useState<CityFormData>(EMPTY_CITY_FORM);
  const [showCityForm, setShowCityForm] = useState(false);
  const [cityEditId, setCityEditId] = useState<string | null>(null);
  const [cityParentId, setCityParentId] = useState<string | null>(null);
  const [savingCity, setSavingCity] = useState(false);
  const [loadingCities, setLoadingCities] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/states", { credentials: "include" });
      const json = await res.json();
      if (json.success) setItems(json.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchCities = async (stateId: string) => {
    setLoadingCities(stateId);
    try {
      const res = await fetch(`/api/admin/cities?stateId=${stateId}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.map((s) => s.id === stateId ? { ...s, cities: json.data || [] } : s));
      }
    } catch { /* ignore */ } finally { setLoadingCities(null); }
  };

  const toggleExpand = (stateId: string) => {
    if (expandedState === stateId) {
      setExpandedState(null);
    } else {
      setExpandedState(stateId);
      const state = items.find((s) => s.id === stateId);
      if (!state?.cities) fetchCities(stateId);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const url = deleteTarget.type === "state"
        ? `/api/admin/states/${(deleteTarget.item as State).id}`
        : `/api/admin/cities/${(deleteTarget.item as City).id}`;
      await fetch(url, { method: "DELETE", credentials: "include" });
      if (deleteTarget.type === "city") {
        const cityItem = deleteTarget.item as City;
        await fetchCities(cityItem.stateId);
        await fetchData();
      } else {
        await fetchData();
      }
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  const openCreate = () => { setForm(EMPTY_STATE_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item: State) => {
    setForm({ name: item.name, code: item.code, countryCode: item.countryCode, isActive: item.isActive });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/states/${editId}` : "/api/admin/states";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "State updated." : "State created." });
        setShowForm(false);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  // City handlers
  const openCityCreate = (stateId: string) => {
    setCityForm(EMPTY_CITY_FORM);
    setCityEditId(null);
    setCityParentId(stateId);
    setShowCityForm(true);
  };

  const openCityEdit = (city: City) => {
    setCityForm({ name: city.name, isActive: city.isActive });
    setCityEditId(city.id);
    setCityParentId(city.stateId);
    setShowCityForm(true);
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCity(true);
    setMessage(null);
    try {
      const url = cityEditId ? `/api/admin/cities/${cityEditId}` : "/api/admin/cities";
      const body = cityEditId ? cityForm : { ...cityForm, stateId: cityParentId };
      const res = await fetch(url, {
        method: cityEditId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: cityEditId ? "City updated." : "City created." });
        setShowCityForm(false);
        if (cityParentId) fetchCities(cityParentId);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSavingCity(false); }
  };

  const set = (key: keyof StateFormData, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">States & Cities</h1>
            <p className="text-sm text-gray-500">Manage states and their cities</p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add State
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No states found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleExpand(item.id)} className="p-1 rounded hover:bg-gray-100">
                      {expandedState === item.id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">Code: {item.code} &middot; Country: {item.countryCode} &middot; Cities: {item._count?.cities ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget({ type: "state", item })} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {expandedState === item.id && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-3 pl-12">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cities</p>
                      <button onClick={() => openCityCreate(item.id)} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        <Plus className="w-3 h-3" /> Add City
                      </button>
                    </div>
                    {loadingCities === item.id ? (
                      <div className="py-4 text-center"><Loader2 className="w-4 h-4 text-blue-500 animate-spin mx-auto" /></div>
                    ) : !item.cities || item.cities.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">No cities yet</p>
                    ) : (
                      <div className="space-y-1">
                        {item.cities.map((city) => (
                          <div key={city.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white transition-colors">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-700">{city.name}</p>
                              <StatusBadge status={city.isActive ? "active" : "inactive"} label={city.isActive ? "Active" : "Inactive"} />
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openCityEdit(city)} className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteTarget({ type: "city", item: city, stateName: item.name })} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* State Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit State" : "Add State"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Name</label><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Maharashtra" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Code</label><input className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value)} required placeholder="e.g. MH" /></div>
                <div><label className={labelClass}>Country Code</label><input className={inputClass} value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)} required placeholder="e.g. IN" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded border-gray-300" /> Active
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* City Form Modal */}
      {showCityForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCityForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowCityForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{cityEditId ? "Edit City" : "Add City"}</h3>
            <form onSubmit={handleCitySubmit} className="space-y-4">
              <div><label className={labelClass}>City Name</label><input className={inputClass} value={cityForm.name} onChange={(e) => setCityForm((p) => ({ ...p, name: e.target.value }))} required placeholder="e.g. Mumbai" /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cityForm.isActive} onChange={(e) => setCityForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded border-gray-300" /> Active
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCityForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingCity} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {savingCity && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{cityEditId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.type === "state" ? "Delete State" : "Delete City"}
        message={deleteTarget?.type === "state"
          ? `Delete "${(deleteTarget?.item as State)?.name}"? All associated cities will also be removed.`
          : `Delete city "${(deleteTarget?.item as City)?.name}" from ${deleteTarget?.stateName}?`}
        loading={deleting}
      />
    </div>
  );
}
