"use client";

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, UserCheck, UserX, Shield, Trash2, ChevronDown } from 'lucide-react';

const allUsers = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', plan: 'PRO', status: 'Active', qrCount: 24, joined: 'Apr 20, 2026' },
  { id: '2', name: 'Michael Chen', email: 'm.chen@startup.io', plan: 'BUSINESS', status: 'Active', qrCount: 87, joined: 'Apr 18, 2026' },
  { id: '3', name: 'Emily Rodriguez', email: 'emily@designco.com', plan: 'FREE', status: 'Pending', qrCount: 3, joined: 'Apr 15, 2026' },
  { id: '4', name: 'David Smith', email: 'david.s@corporate.net', plan: 'PRO', status: 'Active', qrCount: 42, joined: 'Apr 10, 2026' },
  { id: '5', name: 'Aisha Patel', email: 'aisha@agency.co', plan: 'PRO', status: 'Active', qrCount: 19, joined: 'Apr 5, 2026' },
  { id: '6', name: 'Carlos Rivera', email: 'carlos@freelance.dev', plan: 'FREE', status: 'Suspended', qrCount: 0, joined: 'Mar 28, 2026' },
  { id: '7', name: 'Lisa Wang', email: 'lisa.w@techco.com', plan: 'BUSINESS', status: 'Active', qrCount: 156, joined: 'Mar 20, 2026' },
];

const planColors: Record<string, string> = {
  PRO: 'bg-teal-100 text-teal-700',
  BUSINESS: 'bg-[#2D2A26] text-white',
  FREE: 'bg-[#E4DDD3] text-[#6B6560]',
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-500/10 text-green-500',
  Pending: 'bg-amber-500/10 text-amber-500',
  Suspended: 'bg-red-500/10 text-red-500',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [users, setUsers] = useState(allUsers);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (userId: string, action: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      if (action === 'suspend') return { ...u, status: 'Suspended' };
      if (action === 'activate') return { ...u, status: 'Active' };
      if (action === 'promote') return { ...u, plan: 'PRO' };
      return u;
    }).filter(u => action === 'delete' ? u.id !== userId : true));
    setActiveMenu(null);
    showToast(`Action "${action}" applied successfully.`);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'All' || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-[#2D2A26] text-white rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-4 duration-300">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2D2A26] mb-1">Users</h1>
          <p className="text-[#6B6560]">{users.length} total users on the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C958E]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#F5F1EB] border border-[#D4CCC1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C958E]" />
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-[#F5F1EB] border border-[#D4CCC1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm appearance-none cursor-pointer"
          >
            {['All', 'FREE', 'PRO', 'BUSINESS'].map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C958E] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#F5F1EB] border border-[#D4CCC1] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#EDE8E0] border-b border-[#D4CCC1]">
                <th className="px-6 py-4 font-semibold text-[#2D2A26]">User</th>
                <th className="px-6 py-4 font-semibold text-[#2D2A26]">Plan</th>
                <th className="px-6 py-4 font-semibold text-[#2D2A26]">Status</th>
                <th className="px-6 py-4 font-semibold text-[#2D2A26]">QR Codes</th>
                <th className="px-6 py-4 font-semibold text-[#2D2A26]">Joined</th>
                <th className="px-6 py-4 font-semibold text-[#2D2A26] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[#EDE8E0] last:border-0 hover:bg-[#EDE8E0] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-[#2D2A26]">{user.name}</div>
                        <div className="text-[#9C958E] text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${planColors[user.plan]}`}>{user.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4 text-[#3D3833] font-medium">{user.qrCount}</td>
                  <td className="px-6 py-4 text-[#9C958E]">{user.joined}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      className="p-2 rounded-lg hover:bg-[#E4DDD3] transition-colors"
                    >
                      <MoreVertical size={16} className="text-[#6B6560]" />
                    </button>
                    {activeMenu === user.id && (
                      <div className="absolute right-6 top-12 bg-[#F5F1EB] border border-[#D4CCC1] rounded-xl shadow-xl z-10 w-44 py-1 text-left">
                        <button onClick={() => handleAction(user.id, 'activate')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-[#EDE8E0] text-[#2D2A26]">
                          <UserCheck size={15} className="text-green-500" /> Activate
                        </button>
                        <button onClick={() => handleAction(user.id, 'promote')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-[#EDE8E0] text-[#2D2A26]">
                          <Shield size={15} className="text-teal-600" /> Promote to PRO
                        </button>
                        <button onClick={() => handleAction(user.id, 'suspend')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-[#EDE8E0] text-[#2D2A26]">
                          <UserX size={15} className="text-amber-500" /> Suspend
                        </button>
                        <div className="h-px bg-[#D4CCC1] my-1" />
                        <button onClick={() => handleAction(user.id, 'delete')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-red-50 text-red-500">
                          <Trash2 size={15} /> Delete User
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#9C958E]">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
