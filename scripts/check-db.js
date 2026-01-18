
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  console.log('Testing Prisma Connection with Accelerate URL...');
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL starts with:', url ? url.split(':')[0] : 'Undefined');

  if (!url) {
      console.error('DATABASE_URL is missing!');
      process.exit(1);
  }

  const prisma = new PrismaClient({ 
      accelerateUrl: url,
      log: ['query', 'error', 'warn'] 
  });

  try {
    const user = await prisma.user.findFirst();
    console.log('Prisma connection and query successful. Found user:', user ? 'Yes' : 'No');
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
