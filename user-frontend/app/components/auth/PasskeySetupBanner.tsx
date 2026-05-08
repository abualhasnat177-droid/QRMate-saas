"use client";

import React, { useState, useEffect } from 'react';
import { Fingerprint, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

export default function PasskeySetupBanner() {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('passkey_prompt_dismissed');
    const hasPasskey = false; // In a real app, check user data
    
    if (!isDismissed && !hasPasskey && window.PublicKeyCredential) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('passkey_prompt_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`mb-8 p-4 md:p-6 rounded-3xl border transition-all animate-in slide-in-from-top-4 duration-500 ${isDark ? 'bg-teal-600/10 border-teal-500/20 shadow-lg shadow-teal-500/5' : 'bg-teal-50 border-teal-100 shadow-sm'}`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-[#F5F1EB] text-teal-600 shadow-sm'}`}>
          <Fingerprint size={24} />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className={`text-sm font-black mb-1 ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>
            Log in faster with Face ID or fingerprint
          </h3>
          <p className={`text-xs font-bold ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
            Set up a passkey to skip magic links and passwords on this device.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDismiss}
            className={`p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-[#F5F1EB]/5 text-[#6B6560]' : 'hover:bg-[#E4DDD3] text-[#9C958E]'}`}
          >
            <X size={18} />
          </button>
          <button className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20">
            Set up passkey
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
