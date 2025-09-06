import { PrismaClient } from '@prisma/client';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function setupAdmin() {
  console.log('🔧 Setting up admin user in Supabase and database...');

  const adminEmail = 'admin@threadly.com';
  const adminPassword = 'Lucky@0716';
  const adminName = 'Administrator';
  const adminUsername = 'admin';

  try {
    // 1. Create admin user in Supabase
    console.log('📧 Creating admin user in Supabase...');
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName,
        username: adminUsername,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        bio: 'System Administrator'
      },
      app_metadata: {
        role: 'ADMIN',
        provider: 'email'
      }
    });

    if (supabaseError) {
      console.error('❌ Error creating Supabase user:', supabaseError);
      throw supabaseError;
    }

    console.log('✅ Admin user created in Supabase:', supabaseUser.user?.email);

    // 2. Create corresponding user in our database
    console.log('🗄️ Creating admin user in database...');
    const hashedPassword = await hashPassword(adminPassword);
    
    const dbUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        // Update with Supabase ID if it exists
        id: supabaseUser.user?.id || undefined,
        role: 'ADMIN',
        password: hashedPassword,
        name: adminName,
        username: adminUsername,
        provider: 'EMAIL',
        providerId: supabaseUser.user?.id,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        bio: 'System Administrator'
      },
      create: {
        id: supabaseUser.user?.id || undefined,
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        username: adminUsername,
        role: 'ADMIN',
        provider: 'EMAIL',
        providerId: supabaseUser.user?.id,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        bio: 'System Administrator'
      }
    });

    console.log('✅ Admin user created in database:', dbUser.email);

    // 3. Verify the setup
    console.log('🔍 Verifying admin setup...');
    const { data: { user: verifyUser }, error: verifyError } = await supabase.auth.admin.getUserById(supabaseUser.user?.id || '');
    
    if (verifyError) {
      console.error('❌ Error verifying Supabase user:', verifyError);
    } else {
      console.log('✅ Admin user verified in Supabase');
      console.log('   - Email:', verifyUser?.email);
      console.log('   - Role:', verifyUser?.app_metadata?.role);
      console.log('   - ID:', verifyUser?.id);
    }

    console.log('🎉 Admin setup completed successfully!');
    console.log('📋 Admin credentials:');
    console.log('   - Email:', adminEmail);
    console.log('   - Password:', adminPassword);
    console.log('   - Role: ADMIN');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAdmin()
  .catch((error) => {
    console.error('Failed to setup admin:', error);
    process.exit(1);
  });
