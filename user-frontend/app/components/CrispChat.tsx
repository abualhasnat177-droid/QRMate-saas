"use client";
import { useEffect } from 'react';

export function CrispChat({ user }: { user?: { name?: string; email?: string; id?: string; plan?: string } | null }) {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    const isMock = !websiteId || websiteId === 'mock-website-id' || websiteId === 'mock_crisp_id' || websiteId === 'your-crisp-website-id-here';

    if (!isMock && typeof window !== 'undefined' && !(window as any).$crisp) {
      (window as any).$crisp = [];
      (window as any).CRISP_WEBSITE_ID = websiteId;

      const s = document.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (user && (window as any).$crisp) {
      if (user.email) (window as any).$crisp.push(['set', 'user:email', [user.email]]);
      if (user.name) (window as any).$crisp.push(['set', 'user:nickname', [user.name]]);
      
      const sessionData = [];
      if (user.plan) sessionData.push(['plan', user.plan]);
      if (user.id) sessionData.push(['user_id', user.id]);
      
      if (sessionData.length > 0) {
        (window as any).$crisp.push(['set', 'session:data', [sessionData]]);
      }
    }
  }, [user]);

  return null;
}
