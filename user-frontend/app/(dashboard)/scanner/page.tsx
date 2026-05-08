"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, Upload, Link as LinkIcon, Copy, Check, 
  RefreshCw, Zap, ShieldCheck, History as HistoryIcon, 
  XCircle, AlertCircle 
} from 'lucide-react';
import { useTheme } from '../../ThemeContext';

export default function ScannerPage() {
  const { isDark } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      stopScan();
    };
  }, []);

  const scanFrame = () => {
    if (videoRef.current && canvasRef.current && (window as any).jsQR) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            setResult(code.data);
            stopScan();
            return;
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(scanFrame);
  };

  const startScan = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setIsScanning(true);
        requestRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied or not available.");
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (window as any).jsQR) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              setResult(code.data);
            } else {
              setError("No QR code found in image.");
            }
          }
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 pb-10 ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isDark ? 'border-[#2e2e2e]' : 'border-[#E4DDD3]'} pb-6`}>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#f1f5f9]' : 'text-[#2D2A26]'}`}>AI-Powered QR Scanner</h1>
          <p className={`${isDark ? 'text-[#94a3b8]' : 'text-[#6B6560]'} text-sm`}>Instant decoding with enterprise-grade security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-6 relative overflow-hidden`}>
            <div className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-[#1e1e1e]">
               {isScanning && <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />}
               <canvas ref={canvasRef} className="hidden" />
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-teal-500/20 rounded-3xl z-10 ${!isScanning && 'hidden'}`}>
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-xl" />
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                     <div className="absolute left-0 w-full h-0.5 bg-teal-500 animate-scan-line" />
                  </div>
               </div>
               {!isScanning && !result && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                    <Scan size={80} />
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest">Ready to scan</p>
                 </div>
               )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={isScanning ? stopScan : startScan} className={`px-8 py-3 ${isScanning ? 'bg-red-500' : 'bg-teal-600'} text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2`}>
                {isScanning ? <XCircle size={20} /> : <Scan size={20} />}
                {isScanning ? 'Stop' : 'Start Camera'}
              </button>
              <button onClick={() => fileInputRef.current?.click()} className={`px-8 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                <Upload size={20} /> Upload Image
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className={`${isDark ? 'bg-[#0a0a0a] border-[#2e2e2e]' : 'bg-[#F5F1EB] border-[#D4CCC1]'} border rounded-2xl p-6 min-h-[400px] flex flex-col`}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6">Scan Engine Output</h2>
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className={`p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-xl border break-all`}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Payload</p>
                      <p className="font-bold text-sm">{result}</p>
                    </div>
                    <button onClick={handleCopy} className="w-full py-3 border rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Scan size={40} className="mb-4" />
                    <p className="text-xs">Awaiting scan results...</p>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
}
