#!/usr/bin/env node

/**
 * Production User Sync Script
 *
 * This script ensures all Clerk users are properly synced to Supabase user_profiles
 * Designed to maintain 13 users in both Clerk and Supabase for production
 */

const { createClerkClient } = require('@clerk/backend');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Environment variables
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function syncProductionUsers() {
  console.log('🚀 Starting Production User Sync...\n');

  // Validate environment variables
  if (!clerkSecretKey) {
    console.error('❌ CLERK_SECRET_KEY not found');
    process.exit(1);
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase configuration incomplete');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('   - SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
  }

  try {
    // Initialize clients
    const clerk = createClerkClient({ secretKey: clerkSecretKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('🔍 Step 1: Fetching users from Clerk...');

    // Get all users from Clerk
    const clerkResponse = await clerk.users.getUserList({
      limit: 500,
      orderBy: '-created_at'
    });

    const clerkUsers = clerkResponse.data;
    console.log(`✅ Found ${clerkUsers.length} users in Clerk`);

    if (clerkUsers.length === 0) {
      console.log('⚠️  No users found in Clerk. Check your API key and environment.');
      return;
    }

    console.log('\n🔍 Step 2: Checking Supabase user_profiles...');

    // Get existing profiles from Supabase
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('clerk_user_id, email, full_name, id');

    if (profilesError) {
      console.error('❌ Error fetching existing profiles:', profilesError);
      throw profilesError;
    }

    console.log(`✅ Found ${existingProfiles?.length || 0} profiles in Supabase`);

    // Create lookup map for existing profiles
    const existingProfilesMap = new Map();
    (existingProfiles || []).forEach(profile => {
      if (profile.clerk_user_id) {
        existingProfilesMap.set(profile.clerk_user_id, profile);
      }
    });

    console.log('\n🔄 Step 3: Syncing users...');

    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const clerkUser of clerkUsers) {
      try {
        const clerkUserId = clerkUser.id;
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const firstName = clerkUser.firstName || '';
        const lastName = clerkUser.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        const isAdmin = clerkUser.publicMetadata?.role === 'admin';

        console.log(`   Processing: ${email} (${clerkUserId})`);

        const profileData = {
          clerk_user_id: clerkUserId,
          email: email,
          username: email.split('@')[0],
          full_name: fullName,
          avatar_url: clerkUser.imageUrl || null,
          is_admin: isAdmin,
          role: isAdmin ? 'admin' : 'member',
          created_at: new Date(clerkUser.createdAt).toISOString(),
          updated_at: new Date().toISOString(),
          // Default values for required fields
          age: 25,
          gender: 'not_specified',
          trader_level: 'beginner',
          account_balance: 0,
          is_verified: true,
          package: 'free',
          status: 'active',
          timezone: 'UTC',
          language: 'en',
          phone: null,
          country: null,
          bio: null,
          social_links: {},
          trading_preferences: {}
        };

        if (existingProfilesMap.has(clerkUserId)) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              email: profileData.email,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
              is_admin: profileData.is_admin,
              role: profileData.role,
              updated_at: profileData.updated_at
            })
            .eq('clerk_user_id', clerkUserId);

          if (updateError) {
            console.error(`   ❌ Error updating ${email}:`, updateError.message);
            errors.push({ user: email, action: 'update', error: updateError.message });
          } else {
            console.log(`   ✅ Updated: ${email}`);
            updatedCount++;
          }
        } else {
          // Create new profile
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert(profileData);

          if (insertError) {
            console.error(`   ❌ Error creating ${email}:`, insertError.message);
            errors.push({ user: email, action: 'create', error: insertError.message });
          } else {
            console.log(`   ✅ Created: ${email}`);
            createdCount++;
          }
        }

        syncedCount++;
      } catch (userError) {
        console.error(`   ❌ Error processing user ${clerkUser.id}:`, userError.message);
        errors.push({ user: clerkUser.id, action: 'process', error: userError.message });
      }
    }

    console.log('\n📊 Step 4: Final verification...');

    // Final count verification
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('clerk_user_id, email, is_admin')
      .not('clerk_user_id', 'is', null);

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      const finalCount = finalProfiles?.length || 0;
      const adminCount = finalProfiles?.filter(p => p.is_admin).length || 0;
      const memberCount = finalCount - adminCount;

      console.log('\n🎯 SYNC RESULTS:');
      console.log('='.repeat(50));
      console.log(`Clerk Users:          ${clerkUsers.length}`);
      console.log(`Supabase Profiles:    ${finalCount}`);
      console.log(`Profiles Created:     ${createdCount}`);
      console.log(`Profiles Updated:     ${updatedCount}`);
      console.log(`Admin Users:          ${adminCount}`);
      console.log(`Member Users:         ${memberCount}`);
      console.log(`Errors:               ${errors.length}`);

      if (finalCount === 13 && clerkUsers.length === 13) {
        console.log('\n✅ SUCCESS: 13 users synchronized between Clerk and Supabase!');
      } else {
        console.log('\n⚠️  WARNING: User count mismatch detected');
        console.log(`Expected: 13 users in both systems`);
        console.log(`Actual: Clerk(${clerkUsers.length}) | Supabase(${finalCount})`);
      }

      if (errors.length > 0) {
        console.log('\n❌ ERRORS ENCOUNTERED:');
        errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.user} (${error.action}): ${error.error}`);
        });
      }
    }

    console.log('\n✅ Production user sync completed!');

  } catch (error) {
    console.error('❌ Fatal error during sync:', error.message);
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  syncProductionUsers().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { syncProductionUsers };