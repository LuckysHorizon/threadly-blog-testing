// Verification script to check if changes are present
console.log('🔍 Verifying Blog AI Changes...');

// Check if we're on the right page
if (window.location.hostname === 'localhost' && window.location.port === '8080') {
  console.log('✅ Correct server: localhost:8080');
} else {
  console.log('❌ Wrong server:', window.location.href);
}

// Check for admin greeting
const adminGreeting = document.querySelector('h2');
if (adminGreeting && adminGreeting.textContent.includes('Welcome Admin')) {
  console.log('✅ Admin greeting found');
} else {
  console.log('❌ Admin greeting not found - you may not be logged in as admin');
}

// Check for dashboard button
const dashboardButton = document.querySelector('a[href="/admin"]');
if (dashboardButton) {
  console.log('✅ Dashboard button found');
} else {
  console.log('❌ Dashboard button not found - you may not be logged in as admin');
}

// Check for debug text (should NOT be present)
const debugText = document.querySelector('*');
let hasDebugText = false;
if (debugText) {
  const allText = document.body.innerText;
  if (allText.includes('roleMeta:') || allText.includes('email: admin@threadly.com')) {
    hasDebugText = true;
  }
}

if (hasDebugText) {
  console.log('❌ Debug text still present');
} else {
  console.log('✅ Debug text removed');
}

// Check authentication status
console.log('🔐 Authentication check:');
console.log('- Check if you see a user avatar/name in the top right');
console.log('- If not, you need to log in as admin@threadly.com');
console.log('- If yes, check if the user role shows as "admin"');

console.log('📋 Summary:');
console.log('1. Make sure you are logged in as admin@threadly.com');
console.log('2. Hard refresh the page (Ctrl+F5)');
console.log('3. Check browser console for errors');
console.log('4. Try incognito/private mode');
