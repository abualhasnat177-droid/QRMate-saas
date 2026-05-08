"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '../../../../ThemeContext';
import {
  BarChart3, Smartphone, Monitor, Tablet, Globe, Clock,
  ArrowLeft, Download, RefreshCw, TrendingUp, Users, CalendarDays
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  totalScans: number;
  uniqueScans: number;
  scansToday: number;
  scansThisWeek: number;
  timeline: { date: string; count: number }[];
  deviceBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  topCountries: { country: string; count: number }[];
  recentScans: {
    scannedAt: string;
    country: string;
    city: string;
    deviceType: string;
    os: string;
    browser: string;
    referrer: string;
  }[];
}

export default function QRAnalyticsPage() {
  const { isDark } = useTheme();
  const params = useParams();
  const qrId = params.id as string;
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [gated, setGated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('FREE');

  useEffect(() => {
    const ud = localStorage.getItem('user');
    if (ud) { try { setUserPlan(JSON.parse(ud).plan || 'FREE'); } catch {} }
  }, []);

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qr/${qrId}/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrmate-analytics-${qrId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qr/${qrId}/analytics?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setData(json.analytics);
          setGated(json.gated || false);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchAnalytics();
  }, [qrId, range]);

  const cardClass = `${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-sm`;
  const labelClass = `text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-slate-400'} uppercase tracking-wider`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={32} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className={`text-center py-20 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No analytics data found.</div>;
  }

  const timelineMax = Math.max(...(data.timeline?.map(t => t.count) || [1]), 1);

  return (
    <div className={`space-y-6 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className={`p-2 rounded-lg border ${isDark ? 'border-[#2e2e2e] hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-colors`}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>QR Analytics</h1>
            <p className={`text-sm ${isDark ? 'text-[#94a3b8]' : 'text-slate-500'}`}>Scan performance & audience insights</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userPlan === 'BUSINESS' && !gated && (
            <button 
              onClick={handleExport}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isDark ? 'border-[#2e2e2e] text-[#f1f5f9] hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          <div className={`flex items-center gap-1 p-1 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-white border-slate-200'}`}>
            {(['7d', '30d', '90d', 'all'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${range === r ? 'bg-indigo-600 text-white' : (isDark ? 'text-[#94a3b8] hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gated message for free users */}
      {gated && (
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} text-center`}>
          <p className={`text-sm font-bold mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
            You&apos;re seeing basic analytics. Upgrade to Pro for full charts, geo data, device breakdown & more.
          </p>
          <Link href="/billing" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-wider">
            Upgrade to Pro →
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: data.totalScans, icon: <BarChart3 size={20} className="text-indigo-500" /> },
          { label: 'Unique Scans', value: data.uniqueScans || '—', icon: <Users size={20} className="text-blue-500" /> },
          { label: 'Today', value: data.scansToday || 0, icon: <CalendarDays size={20} className="text-emerald-500" /> },
          { label: 'This Week', value: data.scansThisWeek || 0, icon: <TrendingUp size={20} className="text-orange-500" /> },
        ].map((c, i) => (
          <div key={i} className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <span className={labelClass}>{c.label}</span>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>{c.icon}</div>
            </div>
            <div className={`text-3xl font-black tabular-nums ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
          </div>
        ))}
      </div>

      {!gated && data.timeline && (
        <>
          {/* Timeline Chart */}
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>Scans Over Time</h3>
            <div className="flex items-end gap-1 h-48">
              {data.timeline.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full rounded-t bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer relative min-h-[2px]" style={{ height: `${Math.max((t.count / timelineMax) * 100, 1)}%` }}>
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 ${isDark ? 'bg-[#1e1e1e] border border-[#2e2e2e] text-white' : 'bg-white border border-slate-200 text-slate-900 shadow-lg'}`}>
                      {t.count}
                    </div>
                  </div>
                  {i % Math.ceil(data.timeline.length / 7) === 0 && (
                    <span className={`text-[8px] font-bold ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>{t.date.slice(5)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Device + OS + Countries */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Type */}
            <div className={cardClass}>
              <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>Device Type</h3>
              <div className="space-y-3">
                {Object.entries(data.deviceBreakdown || {}).map(([device, count]) => {
                  const total = Object.values(data.deviceBreakdown).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={device}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-2">
                          {device === 'Mobile' ? <Smartphone size={12} /> : device === 'Tablet' ? <Tablet size={12} /> : <Monitor size={12} />}
                          {device}
                        </span>
                        <span className={isDark ? 'text-[#64748b]' : 'text-slate-400'}>{pct}%</span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OS */}
            <div className={cardClass}>
              <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>Operating System</h3>
              <div className="space-y-3">
                {Object.entries(data.osBreakdown || {}).map(([os, count]) => {
                  const total = Object.values(data.osBreakdown).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={os}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{os}</span>
                        <span className={isDark ? 'text-[#64748b]' : 'text-slate-400'}>{pct}%</span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Countries */}
            <div className={cardClass}>
              <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>Top Countries</h3>
              <div className="space-y-3">
                {(data.topCountries || []).map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-700'}`}>
                      <Globe size={12} className="text-indigo-500" />
                      {c.country}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className={cardClass}>
            <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-[#f1f5f9]' : 'text-slate-900'}`}>Recent Scans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`${isDark ? 'text-[#64748b]' : 'text-slate-400'} font-bold uppercase tracking-wider border-b ${isDark ? 'border-[#2e2e2e]' : 'border-slate-100'}`}>
                    <th className="pb-3 pr-4">Time</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Device</th>
                    <th className="pb-3 pr-4">OS</th>
                    <th className="pb-3 pr-4">Browser</th>
                    <th className="pb-3">Referrer</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#2e2e2e]' : 'divide-slate-50'}`}>
                  {(data.recentScans || []).map((s, i) => (
                    <tr key={i} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="py-3 pr-4 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className={isDark ? 'text-[#64748b]' : 'text-slate-400'} />
                          {new Date(s.scannedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{s.city}, {s.country}</td>
                      <td className="py-3 pr-4">{s.deviceType}</td>
                      <td className="py-3 pr-4">{s.os}</td>
                      <td className="py-3 pr-4">{s.browser}</td>
                      <td className={`py-3 ${isDark ? 'text-[#64748b]' : 'text-slate-400'}`}>{s.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
