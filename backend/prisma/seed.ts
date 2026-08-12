import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { name: 'Admin User', email: 'admin@company.com', role: 'ADMIN' },
    { name: 'Sales User', email: 'sales@company.com', role: 'SALES' },
    { name: 'Warehouse User', email: 'warehouse@company.com', role: 'WAREHOUSE' },
    { name: 'Accounts User', email: 'accounts@company.com', role: 'ACCOUNTS' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  console.log('✅ Seed completed! Test users created with password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });