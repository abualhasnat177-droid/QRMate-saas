import { FastifyInstance } from 'fastify';
import crypto from 'crypto';

export default async function anonymousRoutes(fastify: FastifyInstance) {

  // POST /api/qr/anonymous/download
  fastify.post('/download', async (request, reply) => {
    // Check for anonymous session cookie
    let anonId = request.cookies.anon_session;
    
    if (!anonId) {
      anonId = crypto.randomBytes(16).toString('hex');
      reply.setCookie('anon_session', anonId, {
        path: '/',
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 // 1 year
      });
    }

    // In a real app, you'd store this in Redis to track the limit
    // For this implementation, we'll check a "downloaded" flag in the cookie
    const hasDownloaded = request.cookies.anon_did_download;

    if (hasDownloaded === 'true') {
      return reply.status(403).send({
        error: 'Limit reached',
        message: 'You have reached your limit of 1 free anonymous download. Please create a free account to continue.'
      });
    }

    // Mark as downloaded
    reply.setCookie('anon_did_download', 'true', {
      path: '/',
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60
    });

    return { success: true };
  });
}
