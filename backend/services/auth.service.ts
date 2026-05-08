// @ts-ignore
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'superrefreshsecret';

export class AuthService {
  
  static generateAccessToken(user: any, sessionId: string) {
    return jwt.sign(
      { userId: user.id, email: user.email, plan: user.plan, sessionId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(user: any, sessionId: string) {
    return jwt.sign(
      { userId: user.id, sessionId },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  }

  static hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async createSession(userId: string, refreshToken: string, ip: string, userAgent: string) {
    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // @ts-ignore - Supress IDE error until Prisma Client can be regenerated (dev server locking issue)
    return await prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
        ipHash,
        userAgent
      }
    });
  }

  static async invalidateSession(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    // @ts-ignore
    await prisma.session.deleteMany({ where: { refreshTokenHash: hash } });
  }

  static async validateRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
      const hash = this.hashToken(token);
      
      // @ts-ignore
      const session = await prisma.session.findUnique({
        where: { refreshTokenHash: hash },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }
}
