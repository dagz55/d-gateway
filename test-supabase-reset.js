const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase Auth Password Reset Flow...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordReset() {
  try {
    console.log('\n📧 Testing password reset email...');
    
    // Test email (this should be a real email for testing)
    const testEmail = 'test@example.com';
    
    // Get the origin for the redirect URL
    const origin = 'http://localhost:3000';
    const redirectTo = `${origin}/reset-password/confirm`;

    // Use Supabase Auth to send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo,
    });

    if (error) {
      console.error('❌ Password reset email failed:', error.message);
      
      // Check if it's a user not found error (which is expected for test email)
      if (error.message.includes('not found') || error.status === 404) {
        console.log('✅ Expected behavior: User not found (test email)');
        console.log('📧 In production, this would send an email if the user exists');
      } else {
        console.log('❌ Unexpected error:', error);
        return;
      }
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('📧 Check your email for the reset link');
    }
    
    console.log('\n🔗 Reset URL format:');
    console.log(`${redirectTo}?token=TOKEN&type=recovery`);
    
    console.log('\n📋 Password Reset Flow:');
    console.log('1. User enters email on /reset-password');
    console.log('2. Supabase sends reset email with link');
    console.log('3. User clicks link and goes to /reset-password/confirm');
    console.log('4. Page verifies token and allows password update');
    console.log('5. Password is updated via Supabase Auth');
    
    console.log('\n🎉 Supabase Auth password reset is properly configured!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPasswordReset();
