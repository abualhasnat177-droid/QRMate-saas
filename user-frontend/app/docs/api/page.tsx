"use client";

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  Code, Terminal, Globe, Shield, Zap, Copy, CheckCircle2,
  ChevronRight, Play, Book, Layers, Cpu
} from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/qr',
    desc: 'Generate a new QR code',
    body: `{
  "type": "url",
  "value": "https://example.com",
  "options": {
    "fgColor": "#000000",
    "size": 500
  }
}`,
    response: `{
  "id": "qr_123",
  "shortCode": "abc123",
  "imageUrl": "https://qrmate.io/r/abc123",
  "createdAt": "2024-04-29T..."
}`
  },
  {
    method: 'GET',
    path: '/api/v1/qr/:id',
    desc: 'Retrieve QR details and scan count',
    response: `{
  "id": "qr_123",
  "type": "url",
  "scanCount": 1250,
  "imageUrl": "...",
  "createdAt": "..."
}`
  },
  {
    method: 'PATCH',
    path: '/api/v1/qr/:id',
    desc: 'Update dynamic QR destination',
    body: `{ "value": "https://new-destination.com" }`,
    response: `{ "id": "qr_123", "updatedAt": "..." }`
  }
];

export default function ApiDocsPage() {
  const { isDark } = useTheme();
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const getSnippet = (endpoint: typeof ENDPOINTS[0]) => {
    if (selectedLang === 'curl') {
      return `curl -X ${endpoint.method} "${API_BASE}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${endpoint.body ? ` \\
  -d '${endpoint.body}'` : ''}`;
    }
    if (selectedLang === 'js') {
      return `const res = await fetch("${API_BASE}${endpoint.path}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }${endpoint.body ? `,
  body: JSON.stringify(${endpoint.body})` : ''}
});
const data = await res.json();`;
    }
    return `import requests

headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.${endpoint.method.toLowerCase()}(
    "${API_BASE}${endpoint.path}",
    headers=headers${endpoint.body ? `,
    json=${endpoint.body}` : ''}
)
print(response.json())`;
  };

  const cardClass = `${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-3xl overflow-hidden shadow-sm`;

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-[#050505] text-[#f1f5f9]' : 'bg-[#EDE8E0] text-[#2D2A26]'}`}>
      {/* Hero */}
      <div className={`pt-20 pb-32 ${isDark ? 'bg-gradient-to-b from-teal-500/10 to-transparent' : 'bg-gradient-to-b from-teal-50 to-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600/10 text-teal-500 text-xs font-black uppercase tracking-widest mb-8 border border-teal-500/20">
            <Cpu size={14} /> Developer Portal
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Build the <span className="text-teal-600">Future</span> of QR.</h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
            Integrate our high-performance QR engine into your applications with our simple, powerful REST API.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
             <a href={`${API_BASE}/api/docs`} target="_blank" className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20">
               Interactive Swagger UI
             </a>
             <a href="/dashboard/settings/api" className={`px-8 py-4 rounded-2xl font-bold border transition-all ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 hover:bg-[#F5F1EB]/10' : 'bg-[#F5F1EB] border-[#D4CCC1] hover:bg-[#EDE8E0]'}`}>
               Get API Key
             </a>
          </div>
        </div>
      </div>

      {/* Docs Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Navigation */}
          <div className="lg:col-span-3 space-y-8 hidden lg:block">
            <div>
              <h3 className="text-xs font-black text-[#6B6560] uppercase tracking-widest mb-4">Getting Started</h3>
              <div className="space-y-1">
                {['Authentication', 'Rate Limits', 'Errors'].map(item => (
                  <button key={item} className={`flex items-center justify-between w-full p-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'hover:bg-[#F5F1EB]/5 text-[#9C958E]' : 'hover:bg-teal-50 text-[#6B6560]'}`}>
                    {item} <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-[#6B6560] uppercase tracking-widest mb-4">Core API</h3>
              <div className="space-y-1">
                {ENDPOINTS.map(e => (
                  <button key={e.path} className={`flex items-center justify-between w-full p-2 text-xs font-bold rounded-lg transition-colors ${isDark ? 'hover:bg-[#F5F1EB]/5 text-[#9C958E]' : 'hover:bg-teal-50 text-[#6B6560]'}`}>
                    {e.desc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Docs */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* Auth Section */}
            <section className={cardClass}>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={24} className="text-teal-500" />
                  <h2 className="text-2xl font-bold">Authentication</h2>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
                  All API requests must be authenticated using a Bearer Token in the <code>Authorization</code> header.
                </p>
                <div className={`p-4 rounded-xl font-mono text-xs border ${isDark ? 'bg-black border-white/5 text-[#D4CCC1]' : 'bg-[#EDE8E0] border-[#D4CCC1] text-[#6B6560]'}`}>
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>
            </section>

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Endpoints</h2>
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-black border-white/5' : 'bg-[#F5F1EB] border-[#D4CCC1]'}`}>
                {['curl', 'js', 'python'].map(lang => (
                  <button 
                    key={lang} 
                    onClick={() => setSelectedLang(lang)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${selectedLang === lang ? 'bg-teal-600 text-white' : (isDark ? 'text-[#6B6560] hover:text-white' : 'text-[#9C958E] hover:text-[#2D2A26]')}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Sections */}
            {ENDPOINTS.map((e, i) => (
              <section key={i} className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${e.method === 'POST' ? 'bg-emerald-500/20 text-emerald-500' : e.method === 'PATCH' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {e.method}
                  </span>
                  <code className="text-sm font-bold font-mono">{e.path}</code>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Documentation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">{e.desc}</h3>
                    <p className={`text-sm ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
                      Generate a production-ready QR code with custom colors and dynamic destination support.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6B6560]">Response (JSON)</h4>
                      <div className={`p-4 rounded-xl font-mono text-[10px] border max-h-40 overflow-y-auto ${isDark ? 'bg-black border-white/5 text-emerald-400/80' : 'bg-[#EDE8E0] border-[#D4CCC1] text-emerald-700'}`}>
                        <pre>{e.response}</pre>
                      </div>
                    </div>
                  </div>

                  {/* Code Snippet */}
                  <div className={`relative rounded-2xl overflow-hidden border ${isDark ? 'bg-[#0f0f0f] border-white/5' : 'bg-[#1e293b] border-slate-800'}`}>
                    <div className="flex items-center justify-between px-4 py-2 bg-[#F5F1EB]/5 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedLang} snippet</span>
                      <button 
                        onClick={() => copy(getSnippet(e), `snippet-${i}`)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F1EB]/10 text-white/40 hover:text-white transition-all"
                      >
                        {copied === `snippet-${i}` ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto text-[10px] font-mono leading-relaxed text-teal-300">
                      <pre>{getSnippet(e)}</pre>
                    </div>
                  </div>
                </div>
              </section>
            ))}

            {/* Try It Out Footer */}
            <div className={`p-10 rounded-[3rem] text-center border-2 border-dashed ${isDark ? 'bg-teal-500/5 border-teal-500/20' : 'bg-teal-50 border-teal-200'}`}>
               <div className="w-16 h-16 bg-teal-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6">
                 <Play size={24} fill="currentColor" />
               </div>
               <h2 className="text-2xl font-bold mb-3">Ready to test?</h2>
               <p className={`text-sm mb-8 max-w-md mx-auto ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>
                 Use our interactive API Explorer to test requests directly from your browser with your active session.
               </p>
               <a href={`${API_BASE}/api/docs`} target="_blank" className="inline-flex items-center gap-2 bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-teal-700 transition-all shadow-2xl shadow-teal-600/20">
                 Launch API Explorer <Zap size={16} />
               </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
