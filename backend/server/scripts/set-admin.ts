import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const defaultEmail = 'manikantaboda07@gmail.com';
  const adminEmail = (process.env.ADMIN_EMAIL?.trim() || defaultEmail);
  const adminPassword = process.env.ADMIN_PASSWORD?.toString();

  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
  }

  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD is required');
    process.exit(1);
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Try to locate Prisma user first
    let existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    let userId: string | undefined = existing?.id;

    if (userId) {
      // Update Supabase user by known id
      const { data: update, error: updErr } = await supabase.auth.admin.updateUserById(userId, {
        password: adminPassword,
        email_confirm: true,
      });
      if (updErr) {
        // If not found in Supabase, create anew
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { name: 'Admin', username: 'admin' },
        });
        if (createErr) throw createErr;
        userId = created.user?.id;
        console.log(`✅ Created Supabase user ${adminEmail}`);
      } else {
        userId = update.user?.id;
        console.log(`ℹ️ Updated Supabase user password for ${adminEmail}`);
      }
    } else {
      // No Prisma user — create Supabase user then reflect into Prisma
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'Admin', username: 'admin' },
      });
      if (createErr) throw createErr;
      userId = created.user?.id;
      console.log(`✅ Created Supabase user ${adminEmail}`);
    }

    if (!userId) {
      console.error('❌ Failed to resolve Supabase user id');
      process.exit(1);
    }

    // Ensure Prisma app user exists and set role ADMIN
    existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: userId,
          email: adminEmail,
          name: 'Admin',
          username: 'admin',
          provider: 'EMAIL',
          providerId: userId,
          role: 'ADMIN',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
        },
      });
      console.log(`✅ Created Prisma user and set role ADMIN for ${adminEmail}`);
    } else if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
      console.log(`✅ Promoted Prisma user to ADMIN for ${adminEmail}`);
    } else {
      console.log(`ℹ️ Prisma user already ADMIN for ${adminEmail}`);
    }

    console.log('🎉 Admin setup complete');
    process.exit(0);
  } catch (e) {
    console.error('❌ Admin setup failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}


