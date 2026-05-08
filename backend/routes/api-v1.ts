import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function apiV1Routes(fastify: FastifyInstance) {
  
  // POST /api/v1/qr
  fastify.post('/qr', { preValidation: [(fastify as any).authenticateApiKey] }, async (request, reply) => {
    const user = (request as any).user;
    const { type, value, options = {} } = request.body as any;

    if (!type || !value) return reply.status(400).send({ error: 'Type and value are required' });

    const shortCode = crypto.randomBytes(4).toString('hex');
    const qr = await prisma.qRCode.create({
      data: {
        userId: user.id,
        title: options.title || `API Generated ${type}`,
        qrType: type,
        destination: typeof value === 'string' ? value : JSON.stringify(value),
        isDynamic: true,
        shortCode,
        design: options,
        isActive: true
      }
    });

    return {
      id: qr.id,
      shortCode,
      imageUrl: `http://localhost:8080/r/${shortCode}`,
      createdAt: qr.createdAt
    };
  });

  // GET /api/v1/qr/:id
  fastify.get('/qr/:id', { preValidation: [(fastify as any).authenticateApiKey] }, async (request) => {
    const { id } = request.params as any;
    const user = (request as any).user;
    const qr = await prisma.qRCode.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { scans: true } } }
    });
    if (!qr) return { error: 'Not found' };
    return {
      id: qr.id,
      type: qr.qrType,
      shortCode: qr.shortCode,
      imageUrl: `http://localhost:8080/r/${qr.shortCode}`,
      scanCount: qr._count.scans,
      createdAt: qr.createdAt,
      updatedAt: qr.updatedAt
    };
  });

  // PATCH /api/v1/qr/:id
  fastify.patch('/qr/:id', { preValidation: [(fastify as any).authenticateApiKey] }, async (request) => {
    const { id } = request.params as any;
    const { value } = request.body as any;
    const user = (request as any).user;
    
    const qr = await prisma.qRCode.updateMany({
      where: { id, userId: user.id },
      data: { destination: value }
    });
    
    if (qr.count === 0) return { error: 'Not found' };
    return { id, updatedAt: new Date() };
  });

  // DELETE /api/v1/qr/:id
  fastify.delete('/qr/:id', { preValidation: [(fastify as any).authenticateApiKey] }, async (request) => {
    const { id } = request.params as any;
    const user = (request as any).user;
    await prisma.qRCode.deleteMany({ where: { id, userId: user.id } });
    return { deleted: true };
  });

  // GET /api/v1/qr/:id/analytics
  fastify.get('/qr/:id/analytics', { preValidation: [(fastify as any).authenticateApiKey] }, async (request, reply) => {
    const { id } = request.params as any;
    const user = (request as any).user;

    if (user.plan === 'PRO') {
      return reply.status(403).send({ error: 'Analytics API requires Business plan' });
    }

    const scans = await prisma.scan.findMany({ where: { qrCodeId: id } });
    return {
      totalScans: scans.length,
      uniqueScans: new Set(scans.map(s => s.ipHash)).size,
      scansToday: scans.filter(s => s.scannedAt > new Date(new Date().setHours(0,0,0,0))).length
    };
  });
}
