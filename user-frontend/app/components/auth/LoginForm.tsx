"use client";

import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, Apple, Fingerprint, RefreshCw, CheckCircle2, Globe, Terminal as Microsoft } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

export default function LoginForm() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setSupportsPasskey(true);
    }
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError(data.error || 'Failed to send magic link');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/auth/${provider}`;
  };

  if (sent) {
    return (
      <div className="text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black mb-3">Check your email</h2>
        <p className={`text-sm mb-8 ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
          We sent a magic login link to <span className="font-bold text-teal-500">{email}</span>.<br />
          Click the link to sign in instantly.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => setSent(false)} 
            className={`text-xs font-black uppercase tracking-widest hover:underline ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  const btnClass = `w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`;

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4 mb-8">
        <button 
          onClick={() => handleSocial('google')}
          className={`${btnClass} bg-[#F5F1EB] text-[#2D2A26] border border-[#D4CCC1] hover:bg-[#EDE8E0]`}
        >
          <Globe size={20} className="text-blue-500" />
          Continue with Google
        </button>
        
        <button 
          onClick={() => handleSocial('apple')}
          className={`${btnClass} bg-black text-white hover:bg-zinc-900`}
        >
          <Apple size={20} />
          Continue with Apple
        </button>

        {supportsPasskey && (
          <button 
            className={`${btnClass} ${isDark ? 'bg-teal-600/10 text-teal-400 border border-teal-500/20' : 'bg-teal-50 text-teal-600 border border-teal-100'} hover:opacity-80`}
          >
            <Fingerprint size={20} />
            Use passkey instead
          </button>
        )}
      </div>

      <div className="relative flex items-center gap-4 mb-8">
        <div className={`flex-1 h-px ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#E4DDD3]'}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}>or</span>
        <div className={`flex-1 h-px ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#E4DDD3]'}`} />
      </div>

      <form onSubmit={handleMagicLink} className="space-y-4">
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}>
            Work Email
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C958E]" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 text-white placeholder-white/20' : 'bg-[#EDE8E0] border-[#D4CCC1] text-[#2D2A26] placeholder-slate-400'}`}
            />
          </div>
        </div>

        {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw size={18} className="animate-spin" /> : (
            <>
              Send Magic Link
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className={`mt-8 text-[10px] text-center leading-relaxed font-bold ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}>
        By continuing you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>
      </p>
    </div>
  );
}
