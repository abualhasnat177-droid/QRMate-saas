"use client";

import React, { useState } from 'react';
import { Globe, Mail, Shield, Bell, Check, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('QRMate');
  const [supportEmail, setSupportEmail] = useState('support@qrmate.com');
  const [maxFreeQR, setMaxFreeQR] = useState('5');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Settings saved successfully!');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-4 duration-300">
          <Check size={16} /> {toast}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2D2A26] mb-1">Platform Settings</h1>
        <p className="text-[#6B6560]">Configure global platform settings.</p>
      </div>

      {/* General Settings */}
      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2 mb-6">
          <Globe size={20} className="text-teal-600" /> General
        </h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#3D3833] mb-1.5">Platform Name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full bg-[#EDE8E0] border border-[#D4CCC1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3D3833] mb-1.5">Support Email</label>
            <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full bg-[#EDE8E0] border border-[#D4CCC1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3D3833] mb-1.5">Max QR Codes (Free Plan)</label>
            <input type="number" value={maxFreeQR} onChange={e => setMaxFreeQR(e.target.value)} className="w-full bg-[#EDE8E0] border border-[#D4CCC1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" min="1" max="100" />
          </div>
          <button type="submit" className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-[#2D2A26] text-white hover:bg-[#3D3833]'}`}>
            {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2 mb-6">
          <Bell size={20} className="text-teal-600" /> Notifications
        </h2>
        <div className="space-y-4">
          {[
            { key: 'emailNotify', label: 'Email Alerts', desc: 'Receive email on new signups and failed payments.', state: emailNotify, set: setEmailNotify },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#E4DDD3] last:border-0">
              <div>
                <div className="font-medium text-[#2D2A26] text-sm">{item.label}</div>
                <div className="text-xs text-[#9C958E] mt-0.5">{item.desc}</div>
              </div>
              <button onClick={() => item.set(!item.state)} className={`relative w-11 h-6 rounded-full transition-colors ${item.state ? 'bg-teal-600' : 'bg-[#D4CCC1]'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2 mb-6">
          <Shield size={20} className="text-teal-600" /> Security
        </h2>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-[#2D2A26] text-sm">Maintenance Mode</div>
            <div className="text-xs text-[#9C958E] mt-0.5">Disables public access to the platform.</div>
          </div>
          <button onClick={() => { setMaintenanceMode(!maintenanceMode); showToast(maintenanceMode ? 'Maintenance mode disabled.' : 'Maintenance mode enabled!'); }} className={`relative w-11 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-[#D4CCC1]'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {maintenanceMode && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} /> Platform is in maintenance mode. Users cannot log in.
          </div>
        )}
      </div>
    </div>
  );
}
