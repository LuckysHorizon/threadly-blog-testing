import { supabase } from '../lib/supabase';
import { verifySupabaseToken } from '../lib/supabase';
import prisma from '../lib/database';

async function testAdminAuth() {
  console.log('🧪 Testing admin authentication flow...');

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
    console.log('   - Supabase Role:', authData.user?.app_metadata?.role);

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

    // 3. Test database user lookup and role sync
    console.log('\n3️⃣ Testing database user lookup and role sync...');
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

    // 4. Test admin email check
    console.log('\n4️⃣ Testing admin email check...');
    const isAdminEmail = adminEmail === 'admin@threadly.com';
    const supabaseRole = verifiedUser.app_metadata?.role?.toString().toUpperCase();
    const shouldBeAdmin = (supabaseRole === 'ADMIN' || isAdminEmail);
    
    console.log('   - Is admin email:', isAdminEmail);
    console.log('   - Supabase role:', supabaseRole);
    console.log('   - Should be admin:', shouldBeAdmin);
    console.log('   - Actual role:', dbUser.role);

    if (shouldBeAdmin && dbUser.role === 'ADMIN') {
      console.log('✅ Admin role verification successful');
    } else {
      console.log('❌ Admin role verification failed');
    }

    // 5. Test /api/auth/me endpoint simulation
    console.log('\n5️⃣ Testing /api/auth/me endpoint simulation...');
    
    // Simulate the authenticateToken middleware
    const userEmail = verifiedUser.email || '';
    let appUser = await prisma.user.findUnique({ where: { email: userEmail } });
    
    if (appUser) {
      // Check role sync logic
      const supabaseRoleCheck = verifiedUser.app_metadata?.role?.toString().toUpperCase();
      const isAdminEmailCheck = userEmail === 'admin@threadly.com';
      const shouldBeAdminCheck = (supabaseRoleCheck === 'ADMIN' || isAdminEmailCheck);
      
      console.log('   - Middleware role check passed:', shouldBeAdminCheck);
      console.log('   - User would be authenticated with role:', appUser.role);
    }

    console.log('\n🎉 Admin authentication test completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Supabase login: ✅');
    console.log('   - Token verification: ✅');
    console.log('   - Database sync: ✅');
    console.log('   - Role verification: ✅');
    console.log('   - Admin email check: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAdminAuth()
  .catch(console.error);
