"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, Link as LinkIcon, Type, Smartphone, Wifi, Mail, Phone, 
  Calendar, MapPin, Share2, AppWindow, DollarSign, FileText,
  Save, Download, Info, ArrowRight, Eye, RefreshCw, Palette, 
  Settings, Layout, ShieldCheck, Lock, MessageCircle, Image as ImageIcon
} from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { useRouter } from 'next/navigation';

const QR_TYPES = [
  { id: 'url',       icon: <LinkIcon size={18} />,    label: 'URL',         emoji: '🔗' },
  { id: 'text',      icon: <Type size={18} />,        label: 'Text',        emoji: '📝' },
  { id: 'vcard',     icon: <Smartphone size={18} />,  label: 'vCard',       emoji: '📇' },
  { id: 'wifi',      icon: <Wifi size={18} />,        label: 'WiFi',        emoji: '📶' },
  { id: 'whatsapp',  icon: <MessageCircle size={18}/>,label: 'WhatsApp',    emoji: '💬' },
  { id: 'sms',       icon: <Phone size={18} />,       label: 'SMS',         emoji: '📱' },
  { id: 'email',     icon: <Mail size={18} />,        label: 'Email',       emoji: '✉️' },
  { id: 'phone',     icon: <Phone size={18} />,       label: 'Phone',       emoji: '📞' },
  { id: 'geo',       icon: <MapPin size={18} />,      label: 'Location',    emoji: '📍' },
  { id: 'social',    icon: <Share2 size={18} />,      label: 'Social',      emoji: '👤' },
  { id: 'appstore',  icon: <AppWindow size={18} />,   label: 'App Store',   emoji: '📱' },
  { id: 'payment',   icon: <DollarSign size={18} />,  label: 'Payment',     emoji: '💳' },
  { id: 'event',     icon: <Calendar size={18} />,    label: 'Event',       emoji: '📅' },
  { id: 'pdf',       icon: <FileText size={18} />,    label: 'PDF',         emoji: '📄' },
  { id: 'image',     icon: <ImageIcon size={18} />,   label: 'Image',       emoji: '🖼️' },
  { id: 'menu',      icon: <Layout size={18} />,      label: 'Menu',        emoji: '🍽️' },
];

const COUNTRY_CODES = [
  { code: '+1', country: 'United States / Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+61', country: 'Australia' },
  { code: '+91', country: 'India' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+34', country: 'Spain' },
  { code: '+39', country: 'Italy' },
  { code: '+7', country: 'Russia' },
  { code: '+27', country: 'South Africa' },
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+234', country: 'Nigeria' },
  { code: '+62', country: 'Indonesia' },
  { code: '+90', country: 'Turkey' },
  { code: '+82', country: 'South Korea' },
];

export default function CreateQRPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('url');
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({ url: '', platform: 'ios', method: 'paypal' });
  const [isDynamic] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotStyle, setDotStyle] = useState('square');
  const [eyeStyle, setEyeStyle] = useState('square');
  const [errorLevel, setErrorLevel] = useState('M');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, []);

  // Auto-update preview when design options change
  useEffect(() => {
    if (isFormComplete() && generatedQr) {
      handlePreview();
    }
  }, [color, bgColor, dotStyle, eyeStyle, errorLevel]);

  const hasPro = true; // Unlocked for user testing

  const isFormComplete = () => {
    switch (selectedType) {
      case 'url': return !!formData.url;
      case 'text': return !!formData.text;
      case 'vcard': return !!formData.firstName;
      case 'wifi': return !!formData.ssid;
      case 'sms': return !!formData.phone;
      case 'email': return !!formData.to;
      case 'phone': return !!formData.number;
      case 'geo': return !!formData.lat && !!formData.lng;
      case 'social': return !!formData.username;
      case 'appstore': return !!formData.appUrl;
      case 'payment': 
        if (formData.method === 'upi') return !!formData.vpa && !!formData.name;
        if (formData.method === 'paypal') return !!formData.paypalId;
        return !!formData.walletAddress;
      case 'event': return !!formData.eventName && !!formData.startDate;
      case 'whatsapp': return !!formData.phone;
      case 'pdf': return !!formData.pdfUrl;
      case 'image': return !!formData.imageUrl;
      case 'menu': return !!formData.menuUrl;
      default: return false;
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getPayloadData = () => {
    const payload = { ...formData };
    const countryCode = payload.countryCode || '+1';
    if ((selectedType === 'sms' || selectedType === 'whatsapp') && payload.phone) {
      if (!payload.phone.startsWith('+')) payload.phone = `${countryCode}${payload.phone}`;
    }
    if (selectedType === 'phone' && payload.number) {
      if (!payload.number.startsWith('+')) payload.number = `${countryCode}${payload.number}`;
    }
    return payload;
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/qr/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          type: selectedType, 
          data: getPayloadData(),
          options: { 
            colorDark: color, 
            colorLight: bgColor, 
            includeSvg: true,
            errorCorrectionLevel: errorLevel,
            dotStyle: dotStyle,
            eyeStyle: eyeStyle
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedQr(data.qr);
        setGeneratedSvg(data.svg);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (format === 'png' && generatedQr) {
      const link = document.createElement('a');
      link.href = generatedQr;
      link.download = `qrmate-${title || 'code'}.png`;
      link.click();
    } else if (format === 'svg' && generatedSvg) {
      const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrmate-${title || 'code'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = async () => {
    if (!title) { alert('Please enter a title'); return; }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/qr/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title, type: selectedType, data: getPayloadData(), isDynamic,
          design: { color, bgColor, dotStyle, eyeStyle, errorLevel }
        }),
      });
      const data = await res.json();
      if (data.success) router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = `w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${isDark ? 'bg-[#F5F1EB]/5 border-white/10 text-white placeholder-white/30' : 'bg-[#F5F1EB] border-[#B8AFA3] text-[#2D2A26] placeholder-slate-500 shadow-sm'}`;
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`;

  const renderFields = () => {
    switch (selectedType) {
      case 'url':
        return (
          <div><label className={labelClass}>URL</label><input type="url" value={formData.url || ''} onChange={e => updateField('url', e.target.value)} placeholder="https://..." className={inputClass} /></div>
        );
      case 'text':
        return (
          <div><label className={labelClass}>Text (1000 chars max)</label><textarea value={formData.text || ''} onChange={e => updateField('text', e.target.value)} placeholder="Enter text..." className={`${inputClass} h-32 resize-none`} maxLength={1000} /><p className="text-[10px] text-right mt-1 opacity-50">{(formData.text || '').length}/1000</p></div>
        );
      case 'vcard':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1"><label className={labelClass}>First Name *</label><input value={formData.firstName || ''} onChange={e => updateField('firstName', e.target.value)} className={inputClass} /></div>
            <div className="col-span-1"><label className={labelClass}>Last Name</label><input value={formData.lastName || ''} onChange={e => updateField('lastName', e.target.value)} className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>Email</label><input value={formData.email || ''} onChange={e => updateField('email', e.target.value)} className={inputClass} /></div>
            <div className="col-span-1"><label className={labelClass}>Phone</label><input value={formData.phone || ''} onChange={e => updateField('phone', e.target.value)} className={inputClass} /></div>
            <div className="col-span-1"><label className={labelClass}>Company</label><input value={formData.company || ''} onChange={e => updateField('company', e.target.value)} className={inputClass} /></div>
            <div className="col-span-1"><label className={labelClass}>Job Title</label><input value={formData.jobTitle || ''} onChange={e => updateField('jobTitle', e.target.value)} className={inputClass} /></div>
            <div className="col-span-1"><label className={labelClass}>Website</label><input value={formData.website || ''} onChange={e => updateField('website', e.target.value)} className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>Address</label><input value={formData.address || ''} onChange={e => updateField('address', e.target.value)} className={inputClass} /></div>
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <div><label className={labelClass}>SSID *</label><input value={formData.ssid || ''} onChange={e => updateField('ssid', e.target.value)} className={inputClass} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Password</label><input type="password" value={formData.password || ''} onChange={e => updateField('password', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Encryption</label><select value={formData.encryption || 'WPA'} onChange={e => updateField('encryption', e.target.value)} className={inputClass}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.hidden === 'true'} onChange={e => updateField('hidden', e.target.checked ? 'true' : 'false')} className="w-4 h-4 rounded border-[#B8AFA3] text-teal-600 focus:ring-teal-500" /><span className="text-xs font-bold text-[#6B6560]">Hidden Network</span></label>
          </div>
        );
      case 'geo':
        const lookup = async () => {
          if (!formData.q) return;
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.q)}&limit=1`);
          const d = await r.json();
          if (d?.[0]) { updateField('lat', d[0].lat); updateField('lng', d[0].lon); }
        };
        const handleMapsPaste = (url: string) => {
          updateField('mapsUrl', url);
          const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (match) {
            updateField('lat', match[1]);
            updateField('lng', match[2]);
          }
        };
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Paste Google Maps Link</label>
              <input value={formData.mapsUrl || ''} onChange={e => handleMapsPaste(e.target.value)} placeholder="https://www.google.com/maps/..." className={inputClass} />
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-[#E4DDD3] dark:bg-[#F5F1EB]/5" />
              <span className="text-[10px] font-black text-[#9C958E] uppercase tracking-widest">OR SEARCH</span>
              <div className="h-[1px] flex-1 bg-[#E4DDD3] dark:bg-[#F5F1EB]/5" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2"><input value={formData.q || ''} onChange={e => updateField('q', e.target.value)} placeholder="Search address..." className={inputClass} /><button onClick={lookup} className="px-4 py-3 sm:py-0 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 shadow-md">Lookup</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Lat</label><input value={formData.lat || ''} onChange={e => updateField('lat', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Lng</label><input value={formData.lng || ''} onChange={e => updateField('lng', e.target.value)} className={inputClass} /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={formData.useGoogleMaps === 'true'} onChange={e => updateField('useGoogleMaps', e.target.checked ? 'true' : 'false')} className="w-4 h-4 rounded border-[#B8AFA3] text-teal-600 focus:ring-teal-500" />
              <span className="text-xs font-bold text-[#6B6560]">Force Google Maps Link Output</span>
            </label>
          </div>
        );
      case 'appstore':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['ios', 'android', 'both'].map(p => (
                <button key={p} onClick={() => updateField('platform', p)} className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${formData.platform === p ? 'bg-teal-600 border-teal-600 text-white' : (isDark ? 'bg-[#F5F1EB]/5 border-white/5 text-[#6B6560]' : 'bg-[#EDE8E0] border-[#E4DDD3] text-[#6B6560]')}`}>{p}</button>
              ))}
            </div>
            <div><label className={labelClass}>Store URL *</label><input value={formData.appUrl || ''} onChange={e => updateField('appUrl', e.target.value)} className={inputClass} /></div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-4">
            <select value={formData.method || 'paypal'} onChange={e => updateField('method', e.target.value)} className={inputClass}><option value="paypal">PayPal</option><option value="upi">UPI</option><option value="bitcoin">Bitcoin</option><option value="ethereum">Ethereum</option></select>
            {formData.method === 'paypal' && (
              <div className="space-y-4">
                <div><label className={labelClass}>PayPal ID *</label><input value={formData.paypalId || ''} onChange={e => updateField('paypalId', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Amount</label><input type="number" value={formData.amount || ''} onChange={e => updateField('amount', e.target.value)} className={inputClass} /></div>
              </div>
            )}
            {formData.method === 'upi' && (
              <div className="space-y-4">
                <div><label className={labelClass}>VPA ID *</label><input value={formData.vpa || ''} onChange={e => updateField('vpa', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Name *</label><input value={formData.name || ''} onChange={e => updateField('name', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Amount</label><input type="number" value={formData.amount || ''} onChange={e => updateField('amount', e.target.value)} className={inputClass} /></div>
              </div>
            )}
            {(formData.method === 'bitcoin' || formData.method === 'ethereum') && <div><label className={labelClass}>Wallet Address *</label><input value={formData.walletAddress || ''} onChange={e => updateField('walletAddress', e.target.value)} className={inputClass} /></div>}
          </div>
        );
      case 'event':
        return (
          <div className="space-y-4">
            <div><label className={labelClass}>Name *</label><input value={formData.eventName || ''} onChange={e => updateField('eventName', e.target.value)} className={inputClass} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Start *</label><input type="datetime-local" value={formData.startDate || ''} onChange={e => updateField('startDate', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>End</label><input type="datetime-local" value={formData.endDate || ''} onChange={e => updateField('endDate', e.target.value)} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Location</label><input value={formData.location || ''} onChange={e => updateField('location', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Description</label><textarea value={formData.description || ''} onChange={e => updateField('description', e.target.value)} className={`${inputClass} h-20 resize-none`} /></div>
          </div>
        );
      case 'sms': case 'phone':
        return (
          <div className="space-y-4">
            <div><label className={labelClass}>Phone Number *</label><div className="flex gap-2"><select value={formData.countryCode || '+1'} onChange={e => updateField('countryCode', e.target.value)} className={`px-2 py-3 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-[#121212] border-white/10 text-[#D4CCC1]' : 'bg-[#EDE8E0] border-[#B8AFA3] text-[#3D3833]'} shrink-0`}><option value="">None</option>{COUNTRY_CODES.map(c => <option key={c.country} value={c.code}>{c.code} {c.country}</option>)}</select><input value={formData.phone || formData.number || ''} onChange={e => updateField(selectedType === 'sms' ? 'phone' : 'number', e.target.value)} className={inputClass} placeholder="(555) 000-0000" /></div></div>
            {selectedType === 'sms' && <div><label className={labelClass}>Message</label><textarea value={formData.message || ''} onChange={e => updateField('message', e.target.value)} className={`${inputClass} h-20 resize-none`} maxLength={160} /><p className="text-[10px] text-right mt-1 opacity-50">{(formData.message || '').length}/160</p></div>}
          </div>
        );
      case 'email':
        return (
          <div className="space-y-4">
            <div><label className={labelClass}>Recipient *</label><input value={formData.to || ''} onChange={e => updateField('to', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Subject</label><input value={formData.subject || ''} onChange={e => updateField('subject', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Body</label><textarea value={formData.body || ''} onChange={e => updateField('body', e.target.value)} className={`${inputClass} h-20 resize-none`} /></div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-4">
            <select value={formData.platform || 'instagram'} onChange={e => updateField('platform', e.target.value)} className={inputClass}><option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option><option value="twitter">Twitter/X</option><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="facebook">Facebook</option><option value="github">GitHub</option></select>
            <div><label className={labelClass}>Username or URL *</label><input value={formData.username || ''} onChange={e => updateField('username', e.target.value)} className={inputClass} /></div>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div><label className={labelClass}>Phone Number *</label><div className="flex gap-2"><select value={formData.countryCode || '+1'} onChange={e => updateField('countryCode', e.target.value)} className={`px-2 py-3 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-[#121212] border-white/10 text-[#D4CCC1]' : 'bg-[#EDE8E0] border-[#B8AFA3] text-[#3D3833]'} shrink-0`}><option value="">None</option>{COUNTRY_CODES.map(c => <option key={c.country} value={c.code}>{c.code} {c.country}</option>)}</select><input value={formData.phone || ''} onChange={e => updateField('phone', e.target.value)} className={inputClass} placeholder="(555) 000-0000" /></div></div>
            <div><label className={labelClass}>Message</label><textarea value={formData.message || ''} onChange={e => updateField('message', e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Optional pre-filled message" /></div>
          </div>
        );
      case 'pdf':
        return (
          <div><label className={labelClass}>PDF URL *</label><input type="url" value={formData.pdfUrl || ''} onChange={e => updateField('pdfUrl', e.target.value)} placeholder="https://.../document.pdf" className={inputClass} /></div>
        );
      case 'image':
        return (
          <div><label className={labelClass}>Image URL *</label><input type="url" value={formData.imageUrl || ''} onChange={e => updateField('imageUrl', e.target.value)} placeholder="https://.../image.jpg" className={inputClass} /></div>
        );
      case 'menu':
        return (
          <div><label className={labelClass}>Menu URL *</label><input type="url" value={formData.menuUrl || ''} onChange={e => updateField('menuUrl', e.target.value)} placeholder="https://.../menu.pdf" className={inputClass} /></div>
        );
      default: return null;
    }
  };

  return (
    <div className={`space-y-8 pb-20 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Create Asset</h1>
          <p className={isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}>Select content type and customize your QR code.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => router.back()} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest ${isDark ? 'bg-[#F5F1EB]/5 text-[#9C958E] hover:bg-[#F5F1EB]/10' : 'bg-[#E4DDD3] text-[#6B6560] hover:bg-slate-200'}`}>Cancel</button>
           <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-600/20 flex items-center gap-2">{isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}Save Asset</button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-[#D4CCC1]' : 'text-[#3D3833]'}`}>Select Content Type</h3>
        <div className="flex flex-wrap gap-2.5">
          {QR_TYPES.map(type => (
            <button 
              key={type.id} 
              onClick={() => setSelectedType(type.id)} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all border shadow-sm ${selectedType === type.id ? 'bg-teal-600 border-teal-600 text-white shadow-md' : (isDark ? 'bg-[#1e1e1e] border-white/5 text-[#9C958E] hover:border-white/20 hover:text-white hover:bg-[#F5F1EB]/5' : 'bg-[#F5F1EB] border-[#D4CCC1] text-[#6B6560] hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50')} text-xs font-semibold`}
            >
              <span className="text-base">{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">

          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#F5F1EB] border-[#E4DDD3]'} shadow-sm`}>
            <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-8">2. Configure Content</h3>
            <div className="space-y-6">
              <div><label className={labelClass}>Internal Title (Required)</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Campaign v2" className={inputClass} /></div>
              {/* Dynamic choice removed as per user request */}
              <div className="h-[1px] w-full bg-[#E4DDD3] dark:bg-[#F5F1EB]/5 my-8" />
              {renderFields()}
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#F5F1EB] border-[#E4DDD3]'} shadow-sm relative overflow-hidden`}>
            {!hasPro && (
              <div className={`absolute inset-0 z-10 ${isDark ? 'bg-[#0a0a0a]/70' : 'bg-[#F5F1EB]/70'} backdrop-blur-sm flex items-center justify-center p-4`}>
                <div className={`p-6 rounded-2xl border shadow-xl text-center max-w-xs w-full ${isDark ? 'bg-[#121212] border-white/10' : 'bg-[#F5F1EB] border-[#D4CCC1]'}`}>
                  <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-teal-600/20">
                    <Lock size={18} />
                  </div>
                  <h4 className="text-base font-bold tracking-tight mb-1">Pro Customization</h4>
                  <p className="text-xs text-[#6B6560] mb-5">Unlock dot shapes, eye styles, and premium export formats.</p>
                  <button onClick={() => router.push('/billing')} className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-xs hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20">
                    Upgrade to Pro — $6/mo
                  </button>
                </div>
              </div>
            )}
            <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-8">3. Design & Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div><label className={labelClass}>Dot Pattern</label><div className="grid grid-cols-3 gap-2">{['square', 'dots', 'rounded'].map(s => (<button key={s} onClick={() => setDotStyle(s)} className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${dotStyle === s ? 'bg-teal-600 border-teal-600 text-white' : (isDark ? 'bg-[#F5F1EB]/5 border-white/5 text-[#6B6560]' : 'bg-[#EDE8E0] border-[#E4DDD3] text-[#6B6560]')}`}>{s}</button>))}</div></div>
              <div><label className={labelClass}>Corner Style</label><div className="grid grid-cols-2 gap-2">{['square', 'extra-rounded'].map(s => (<button key={s} onClick={() => setEyeStyle(s)} className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${eyeStyle === s ? 'bg-teal-600 border-teal-600 text-white' : (isDark ? 'bg-[#F5F1EB]/5 border-white/5 text-[#6B6560]' : 'bg-[#EDE8E0] border-[#E4DDD3] text-[#6B6560]')}`}>{s}</button>))}</div></div>
              <div><label className={labelClass}>Error Correction</label><div className="grid grid-cols-4 gap-2">{['L', 'M', 'Q', 'H'].map(l => (<button key={l} onClick={() => setErrorLevel(l)} className={`p-3 rounded-xl border text-[10px] font-black transition-all ${errorLevel === l ? 'bg-teal-600 border-teal-600 text-white' : (isDark ? 'bg-[#F5F1EB]/5 border-white/5 text-[#6B6560]' : 'bg-[#EDE8E0] border-[#E4DDD3] text-[#6B6560]')}`}>{l}</button>))}</div></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 sm:p-8 rounded-[2rem] border ${isDark ? 'bg-[#121212] border-white/10' : 'bg-[#F5F1EB] border-[#D4CCC1]'} shadow-xl shadow-slate-200/40 dark:shadow-none sticky top-8`}>
            <div className="flex items-center justify-between mb-6">
               <h3 className={`text-sm font-bold ${isDark ? 'text-[#D4CCC1]' : 'text-[#3D3833]'}`}>Live Preview</h3>
            </div>
            
            <div className={`aspect-square rounded-2xl mb-6 flex items-center justify-center overflow-hidden border ${isDark ? 'border-[#2e2e2e] bg-[#0a0a0a]' : 'border-[#D4CCC1] bg-[#EDE8E0]'} shadow-inner`}>
              {(generatedQr && isFormComplete()) ? (
                <img src={generatedQr} alt="QR" className="w-full h-full p-8 animate-in fade-in zoom-in-95 duration-300 bg-[#F5F1EB]" />
              ) : (
                <div className="text-center p-8">
                  <div className={`w-14 h-14 rounded-full ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#F5F1EB]'} border shadow-sm mx-auto flex items-center justify-center mb-4 ${isDark ? 'border-[#2e2e2e]' : 'border-[#D4CCC1]'}`}>
                    <Eye size={20} className={isDark ? 'text-[#6B6560]' : 'text-[#9C958E]'} />
                  </div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-[#6B6560]' : 'text-[#6B6560]'}`}>Fill required fields<br/>to preview your QR code</p>
                </div>
              )}
            </div>

            <button 
              onClick={handlePreview} 
              disabled={isGenerating || !isFormComplete()} 
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${!isFormComplete() ? 'opacity-50 cursor-not-allowed bg-[#E4DDD3] text-[#9C958E] border-transparent dark:bg-[#F5F1EB]/5 dark:text-[#6B6560]' : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30 dark:hover:bg-teal-500/20'}`}
            >
              {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Generate Preview
            </button>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={() => handleDownload('png')} 
                disabled={!generatedQr} 
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!generatedQr ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                <Download size={14} /> PNG
              </button>
              <button 
                onClick={() => handleDownload('svg')} 
                disabled={!generatedSvg} 
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!generatedSvg ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                <Download size={14} /> SVG
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-4 mt-8 pt-6 border-t ${isDark ? 'border-[#2e2e2e]' : 'border-[#E4DDD3]'}`}>
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>Foreground</label>
                <div className={`flex items-center gap-3 p-2 rounded-xl border ${isDark ? 'bg-black/50 border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} shadow-sm`}>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#D4CCC1] shadow-sm shrink-0">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-[-10px] w-12 h-12 cursor-pointer" />
                  </div>
                  <span className={`text-xs font-mono font-medium ${isDark ? 'text-[#D4CCC1]' : 'text-[#3D3833]'}`}>{color}</span>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-[#9C958E]' : 'text-[#6B6560]'}`}>Background</label>
                <div className={`flex items-center gap-3 p-2 rounded-xl border ${isDark ? 'bg-black/50 border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} shadow-sm`}>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#D4CCC1] shadow-sm shrink-0">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-[-10px] w-12 h-12 cursor-pointer" />
                  </div>
                  <span className={`text-xs font-mono font-medium ${isDark ? 'text-[#D4CCC1]' : 'text-[#3D3833]'}`}>{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
