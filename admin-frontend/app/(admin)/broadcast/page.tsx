"use client";

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BroadcastPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultData, setResultData] = useState<{ sentCount: number, totalUsers: number } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:8080/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResultData({ sentCount: data.sentCount, totalUsers: data.totalUsers });
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#2D2A26] mb-2 tracking-tighter uppercase">Broadcast System</h1>
        <p className="text-[#6B6560] font-bold text-sm tracking-wide">Push announcements to all registered users via SMTP.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#F5F1EB] p-8 rounded-[2rem] border border-[#D4CCC1] shadow-xl shadow-slate-200/50">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-[#2D2A26] mb-2">Broadcast Complete!</h2>
                <p className="text-[#6B6560] font-bold mb-8">
                  Successfully sent emails to <span className="text-teal-600">{resultData?.sentCount}</span> out of <span className="text-[#3D3833]">{resultData?.totalUsers}</span> users.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all"
                >
                  Send New Broadcast
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#9C958E] uppercase tracking-[0.2em] mb-2 ml-1">Email Subject</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" />
                    <input 
                      type="text" 
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g., Exciting New Features are here!"
                      className="w-full pl-12 pr-4 py-4 bg-[#EDE8E0] border border-[#D4CCC1] rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#9C958E] uppercase tracking-[0.2em] mb-2 ml-1">Message Content</label>
                  <textarea 
                    rows={8}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Write your announcement here..."
                    className="w-full p-5 bg-[#EDE8E0] border border-[#D4CCC1] rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full py-5 rounded-2xl bg-teal-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-98'}`}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Initializing Broadcast...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Push to All Users
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center">
                    <AlertCircle size={16} />
                    Failed to execute broadcast. Check server logs.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-teal-600 p-8 rounded-[2rem] text-white shadow-xl shadow-teal-600/20">
            <Users className="mb-4 opacity-50" size={32} />
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Audience reach</h3>
            <p className="text-xs font-bold opacity-80 leading-relaxed">
              Your message will be sent to every registered email in your database using the configured SMTP server.
            </p>
          </div>

          <div className="bg-[#2D2A26] p-8 rounded-[2rem] text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#9C958E]">Loops.so Status</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Connected</h3>
            <p className="text-xs font-bold opacity-60 leading-relaxed">
              Loops API is active and ready for high-volume dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
