"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Globe, Smartphone, Monitor, 
  ArrowUpRight, ArrowDownRight, RefreshCw, QrCode, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/user/analytics?range=${range}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cardClass = `border ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#F5F1EB] border-[#E4DDD3]'} rounded-3xl p-6 shadow-sm transition-all`;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={32} className="text-teal-500 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || { total: 0, unique: 0, mobile: 0, desktop: 0 };
  const timeline = data?.timeline || [];
  const topQrs = data?.topQrs || [];
  const chartMax = Math.max(...timeline.map((d: any) => d.count), 1);

  return (
    <div className={`space-y-8 pb-12 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Analytics</h1>
          <p className={isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}>Aggregated performance across all your assets.</p>
        </div>
        
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#F5F1EB]/5 border-white/5' : 'bg-[#EDE8E0] border-[#D4CCC1]'}`}>
          {(['7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${range === r ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : (isDark ? 'text-[#6B6560] hover:text-[#D4CCC1]' : 'text-[#9C958E] hover:text-[#6B6560]')}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Scans', value: stats.total.toLocaleString(), icon: <BarChart3 size={20} className="text-teal-500" />, trend: '+12%' },
          { label: 'Unique Users', value: stats.unique.toLocaleString(), icon: <Globe size={20} className="text-emerald-500" />, trend: '+8%' },
          { label: 'Mobile Share', value: `${stats.total > 0 ? Math.round((stats.mobile / stats.total) * 100) : 0}%`, icon: <Smartphone size={20} className="text-blue-500" />, trend: '+5%' },
          { label: 'Desktop Share', value: `${stats.total > 0 ? Math.round((stats.desktop / stats.total) * 100) : 0}%`, icon: <Monitor size={20} className="text-orange-500" />, trend: '-2%' },
        ].map((card, i) => (
          <div key={i} className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#EDE8E0]'} border border-[#E4DDD3] dark:border-white/5 flex items-center justify-center`}>
                {card.icon}
              </div>
              <div className={`text-[10px] font-black tracking-widest ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                {card.trend}
              </div>
            </div>
            <div className="text-[10px] font-black text-[#9C958E] uppercase tracking-[0.2em] mb-1">{card.label}</div>
            <div className="text-2xl font-black tabular-nums">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Chart */}
        <div className={`lg:col-span-2 ${cardClass}`}>
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp size={18} className="text-teal-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Scan Velocity</h3>
          </div>
          
          <div className="flex items-end gap-2 h-64">
            {timeline.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div 
                  className="w-full rounded-t-lg bg-teal-600 transition-all cursor-help relative group-hover:bg-teal-400" 
                  style={{ height: `${(d.count / chartMax) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#2D2A26] text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                    {d.count} scans • {new Date(d.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
             <span className="text-[10px] font-black text-[#9C958E] uppercase tracking-widest">{new Date(timeline[0]?.date).toLocaleDateString()}</span>
             <span className="text-[10px] font-black text-[#9C958E] uppercase tracking-widest">Today</span>
          </div>
        </div>

        {/* Top Performers */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-8">
            <QrCode size={18} className="text-teal-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Top Performers</h3>
          </div>
          
          <div className="space-y-6">
            {topQrs.length > 0 ? topQrs.map((qr: any, i: number) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-wider truncate max-w-[150px]">{qr.name}</span>
                  <span className="text-xs font-black tabular-nums text-teal-500">{qr.scans.toLocaleString()}</span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#EDE8E0]'} overflow-hidden`}>
                  <div 
                    className="h-full bg-teal-600 transition-all duration-1000"
                    style={{ width: `${(qr.scans / (topQrs[0]?.scans || 1)) * 100}%` }}
                  />
                </div>
                <Link 
                  href={`/qr/${qr.id}/analytics`}
                  className="mt-2 text-[9px] font-black text-[#9C958E] uppercase tracking-widest hover:text-teal-500 flex items-center gap-1 transition-colors"
                >
                  Full Report <ArrowRight size={10} />
                </Link>
              </div>
            )) : (
              <div className="py-12 text-center opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
