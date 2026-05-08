"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Users, Activity, CreditCard, Settings, LogOut, Menu, X, Mail } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { name: 'Overview', href: '/', icon: <Activity size={20} /> },
    { name: 'Users', href: '/users', icon: <Users size={20} /> },
    { name: 'Broadcast', href: '/broadcast', icon: <Mail size={20} /> },
    { name: 'Billing', href: '/billing', icon: <CreditCard size={20} /> },
    { name: 'Settings', href: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#EDE8E0] text-[#2D2A26] flex flex-col md:flex-row font-sans selection:bg-teal-600/30">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#D4CCC1] bg-[#F5F1EB] z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-teal-900">
          <ShieldCheck className="text-teal-600" />
          Admin Panel
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-[#6B6560]">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#F5F1EB] border-r border-[#D4CCC1] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4 shadow-sm">
          <div className="hidden md:flex items-center gap-2 font-bold text-2xl tracking-tight mb-10 mt-2 px-2 text-[#2D2A26]">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-600">
              <ShieldCheck size={24} />
            </div>
            QRMate Admin
          </div>
          
          <nav className="flex-1 space-y-1 mt-8 md:mt-0">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-teal-600/10 text-teal-700' : 'text-[#6B6560] hover:text-[#2D2A26] hover:bg-[#EDE8E0]'}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#E4DDD3]">
             <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-[#6B6560] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:ml-0 bg-[#EDE8E0]">
        {isMobileOpen && (
          <div className="fixed inset-0 bg-[#2D2A26]/20 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
        )}
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
