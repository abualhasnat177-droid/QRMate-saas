"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, ArrowRight, Mail, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // --- Social OAuth (real redirect) ---
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    setError('');
    if (provider === 'google') {
      // Redirect to the real backend Google OAuth route
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/auth/google`;
      return;
    }
    // Github fallback or other providers...
  };

  // --- Email/Password (mock) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      try {
        const mockUser = { name: 'Demo User', email, plan: 'PRO' };
        localStorage.setItem('token', 'mock_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        router.push('/');
      } catch {
        setError('A system error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#EDE8E0] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight text-[#2D2A26] mb-8 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
              <QrCode size={18} className="text-white" />
            </div>
            QRMate
          </a>
          <h1 className="text-3xl font-bold text-[#2D2A26] mb-2">Welcome Back</h1>
          <p className="text-[#6B6560] text-sm">Sign in to your account to continue.</p>
        </div>

        <div className="bg-[#F5F1EB] p-8 rounded-xl border border-[#D4CCC1] shadow-sm">

          {/* --- Social Buttons --- */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              disabled={!!loadingProvider || isLoading}
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2.5 px-4 py-3 border border-[#D4CCC1] rounded-lg hover:bg-[#EDE8E0] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm text-[#3D3833]"
            >
              {loadingProvider === 'google' ? (
                <RefreshCw size={18} className="animate-spin text-teal-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              type="button"
              disabled={!!loadingProvider || isLoading}
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2.5 px-4 py-3 border border-[#D4CCC1] rounded-lg hover:bg-[#EDE8E0] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm text-[#3D3833]"
            >
              {loadingProvider === 'github' ? (
                <RefreshCw size={18} className="animate-spin text-teal-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#181717" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              )}
              <span>GitHub</span>
            </button>
          </div>

          {/* --- Divider --- */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4DDD3]" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-[#9C958E]">
              <span className="bg-[#F5F1EB] px-4">Or continue with</span>
            </div>
          </div>

          {/* --- Error --- */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* --- Email/Password Form --- */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="w-full bg-[#EDE8E0] border border-[#D4CCC1] rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider">Password</label>
                <Link href="#" className="text-[10px] font-bold text-teal-600 hover:underline uppercase tracking-wider">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#EDE8E0] border border-[#D4CCC1] rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!loadingProvider}
              className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <RefreshCw size={18} className="animate-spin" />}
              <span>{isLoading ? 'Logging in...' : 'Login'}</span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#6B6560] text-xs font-semibold">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-teal-600 font-bold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
