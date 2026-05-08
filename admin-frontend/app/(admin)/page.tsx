import React from 'react';
import { Users, QrCode, CreditCard, ArrowUpRight, ArrowDownRight, Search, Activity } from 'lucide-react';

export default function AdminOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2D2A26] mb-1">Platform Overview</h1>
          <p className="text-[#6B6560]">System metrics and recent activity for QRMate.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#F5F1EB] border border-[#D4CCC1] rounded-lg px-3 py-2 shadow-sm">
           <Search size={16} className="text-[#9C958E]" />
           <input type="text" placeholder="Search users or codes..." className="bg-transparent border-none outline-none text-sm w-48" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: '4,521', change: '+12%', isUp: true, icon: <Users className="text-teal-600" size={20} />, bg: 'bg-teal-50' },
          { title: 'Active QR Codes', value: '18,290', change: '+24%', isUp: true, icon: <QrCode className="text-teal-600" size={20} />, bg: 'bg-teal-50' },
          { title: 'MRR', value: '$12,450', change: '+8%', isUp: true, icon: <CreditCard className="text-emerald-600" size={20} />, bg: 'bg-emerald-50' },
          { title: 'Churn Rate', value: '2.1%', change: '-0.4%', isUp: false, icon: <Activity className="text-rose-600" size={20} />, bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#F5F1EB] p-6 rounded-2xl border border-[#D4CCC1] shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#6B6560] font-medium text-sm">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-[#2D2A26] mb-2">{stat.value}</div>
            <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {stat.change} <span className="text-[#9C958E] font-normal ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#2D2A26] mb-6">Recent User Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4DDD3] text-[#6B6560] text-sm">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Sarah Jenkins', email: 'sarah.j@example.com', plan: 'PRO', date: 'Just now', status: 'Active' },
                  { name: 'Michael Chen', email: 'm.chen@startup.io', plan: 'BUSINESS', date: '2 hours ago', status: 'Active' },
                  { name: 'Emily Rodriguez', email: 'emily@designco.com', plan: 'FREE', date: '5 hours ago', status: 'Pending' },
                  { name: 'David Smith', email: 'david.s@corporate.net', plan: 'PRO', date: '1 day ago', status: 'Active' },
                ].map((user, i) => (
                  <tr key={i} className="border-b border-[#EDE8E0] last:border-0 hover:bg-[#EDE8E0] transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-[#2D2A26]">{user.name}</div>
                      <div className="text-[#6B6560] text-xs">{user.email}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        user.plan === 'PRO' ? 'bg-teal-100 text-teal-700' : 
                        user.plan === 'BUSINESS' ? 'bg-[#2D2A26] text-white' : 'bg-[#E4DDD3] text-[#6B6560]'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 text-[#6B6560]">{user.date}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'}`} title={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#2D2A26] mb-6">System Health</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[#3D3833]">API Server (Fastify)</span>
                <span className="text-emerald-600 font-medium">Online</span>
              </div>
              <div className="w-full bg-[#E4DDD3] rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[#3D3833]">PostgreSQL DB</span>
                <span className="text-emerald-600 font-medium">98% Load</span>
              </div>
              <div className="w-full bg-[#E4DDD3] rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[#3D3833]">Storage (S3)</span>
                <span className="text-amber-500 font-medium">75% Used</span>
              </div>
              <div className="w-full bg-[#E4DDD3] rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
