import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function userRoutes(fastify: FastifyInstance) {

  fastify.get('/keys', { preValidation: [(fastify as any).authenticate] }, async (request) => {
    const user = (request as any).user;
    return await prisma.apiKey.findMany({ where: { userId: user.id } });
  });

  fastify.post('/keys', { preValidation: [(fastify as any).authenticate] }, async (request) => {
    const user = (request as any).user;
    const { name } = request.body as any;
    
    const rawKey = `qrm_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const limit = user.plan === 'BUSINESS' ? 50000 : 1000;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: name || 'New API Key',
        keyHash,
        keyPrefix: rawKey.substring(0, 8),
        callsLimit: limit
      }
    });

    return { success: true, apiKey: { ...apiKey, rawKey } };
  });

  fastify.delete('/keys/:id', { preValidation: [(fastify as any).authenticate] }, async (request) => {
    const { id } = request.params as any;
    const user = (request as any).user;
    await prisma.apiKey.deleteMany({ where: { id, userId: user.id } });
    return { success: true };
  });
}
