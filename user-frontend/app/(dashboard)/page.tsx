"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, QrCode, TrendingUp, ExternalLink, RefreshCw, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QRCode {
  id: string;
  title: string;
  destination: string;
  qrType: string;
  _count?: { scans: number };
  createdAt: string;
}

import { useTheme } from '../ThemeContext';

export default function DashboardPage() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    qrCodes: 0,
    totalScans: 0,
  });
  const [recentQrs, setRecentQrs] = useState<QRCode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`;
      try {
        const [statsRes, qrsRes] = await Promise.all([
          fetch(`${API_URL}/api/user/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/qr/my-codes`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const statsData = await statsRes.json();
        const qrsData = await qrsRes.json();
        
        if (statsData.success) {
          setStats(statsData.stats);
        }
        
        if (qrsData.success && Array.isArray(qrsData.codes)) {
          setRecentQrs(qrsData.codes.slice(0, 5));
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`space-y-8 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Dashboard</h1>
          <p className={`${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'} text-sm`}>Monitor your QR code performance and activity.</p>
        </div>
        
        <Link 
          href="/create" 
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
        >
          <Plus size={18} /> 
          <span>Create New QR</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', value: stats.totalScans.toLocaleString(), icon: <BarChart3 size={20} className="text-teal-600" /> },
          { label: 'Total QR Codes', value: stats.qrCodes, icon: <QrCode size={20} className="text-blue-600" /> },
          { label: 'Growth', value: '+12.5%', icon: <TrendingUp size={20} className="text-emerald-600" /> },
          { label: 'Active', value: stats.qrCodes, icon: <RefreshCw size={20} className="text-orange-600" /> },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-wider`}>{stat.label}</div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#EDE8E0]'} group-hover:scale-110 transition-transform`}>
                 {stat.icon}
              </div>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} tabular-nums`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className={`lg:col-span-2 ${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-8 shadow-sm transition-colors`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Recent QR Codes</h2>
            <Link href="/analytics" className="text-xs font-bold text-teal-500 hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] font-black ${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'} uppercase tracking-[0.2em] border-b ${isDark ? 'border-[#2e2e2e]' : 'border-[#E4DDD3]'}`}>
                  <th className="pb-4 px-4">Asset</th>
                  <th className="pb-4 px-4">Type</th>
                  <th className="pb-4 px-4 text-center">Scans</th>
                  <th className="pb-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#2e2e2e]' : 'divide-slate-50'}`}>
                {recentQrs.length > 0 ? recentQrs.map((qr) => (
                  <tr key={qr.id} className={`${isDark ? 'hover:bg-[#F5F1EB]/5' : 'hover:bg-[#EDE8E0]'} transition-colors group`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-[#121212] border-[#2e2e2e]' : 'bg-[#E4DDD3] border-[#D4CCC1]'} border flex items-center justify-center text-[#6B6560]`}>
                          <QrCode size={18} className="text-teal-500" />
                        </div>
                        <div>
                          <div className={`font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} text-sm`}>{qr.title}</div>
                          <div className={`text-[10px] font-medium ${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'} truncate max-w-[150px]`}>{qr.destination}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                        {qr.qrType || 'URL'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-sm font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} tabular-nums`}>{qr._count?.scans || 0}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link 
                        href={`/qr/${qr.id}/analytics`}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-teal-400' : 'text-teal-600'} hover:underline`}
                      >
                        Details
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <QrCode size={48} strokeWidth={1} className={isDark ? 'text-[#64748b]' : 'text-[#D4CCC1]'} />
                        <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'}`}>No codes found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Sidebar */}
        <div className="space-y-6">
           <div className={`rounded-2xl p-8 text-white shadow-xl relative overflow-hidden transition-all ${isDark ? 'bg-teal-600 border border-teal-500 shadow-teal-600/10' : 'bg-teal-600'}`}>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 tracking-tight">Upgrade to Pro</h3>
                <p className="text-teal-100 text-sm mb-8 opacity-80">Unlock advanced analytics, custom branding, and bulk generation.</p>
                <Link href="/billing" className={`block w-full py-3 bg-[#F5F1EB] text-teal-600 rounded-xl font-black text-xs uppercase tracking-widest text-center shadow-lg transition-all hover:bg-teal-50 hover:scale-[1.02]`}>
                   View Plans
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F1EB]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
           </div>

           <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-8 shadow-sm transition-colors`}>
              <h3 className={`text-md font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} mb-8`}>Resources</h3>
              <div className="space-y-6">
                 {[
                   { t: 'Getting Started', d: 'How to create your first code' },
                   { t: 'Customization', d: 'Make your QR codes unique' },
                   { t: 'Analytics Guide', d: 'Understanding your data' }
                 ].map((item, i) => (
                   <button key={i} className="w-full text-left group flex items-start gap-4">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${isDark ? 'bg-[#2e2e2e]' : 'bg-slate-300'} group-hover:bg-teal-500 transition-all group-hover:scale-125`} />
                      <div>
                        <div className={`text-sm font-bold ${isDark ? 'text-[#e2e8f0]' : 'text-[#2D2A26]'} group-hover:text-teal-500 transition-colors`}>{item.t}</div>
                        <div className={`text-[10px] font-bold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-widest mt-1`}>{item.d}</div>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

