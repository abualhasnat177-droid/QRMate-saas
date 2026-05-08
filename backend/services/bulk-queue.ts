import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

/**
 * BULLMQ QUEUE DEFINITION
 */
export const bulkQueue = new Queue('bulk-qr-generation', { connection });
