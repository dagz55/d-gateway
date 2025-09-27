/**
 * Script to fix admin role assignment
 * This script calls the make-first-admin endpoint to ensure dagz55@gmail.com has admin role
 */

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://zignals.org'
  : 'http://localhost:3000';

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin role for dagz55@gmail.com...');
    console.log('ℹ️  Note: You must be signed in as dagz55@gmail.com for this to work');
    console.log('');

    // Instructions for manual execution
    console.log('📋 Manual Steps:');
    console.log('1. Open browser and go to:', `${API_BASE}/sign-in`);
    console.log('2. Sign in as dagz55@gmail.com');
    console.log('3. Open browser dev tools (F12)');
    console.log('4. Go to Console tab');
    console.log('5. Paste and run this code:');
    console.log('');
    console.log('------- COPY THIS CODE -------');
    console.log(`
fetch('${API_BASE}/api/admin/make-first-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  console.log('✅ Admin role fix result:', data);
  if (data.success) {
    console.log('🎉 Admin role fixed! Now try visiting ${API_BASE}/admin/dashboard');
    // Redirect to admin dashboard
    window.location.href = '${API_BASE}/admin/dashboard';
  } else {
    console.error('❌ Failed to fix admin role:', data.error);
  }
})
.catch(error => {
  console.error('❌ Error calling admin endpoint:', error);
});
    `);
    console.log('------- END COPY -------');
    console.log('');
    console.log('6. After running the code, you should be redirected to /admin/dashboard');
    console.log('');

  } catch (error) {
    console.error('❌ Error in fix-admin-role script:', error);
  }
}

// If running in Node.js, show instructions
if (typeof window === 'undefined') {
  fixAdminRole();
} else {
  // If running in browser, execute the fix
  console.log('🔧 Executing admin role fix...');
  fixAdminRole();
}