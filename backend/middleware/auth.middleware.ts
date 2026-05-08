import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Check for cookie first
    const token = request.cookies.access_token;
    
    if (!token) {
      // Fallback to Bearer token for API calls
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('No token provided');
      }
      const bearerToken = authHeader.split(' ')[1];
      const decoded = jwt.verify(bearerToken, JWT_SECRET) as any;
      (request as any).user = decoded;
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (request as any).user = decoded;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};
