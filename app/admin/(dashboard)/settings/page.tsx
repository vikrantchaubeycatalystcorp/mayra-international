"use client";

import { Settings, Globe, Mail, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><Settings className="w-5 h-5 text-gray-600" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-500">Configure your portal</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "General Settings", desc: "Site name, description, and default values", icon: Globe, color: "bg-blue-50 text-blue-600" },
          { title: "Email Configuration", desc: "SMTP settings and email templates", icon: Mail, color: "bg-emerald-50 text-emerald-600" },
          { title: "Security", desc: "Password policies and session management", icon: Shield, color: "bg-red-50 text-red-600" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}><item.icon className="w-5 h-5" /></div>
            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            <p className="text-xs text-blue-600 mt-3 font-medium">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
