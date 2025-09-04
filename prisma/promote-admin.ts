import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const defaultEmail = 'manikantaboda07@gmail.com';
    const adminEmail = (process.env.ADMIN_EMAIL?.trim() || defaultEmail);

    if (!adminEmail) {
      console.log('Set ADMIN_EMAIL to promote a user to ADMIN');
      process.exit(0);
    }

    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!user) {
      console.error(`❌ User not found for email: ${adminEmail}`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`ℹ️ User ${adminEmail} is already ADMIN`);
      process.exit(0);
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    console.log(`✅ Promoted ${adminEmail} to ADMIN`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to promote admin:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ESM-safe main check
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
