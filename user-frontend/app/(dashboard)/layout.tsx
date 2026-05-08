"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, QrCode, BarChart3, Settings, 
  CreditCard, LogOut, Menu, X, Bell, Search, Plus, 
  Zap, User, Scan, Moon, Sun, ChevronDown, Layers, Key
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/' },
  { icon: <QrCode size={20} />, label: 'Create QR', href: '/create' },
  { icon: <Scan size={20} />, label: 'Scanner', href: '/scanner' },
  { icon: <Layers size={20} />, label: 'Bulk Generate', href: '/bulk' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/analytics' },
  { icon: <Key size={20} />, label: 'Developer API', href: '/settings/api' },
  { icon: <CreditCard size={20} />, label: 'Billing', href: '/billing' },
  { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
];

import { useTheme } from '../ThemeContext';
import { CrispChat } from '../components/CrispChat';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; email: string; plan: string; id?: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New feature available', desc: 'Check out the new analytics features!', time: '2m ago', read: false },
    { id: 2, title: 'Subscription renewed', desc: 'Your PRO plan was successfully renewed.', time: '1h ago', read: true },
    { id: 3, title: 'Welcome to QRMate', desc: 'Thanks for joining. Start creating your first QR code.', time: '2d ago', read: true },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setTimeout(() => {
          setUser(parsed);
        }, 0);
      } catch (err) {
        console.error('Layout: Failed to parse user data', err);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#121212] text-[#f1f5f9]' : 'bg-[#EDE8E0] text-[#2D2A26]'} font-sans transition-colors duration-500`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'} border-r ${isDark ? 'border-[#2e2e2e] bg-[#0a0a0a]' : 'border-[#D4CCC1] bg-[#F5F1EB]'}`}>
        <div className="h-full flex flex-col">
          <Link href="http://localhost:3000" className="p-5 flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-sm">
              <QrCode size={24} className="text-white" />
            </div>
            {isSidebarOpen && <span className={`font-bold text-xl tracking-tight ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>QRMate</span>}
          </Link>

          <nav className="flex-1 px-3 space-y-1 mt-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all ${isActive ? (isDark ? 'bg-teal-600/10 text-teal-400' : 'bg-teal-50 text-teal-700') : (isDark ? 'text-[#94a3b8] hover:bg-[#F5F1EB]/5 hover:text-[#f1f5f9]' : 'text-[#6B6560] hover:bg-[#EDE8E0] hover:text-[#2D2A26]')}`}
                >
                  <div className={isActive ? (isDark ? 'text-teal-400' : 'text-teal-600') : (isDark ? 'text-[#64748b] group-hover:text-[#94a3b8]' : 'text-[#9C958E] group-hover:text-[#6B6560]')}>
                    {item.icon}
                  </div>
                  {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${isDark ? 'border-[#2e2e2e]' : 'border-[#E4DDD3]'}`}>
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400' : 'text-[#6B6560] hover:bg-red-50 hover:text-red-600'}`}
            >
              <LogOut size={20} />
              {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        {/* Top Header */}
        <header className={`sticky top-0 z-40 h-16 ${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-b border-[#D4CCC1]'} border-b px-4 md:px-6 flex items-center justify-between transition-colors`}>
           <div className={`hidden sm:flex items-center gap-4 ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e]' : 'bg-[#E4DDD3] border-[#D4CCC1]'} px-4 py-2 rounded-lg border`}>
              <Search size={18} className={isDark ? 'text-[#64748b]' : 'text-[#9C958E]'} />
              <input type="text" placeholder="Search codes..." className={`bg-transparent border-none focus:outline-none text-sm font-medium ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} w-32 md:w-64 placeholder:text-[#9C958E]`} />
           </div>
           
           {/* Spacer for mobile to push icons to right */}
           <div className="sm:hidden flex-1" />

           <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${isDark ? 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#F5F1EB]/5' : 'text-[#9C958E] hover:text-[#2D2A26] hover:bg-[#EDE8E0]'}`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className={`h-6 w-px ${isDark ? 'bg-[#2e2e2e]' : 'bg-slate-200'} mx-2`} />

              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-3 p-1.5 pr-2 rounded-xl transition-colors ${isDark ? 'hover:bg-[#F5F1EB]/5' : 'hover:bg-[#EDE8E0]'}`}
                >
                   <div className="text-right hidden sm:block">
                      <div className={`text-sm font-semibold leading-none ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>{user?.name || 'User'}</div>
                      <div className={`text-xs mt-1 ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>{user?.plan || 'Free'} Plan</div>
                   </div>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#94a3b8]' : 'bg-[#E4DDD3] border-[#D4CCC1] text-[#6B6560]'}`}>
                      <User size={20} />
                   </div>
                   <ChevronDown size={14} className={isDark ? 'text-[#64748b]' : 'text-[#9C958E]'} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={`absolute top-full mt-2 right-0 w-48 rounded-xl border shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'}`}>
                    <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${isDark ? 'text-[#f1f5f9] hover:bg-[#F5F1EB]/5' : 'text-[#3D3833] hover:bg-[#EDE8E0]'}`}>
                      <Settings size={16} />
                      Profile Settings
                    </Link>
                    <Link href="/billing" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${isDark ? 'text-[#f1f5f9] hover:bg-[#F5F1EB]/5' : 'text-[#3D3833] hover:bg-[#EDE8E0]'}`}>
                      <CreditCard size={16} />
                      Billing & Plan
                    </Link>
                    <div className={`my-2 border-t ${isDark ? 'border-[#2e2e2e]' : 'border-[#E4DDD3]'}`} />
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        localStorage.removeItem('user');
                        router.push('/login');
                      }} 
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed bottom-6 right-6 z-[60] w-10 h-10 border flex items-center justify-center rounded-full shadow-md transition-all ${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e] text-[#94a3b8] hover:bg-[#1e1e1e]' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#6B6560] hover:bg-[#EDE8E0]'}`}
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <CrispChat user={user} />
    </div>
  );
}
