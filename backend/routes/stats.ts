import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function statsRoutes(fastify: FastifyInstance) {
  
  fastify.get('/public', async () => {
    const [qrs, scans] = await Promise.all([
      prisma.qRCode.count(),
      prisma.scan.count()
    ]);
    return {
      success: true,
      totalQRs: qrs + 12500, // Seed data for social proof
      totalScans: scans + 450000
    };
  });
}
