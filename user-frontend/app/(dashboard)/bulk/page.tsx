"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  Upload, Download, FileText, CheckCircle2, XCircle,
  RefreshCw, AlertCircle, Zap, ArrowRight, Loader2, FileArchive
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CSVRow {
  name: string; type: string; value: string; fg_color?: string; bg_color?: string;
}

export default function BulkPage() {
  const { isDark } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [userPlan, setUserPlan] = useState('FREE');

  useEffect(() => {
    const ud = localStorage.getItem('user');
    if (ud) { try { setUserPlan(JSON.parse(ud).plan || 'FREE'); } catch {} }
  }, []);

  // Polling for job status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && jobStatus !== 'completed' && jobStatus !== 'failed') {
      interval = setInterval(async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qr/bulk/${jobId}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setJobStatus(data.status);
            setProgress(data.progress || 0);
            if (data.status === 'completed' && data.result) {
              setDownloadUrl(data.result.downloadUrl);
              setIsProcessing(false);
              clearInterval(interval);
            }
            if (data.status === 'failed') {
               setErrors(['Background processing failed. Please try again.']);
               setIsProcessing(false);
               clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const downloadTemplate = () => {
    const csv = `name,type,value,fg_color,bg_color\nMy Website,url,https://example.com,#000000,#ffffff\nContact Card,vcard,John Doe,#1e293b,#f1f5f9\nWiFi Guest,wifi,GuestNetwork,#0f172a,#ffffff\nSupport Email,email,help@example.com,#000000,#ffffff\nCall Us,phone,+1234567890,#000000,#ffffff`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'qrmate-bulk-template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      return { name: cols[0] || '', type: cols[1] || 'url', value: cols[2] || '', fg_color: cols[3], bg_color: cols[4] };
    }).filter(r => r.value);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string);
      setRows(parsed);
      setDownloadUrl(null);
      setJobId(null);
      setJobStatus('idle');
      setErrors([]);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (rows.length === 0) return;
    setIsProcessing(true); setProgress(0); setErrors([]); setJobStatus('waiting');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qr/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) { 
        setErrors([data.error || 'Bulk generation failed']); 
        setIsProcessing(false); 
        return; 
      }
      setJobId(data.jobId);
    } catch (err) { setErrors(['Network error']); setIsProcessing(false); }
  };

  const cardClass = `${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-6 shadow-sm`;

  // removed plan lock for user testing
  if (false) {
    return (
      <div className={`max-w-2xl mx-auto text-center py-20 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-teal-500/10' : 'bg-teal-50'}`}>
          <Zap size={32} className="text-teal-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Bulk QR Generation</h2>
        <p className={`text-sm mb-8 max-w-md mx-auto ${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'}`}>
          Generate up to 1,000 QR codes at once via CSV. Perfect for agencies and enterprise campaigns.
        </p>
        <Link href="/billing" className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
          Upgrade to Pro <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Bulk Generate</h1>
          <p className={`text-sm ${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'}`}>Upload a CSV to generate high-resolution QR packages.</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
          {userPlan} Plan: {userPlan === 'BUSINESS' ? '1,000' : '100'} limit
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cardClass}>
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>1. Download Template</h3>
          <p className={`text-xs mb-4 ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>Get our standard CSV structure with example data.</p>
          <button onClick={downloadTemplate} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-[#2e2e2e] text-[#f1f5f9] hover:bg-[#F5F1EB]/5' : 'border-[#D4CCC1] text-[#3D3833] hover:bg-[#EDE8E0]'}`}>
            <Download size={14} /> Download Template
          </button>
        </div>

        <div className={cardClass}>
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>2. Upload Your CSV</h3>
          <input type="file" ref={fileRef} accept=".csv" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className={`w-full flex flex-col items-center gap-3 py-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isDark ? 'border-[#2e2e2e] hover:border-teal-500/50 hover:bg-teal-500/5' : 'border-[#D4CCC1] hover:border-teal-300 hover:bg-teal-50/30'}`}>
            <Upload size={24} className="text-teal-500" />
            <span className={`text-xs font-bold ${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'}`}>{fileName || 'Click or drag CSV here'}</span>
          </button>
        </div>
      </div>

      {rows.length > 0 && jobStatus === 'idle' && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Preview ({rows.length} rows)</h3>
            <button onClick={handleGenerate} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
              <Zap size={14} /> Generate All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`font-bold uppercase tracking-wider ${isDark ? 'text-[#64748b] border-[#2e2e2e]' : 'text-[#9C958E] border-[#E4DDD3]'} border-b`}>
                  <th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Value</th><th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#2e2e2e]' : 'divide-slate-50'}`}>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-semibold">{r.name}</td>
                    <td className="py-2 pr-4 capitalize">{r.type}</td>
                    <td className={`py-2 pr-4 truncate max-w-[200px] ${isDark ? 'text-[#64748b]' : 'text-[#6B6560]'}`}>{r.value}</td>
                    <td className="py-2"><CheckCircle2 size={14} className="text-emerald-500" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className="text-teal-500 animate-spin" />
              <div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>Processing Bulk Job</h3>
                <p className={`text-[10px] font-bold ${isDark ? 'text-[#64748b]' : 'text-[#9C958E]'}`}>Status: {jobStatus}...</p>
              </div>
            </div>
            <span className="text-xs font-black text-teal-600">{progress}%</span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#F5F1EB]/5' : 'bg-[#E4DDD3]'}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-teal-600"
            />
          </div>
        </div>
      )}

      {downloadUrl && (
        <div className={`p-8 rounded-[2.5rem] border text-center ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-600/20">
            <CheckCircle2 size={32} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-900'}`}>Success! Your ZIP is ready</h3>
          <p className={`text-sm mb-6 ${isDark ? 'text-emerald-400/70' : 'text-emerald-700/70'}`}>We&apos;ve also sent a download link to your email.</p>
          <a 
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${downloadUrl}`} 
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Download size={16} /> Download ZIP Archive
          </a>
        </div>
      )}

      {errors.length > 0 && (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
          {errors.map((e, i) => (
            <p key={i} className="flex items-center gap-2 text-xs font-bold text-red-500 mb-1"><AlertCircle size={12} />{e}</p>
          ))}
        </div>
      )}
    </div>
  );
}
