import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const data = await resend.emails.send({
      from: process.env.MAIL_FROM || 'QRMate <noreply@qrmate.com>',
      to,
      subject,
      text,
      html: html || text,
    });
    
    console.log('Message sent via Resend:', data.data?.id);
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return { success: false, error };
  }
};
