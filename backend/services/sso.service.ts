import * as saml from 'samlify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SSOService {

  static async getServiceProvider() {
    return saml.ServiceProvider({
      entityID: 'https://qrmate.com/metadata',
      authnRequestsSigned: false,
      wantAssertionsSigned: true,
      wantMessageSigned: true,
      wantLogoutResponseSigned: true,
      wantLogoutRequestSigned: true,
      privateKey: process.env.SAML_PRIVATE_KEY,
      isAssertionEncrypted: false,
      assertionConsumerService: [{
        Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        Location: 'http://localhost:8080/auth/sso/callback',
      }]
    });
  }

  static async getIdPFromDomain(domain: string) {
    const config = await prisma.sSOConfig.findUnique({
      where: { domain }
    });
    if (!config || !config.enabled) return null;

    return saml.IdentityProvider({
      metadata: config.idpMetadata
    });
  }
}
