import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding standard users...');
  
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@test.com' },
    update: {},
    create: {
      email: 'analyst@test.com',
      name: 'Analyst User',
      password,
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@test.com' },
    update: {},
    create: {
      email: 'viewer@test.com',
      name: 'Viewer User',
      password,
      role: 'VIEWER',
    },
  });

  console.log({ admin, analyst, viewer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
