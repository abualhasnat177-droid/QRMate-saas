"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, ChevronDown } from 'lucide-react';

const transactions = [
  { user: 'Michael Chen', plan: 'BUSINESS', amount: '$49.00', date: 'Apr 22, 2026', status: 'Success' },
  { user: 'Sarah Jenkins', plan: 'PRO', amount: '$15.00', date: 'Apr 20, 2026', status: 'Success' },
  { user: 'David Smith', plan: 'PRO', amount: '$15.00', date: 'Apr 10, 2026', status: 'Success' },
  { user: 'Lisa Wang', plan: 'BUSINESS', amount: '$49.00', date: 'Mar 20, 2026', status: 'Success' },
  { user: 'Carlos Rivera', plan: 'PRO', amount: '$15.00', date: 'Mar 28, 2026', status: 'Refunded' },
];

const barData = [
  { month: 'Nov', revenue: 2400 },
  { month: 'Dec', revenue: 3800 },
  { month: 'Jan', revenue: 5100 },
  { month: 'Feb', revenue: 7200 },
  { month: 'Mar', revenue: 8900 },
  { month: 'Apr', revenue: 12450 },
];
const barMax = Math.max(...barData.map(b => b.revenue));

export default function AdminBillingPage() {
  const [period, setPeriod] = useState('This Month');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2D2A26] mb-1">Billing Overview</h1>
          <p className="text-[#6B6560]">Platform revenue and subscription data.</p>
        </div>
        <div className="relative">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="pl-4 pr-8 py-2.5 bg-[#F5F1EB] border border-[#D4CCC1] rounded-lg text-sm focus:outline-none shadow-sm appearance-none cursor-pointer">
            {['This Month', 'Last Month', 'Last 3 Months', 'Last Year'].map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C958E] pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: '$12,450', change: '+18%', icon: <DollarSign className="text-emerald-500" size={20} />, bg: 'bg-emerald-50' },
          { label: 'Active Subscribers', value: '521', change: '+12%', icon: <Users className="text-teal-600" size={20} />, bg: 'bg-teal-50' },
          { label: 'Avg Revenue/User', value: '$23.90', change: '+4%', icon: <TrendingUp className="text-teal-500" size={20} />, bg: 'bg-teal-50' },
          { label: 'Failed Payments', value: '3', change: '-2', icon: <CreditCard className="text-rose-500" size={20} />, bg: 'bg-rose-50' },
        ].map((s, i) => (
          <div key={i} className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#6B6560] text-sm">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.bg}`}>{s.icon}</div>
            </div>
            <div className="text-2xl font-bold text-[#2D2A26]">{s.value}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">{s.change} vs last month</div>
          </div>
        ))}
      </div>

      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#2D2A26] mb-8">Revenue Growth (Last 6 Months)</h2>
        <div className="flex items-end gap-4 h-44">
          {barData.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs text-[#9C958E]">${(b.revenue / 1000).toFixed(1)}k</div>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400 hover:opacity-80 transition-all cursor-pointer" style={{ height: `${(b.revenue / barMax) * 100}%` }} title={`$${b.revenue.toLocaleString()}`} />
              <div className="text-xs text-[#6B6560]">{b.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#2D2A26] mb-6">Plan Distribution</h2>
        <div className="space-y-4">
          {[
            { plan: 'FREE', count: 3200, total: 4521, color: 'bg-[#9C958E]' },
            { plan: 'PRO', count: 1100, total: 4521, color: 'bg-teal-500' },
            { plan: 'BUSINESS', count: 221, total: 4521, color: 'bg-[#2D2A26]' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-[#3D3833]">{item.plan}</span>
                <span className="text-[#6B6560]">{item.count.toLocaleString()} users ({Math.round((item.count / item.total) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#EDE8E0] rounded-full h-3">
                <div className={`${item.color} h-3 rounded-full transition-all duration-700`} style={{ width: `${(item.count / item.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E4DDD3]">
          <h2 className="text-lg font-bold text-[#2D2A26]">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#EDE8E0] border-b border-[#D4CCC1]">
                <th className="px-6 py-3 font-semibold text-[#2D2A26]">User</th>
                <th className="px-6 py-3 font-semibold text-[#2D2A26]">Plan</th>
                <th className="px-6 py-3 font-semibold text-[#2D2A26]">Amount</th>
                <th className="px-6 py-3 font-semibold text-[#2D2A26]">Date</th>
                <th className="px-6 py-3 font-semibold text-[#2D2A26]">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} className="border-b border-[#EDE8E0] last:border-0 hover:bg-[#EDE8E0] transition-colors">
                  <td className="px-6 py-3 font-medium text-[#2D2A26]">{t.user}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.plan === 'BUSINESS' ? 'bg-[#2D2A26] text-white' : 'bg-teal-100 text-teal-700'}`}>{t.plan}</span>
                  </td>
                  <td className="px-6 py-3 font-semibold text-[#2D2A26]">{t.amount}</td>
                  <td className="px-6 py-3 text-[#6B6560]">{t.date}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
