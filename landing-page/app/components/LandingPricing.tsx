"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Star, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LandingPricingProps {
  isDark: boolean;
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    period: 'forever',
    icon: <Zap size={24} className="text-[#9C958E]" />,
    features: [
      '5 Professional QR codes',
      'All content types',
      'Scan count tracking',
      'Unlimited static codes',
      'Standard PNG exports',
    ],
    buttonText: 'Get Started',
    buttonHref: '/signup',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: '$6',
    yearlyPrice: '$49',
    period: '/month',
    icon: <Star size={24} className="text-teal-500" />,
    features: [
      'Unlimited QR codes',
      'Full scan analytics',
      'SVG & PDF exports',
      'Bulk generation (100)',
      'No ads or branding',
      'Priority support',
    ],
    buttonText: 'Start Free Trial',
    buttonHref: '/signup?plan=pro',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: '$19',
    yearlyPrice: '$149',
    period: '/month',
    icon: <Building2 size={24} className="text-emerald-500" />,
    features: [
      'Everything in Pro',
      'Developer REST API',
      'Unlimited bulk generation',
      'White-label branding',
      'Multi-user team seats',
      'Dedicated account manager',
    ],
    buttonText: 'Start Free Trial',
    buttonHref: '/signup?plan=business',
    highlight: false,
  },
];

export default function LandingPricing({ isDark }: LandingPricingProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className={`py-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F5F1EB]'} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.3em] mb-4 block">Simple Pricing</span>
          <h2 className={`text-4xl md:text-5xl font-black tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>
            Built for growth, <span className="text-teal-600">priced for value.</span>
          </h2>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-xs font-black uppercase tracking-widest ${!isAnnual ? (isDark ? 'text-white' : 'text-[#2D2A26]') : 'text-[#9C958E]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-teal-600' : (isDark ? 'bg-[#F5F1EB]/10' : 'bg-slate-200')}`}
            >
              <motion.div
                animate={{ x: isAnnual ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-[#F5F1EB] rounded-full shadow-sm"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-widest ${isAnnual ? (isDark ? 'text-white' : 'text-[#2D2A26]') : 'text-[#9C958E]'}`}>Yearly</span>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                Save ~30%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col ${plan.highlight ? (isDark ? 'bg-teal-600/10 border-teal-500/30' : 'bg-[#2D2A26] border-slate-900 text-white scale-105 shadow-2xl z-10') : (isDark ? 'bg-[#F5F1EB]/5 border-white/5 hover:bg-[#F5F1EB]/[0.08]' : 'bg-[#F5F1EB] border-[#E4DDD3] hover:border-teal-100 hover:shadow-xl')}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-12 px-4 py-1.5 bg-teal-600 text-white rounded-b-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.highlight ? 'bg-teal-500/20' : (isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#EDE8E0]')}`}>
                  {plan.icon}
                </div>
                <h3 className={`text-xl font-black tracking-tight ${!plan.highlight && isDark ? 'text-white' : ''}`}>{plan.name}</h3>
              </div>

              <div className="mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-baseline gap-1"
                  >
                    <span className={`text-5xl font-black tracking-tighter ${!plan.highlight && isDark ? 'text-white' : ''}`}>
                      {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-widest opacity-60 ${!plan.highlight && isDark ? 'text-[#9C958E]' : ''}`}>
                      {isAnnual ? '/year' : '/month'}
                    </span>
                  </motion.div>
                </AnimatePresence>
                {isAnnual && plan.id !== 'free' && (
                  <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest">
                    Billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-bold opacity-80">
                    <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
                    <span className={!plan.highlight && isDark ? 'text-[#D4CCC1]' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`${plan.buttonHref}${plan.buttonHref.includes('?') ? '&' : '?'}period=${isAnnual ? 'yearly' : 'monthly'}`}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${plan.highlight ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-600/30 hover:scale-[1.02]' : (isDark ? 'bg-[#F5F1EB]/5 text-white hover:bg-[#F5F1EB]/10' : 'bg-[#2D2A26] text-white hover:bg-[#3D3833]')}`}
              >
                {plan.buttonText}
                <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center space-y-4">
          <p className={`text-xs font-bold ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'} uppercase tracking-[0.2em]`}>
            Trusted by 5,000+ businesses globally
          </p>
          <p className={`text-sm font-bold ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'} tracking-tight`}>
            Cancel anytime. No contracts. No termination fees.
          </p>
        </div>
      </div>
    </section>
  );
}
