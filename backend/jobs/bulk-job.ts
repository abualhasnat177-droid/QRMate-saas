import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import QRCodeLib from 'qrcode';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../email';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

/**
 * BULLMQ WORKER FOR BULK QR GENERATION
 */
export const bulkWorker = new Worker('bulk-qr-generation', async (job: Job) => {
  const { rows, userId, userEmail, jobId: customId } = job.data;
  
  const errors: string[] = [];
  const zip = new AdmZip();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      await job.updateProgress(Math.round(((i + 1) / rows.length) * 100));
      
      const payload = row.value || row.url || '';
      if (!payload.trim()) {
        errors.push(`Row ${i + 1}: Empty value`);
        continue;
      }

      const buffer = await QRCodeLib.toBuffer(payload, {
        width: 600,
        margin: 2,
        color: {
          dark: row.fg_color || '#000000',
          light: row.bg_color || '#ffffff',
        }
      });

      const fileName = `${row.name || `QR-${i + 1}`}.png`.replace(/[<>:"/\\|?*]/g, '_');
      zip.addFile(fileName, buffer);

    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    zip.addFile('errors.txt', Buffer.from(errors.join('\n'), 'utf-8'));
  }

  const publicDir = path.join(process.cwd(), 'public', 'downloads');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const zipPath = path.join(publicDir, `bulk-${customId}.zip`);
  zip.writeZip(zipPath);

  // Send email notification
  try {
    await sendEmail(
      userEmail,
      'Your Bulk QR Generation is Ready!',
      `Hi there,\n\nYour bulk QR generation job (${rows.length} rows) is complete.\n\nYou can download your ZIP file here: http://localhost:8080/downloads/bulk-${customId}.zip\n\nThanks,\nThe QRMate Team`
    );
  } catch (emailErr) {
    console.error('Failed to send bulk completion email:', emailErr);
  }

  return { downloadUrl: `/downloads/bulk-${customId}.zip`, total: rows.length, processed: rows.length - errors.length, errors };
}, { connection });

bulkWorker.on('completed', job => {
  console.log(`Bulk Job ${job.id} completed`);
});

bulkWorker.on('failed', (job, err) => {
  console.error(`Bulk Job ${job?.id} failed:`, err);
});
