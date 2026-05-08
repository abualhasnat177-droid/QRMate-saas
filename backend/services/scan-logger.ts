/**
 * Scan Logger Service
 * Async geo-lookup, UA parsing, and logging — fire-and-forget to keep redirects fast.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// --- User-Agent parsing (lightweight, no external deps) ---

interface ParsedUA {
  deviceType: string;
  os: string;
  browser: string;
}

function parseUserAgent(ua: string): ParsedUA {
  const lower = ua.toLowerCase();

  // Device type
  let deviceType = 'Desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // OS
  let os = 'Other';
  if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser
  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  return { deviceType, os, browser };
}

// --- IP hashing ---

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'qrmate-salt').digest('hex');
}

// --- Geo lookup (ip-api.com free tier — fires async, does not block) ---

interface GeoResult {
  country: string;
  city: string;
}

async function geoLookup(ip: string): Promise<GeoResult> {
  try {
    // Skip geo for local/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Localhost' };
    }

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      signal: AbortSignal.timeout(3000), // 3s timeout — never block
    });
    if (!res.ok) return { country: 'Unknown', city: 'Unknown' };
    const data = await res.json();
    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
    };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

// --- Main log function (fire-and-forget) ---

export async function logScan(
  qrCodeId: string,
  ip: string,
  userAgentStr: string,
  referer: string | null
): Promise<void> {
  try {
    const ua = parseUserAgent(userAgentStr || '');
    const ipHash = hashIP(ip);
    const referrer = referer || 'Direct';

    // Fire geo lookup asynchronously — we don't await before writing
    // but we do await the whole thing since this function is fire-and-forget
    const geo = await geoLookup(ip);

    await prisma.scan.create({
      data: {
        qrCodeId,
        ipHash,
        userAgent: userAgentStr?.slice(0, 500) || null,
        country: geo.country,
        city: geo.city,
        deviceType: ua.deviceType,
        os: ua.os,
        browser: ua.browser,
        referrer: referrer.slice(0, 500),
      },
    });
  } catch (err) {
    // Never let scan logging crash the redirect
    console.error('Scan logging error (non-blocking):', err);
  }
}
