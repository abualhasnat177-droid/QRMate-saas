"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactSection({ isDark }: { isDark: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={`py-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F5F1EB]'} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-black text-teal-600 uppercase tracking-[0.3em] mb-4 block">Get in Touch</span>
            <h2 className={`text-5xl md:text-6xl font-black ${isDark ? 'text-white' : 'text-[#2D2A26]'} mb-8 tracking-tighter`}>
              Have questions? <br />
              <span className="text-teal-600">We're here to help.</span>
            </h2>
            <p className={`text-xl ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'} leading-relaxed mb-10`}>
              Whether you need technical support, have a feature request, or just want to say hi, our team is ready to assist you.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Support Email', detail: 'support@qrmate.com' },
                { title: 'Response Time', detail: 'Less than 24 hours' },
                { title: 'Location', detail: 'Remote-first, global team' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'} mb-1`}>{item.title}</span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-10 rounded-[3rem] ${isDark ? 'bg-[#121212] border-[#2e2e2e]' : 'bg-[#EDE8E0] border-[#D4CCC1]'} border shadow-2xl relative overflow-hidden`}>
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#2D2A26]'} mb-4`}>Message Sent!</h3>
                <p className={`${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'} mb-8 font-medium`}>
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'} ml-1`}>Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 text-sm font-bold ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 text-white focus:border-teal-500/50' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#2D2A26] focus:border-teal-600 focus:shadow-xl focus:shadow-teal-500/10'} outline-none`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'} ml-1`}>Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 text-sm font-bold ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 text-white focus:border-teal-500/50' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#2D2A26] focus:border-teal-600 focus:shadow-xl focus:shadow-teal-500/10'} outline-none`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'} ml-1`}>Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you're thinking..."
                    className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 text-sm font-bold resize-none ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 text-white focus:border-teal-500/50' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#2D2A26] focus:border-teal-600 focus:shadow-xl focus:shadow-teal-500/10'} outline-none`}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full py-4 rounded-2xl bg-teal-600 text-white font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center"
                  >
                    <AlertCircle size={14} />
                    Failed to send message. Please try again.
                  </motion.div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
