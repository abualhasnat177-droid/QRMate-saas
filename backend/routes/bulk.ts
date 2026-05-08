import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getPlanLimits } from '../middleware/plan-guard';
import { bulkQueue } from '../services/bulk-queue';

export default async function bulkRoutes(fastify: FastifyInstance) {

  fastify.post('/', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const limits = getPlanLimits(user.plan || 'FREE');

    if (limits.bulkRowLimit === 0) {
      return reply.status(403).send({
        error: 'Bulk generation requires Pro plan or higher',
        message: 'Upgrade to Pro to generate up to 100 QR codes at once, or Business for unlimited.',
      });
    }

    const { rows } = request.body as any;
    if (!Array.isArray(rows) || rows.length === 0) {
      return reply.status(400).send({ error: 'No rows provided' });
    }

    if (limits.bulkRowLimit !== -1 && rows.length > limits.bulkRowLimit) {
      return reply.status(400).send({
        error: `Row limit exceeded. Your plan allows ${limits.bulkRowLimit} rows.`,
      });
    }

    const customId = crypto.randomBytes(8).toString('hex');
    const job = await bulkQueue.add('bulk-gen', {
      rows,
      userId: user.id,
      userEmail: user.email,
      jobId: customId
    }, { jobId: customId });

    return { success: true, jobId: job.id };
  });

  fastify.get('/:jobId/status', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
    const { jobId } = request.params as any;
    const job = await bulkQueue.getJob(jobId);

    if (!job) return reply.status(404).send({ error: 'Job not found' });

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;

    return {
      success: true,
      status: state,
      progress: progress,
      result: result
    };
  });
}
