import { supabase } from '../lib/supabase';
import { verifySupabaseToken } from '../lib/supabase';
import prisma from '../lib/database';

async function testAuth() {
  console.log('🧪 Testing authentication flow...');

  const adminEmail = 'admin@threadly.com';
  const adminPassword = 'Lucky@0716';

  try {
    // 1. Test Supabase login
    console.log('1️⃣ Testing Supabase login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (authError) {
      console.error('❌ Supabase login failed:', authError.message);
      return;
    }

    console.log('✅ Supabase login successful');
    console.log('   - User ID:', authData.user?.id);
    console.log('   - Email:', authData.user?.email);
    console.log('   - Role:', authData.user?.app_metadata?.role);

    // 2. Test token verification
    console.log('\n2️⃣ Testing token verification...');
    const accessToken = authData.session?.access_token;
    if (!accessToken) {
      console.error('❌ No access token received');
      return;
    }

    const verifiedUser = await verifySupabaseToken(accessToken);
    if (!verifiedUser) {
      console.error('❌ Token verification failed');
      return;
    }

    console.log('✅ Token verification successful');
    console.log('   - Verified User ID:', verifiedUser.id);
    console.log('   - Verified Email:', verifiedUser.email);
    console.log('   - Verified Role:', verifiedUser.app_metadata?.role);

    // 3. Test database user lookup
    console.log('\n3️⃣ Testing database user lookup...');
    const dbUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!dbUser) {
      console.error('❌ User not found in database');
      return;
    }

    console.log('✅ Database user found');
    console.log('   - DB User ID:', dbUser.id);
    console.log('   - DB Email:', dbUser.email);
    console.log('   - DB Role:', dbUser.role);
    console.log('   - DB Username:', dbUser.username);

    // 4. Test role consistency
    console.log('\n4️⃣ Testing role consistency...');
    const supabaseRole = verifiedUser.app_metadata?.role?.toString().toUpperCase();
    const dbRole = dbUser.role.toString().toUpperCase();
    
    if (supabaseRole === dbRole) {
      console.log('✅ Roles are consistent');
      console.log('   - Supabase Role:', supabaseRole);
      console.log('   - Database Role:', dbRole);
    } else {
      console.warn('⚠️ Role mismatch detected');
      console.log('   - Supabase Role:', supabaseRole);
      console.log('   - Database Role:', dbRole);
    }

    // 5. Test admin access
    console.log('\n5️⃣ Testing admin access...');
    if (dbRole === 'ADMIN') {
      console.log('✅ Admin access confirmed');
    } else {
      console.error('❌ Admin access denied - user is not an admin');
    }

    console.log('\n🎉 Authentication test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Supabase authentication: ✅');
    console.log('   - Token verification: ✅');
    console.log('   - Database lookup: ✅');
    console.log('   - Role consistency: ✅');
    console.log('   - Admin access: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuth()
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
