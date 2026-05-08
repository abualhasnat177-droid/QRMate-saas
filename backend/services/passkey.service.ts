import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rpName = 'QRMate';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || 'http://localhost:3001';

export class PasskeyService {

  static async beginRegistration(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { passkeys: true }
    });

    if (!user) throw new Error('User not found');

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(user.id),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: user.passkeys.map(pk => ({
        id: pk.credentialId,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    return options;
  }

  static async completeRegistration(userId: string, body: any, currentOptions: any) {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: currentOptions.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { publicKey, id, counter } = credential;

      return await prisma.passkeyCredential.create({
        data: {
          userId,
          credentialId: id,
          publicKey: Buffer.from(publicKey),
          counter: BigInt(counter),
          deviceName: body.deviceName || 'New Device'
        }
      });
    }

    throw new Error('Registration failed');
  }

  static async beginAuthentication(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { passkeys: true }
    });

    if (!user || user.passkeys.length === 0) throw new Error('No passkeys found for this user');

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.passkeys.map(pk => ({
        id: pk.credentialId,
      })),
      userVerification: 'preferred',
    });

    return options;
  }

  static async completeAuthentication(body: any, currentOptions: any) {
    const pk = await prisma.passkeyCredential.findUnique({
      where: { credentialId: body.id },
      include: { user: true }
    });

    if (!pk) throw new Error('Credential not found');

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: currentOptions.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: pk.credentialId,
        publicKey: pk.publicKey,
        counter: Number(pk.counter),
      },
    });

    if (verification.verified) {
      await prisma.passkeyCredential.update({
        where: { id: pk.id },
        data: { counter: BigInt(verification.authenticationInfo.newCounter), lastUsedAt: new Date() }
      });
      return pk.user;
    }

    throw new Error('Authentication failed');
  }
}
