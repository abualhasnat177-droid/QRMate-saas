
const fetch = require('node-fetch');

async function testMagicLinkFlow() {
  const email = `test-user-${Date.now()}@example.com`;
  console.log(`🚀 Starting Magic Link test for: ${email}`);

  // 1. Request Magic Link
  console.log('--- Step 1: Requesting Magic Link ---');
  const requestRes = await fetch('http://localhost:8080/auth/magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const requestData = await requestRes.json();
  console.log('Request Response:', requestData);

  if (!requestData.success) {
    console.error('❌ Failed to request magic link');
    return;
  }

  // Since I can't check real email, I'll check the terminal output simulation or the DB
  // But wait, I can just find the token in the database using Prisma to simulate the "click"
}

// testMagicLinkFlow();
console.log('To test, I will inspect the database for the generated token and simulate the verification redirect.');
