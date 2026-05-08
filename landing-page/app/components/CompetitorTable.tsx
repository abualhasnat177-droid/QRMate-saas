"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CompetitorTableProps {
  isDark: boolean;
}

const features = [
  { feature: 'Dynamic QR codes on free plan',       us: true,  others: false },
  { feature: 'Scan analytics included free',         us: true,  others: false },
  { feature: 'QR content types',                     us: 'All types', others: 'URL only' },
  { feature: 'Bulk QR generation',                   us: true,  others: false },
  { feature: 'Developer REST API',                   us: true,  others: false },
  { feature: 'Price for dynamic QR',                 us: '$0', others: '$15.00/mo' },
  { feature: 'No hidden fees or termination penalty', us: true, others: false },
];

function CellValue({ value, isDark }: { value: boolean | string; isDark: boolean }) {
  if (typeof value === 'boolean') {
    return value
      ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
      : <XCircle size={18} className={`mx-auto ${isDark ? 'text-red-400/60' : 'text-red-300'}`} />;
  }
  return <span className={`text-sm font-bold ${isDark ? 'text-[#D4CCC1]' : 'text-[#3D3833]'}`}>{value}</span>;
}

export default function CompetitorTable({ isDark }: CompetitorTableProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`py-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#EDE8E0]'} transition-colors duration-500`}
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.3em] mb-4 block">
            The Advantage
          </span>
          <h2 className={`text-4xl md:text-5xl font-black tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>
            Everything they charge extra for — <span className="text-teal-600">included free</span>
          </h2>
          <p className={`text-lg ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'} max-w-2xl mx-auto`}>
            We&apos;re a dedicated QR platform. No design suite bloat. Just the features you need.
          </p>
        </div>

        <div className={`rounded-2xl border overflow-hidden shadow-lg ${isDark ? 'border-white/10 bg-[#121212]' : 'border-[#D4CCC1] bg-[#F5F1EB]'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#EDE8E0]'}`}>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}>Feature</th>
                  <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-teal-600`}>
                    <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-[10px] font-black">QRMate</span>
                  </th>
                  <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'}`}>Standard Generators</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {features.map((row, i) => (
                  <tr key={i} className={`${isDark ? 'hover:bg-[#F5F1EB]/[0.02]' : 'hover:bg-[#EDE8E0]/50'} transition-colors`}>
                    <td className={`px-6 py-4 text-sm font-semibold ${isDark ? 'text-[#D4CCC1]' : 'text-[#3D3833]'}`}>{row.feature}</td>
                    <td className="px-6 py-4 text-center"><CellValue value={row.us} isDark={isDark} /></td>
                    <td className="px-6 py-4 text-center"><CellValue value={row.others} isDark={isDark} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generic Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mt-16 rounded-2xl p-8 md:p-12 border ${isDark ? 'bg-teal-600/10 border-teal-500/20' : 'bg-teal-50 border-teal-100'}`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className={`text-2xl font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-[#2D2A26]'}`}>
                Tired of bloated design tools?
              </h3>
              <p className={`text-sm font-medium max-w-xl ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
                If you&apos;re paying for a QR code buried inside a design suite, there&apos;s a better way. Same result. Focused product. A fraction of the price.
              </p>
            </div>
            <Link
              href="http://localhost:3001/signup"
              className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 whitespace-nowrap hover:scale-105"
            >
              Start free — no credit card
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
