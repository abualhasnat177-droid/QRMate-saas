"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Trash2, Check, RefreshCw, Mail, Key } from 'lucide-react';

import { useTheme } from '../../ThemeContext';

export default function SettingsPage() {
  const { isDark } = useTheme();
  const [user, setUser] = useState({ name: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    scanAlerts: true,
    weeklyReport: true,
    productUpdates: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          // Defer update to avoid synchronous setState in effect warning
          setTimeout(() => {
            setUser({ name: parsed.name || '', email: parsed.email || '' });
          }, 0);
        } catch (err) {
          console.error('Settings: Failed to parse user data', err);
        }
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    const currentData = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentData, name: user.name }));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-8 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Settings</h1>
        <p className={`${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'} text-sm`}>Manage your profile, security, and notification preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Settings */}
        <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-xl p-8 shadow-sm transition-colors`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md">
              <User size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Profile</h2>
              <p className={`${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} text-sm`}>Update your personal information.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-wider mb-2`}>Full Name</label>
                <div className="relative">
                   <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" />
                   <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className={`w-full border rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-semibold ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#f1f5f9] focus:border-teal-500' : 'bg-[#EDE8E0] border-[#D4CCC1] text-[#2D2A26] focus:border-teal-600'}`}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-wider mb-2`}>Email Address</label>
                <div className="relative">
                   <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C958E]" />
                   <input
                    type="email"
                    value={user.email}
                    disabled
                    className={`w-full border rounded-lg pl-12 pr-4 py-2.5 cursor-not-allowed opacity-50 text-sm font-semibold ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#94a3b8]' : 'bg-[#E4DDD3] border-[#D4CCC1] text-[#2D2A26]'}`}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${saved ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'}`}
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
                <span>{saved ? 'Saved' : isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security */}
        <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-xl p-8 shadow-sm transition-colors`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e]' : 'bg-[#E4DDD3] border-[#D4CCC1]'} border flex items-center justify-center text-teal-600`}>
              <Key size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Security</h2>
              <p className={`${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} text-sm`}>Update your password and security settings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-wider mb-2`}>New Password</label>
              <input type="password" placeholder="••••••••" className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-semibold ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#f1f5f9] focus:border-teal-500' : 'bg-[#EDE8E0] border-[#D4CCC1] text-[#2D2A26] focus:border-teal-600'}`} />
            </div>
            <div>
              <label className={`block text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-wider mb-2`}>Confirm Password</label>
              <input type="password" placeholder="••••••••" className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-semibold ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#f1f5f9] focus:border-teal-500' : 'bg-[#EDE8E0] border-[#D4CCC1] text-[#2D2A26] focus:border-teal-600'}`} />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#f1f5f9] hover:bg-[#F5F1EB]/10' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#3D3833] hover:bg-[#EDE8E0]'}`}>
              Update Password
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-xl p-8 shadow-sm transition-colors`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e]' : 'bg-[#E4DDD3] border-[#D4CCC1]'} border flex items-center justify-center text-teal-600`}>
              <Bell size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Notifications</h2>
              <p className={`${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} text-sm`}>Manage your email alerts and reports.</p>
            </div>
          </div>

          <div className={`divide-y ${isDark ? 'divide-[#2e2e2e]' : 'divide-slate-100'}`}>
            {[
              { key: 'scanAlerts', label: 'Scan Notifications', desc: 'Get an email for every scan event.' },
              { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Receive a weekly performance report.' },
              { key: 'productUpdates', label: 'Product Updates', desc: 'Stay informed on new features and updates.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-6 first:pt-0 last:pb-0">
                <div className="max-w-md">
                  <div className={`font-bold text-sm mb-1 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>{item.label}</div>
                  <div className={`text-xs font-semibold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>{item.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifications[item.key as keyof typeof notifications] ? 'bg-teal-600' : (isDark ? 'bg-[#2e2e2e]' : 'bg-slate-200')}`}
                >
                  <div 
                    className={`absolute top-1 left-1 w-4 h-4 bg-[#F5F1EB] rounded-full transition-transform duration-200 ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} 
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className={`${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'} border rounded-xl p-8 shadow-sm transition-colors`}>
          <div className="flex items-center gap-4 mb-6">
             <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-[#F5F1EB] border-red-100'} border flex items-center justify-center text-red-600 shadow-sm`}>
                <Trash2 size={24} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
                <p className={`${isDark ? 'text-red-500/40' : 'text-red-700/60'} font-bold text-[10px] uppercase tracking-wider`}>Irreversible Action</p>
             </div>
          </div>
          <p className={`${isDark ? 'text-red-500/60' : 'text-red-700/70'} text-sm font-semibold mb-8 max-w-2xl leading-relaxed`}>
            Deleting your account will permanently remove all your QR codes, analytics data, and subscription information. This cannot be undone.
          </p>
          <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border ${isDark ? 'bg-red-600 text-white border-red-500 hover:bg-red-700' : 'bg-[#F5F1EB] border-red-200 text-red-600 hover:bg-red-600 hover:text-white'}`}>
            Delete Account
          </button>
        </div>
      </div>
    </div>

  );
}
