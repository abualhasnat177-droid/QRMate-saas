"use client";

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');

    if (token && userData) {
      try {
        localStorage.setItem('token', token);
        // The data is URI encoded from the backend
        const decodedUser = decodeURIComponent(userData);
        localStorage.setItem('user', decodedUser);
        
        // Brief delay for visual feedback then redirect to dashboard
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (err) {
        console.error('Auth success processing failed', err);
        router.push('/login?error=auth_processing_failed');
      }
    } else {
      router.push('/login?error=missing_auth_data');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#EDE8E0] flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <RefreshCw size={40} className="animate-spin text-teal-600" />
        </div>
        <h1 className="text-xl font-bold text-[#2D2A26]">Authenticating...</h1>
        <p className="text-[#6B6560] text-sm">Completing your secure login to QRMate.</p>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EDE8E0] flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <RefreshCw size={40} className="animate-spin text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-[#2D2A26]">Loading...</h1>
          </div>
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
