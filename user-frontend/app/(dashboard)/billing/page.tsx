"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, CreditCard, ShieldCheck, Star, Zap, Building2, 
  X, Download, AlertCircle, RefreshCw, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../ThemeContext';

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    period: 'forever',
    icon: <Zap size={24} className="text-[#9C958E]" />,
    features: [
      '5 Professional QR Codes',
      'All 12 QR content types',
      'Basic color customization',
      'PNG download',
      'Basic scan count',
    ],
    color: 'border-[#D4CCC1]/50',
    badge: '',
  },
  {
    id: 'PRO',
    stripeMonthly: 'pro_monthly',
    stripeYearly: 'pro_yearly',
    name: 'Pro',
    monthlyPrice: '$6',
    yearlyPrice: '$49',
    period: '/month',
    icon: <Star size={24} className="text-teal-500" />,
    features: [
      'Unlimited QR codes',
      'Full analytics dashboard',
      'PNG, SVG, PDF exports',
      'Bulk generation (100 QRs)',
      'Folders & campaigns',
      'Priority email support (24h)',
    ],
    color: 'border-teal-600',
    badge: 'Most Popular',
  },
  {
    id: 'BUSINESS',
    stripeMonthly: 'business_monthly',
    stripeYearly: 'business_yearly',
    name: 'Business',
    monthlyPrice: '$19',
    yearlyPrice: '$149',
    period: '/month',
    icon: <Building2 size={24} className="text-emerald-500" />,
    features: [
      'Everything in Pro',
      'Unlimited bulk generation',
      'REST API (50,000 calls/mo)',
      'White-label branding',
      'Team seats (up to 5)',
      '4-hour SLA support',
    ],
    color: 'border-emerald-500',
    badge: 'Teams',
  },
];

const invoices = [
  { id: 'INV-2026-04', date: 'April 1, 2026', amount: '$6.00', status: 'Paid' },
  { id: 'INV-2026-03', date: 'March 1, 2026', amount: '$6.00', status: 'Paid' },
  { id: 'INV-2026-02', date: 'February 1, 2026', amount: '$6.00', status: 'Paid' },
];

export default function BillingPage() {
  const { isDark } = useTheme();
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [isAnnual, setIsAnnual] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setTimeout(() => setCurrentPlan(parsed.plan || 'FREE'), 0);
        } catch {}
      }
    }
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const activePlan = plans.find(p => p.id === currentPlan) || plans[0];

  return (
    <div className={`max-w-5xl mx-auto space-y-8 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-3 border ${toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm">{toast.msg}</span>
        </div>
      )}

      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Billing</h1>
        <p className={`${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'} text-sm`}>Manage your subscription. Cancel anytime — no penalties.</p>
      </div>

      {/* Current Plan */}
      <div className={`rounded-2xl p-8 border shadow-sm ${currentPlan === 'FREE' ? (isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]') : (isDark ? 'bg-teal-600 border-teal-500 text-white shadow-xl' : 'bg-teal-600 text-white border-teal-700')}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className={currentPlan === 'FREE' ? 'text-teal-600' : 'text-white'} />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Current Plan</span>
            </div>
            <h2 className="text-4xl font-bold mb-2 tracking-tight">{activePlan.name}</h2>
            <p className="text-sm font-semibold opacity-80">
              {activePlan.monthlyPrice}{activePlan.period !== 'forever' ? activePlan.period : ' — forever free'}
            </p>
          </div>
          <div className="flex gap-3">
            {currentPlan !== 'FREE' && (
              <button
                onClick={() => {
                  if (confirm('Cancel subscription? You\'ll keep access until the end of your billing period.')) {
                    const ud = localStorage.getItem('user');
                    if (ud) { const p = JSON.parse(ud); p.plan = 'FREE'; localStorage.setItem('user', JSON.stringify(p)); }
                    setCurrentPlan('FREE');
                    showToast('Subscription cancelled. No penalties applied.');
                  }
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm border border-white/20 hover:bg-[#F5F1EB]/10 transition-all"
              >
                Cancel Subscription
              </button>
            )}
            {currentPlan !== 'BUSINESS' && (
              <button
                onClick={() => setShowUpgradeModal(currentPlan === 'FREE' ? 'PRO' : 'BUSINESS')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${currentPlan === 'FREE' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-[#F5F1EB] text-teal-600 hover:bg-[#EDE8E0]'}`}
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-bold ${!isAnnual ? (isDark ? 'text-white' : 'text-[#2D2A26]') : (isDark ? 'text-[#6B6560]' : 'text-[#9C958E]')}`}>Monthly</span>
        <button onClick={() => setIsAnnual(!isAnnual)} className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-teal-600' : (isDark ? 'bg-[#F5F1EB]/10' : 'bg-slate-200')}`}>
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-[#F5F1EB] shadow transition-all ${isAnnual ? 'left-8' : 'left-1'}`} />
        </button>
        <span className={`text-sm font-bold ${isAnnual ? (isDark ? 'text-white' : 'text-[#2D2A26]') : (isDark ? 'text-[#6B6560]' : 'text-[#9C958E]')}`}>
          Annual <span className="text-emerald-500 text-xs font-black">Save ~30%</span>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = plan.id === currentPlan;
          const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
          const periodLabel = plan.id === 'FREE' ? 'forever' : isAnnual ? '/year' : '/month';

          let cardStyle = isDark ? 'bg-[#1e1e1e] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]/80';
          if (plan.id === 'PRO') cardStyle = isDark ? 'bg-[#1e1e1e] border-teal-500/40' : 'bg-[#2D2A26] border-teal-500/20 text-white';
          if (plan.id === 'BUSINESS') cardStyle = isDark ? 'bg-[#1e1e1e] border-emerald-500/40' : 'bg-[#F5F1EB] border-emerald-200/60';
          if (isActive) cardStyle += isDark ? ' ring-2 ring-teal-500' : ' ring-2 ring-teal-600';

          const isProCard = plan.id === 'PRO' && !isDark;

          return (
            <div key={plan.id} className={`p-8 rounded-3xl shadow-sm flex flex-col relative border transition-all overflow-hidden ${cardStyle}`}>
              {plan.badge && (
                <div className={`absolute top-0 right-6 px-3 py-1.5 rounded-b-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${plan.id === 'PRO' ? 'bg-teal-500' : 'bg-emerald-500'}`}>
                  {plan.badge}
                </div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${plan.id === 'PRO' ? 'bg-teal-500/20 border-teal-500/20 text-teal-400' : plan.id === 'BUSINESS' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600') : (isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#94a3b8]' : 'bg-[#E4DDD3] border-[#D4CCC1] text-[#6B6560]')}`}>
                  {plan.icon}
                </div>
                <h4 className={`font-bold tracking-tight text-lg ${isProCard ? 'text-white' : (isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]')}`}>{plan.name}</h4>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-black tracking-tighter ${isProCard ? 'text-white' : (isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]')}`}>{price}</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${isProCard ? 'text-teal-200' : (isDark ? 'text-[#64748b]' : 'text-[#6B6560]')}`}>{periodLabel}</span>
              </div>

              <div className={`h-[1px] w-full mb-6 ${isProCard ? 'bg-[#F5F1EB]/10' : (isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#E4DDD3]')}`} />

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex gap-3 text-xs font-semibold ${isProCard ? 'text-[#D4CCC1]' : (isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]')}`}>
                    <CheckCircle2 size={16} className={`${plan.id === 'BUSINESS' ? 'text-emerald-500' : 'text-teal-500'} shrink-0`} />
                    <span className={isProCard ? 'text-white' : ''}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isActive}
                onClick={() => setShowUpgradeModal(plan.id)}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all ${isActive ? (isDark ? 'bg-[#F5F1EB]/10 text-white' : 'bg-[#E4DDD3] text-[#6B6560]') : plan.id === 'PRO' ? (isDark ? 'bg-[#f1f5f9] text-[#0a0a12] hover:bg-[#FAF8F5]' : 'bg-[#F5F1EB] text-[#2D2A26] hover:bg-[#EDE8E0]') : plan.id === 'BUSINESS' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20' : (isDark ? 'border-2 border-[#2e2e2e] text-[#94a3b8] hover:bg-[#F5F1EB] hover:text-black' : 'border-2 border-[#D4CCC1] text-[#3D3833] hover:bg-[#2D2A26] hover:text-white hover:border-slate-900')}`}
              >
                {isActive ? 'Current Plan' : plan.id === 'FREE' ? 'Downgrade' : `Get ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Cancel anytime notice */}
      <p className={`text-center text-xs font-semibold ${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'}`}>
        Cancel anytime. No contracts. No termination fees.
      </p>

      {/* Payment + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-8 shadow-sm`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Payment Methods</h3>
            <button className="text-xs font-bold text-teal-500 hover:underline">Add New</button>
          </div>
          <div className={`p-5 border ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e]' : 'bg-[#EDE8E0] border-[#E4DDD3]'} rounded-xl flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <CreditCard size={24} className={isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} />
              <div>
                <div className={`font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} text-sm`}>Visa ending in 4242</div>
                <div className={`text-[10px] font-semibold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} uppercase tracking-wider`}>Expires 12/28</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 ${isDark ? 'bg-[#F5F1EB]/5 border-[#2e2e2e] text-[#64748b]' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#9C958E]'} border rounded text-[10px] font-bold uppercase`}>Default</span>
          </div>
        </div>

        <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-8 shadow-sm`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} mb-8`}>Billing History</h3>
          <div className="space-y-4">
            {invoices.map((inv, i) => (
              <div key={i} className={`flex items-center justify-between text-sm ${i !== invoices.length - 1 ? (isDark ? 'border-b border-[#2e2e2e] pb-4' : 'border-b border-slate-50 pb-4') : ''}`}>
                <div className="flex items-center gap-3">
                  <Download size={16} className={`${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'} cursor-pointer hover:text-teal-600 transition-colors`} />
                  <div>
                    <div className={`font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>{inv.id}</div>
                    <div className={`text-[10px] font-semibold ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>{inv.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>{inv.amount}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showUpgradeModal && showUpgradeModal !== 'FREE' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} rounded-2xl max-w-md w-full shadow-2xl border overflow-hidden`}
            >
              <div className={`p-6 border-b ${isDark ? 'border-[#2e2e2e] bg-[#F5F1EB]/5' : 'border-[#E4DDD3] bg-[#EDE8E0]'} flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${isDark ? 'bg-teal-600/20' : 'bg-teal-100'} rounded-full flex items-center justify-center text-teal-600`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'} leading-none mb-1`}>Checkout</h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} flex items-center gap-1`}>
                      <ShieldCheck size={12} className="text-emerald-500" /> Secure payment
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowUpgradeModal(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-[#64748b] hover:bg-[#F5F1EB]/10' : 'text-[#9C958E] hover:bg-slate-200'}`}>
                  <X size={20} />
                </button>
              </div>

              <form className="p-6" onSubmit={(e) => {
                e.preventDefault();
                setIsProcessing(true);
                setTimeout(() => {
                  setIsProcessing(false);
                  setShowUpgradeModal(null);
                  const ud = localStorage.getItem('user');
                  if (ud) { const p = JSON.parse(ud); p.plan = showUpgradeModal; localStorage.setItem('user', JSON.stringify(p)); }
                  setCurrentPlan(showUpgradeModal!);
                  showToast('Payment successful! Plan upgraded.');
                }, 2000);
              }}>
                <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e] border-[#2e2e2e]' : 'bg-[#EDE8E0] border-[#D4CCC1]'} flex justify-between items-center`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'} mb-1`}>Selected Plan</p>
                    <p className={`text-sm font-black ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>{showUpgradeModal === 'PRO' ? 'Pro' : 'Business'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
                      {showUpgradeModal === 'PRO' ? (isAnnual ? '$49' : '$6') : (isAnnual ? '$149' : '$19')}
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>{isAnnual ? 'per year' : 'per month'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'}`}>Card Information</label>
                    <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-[#2e2e2e] bg-[#0a0a0a]' : 'border-[#D4CCC1] bg-[#F5F1EB]'}`}>
                      <input type="text" required placeholder="Card number" className={`w-full p-3 text-sm font-semibold border-b ${isDark ? 'bg-transparent border-[#2e2e2e] text-white placeholder-[#64748b]' : 'bg-transparent border-[#D4CCC1] text-[#2D2A26] placeholder-slate-400'} focus:outline-none`} />
                      <div className="flex">
                        <input type="text" required placeholder="MM / YY" className={`w-1/2 p-3 text-sm font-semibold border-r ${isDark ? 'bg-transparent border-[#2e2e2e] text-white placeholder-[#64748b]' : 'bg-transparent border-[#D4CCC1] text-[#2D2A26] placeholder-slate-400'} focus:outline-none`} />
                        <input type="text" required placeholder="CVC" className={`w-1/2 p-3 text-sm font-semibold ${isDark ? 'bg-transparent text-white placeholder-[#64748b]' : 'bg-transparent text-[#2D2A26] placeholder-slate-400'} focus:outline-none`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button type="submit" disabled={isProcessing} className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-teal-600/20 disabled:opacity-50">
                    {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : `Pay ${showUpgradeModal === 'PRO' ? (isAnnual ? '$49.00' : '$6.00') : (isAnnual ? '$149.00' : '$19.00')}`}
                  </button>
                  <p className={`text-center text-[10px] font-semibold mt-3 ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>
                    Cancel anytime. No contracts. No termination fees.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
