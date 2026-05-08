import '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { PasskeyService } from '../services/passkey.service';
import { SSOService } from '../services/sso.service';
import { sendEmail } from '../email';
// @ts-ignore
import passport from 'passport';
// @ts-ignore
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import appleSignin from 'apple-signin-auth';
// @ts-ignore
import { authenticator } from 'otplib';
import QRCodeLib from 'qrcode';

const prisma = new PrismaClient();

// Configure Passport Google Strategy
passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback'
  },
  async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error('No email found'));

      let user = await prisma.user.findFirst({
        where: { OR: [{ email }, { providerId: profile.id }] }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0].value,
            provider: 'google',
            providerId: profile.id,
            plan: 'FREE'
          }
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err as Error);
    }
  }
));

export default async function authRoutes(fastify: FastifyInstance) {

  // Test route to verify registration
  fastify.get('/test', async () => ({ status: 'auth routes are working' }));

  // POST /auth/magic-link
  fastify.post('/magic-link', async (request, reply) => {
    const { email } = request.body as any;
    if (!email) return reply.status(400).send({ error: 'Email is required' });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.magicLinkToken.count({
      where: { email, createdAt: { gt: oneHourAgo } }
    });
    if (recentTokens >= 3) return reply.status(429).send({ error: 'Too many requests. Try again in an hour.' });

    await prisma.magicLinkToken.updateMany({
      where: { email, used: false },
      data: { used: true }
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = AuthService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.magicLinkToken.create({
      data: { email, tokenHash, expiresAt }
    });

    const magicLink = `${process.env.MAGIC_LINK_BASE_URL || 'http://localhost:3001'}/auth/verify?token=${rawToken}`;
    
    try {
      const emailResult = await sendEmail(
        email,
        'Your QRMate Login Link',
        `Click here to sign in to QRMate: ${magicLink}\n\nThis link expires in 15 minutes and can only be used once.`
      );
      
      // Development fallback: Log the link so it can be clicked even if Resend API key is missing
      console.log(`\n🔑 MAGIC LINK GENERATED FOR ${email}:\n👉 ${magicLink}\n`);

      if (!emailResult.success) {
        console.error('Email sending failed, but link was generated:', emailResult.error);
        return reply.status(500).send({ error: 'Failed to send email. Check backend logs for the link if in development.' });
      }

      return { success: true, message: 'Check your email for the magic link' };
    } catch (err) {
      console.error('Magic link generation error:', err);
      return reply.status(500).send({ error: 'Failed to generate magic link' });
    }
  });

  // GET /auth/verify?token=xxx
  fastify.get('/verify', async (request, reply) => {
    const { token } = request.query as any;
    if (!token) return reply.status(400).send({ error: 'Token is required' });

    const tokenHash = AuthService.hashToken(token);
    const magicToken = await prisma.magicLinkToken.findUnique({
      where: { tokenHash }
    });

    if (!magicToken || magicToken.used || magicToken.expiresAt < new Date()) {
      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/login?error=expired_link`);
    }

    await prisma.magicLinkToken.update({
      where: { id: magicToken.id },
      data: { used: true }
    });

    let user = await prisma.user.findUnique({ where: { email: magicToken.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: magicToken.email, plan: 'FREE' }
      });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const refreshToken = AuthService.generateRefreshToken(user, sessionId);
    const accessToken = AuthService.generateAccessToken(user, sessionId);

    await AuthService.createSession(user.id, refreshToken, request.ip, request.headers['user-agent'] || '');

    reply.setCookie('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });
    reply.setCookie('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 });

    return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/dashboard`);
  });

  // POST /auth/logout
  fastify.post('/logout', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
    const refreshToken = request.cookies.refresh_token;
    if (refreshToken) {
      await AuthService.invalidateSession(refreshToken);
    }
    reply.clearCookie('access_token');
    reply.clearCookie('refresh_token');
    return { success: true };
  });

  // POST /auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies.refresh_token;
    if (!refreshToken) return reply.status(401).send({ error: 'No refresh token' });

    const session = await AuthService.validateRefreshToken(refreshToken);
    if (!session) return reply.status(401).send({ error: 'Invalid session' });

    const newAccessToken = AuthService.generateAccessToken(session.user, session.id);
    
    reply.setCookie('access_token', newAccessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });

    return { success: true };
  });

  // ─────────────────────────────────────────────────────────
  // GOOGLE OAUTH
  // ─────────────────────────────────────────────────────────

  fastify.get('/google', async (request, reply) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || '')}&scope=email%20profile`;
    return reply.redirect(url);
  });

  fastify.get('/google/callback', async (request, reply) => {
    const { code } = request.query as any;
    if (!code) return reply.status(400).send({ error: 'No code provided' });

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code'
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/login?error=google_auth_failed`);
      }

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();

      if (!userData.email) {
        return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/login?error=google_auth_no_email`);
      }

      let user = await prisma.user.findFirst({
        where: { OR: [{ email: userData.email }, { providerId: userData.id }] }
      });

      if (!user) {
        user = await prisma.user.create({
          data: { 
            email: userData.email, 
            name: userData.name || userData.email.split('@')[0],
            avatarUrl: userData.picture,
            provider: 'google',
            providerId: userData.id,
            plan: 'FREE' 
          }
        });
      }

      const sessionId = crypto.randomBytes(16).toString('hex');
      const refreshToken = AuthService.generateRefreshToken(user, sessionId);
      const accessToken = AuthService.generateAccessToken(user, sessionId);

      await AuthService.createSession(user.id, refreshToken, request.ip, request.headers['user-agent'] || '');

      reply.setCookie('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });
      reply.setCookie('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 });

      const userDataObj = encodeURIComponent(JSON.stringify({ name: user.name, email: user.email, plan: user.plan, id: user.id }));
      
      // Redirect with token and user data in query params for the frontend to capture
      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/auth-success?token=${accessToken}&user=${userDataObj}`);
    } catch (err) {
      console.error('Google callback error:', err);
      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/login?error=google_auth_failed`);
    }
  });

  // ─────────────────────────────────────────────────────────
  // APPLE SIGN IN
  // ─────────────────────────────────────────────────────────

  fastify.post('/apple/callback', async (request, reply) => {
    const { id_token, user: appleUser } = request.body as any;

    try {
      const { sub: appleId, email } = await appleSignin.verifyIdToken(id_token, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });

      let user = await prisma.user.findFirst({
        where: { OR: [{ email }, { providerId: appleId }] }
      });

      if (!user) {
        let name = '';
        if (appleUser) {
          const parsed = JSON.parse(appleUser);
          name = `${parsed.name.firstName} ${parsed.name.lastName}`;
        }

        user = await prisma.user.create({
          data: { email, name, provider: 'apple', providerId: appleId, plan: 'FREE' }
        });
      }

      const sessionId = crypto.randomBytes(16).toString('hex');
      const refreshToken = AuthService.generateRefreshToken(user, sessionId);
      const accessToken = AuthService.generateAccessToken(user, sessionId);

      await AuthService.createSession(user.id, refreshToken, request.ip, request.headers['user-agent'] || '');

      reply.setCookie('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });
      reply.setCookie('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 });

      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/dashboard`);
    } catch (err) {
      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/login?error=apple_failed`);
    }
  });

  // ─────────────────────────────────────────────────────────
  // PASSKEYS (WebAuthn)
  // ─────────────────────────────────────────────────────────

  fastify.post('/passkey/register/begin', { preValidation: [(fastify as any).authenticate] }, async (request) => {
    const user = (request as any).user;
    const options = await PasskeyService.beginRegistration(user.userId);
    (request as any).session = { challenge: options.challenge };
    return options;
  });

  fastify.post('/passkey/register/complete', { preValidation: [(fastify as any).authenticate] }, async (request) => {
    const user = (request as any).user;
    const { challenge } = (request as any).session || {};
    return await PasskeyService.completeRegistration(user.userId, request.body, { challenge });
  });

  fastify.post('/passkey/authenticate/begin', async (request) => {
    const { email } = request.body as any;
    const options = await PasskeyService.beginAuthentication(email);
    (request as any).session = { challenge: options.challenge, email };
    return options;
  });

  fastify.post('/passkey/authenticate/complete', async (request, reply) => {
    const { challenge } = (request as any).session || {};
    const user = await PasskeyService.completeAuthentication(request.body, { challenge });

    const sessionId = crypto.randomBytes(16).toString('hex');
    const refreshToken = AuthService.generateRefreshToken(user, sessionId);
    const accessToken = AuthService.generateAccessToken(user, sessionId);

    await AuthService.createSession(user.id, refreshToken, request.ip, request.headers['user-agent'] || '');

    reply.setCookie('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });
    reply.setCookie('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 });

    return { success: true };
  });

  // ─────────────────────────────────────────────────────────
  // MFA (TOTP)
  // ─────────────────────────────────────────────────────────

  fastify.post('/mfa/setup', { preValidation: [(fastify as any).authenticate] }, async (request) => {
    const user = (request as any).user;
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'QRMate', secret);
    const qr = await QRCodeLib.toDataURL(otpauth);
    (request as any).session = { mfaSecret: secret };
    return { qr, secret };
  });

  fastify.post('/mfa/verify-setup', { preValidation: [(fastify as any).authenticate] }, async (request, reply) => {
    const { code } = request.body as any;
    const { mfaSecret } = (request as any).session || {};
    const user = (request as any).user;

    if (!authenticator.check(code, mfaSecret)) return reply.status(400).send({ error: 'Invalid code' });

    const encryptionKey = process.env.MFA_ENCRYPTION_KEY || '32charhexsecret';
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(encryptionKey, 'hex'), Buffer.alloc(16, 0));
    const encryptedSecret = Buffer.concat([cipher.update(mfaSecret), cipher.final()]).toString('hex');

    await prisma.user.update({
      where: { id: user.userId },
      data: { mfaEnabled: true, mfaSecretEncrypted: encryptedSecret }
    });

    return { success: true };
  });

  // ─────────────────────────────────────────────────────────
  // MICROSOFT OAUTH
  // ─────────────────────────────────────────────────────────

  fastify.get('/microsoft', async (request, reply) => {
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.MICROSOFT_CALLBACK_URL || '')}&response_mode=query&scope=openid%20profile%20email`;
    return reply.redirect(url);
  });

  fastify.get('/microsoft/callback', async (request, reply) => {
    const { code } = request.query as any;
    if (!code) return reply.status(400).send({ error: 'No code provided' });

    try {
      const email = `ms_user_${code.substring(0, 5)}@outlook.com`; // Mock
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: { email, provider: 'microsoft', plan: 'FREE' }
        });
      }

      const sessionId = crypto.randomBytes(16).toString('hex');
      const refreshToken = AuthService.generateRefreshToken(user, sessionId);
      const accessToken = AuthService.generateAccessToken(user, sessionId);

      await AuthService.createSession(user.id, refreshToken, request.ip, request.headers['user-agent'] || '');

      reply.setCookie('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });
      reply.setCookie('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 });

      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/dashboard`);
    } catch (err) {
      return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/login?error=microsoft_failed`);
    }
  });

  // ─────────────────────────────────────────────────────────
  // SAML SSO
  // ─────────────────────────────────────────────────────────

  fastify.post('/sso/login', async (request, reply) => {
    const { email } = request.body as any;
    const domain = email.split('@')[1];
    const idp = await SSOService.getIdPFromDomain(domain);
    if (!idp) return reply.status(400).send({ error: 'SSO not configured for this domain' });

    const sp = await SSOService.getServiceProvider();
    const { context } = sp.createLoginRequest(idp, 'redirect');
    return reply.redirect(context);
  });

  fastify.post('/sso/callback', async (request, reply) => {
    // In a real app, parse SAML response from request.body.SAMLResponse
    // For this turn, we mock the success
    const mockEmail = 'enterprise_user@company.com';
    let user = await prisma.user.findUnique({ where: { email: mockEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: { email: mockEmail, plan: 'BUSINESS' }
      });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const refreshToken = AuthService.generateRefreshToken(user, sessionId);
    const accessToken = AuthService.generateAccessToken(user, sessionId);

    await AuthService.createSession(user.id, refreshToken, request.ip, request.headers['user-agent'] || '');

    reply.setCookie('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 });
    reply.setCookie('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 });

    return reply.redirect(`${process.env.USER_DASHBOARD_URL || 'http://localhost:3001'}/dashboard`);
  });
}
