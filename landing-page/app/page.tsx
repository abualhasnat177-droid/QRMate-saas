"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants, useInView } from 'framer-motion';
import { 
  QrCode, BarChart3, Palette, Link as LinkIcon, ChevronDown, 
  CheckCircle2, Menu, X, ArrowRight, Smartphone, Building2,
  Calendar, ShoppingBag, Star, Zap, RefreshCw, Download, Globe, ShieldCheck, Scan, Moon, Sun,
  MessageCircle, Code, User, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import ContactSection from './components/ContactSection';
import CompetitorTable from './components/CompetitorTable';
import LandingPricing from './components/LandingPricing';

function NumberCounter({ value, duration = 2 }: { value: string, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const currentVal = progress * numericValue;
      
      if (value.includes('.')) {
        setDisplayValue(parseFloat(currentVal.toFixed(1)));
      } else {
        setDisplayValue(Math.floor(currentVal));
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue, duration, isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

function PublicStats({ isDark }: { isDark: boolean }) {
  const [stats, setStats] = useState({ totalQRs: 12842, totalScans: 452109 });

  useEffect(() => {
    fetch('http://localhost:8080/api/stats/public')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.qrCodesGenerated === 'number' && typeof data.totalScans === 'number') {
          setStats({ totalQRs: data.qrCodesGenerated, totalScans: data.totalScans });
        }
      })
      .catch(() => { /* Keep initial fallback */ });
  }, []);

  return (
    <div className={`flex items-center gap-8 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}>
      <div className="flex items-center gap-2">
         <span className={isDark ? 'text-white' : 'text-[#2D2A26]'}><NumberCounter value={(stats?.totalQRs ?? 0).toString()} /></span> QR Codes Generated
      </div>
      <div className="w-px h-3 bg-slate-200 dark:bg-[#F5F1EB]/10" />
      <div className="flex items-center gap-2">
         <span className={isDark ? 'text-white' : 'text-[#2D2A26]'}><NumberCounter value={(stats?.totalScans ?? 0).toString()} /></span> Total Scans Today
      </div>
    </div>
  );
}

const QRCodeGrid = ({ isDark, className }: { isDark: boolean, className?: string }) => {
  return (
    <div className={`grid grid-cols-6 gap-1 w-32 h-32 opacity-20 pointer-events-none ${className}`}>
      {Array.from({ length: 36 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            backgroundColor: [
              isDark ? "#1e293b" : "#e2e8f0",
              Math.random() > 0.7 ? (isDark ? "#6366f1" : "#4f46e5") : (isDark ? "#1e293b" : "#e2e8f0"),
              isDark ? "#1e293b" : "#e2e8f0"
            ]
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="w-full h-full rounded-sm"
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  if (!hasMounted) return <div className="bg-[#F5F1EB] min-h-screen" />;

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className={`${isDark ? 'dark bg-[#121212] text-[#f1f5f9]' : 'bg-[#F5F1EB] text-[#2D2A26]'} min-h-screen font-sans selection:bg-teal-600/10 selection:text-teal-600 transition-colors duration-500 overflow-x-hidden`}>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] ${isDark ? 'bg-teal-900/20' : 'bg-teal-200/40'} blur-[160px] rounded-full animate-pulse opacity-60`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] ${isDark ? 'bg-teal-900/20' : 'bg-teal-200/40'} blur-[160px] rounded-full animate-pulse opacity-60`} style={{ animationDelay: '3s' }} />
        <div className={`absolute top-[20%] right-[10%] w-[40%] h-[40%] ${isDark ? 'bg-teal-900/10' : 'bg-teal-100/30'} blur-[140px] rounded-full animate-pulse opacity-40`} style={{ animationDelay: '1.5s' }} />
        <div className={`absolute inset-0 opacity-[0.03] ${isDark ? 'invert' : ''}`} style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <nav className={`fixed top-0 w-full z-50 ${isDark ? 'bg-[#121212]/60' : 'bg-[#F5F1EB]/60'} backdrop-blur-2xl border-b ${isDark ? 'border-[#2e2e2e]' : 'border-[#D4CCC1]/40'} transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-2xl tracking-tighter group">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20 group-hover:scale-110 transition-transform">
              <QrCode size={22} className="text-white" />
            </div>
            <span className={isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}>QRMate</span>
          </Link>
 
          <div className="hidden lg:flex items-center gap-8">
            {['Features', 'How it works', 'Pricing'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className={`text-sm font-bold ${isDark ? 'text-[#94a3b8] hover:text-[#f1f5f9]' : 'text-[#6B6560] hover:text-[#2D2A26]'} transition-colors uppercase tracking-widest`}
              >
                {item}
              </Link>
            ))}
            
            <div className="w-px h-4 bg-[#D4CCC1] dark:bg-[#F5F1EB]/10 mx-2" />

            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${isDark ? 'border-[#2e2e2e] bg-[#F5F1EB]/5 text-[#94a3b8] hover:text-[#f1f5f9]' : 'border-[#D4CCC1] bg-[#F5F1EB] text-[#6B6560] hover:text-[#2D2A26]'} transition-all hover:scale-110`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link 
              href="/login" 
              className={`text-sm font-bold ${isDark ? 'text-[#f1f5f9] border-[#2e2e2e] hover:bg-[#F5F1EB]/5' : 'text-[#2D2A26] border-[#D4CCC1] hover:bg-[#EDE8E0]'} px-6 py-2.5 rounded-full border transition-all shadow-sm`}
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className={`group relative text-sm font-bold text-white px-8 py-3 rounded-full ${isDark ? 'bg-teal-600' : 'bg-[#2D2A26]'} hover:opacity-90 transition-all shadow-xl shadow-teal-900/10 overflow-hidden`}
            >
              Get Started
            </Link>
          </div>
 
          <button className={`lg:hidden ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} p-2`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 ${isDark ? 'bg-[#121212]/95' : 'bg-[#F5F1EB]/95'} backdrop-blur-xl pt-24 px-6 lg:hidden`}
          >
            <div className="flex flex-col gap-8 text-center">
              <button 
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border ${isDark ? 'border-white/10 text-white' : 'border-[#D4CCC1] text-[#2D2A26]'} font-bold`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                Switch to {isDark ? 'Light' : 'Dark'} Mode
              </button>
              {['Features', 'How it works', 'Pricing'].map((item) => (
                <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#2D2A26]'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {item}
                </Link>
              ))}
              <hr className={isDark ? 'border-white/5' : 'border-[#E4DDD3]'} />
              <Link href="/login" className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>Sign In</Link>
              <Link href="/signup" className="py-5 bg-teal-600 text-white rounded-2xl text-xl font-black shadow-xl">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-20">
        <motion.section className="pt-12 lg:pt-20 pb-16 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none z-0">
             {[
               { top: '15%', left: '10%', delay: 0 },
               { top: '35%', right: '12%', delay: 1 },
               { bottom: '25%', left: '15%', delay: 0.5 },
               { bottom: '40%', right: '8%', delay: 1.5 },
               { top: '60%', left: '5%', delay: 2 },
               { top: '10%', right: '25%', delay: 0.8 },
             ].map((node, i) => (
               <motion.div 
                 key={`hero-node-${i}`}
                 animate={{ y: [-15, 15, -15], opacity: [0.2, 0.8, 0.2] }}
                 transition={{ duration: 5 + i, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
                 style={{ top: node.top, left: node.left, right: node.right, bottom: node.bottom } as any}
                 className="absolute w-2.5 h-2.5 bg-teal-600 rounded-full shadow-[0_0_25px_rgba(99,102,241,0.8)]"
               />
             ))}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] max-w-full bg-teal-500/10 rounded-full blur-[120px]" />
              <QRCodeGrid isDark={isDark} className="absolute top-[10%] left-[5%] rotate-12 scale-150" />
              <QRCodeGrid isDark={isDark} className="absolute bottom-[20%] right-[5%] -rotate-12 scale-125" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center mb-10"
            >
              <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 mb-10">
                <div className={`inline-flex items-center gap-3 px-3 py-1.5 ${isDark ? 'bg-[#F5F1EB]/5 border-white/10' : 'bg-teal-50/50 border-teal-100/50'} rounded-full border backdrop-blur-sm`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[10px] font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'} uppercase tracking-[0.2em]`}>Free • No signup required • All QR types</span>
                </div>
                <PublicStats isDark={isDark} />
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className={`text-2xl md:text-4xl font-extrabold tracking-tight ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} leading-[1.1] mb-4`}
              >
                Professional QR Codes <br />
                <span className="text-teal-600">Built for Professionals.</span>
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className={`text-sm md:text-base ${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'} mb-8 max-w-lg mx-auto`}
              >
                Real analytics, all content types — starting free.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { icon: <LinkIcon size={20} />, label: 'URL', href: '/dashboard/create?type=url' },
                  { icon: <User size={20} />, label: 'vCard', href: '/dashboard/create?type=vcard' },
                  { icon: <Zap size={20} />, label: 'WiFi', href: '/dashboard/create?type=wifi' },
                  { icon: <MessageCircle size={20} />, label: 'WhatsApp', href: '/dashboard/create?type=whatsapp' },
                  { icon: <ImageIcon size={20} />, label: 'Image', href: '/dashboard/create?type=image' },
                  { icon: <Smartphone size={20} />, label: 'App Store', href: '/dashboard/create?type=appstore' },
                  { icon: <Globe size={20} />, label: 'Socials', href: '/dashboard/create?type=social' },
                  { icon: <Calendar size={20} />, label: 'Event', href: '/dashboard/create?type=event' },
                  { icon: <Code size={20} />, label: 'SMS', href: '/dashboard/create?type=sms' },
                  { icon: <ShieldCheck size={20} />, label: 'Crypto', href: '/dashboard/create?type=crypto' },
                  { icon: <Smartphone size={20} />, label: 'PDF', href: '/dashboard/create?type=pdf' },
                  { icon: <ArrowRight size={20} />, label: 'More', href: '/dashboard/create' },
                ].map((option, i) => (
                  <Link 
                    key={i}
                    href={option.href}
                    className={`group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-[#1e1e1e] border-white/5 hover:bg-teal-600 hover:border-teal-500' : 'bg-[#F5F1EB] border-[#E4DDD3] hover:border-teal-600 hover:shadow-xl hover:shadow-teal-500/10'}`}
                  >
                    <div className={`mb-3 transition-transform duration-300 group-hover:scale-110 ${isDark ? 'text-teal-400 group-hover:text-white' : 'text-teal-600'}`}>
                      {option.icon}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#9C958E] group-hover:text-white' : 'text-[#6B6560]'}`}>
                      {option.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        <CompetitorTable isDark={isDark} />

        <motion.section 
          id="how-it-works" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className={`py-20 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F5F1EB]'} transition-colors duration-500`}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-[#2D2A26]'} mb-6 tracking-tighter`}>Create QR Code in 3 Steps</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { step: 'Step 1', title: 'Choose Type', icon: <Scan size={30} /> },
                 { step: 'Step 2', title: 'Enter Data', icon: <Zap size={30} /> },
                 { step: 'Step 3', title: 'Download', icon: <Download size={30} /> }
               ].map((item, i) => (
                 <div key={i} className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-[#121212] border-white/5' : 'bg-[#EDE8E0] border-[#E4DDD3]'} flex flex-col items-center group transition-all duration-500 hover:shadow-2xl`}>
                   <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-teal-600/20 group-hover:scale-110 transition-transform">
                     {item.icon}
                   </div>
                   <div className="text-teal-600 text-[10px] font-black uppercase tracking-widest mb-2">{item.step}</div>
                   <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>{item.title}</h3>
                 </div>
               ))}
            </div>
          </div>
        </motion.section>

        <LandingPricing isDark={isDark} />
        <ContactSection isDark={isDark} />
      </main>

      <footer className={`pt-12 pb-8 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#F5F1EB] border-[#E4DDD3]'} border-t transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                <QrCode size={18} className="text-white" />
              </div>
              <span className={isDark ? 'text-white' : 'text-[#2D2A26]'}>QRMate</span>
            </div>
            <p className={`${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'} text-[10px] font-bold uppercase tracking-[0.2em]`}>&copy; 2026 QRMate Industries.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
