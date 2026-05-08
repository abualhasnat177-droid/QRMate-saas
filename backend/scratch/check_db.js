
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTokens() {
  try {
    const tokens = await prisma.magicLinkToken.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    console.log('Latest Token in DB:', JSON.stringify(tokens, null, 2));
  } catch (err) {
    console.error('Prisma check failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();
