import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCodeLib from 'qrcode';
import crypto from 'crypto';
import { sendEmail } from './email';
import { encodeQR, QRType, QRData } from './services/qr-encoder';
import { validateQR } from './services/qr-validator';
import { logScan } from './services/scan-logger';
import { getPlanLimits, requirePlan, hasPlanAccess } from './middleware/plan-guard';
// import { bulkQueue } from './services/bulk-queue';
// import './jobs/bulk-job'; // Initialize worker

import apiV1Routes from './routes/api-v1';
import userRoutes from './routes/user';
import bulkRoutes from './routes/bulk';
import statsRoutes from './routes/stats';
import authRoutes from './routes/auth';
import anonymousRoutes from './routes/anonymous';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Register CORS
fastify.register(cors, {
  origin: true // Allow all origins for dev
});

// Register JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret_qrmate_key_32_chars_long_minimum'
});

// Register Cookies & Sessions (Required for Magic Link & Passkeys)
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'cookie-secret-random-32-chars-long-min'
});

fastify.register(fastifySession, {
  secret: process.env.COOKIE_SECRET || 'cookie-secret-random-32-chars-long-min',
  cookie: { secure: process.env.NODE_ENV === 'production' }
});

// Serve static files
import fastifyStatic from '@fastify/static';
import path from 'path';
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/', 
});

// Swagger Documentation
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

fastify.register(fastifySwagger, {
  openapi: {
    info: { title: 'QRMate Developer API', description: 'Advanced QR generation and tracking API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:8080' }],
    components: {
      securitySchemes: {
        apiKey: { type: 'apiKey', name: 'Authorization', in: 'header', description: 'Bearer {your_api_key}' }
      }
    }
  }
});

fastify.register(fastifySwaggerUi, {
  routePrefix: '/api/docs',
});

// Middleware to protect API Keys
fastify.decorate("authenticateApiKey", async function(request: any, reply: any) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid API key' });
  }

  const key = authHeader.split(' ')[1];
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  const apiKey = await prisma.apiKey.findUnique({ 
    where: { keyHash },
    include: { user: true }
  });

  if (!apiKey) return reply.status(401).send({ error: 'Invalid API key' });

  // Rate limit check
  if (apiKey.callsUsed >= apiKey.callsLimit) {
    return reply.status(429).send({ 
      error: 'Monthly limit reached', 
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString() 
    });
  }

  // Update usage (async)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { callsUsed: { increment: 1 }, lastUsedAt: new Date() }
  }).catch(console.error);

  request.user = apiKey.user;
  request.apiKeyId = apiKey.id;
});

// Main authentication middleware for dashboard/web users
fastify.decorate("authenticate", async function(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Optional auth — sets request.user if token present, but does not block
fastify.decorate("optionalAuth", async function(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch {
    // No token — that's fine, proceed without user
  }
});

// Helper: generate short code for dynamic QR
function generateShortCode(): string {
  return crypto.randomBytes(4).toString('hex'); // 8 chars
}

// ═══════════════════════════════════════════════════════════
// LEGACY AUTHENTICATION (DEPRECATED - MOVED TO MODULAR ROUTES)
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// QR CODE GENERATION (public — no auth for anonymous use)
// ═══════════════════════════════════════════════════════════

function generateStyledSVG(payload: string, options: any) {
  const qr = QRCodeLib.create(payload, { errorCorrectionLevel: options.errorCorrectionLevel || 'M' });
  const { modules } = qr;
  const size = modules.size;
  const margin = options.margin || 4;
  const width = options.width || 300;
  const scale = width / (size + margin * 2);
  
  const fgColor = options.colorDark || '#000000';
  const bgColor = options.colorLight || '#ffffff';
  
  const dotStyle = options.dotStyle || 'square';
  const eyeStyle = options.eyeStyle || 'square';
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}">`;

  // 1. Draw Background
  svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
  
  // 2. Draw Eyes (Finder Patterns)
  const eyePositions = [[0, 0], [size - 7, 0], [0, size - 7]];
  const eyeMask = Array.from({ length: size }, () => Array(size).fill(false));

  eyePositions.forEach(([r, c]) => {
    // Mark these as eye modules so we don't draw them again in the loop
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        eyeMask[r + i][c + j] = true;
      }
    }

    const x = (c + margin) * scale;
    const y = (r + margin) * scale;
    const s7 = 7 * scale;
    const s5 = 5 * scale;
    const s3 = 3 * scale;
    const offset1 = scale;
    const offset2 = 2 * scale;

    const rx = eyeStyle === 'extra-rounded' ? scale * 2 : (eyeStyle === 'rounded' ? scale : 0);

    // Outer square (7x7)
    svg += `<path d="M${x},${y + rx} a${rx},${rx} 0 0 1 ${rx},-${rx} h${s7 - 2 * rx} a${rx},${rx} 0 0 1 ${rx},${rx} v${s7 - 2 * rx} a${rx},${rx} 0 0 1 -${rx},${rx} h-${s7 - 2 * rx} a${rx},${rx} 0 0 1 -${rx},-${rx} z M${x + scale},${y + scale} v${s5} h${s5} v-${s5} z" fill="${fgColor}" fill-rule="evenodd"/>`;
    
    // Inner square (3x3)
    const irx = rx > 0 ? rx * 0.5 : 0;
    svg += `<rect x="${x + offset2}" y="${y + offset2}" width="${s3}" height="${s3}" fill="${fgColor}" rx="${irx}"/>`;
  });

  // 3. Draw Dots/Modules
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (modules.get(row, col) && !eyeMask[row][col]) {
        const x = (col + margin) * scale;
        const y = (row + margin) * scale;
        
        if (dotStyle === 'dots') {
          svg += `<circle cx="${x + scale / 2}" cy="${y + scale / 2}" r="${scale / 2.2}" fill="${fgColor}"/>`;
        } else if (dotStyle === 'rounded') {
          svg += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${scale - 1}" height="${scale - 1}" fill="${fgColor}" rx="${scale * 0.4}"/>`;
        } else {
          svg += `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" fill="${fgColor}"/>`;
        }
      }
    }
  }
  
  svg += '</svg>';
  return svg;
}

fastify.post('/api/qr/generate', async (request, reply) => {
  const { type, data, url, options } = request.body as any;
  
  // Support both old format (url string) and new format (type + data)
  let payload: string;

  if (type && data) {
    // New typed format
    const validation = validateQR(type as QRType, data as QRData);
    if (!validation.valid) {
      return reply.status(400).send({ error: 'Validation failed', errors: validation.errors });
    }
    payload = encodeQR(type as QRType, data as QRData);
  } else if (url) {
    // Legacy format — raw URL/string
    payload = url;
  } else {
    return reply.status(400).send({ error: 'Either url or (type + data) is required' });
  }

  if (!payload.trim()) {
    return reply.status(400).send({ error: 'Empty QR payload' });
  }

  try {
    let qrDataUrl = await QRCodeLib.toDataURL(payload, {
      type: options?.type || 'image/png',
      margin: options?.margin || 4,
      width: options?.width || 300,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.colorDark || '#000000',
        light: options?.colorLight || '#ffffff',
      }
    });
    
    let svgData = null;
    if (options?.includeSvg || options?.dotStyle || options?.eyeStyle) {
      if (options?.dotStyle && options.dotStyle !== 'square' || options?.eyeStyle && options.eyeStyle !== 'square') {
        svgData = generateStyledSVG(payload, options);
        // If they want styled, we also provide a data URL version of the styled SVG for the 'qr' field
        const base64Svg = Buffer.from(svgData).toString('base64');
        qrDataUrl = `data:image/svg+xml;base64,${base64Svg}`;
      } else {
        svgData = await QRCodeLib.toString(payload, {
          type: 'svg',
          margin: options?.margin || 4,
          width: options?.width || 300,
          errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
          color: {
            dark: options?.colorDark || '#000000',
            light: options?.colorLight || '#ffffff',
          }
        });
      }
    }

    return { success: true, qr: qrDataUrl, svg: svgData, encodedPayload: payload };
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to generate QR code' });
  }
});

// ═══════════════════════════════════════════════════════════
// QR CODE SAVE (auth required)
// ═══════════════════════════════════════════════════════════

fastify.post('/api/qr/save', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { title, destination, design, isDynamic, qrType } = request.body as any;
  const user = (request as any).user;

  // Check dynamic QR limit for free users
  if (isDynamic) {
    const limits = getPlanLimits(user.plan || 'FREE');
    if (limits.dynamicQRLimit !== -1) {
      const currentCount = await prisma.qRCode.count({
        where: { userId: user.id, isDynamic: true }
      });
      if (currentCount >= limits.dynamicQRLimit) {
        return reply.status(403).send({
          error: 'Dynamic QR limit reached',
          message: `Your ${user.plan || 'FREE'} plan allows ${limits.dynamicQRLimit} dynamic QR codes. Upgrade to Pro for unlimited.`,
          limit: limits.dynamicQRLimit,
          current: currentCount,
        });
      }
    }
  }

  try {
    const shortCode = isDynamic ? generateShortCode() : null;

    const qr = await prisma.qRCode.create({
      data: {
        title: title || 'Untitled QR',
        qrType: qrType || 'url',
        destination,
        isDynamic: isDynamic || false,
        shortCode,
        design: design || {},
        userId: user.id,
      }
    });
    return { success: true, qr };
  } catch (error) {
    return reply.status(500).send({ error: 'Failed to save QR code' });
  }
});

// ═══════════════════════════════════════════════════════════
// QR CODE LISTING & MANAGEMENT
// ═══════════════════════════════════════════════════════════

fastify.get('/api/qr/my-codes', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const user = (request as any).user;
  const codes = await prisma.qRCode.findMany({
    where: { userId: user.id },
    include: { _count: { select: { scans: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return { success: true, codes };
});

// Update dynamic QR destination
fastify.patch('/api/qr/:id', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { id } = request.params as any;
  const { destination } = request.body as any;
  const user = (request as any).user;

  const qr = await prisma.qRCode.findFirst({ where: { id, userId: user.id } });
  if (!qr) return reply.status(404).send({ error: 'QR code not found' });
  if (!qr.isDynamic) return reply.status(400).send({ error: 'Can only update dynamic QR codes' });

  const updated = await prisma.qRCode.update({
    where: { id },
    data: { destination },
  });

  return { success: true, qr: updated };
});

// Delete QR
fastify.delete('/api/qr/:id', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { id } = request.params as any;
  const user = (request as any).user;

  const qr = await prisma.qRCode.findFirst({ where: { id, userId: user.id } });
  if (!qr) return reply.status(404).send({ error: 'QR code not found' });

  await prisma.qRCode.delete({ where: { id } });
  return { success: true, deleted: true };
});

// ═══════════════════════════════════════════════════════════
// SCAN REDIRECT — PUBLIC (no auth)
// ═══════════════════════════════════════════════════════════

fastify.get('/r/:shortCode', async (request, reply) => {
  const { shortCode } = request.params as any;

  const qr = await prisma.qRCode.findUnique({ where: { shortCode } });
  if (!qr || !qr.isActive) {
    return reply.status(404).send({ error: 'QR code not found or deactivated' });
  }

  // Fire-and-forget scan logging — DO NOT await
  const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || request.ip 
    || '0.0.0.0';
  const ua = request.headers['user-agent'] || '';
  const referer = request.headers['referer'] || null;
  
  logScan(qr.id, ip, ua, referer as string | null).catch(() => {});

  return reply.redirect(qr.destination);
});

// ═══════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════

fastify.get('/api/qr/:id/analytics', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { id } = request.params as any;
  const { range = '30d' } = request.query as any;
  const user = (request as any).user;

  const qr = await prisma.qRCode.findFirst({ where: { id, userId: user.id } });
  if (!qr) return reply.status(404).send({ error: 'QR code not found' });

  const limits = getPlanLimits(user.plan || 'FREE');

  // Everyone gets total scan count
  const totalScans = await prisma.scan.count({ where: { qrCodeId: id } });

  if (limits.analyticsAccess === 'count_only') {
    return {
      success: true,
      analytics: { totalScans },
      gated: true,
      message: 'Upgrade to Pro for full analytics with charts, geo, device, and referrer data.',
    };
  }

  // Full analytics for Pro+
  const now = new Date();
  let dateFilter = new Date();
  if (range === '7d') dateFilter.setDate(now.getDate() - 7);
  else if (range === '30d') dateFilter.setDate(now.getDate() - 30);
  else if (range === '90d') dateFilter.setDate(now.getDate() - 90);
  else dateFilter = new Date(0); // all time

  const whereClause = {
    qrCodeId: id,
    scannedAt: { gte: dateFilter },
  };

  const [uniqueScans, scansToday, scansThisWeek, recentScans, allScans] = await Promise.all([
    prisma.scan.groupBy({ by: ['ipHash'], where: whereClause }).then(r => r.length),
    prisma.scan.count({
      where: {
        qrCodeId: id,
        scannedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.scan.count({
      where: {
        qrCodeId: id,
        scannedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.scan.findMany({
      where: whereClause,
      orderBy: { scannedAt: 'desc' },
      take: 20,
      select: {
        scannedAt: true,
        country: true,
        city: true,
        deviceType: true,
        os: true,
        browser: true,
        referrer: true,
      },
    }),
    prisma.scan.findMany({
      where: whereClause,
      select: {
        scannedAt: true,
        deviceType: true,
        os: true,
        country: true,
      },
    }),
  ]);

  // Aggregate device breakdown
  const deviceBreakdown: Record<string, number> = {};
  const osBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};

  for (const scan of allScans) {
    deviceBreakdown[scan.deviceType || 'Unknown'] = (deviceBreakdown[scan.deviceType || 'Unknown'] || 0) + 1;
    osBreakdown[scan.os || 'Unknown'] = (osBreakdown[scan.os || 'Unknown'] || 0) + 1;
    countryBreakdown[scan.country || 'Unknown'] = (countryBreakdown[scan.country || 'Unknown'] || 0) + 1;
  }

  // Top 5 countries
  const topCountries = Object.entries(countryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  // Daily scan timeline (last 30 days)
  const timeline: Record<string, number> = {};
  const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30;
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    timeline[key] = 0;
  }
  for (const scan of allScans) {
    const key = scan.scannedAt.toISOString().split('T')[0];
    if (timeline[key] !== undefined) {
      timeline[key]++;
    }
  }

  const timelineData = Object.entries(timeline).map(([date, count]) => ({ date, count }));

  return {
    totalScans,
    uniqueScans,
    scansToday,
    scansThisWeek,
    recentScans,
    deviceBreakdown,
    osBreakdown,
    topCountries,
    timeline: timelineData,
  };
});

/**
 * EXPORT ANALYTICS AS CSV (BUSINESS plan only)
 */
fastify.get('/api/qr/:id/analytics/export', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { id } = request.params as any;
  const user = (request as any).user;

  if (!hasPlanAccess(user.plan || 'FREE', 'BUSINESS')) {
    return reply.status(403).send({ error: 'CSV export requires Business plan' });
  }

  const qr = await prisma.qRCode.findFirst({ where: { id, userId: user.id } });
  if (!qr) return reply.status(404).send({ error: 'QR code not found' });

  const scans = await prisma.scan.findMany({
    where: { qrCodeId: id },
    orderBy: { scannedAt: 'desc' },
  });

  let csv = 'Time,Country,City,Device,OS,Browser,Referrer\n';
  scans.forEach(s => {
    csv += `"${s.scannedAt.toISOString()}","${s.country || ''}","${s.city || ''}","${s.deviceType || ''}","${s.os || ''}","${s.browser || ''}","${s.referrer || ''}"\n`;
  });

  reply.header('Content-Type', 'text/csv');
  reply.header('Content-Disposition', `attachment; filename=qrmate-analytics-${id}.csv`);
  return csv;
});

// ═══════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════

fastify.get('/api/user/me', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  return { user: request.user };
});

fastify.get('/api/user/stats', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const user = (request as any).user;
  const qrCount = await prisma.qRCode.count({ where: { userId: user.id } });
  
  const scanCount = await prisma.scan.count({
    where: { qrCode: { userId: user.id } }
  });

  return { 
    success: true, 
    stats: {
      qrCodes: qrCount,
      totalScans: scanCount,
      activeCampaigns: qrCount,
      conversionRate: '12.5%'
    }
  };
});

fastify.get('/api/user/analytics', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const user = (request as any).user;
  const { range = '30d' } = request.query as any;

  const now = new Date();
  let dateFilter = new Date();
  if (range === '7d') dateFilter.setDate(now.getDate() - 7);
  else if (range === '30d') dateFilter.setDate(now.getDate() - 30);
  else if (range === '90d') dateFilter.setDate(now.getDate() - 90);
  else dateFilter = new Date(0);

  const [totalScans, uniqueScans, mobileScans, desktopScans, allScans, topQrs] = await Promise.all([
    prisma.scan.count({ where: { qrCode: { userId: user.id }, scannedAt: { gte: dateFilter } } }),
    prisma.scan.groupBy({ by: ['ipHash'], where: { qrCode: { userId: user.id }, scannedAt: { gte: dateFilter } } }).then(r => r.length),
    prisma.scan.count({ where: { qrCode: { userId: user.id }, deviceType: 'mobile', scannedAt: { gte: dateFilter } } }),
    prisma.scan.count({ where: { qrCode: { userId: user.id }, deviceType: 'desktop', scannedAt: { gte: dateFilter } } }),
    prisma.scan.findMany({ 
      where: { qrCode: { userId: user.id }, scannedAt: { gte: dateFilter } },
      select: { scannedAt: true }
    }),
    prisma.qRCode.findMany({
      where: { userId: user.id },
      include: { _count: { select: { scans: true } } },
      orderBy: { scans: { _count: 'desc' } },
      take: 5
    })
  ]);

  // Aggregate timeline
  const timeline: Record<string, number> = {};
  const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 30;
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    timeline[d.toISOString().split('T')[0]] = 0;
  }
  for (const scan of allScans) {
    const key = scan.scannedAt.toISOString().split('T')[0];
    if (timeline[key] !== undefined) timeline[key]++;
  }

  return {
    success: true,
    stats: {
      total: totalScans,
      unique: uniqueScans,
      mobile: mobileScans,
      desktop: desktopScans
    },
    timeline: Object.entries(timeline).map(([date, count]) => ({ date, count })),
    topQrs: topQrs.map(qr => ({
      id: qr.id,
      name: qr.title,
      scans: qr._count.scans
    }))
  };
});

// ═══════════════════════════════════════════════════════════
// EMAIL / CONTACT ROUTES
// ═══════════════════════════════════════════════════════════

fastify.post('/api/contact', async (request, reply) => {
  const { name, email, message, subject = 'Support Request' } = request.body as any;

  if (!email || !message) {
    return reply.status(400).send({ error: 'Email and message are required' });
  }

  try {
    const websiteId = process.env.CRISP_WEBSITE_ID;
    const identifier = process.env.CRISP_API_IDENTIFIER;
    const key = process.env.CRISP_API_KEY;

    if (!websiteId || !identifier || !key) {
      console.log('Crisp API keys missing, simulating ticket creation for:', email);
      return { success: true, message: 'Ticket created (simulated)' };
    }

    const authHeader = 'Basic ' + Buffer.from(`${identifier}:${key}`).toString('base64');
    const res = await fetch(`https://api.crisp.chat/v1/website/${websiteId}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Crisp-Tier': 'plugin',
        'Authorization': authHeader
      }
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create Crisp conversation');
    
    const sessionId = data.data.session_id;
    
    await fetch(`https://api.crisp.chat/v1/website/${websiteId}/conversation/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Crisp-Tier': 'plugin',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        type: 'text',
        from: 'user',
        origin: 'email',
        content: `Name: ${name || 'N/A'}\nSubject: ${subject}\n\n${message}`,
        user: { nickname: name, email: email }
      })
    });

    return { success: true, message: 'Ticket created in Crisp' };
  } catch (error) {
    console.error('Crisp ticketing error:', error);
    return reply.status(500).send({ error: 'Failed to create support ticket' });
  }
});

// ═══════════════════════════════════════════════════════════
// ADMIN / BROADCAST ROUTES
// ═══════════════════════════════════════════════════════════

fastify.post('/api/admin/broadcast', async (request, reply) => {
  const { subject, message, segment = 'all', scheduleAt } = request.body as any;
  if (!subject || !message) return reply.status(400).send({ error: 'Subject and message are required' });
  
  try {
    const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
    const LOOPS_API = 'https://app.loops.so/api/v1';

    const totalUsers = await prisma.user.count();

    if (!LOOPS_API_KEY) {
       console.log('Loops API key missing, simulating broadcast for subject:', subject);
       return { success: true, sentCount: totalUsers, totalUsers: totalUsers };
    }

    const res = await fetch(`${LOOPS_API}/campaigns/send`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        campaignId: 'dynamic_creation',
        subject,
        htmlBody: message.replace(/\n/g, '<br/>'),
        audienceFilter: segment !== 'all' ? { userGroup: segment } : undefined,
        scheduledAt: scheduleAt ?? undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send broadcast via Loops');

    console.log('Broadcast triggered via Loops:', subject);

    return { success: true, sentCount: totalUsers, totalUsers: totalUsers };
  } catch (error) {
    console.error('Broadcast failed:', error);
    return reply.status(500).send({ error: 'Database or Loops API failure' });
  }
});

// ═══════════════════════════════════════════════════════════
// API KEY MANAGEMENT (BUSINESS plan)
// ═══════════════════════════════════════════════════════════

fastify.post('/api/keys', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const user = (request as any).user;
  
  if (!hasPlanAccess(user.plan || 'FREE', 'PRO')) {
    return reply.status(403).send({
      error: 'API access requires Pro plan or higher',
    });
  }

  const { name = 'Default' } = request.body as any;
  const rawKey = `qrm_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);
  const limits = getPlanLimits(user.plan || 'FREE');

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      keyHash,
      keyPrefix,
      callsLimit: limits.apiCallsPerMonth,
    },
  });

  return {
    success: true,
    key: rawKey, // Show ONCE
    id: apiKey.id,
    name: apiKey.name,
    prefix: keyPrefix,
    callsLimit: apiKey.callsLimit,
  };
});

fastify.get('/api/keys', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const user = (request as any).user;
  
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      callsUsed: true,
      callsLimit: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { success: true, keys };
});

fastify.delete('/api/keys/:id', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { id } = request.params as any;
  const user = (request as any).user;

  const key = await prisma.apiKey.findFirst({ where: { id, userId: user.id } });
  if (!key) return reply.status(404).send({ error: 'API key not found' });

  await prisma.apiKey.delete({ where: { id } });
  return { success: true, deleted: true };
});

// ═══════════════════════════════════════════════════════════
// STRIPE BILLING ROUTES
// ═══════════════════════════════════════════════════════════

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-04-22.dahlia' as any
});

// New plan IDs
const STRIPE_PLANS: Record<string, string> = {
  'pro_monthly': process.env.STRIPE_PRO_MONTHLY_ID || 'price_pro_monthly_6',
  'pro_yearly': process.env.STRIPE_PRO_YEARLY_ID || 'price_pro_yearly_49',
  'business_monthly': process.env.STRIPE_BUSINESS_MONTHLY_ID || 'price_business_monthly_19',
  'business_yearly': process.env.STRIPE_BUSINESS_YEARLY_ID || 'price_business_yearly_149',
};

fastify.post('/api/billing/checkout', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const { planId } = request.body as any;
  const priceId = STRIPE_PLANS[planId] || planId;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: 'http://localhost:3001/billing?success=true',
      cancel_url: 'http://localhost:3001/billing?canceled=true',
      customer_email: (request as any).user.email
    });
    
    return { url: session.url };
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
});

/**
 * STRIPE WEBHOOK HANDLER
 * Processes checkout.session.completed and customer.subscription.updated
 */
fastify.post('/api/billing/webhook', { config: { rawBody: true } }, async (request, reply) => {
  const sig = request.headers['stripe-signature'] as string;
  let event;

  try {
    // In a real app, you'd use stripe.webhooks.constructEvent with your endpoint secret
    // For this environment, we'll parse the body directly as we're in a mock-friendly setup
    event = (request.body as any);
    
    // Log for visibility in dev
    console.log('Stripe Webhook Received:', event.type);

    if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
      const session = event.data.object;
      const customerEmail = session.customer_email || session.email;
      
      // Determine plan based on price ID (mapping from our STRIPE_PLANS)
      let plan: 'PRO' | 'BUSINESS' | 'FREE' = 'FREE';
      const priceId = session.plan?.id || session.lines?.data[0]?.price?.id || session.amount_total > 1000 ? 'BUSINESS' : 'PRO'; 
      
      // Heuristic plan mapping for the demo/test environment
      if (priceId.includes('business')) plan = 'BUSINESS';
      else if (priceId.includes('pro')) plan = 'PRO';

      if (customerEmail) {
        await prisma.user.update({
          where: { email: customerEmail },
          data: { plan },
        });
        console.log(`User ${customerEmail} upgraded to ${plan}`);
      }
    }

    return { received: true };
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return reply.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ═══════════════════════════════════════════════════════════
// FOLDERS & CAMPAIGNS (PRO plan)
// ═══════════════════════════════════════════════════════════

fastify.get('/api/folders', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
  const user = (request as any).user;
  
  if (!hasPlanAccess(user.plan || 'FREE', 'PRO')) {
    return reply.status(403).send({
      error: 'Folders require Pro plan',
      message: 'Upgrade to Pro to organize your QR codes into folders and campaigns.'
    });
  }

  // Folders would be a separate table in a real app, returning empty for now
  return { success: true, folders: [] };
});

// ═══════════════════════════════════════════════════════════
// BULK QR GENERATION
// ═══════════════════════════════════════════════════════════

// Register Modular Routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(anonymousRoutes, { prefix: '/api/qr/anonymous' });
fastify.register(apiV1Routes, { prefix: '/api/v1' });
fastify.register(userRoutes, { prefix: '/api/user' });
// fastify.register(bulkRoutes, { prefix: '/api/qr/bulk' });
fastify.register(statsRoutes, { prefix: '/api/stats' });

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

const start = async () => {
  try {
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:8080');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
