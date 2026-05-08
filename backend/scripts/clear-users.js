const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Starting database cleanup...');
  
  try {
    // 1. Delete QR codes first (since they reference Users and don't have Cascade in the schema)
    const qrCount = await prisma.qRCode.deleteMany();
    console.log(`✅ Deleted ${qrCount.count} QR codes (and their scans)`);

    // 2. Delete all users
    // ApiKeys, Sessions, and Passkeys have Cascade delete, so they will be removed automatically
    const userCount = await prisma.user.deleteMany();
    console.log(`✅ Deleted ${userCount.count} users`);

    // 3. Clear other auxiliary tables
    await prisma.magicLinkToken.deleteMany();
    await prisma.sSOConfig.deleteMany();
    
    console.log('✨ Database cleanup completed successfully. All user-related data is gone.');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
