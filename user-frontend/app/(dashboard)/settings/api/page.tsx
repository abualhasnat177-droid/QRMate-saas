"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import {
  Key, Plus, Trash2, Copy, CheckCircle2, AlertCircle,
  RefreshCw, Zap, Shield, BarChart3, Code
} from 'lucide-react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  callsUsed: number;
  callsLimit: number;
  lastUsedAt: string | null;
  createdAt: string;
  rawKey?: string; // Only shown once after creation
}

export default function ApiSettingsPage() {
  const { isDark } = useTheme();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyModal, setShowNewKeyModal] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [userPlan, setUserPlan] = useState('FREE');

  useEffect(() => {
    const ud = localStorage.getItem('user');
    if (ud) { try { setUserPlan(JSON.parse(ud).plan || 'FREE'); } catch {} }
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/user/keys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setKeys(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).apiKeys)) {
        // Handle alternative response format if present
        setKeys((data as any).apiKeys);
      } else {
        setKeys([]);
      }
    } catch (err) { 
      console.error(err);
      setKeys([]);
    }
    setLoading(false);
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/user/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewKeyModal(data.apiKey);
        setNewKeyName('');
        fetchKeys();
      }
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will stop working.')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/user/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchKeys();
    } catch (err) { console.error(err); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardClass = `${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-6 shadow-sm`;

  if (userPlan === 'FREE') {
    return (
      <div className={`max-w-2xl mx-auto text-center py-20 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-teal-500/10' : 'bg-teal-50'}`}>
          <Code size={32} className="text-teal-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Developer API Access</h2>
        <p className={`text-sm mb-8 max-w-md mx-auto ${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'}`}>
          Integrate QRMate directly into your apps. Pro and Business plans include full API access with high rate limits.
        </p>
        <Link href="/billing" className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
          Upgrade for API Access <Zap size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>API Keys</h1>
          <p className={`text-sm ${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'}`}>Manage your production API keys and monitor usage.</p>
        </div>
        <Link href="/docs/api" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-[#2e2e2e] text-[#f1f5f9] hover:bg-[#F5F1EB]/5' : 'border-[#D4CCC1] text-[#3D3833] hover:bg-[#EDE8E0]'}`}>
           View Documentation <ArrowRight size={14} />
        </Link>
      </div>

      <div className={cardClass}>
        <div className="flex gap-3">
          <input 
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production Mobile App)"
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 text-white' : 'bg-[#EDE8E0] border-[#D4CCC1] text-[#2D2A26]'}`}
          />
          <button 
            onClick={createKey}
            disabled={creating || !newKeyName}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
          >
            {creating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            Generate Key
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="text-teal-500 animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${isDark ? 'border-[#2e2e2e]' : 'border-[#E4DDD3]'}`}>
            <Shield size={48} strokeWidth={1} className="mx-auto mb-4 text-[#D4CCC1]" />
            <p className="text-sm font-bold text-[#9C958E]">No active API keys found</p>
          </div>
        ) : (
          keys.map(key => (
            <div key={key.id} className={cardClass}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-[#F5F1EB]/5 text-[#9C958E]' : 'bg-[#EDE8E0] text-[#9C958E]'}`}>
                      <Key size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold">{key.name}</h3>
                      <code className="text-xs text-teal-500 font-mono tracking-wider">{key.keyPrefix}••••••••••••••••</code>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9C958E]">
                      <Clock size={12} /> Created {new Date(key.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9C958E]">
                      <RefreshCw size={12} /> Last used {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9C958E]">Usage Meter</span>
                    <span className="text-xs font-black tabular-nums">{key.callsUsed.toLocaleString()} / {key.callsLimit.toLocaleString()}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#E4DDD3]'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${key.callsUsed / key.callsLimit > 0.9 ? 'bg-red-500' : 'bg-teal-600'}`} 
                      style={{ width: `${Math.min((key.callsUsed / key.callsLimit) * 100, 100)}%` }} 
                    />
                  </div>
                  <button 
                    onClick={() => deleteKey(key.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20"
                  >
                    <Trash2 size={12} /> Revoke Key
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-[#F5F1EB] border-[#D4CCC1]'} animate-in zoom-in-95 duration-300`}>
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">API Key Generated</h2>
            <p className={`text-sm text-center mb-6 ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
              Please copy this key now. For security, we won&apos;t show it again.
            </p>
            
            <div className={`relative p-4 rounded-xl font-mono text-xs break-all border mb-6 ${isDark ? 'bg-[#121212] border-white/5 text-emerald-400' : 'bg-[#EDE8E0] border-[#D4CCC1] text-emerald-600'}`}>
              {showNewKeyModal.rawKey}
              <button 
                onClick={() => copyToClipboard(showNewKeyModal.rawKey!)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#F5F1EB]/10 hover:bg-[#F5F1EB]/20 transition-all"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            <button 
              onClick={() => setShowNewKeyModal(null)}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
            >
              I&apos;ve saved the key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}

function Clock(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
