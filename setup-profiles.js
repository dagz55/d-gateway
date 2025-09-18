const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupProfiles() {
  console.log('🔧 Setting up Profiles Table and Data...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // First, let's check if a profiles table exists
    console.log('🔍 Checking for profiles table...');
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (!profilesError) {
        console.log('✅ Profiles table exists');
        console.log(`📊 Found ${profiles.length} profile(s)`);
      } else if (profilesError.message.includes('does not exist')) {
        console.log('❌ Profiles table does not exist. Creating...');
        await createProfilesTable(supabase);
      } else {
        console.log('⚠️  Error accessing profiles table:', profilesError.message);
      }
    } catch (err) {
      console.log('❌ Error checking profiles table:', err.message);
    }

    // Get all auth users
    console.log('\n🔐 Getting auth users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log(`❌ Cannot access auth.users: ${usersError.message}`);
      return;
    }

    console.log(`✅ Found ${users.users.length} auth users`);

    // Now check/create profiles for each user
    console.log('\n👤 Processing users...');
    
    for (const user of users.users) {
      console.log(`\n   Processing user: ${user.email}`);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (existingProfile) {
        console.log(`   ✅ Profile exists for ${user.email}`);
        console.log(`      Avatar: ${existingProfile.avatar_url || 'None'}`);
      } else {
        console.log(`   ❌ Creating profile for ${user.email}`);
        
        // Extract data from user metadata
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        
        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (profileError) {
          console.log(`   ❌ Error creating profile: ${profileError.message}`);
        } else {
          console.log(`   ✅ Created profile for ${user.email}`);
          console.log(`      Name: ${newProfile.full_name}`);
          console.log(`      Avatar: ${newProfile.avatar_url || 'None'}`);
        }
      }
    }
    
    // Summary
    console.log('\n📋 Setup Summary:');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*');
      
    console.log(`- Total profiles: ${allProfiles?.length || 0}`);
    console.log(`- Profiles with avatars: ${allProfiles?.filter(p => p.avatar_url)?.length || 0}`);
    
  } catch (error) {
    console.log(`❌ Setup failed: ${error.message}`);
  }
}

async function createProfilesTable(supabase) {
  console.log('🏗️  Creating profiles table...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable Row Level Security
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);

    -- Create updated_at trigger
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.log('❌ Error creating table via RPC:', error.message);
      // This might not work, but we can continue
    } else {
      console.log('✅ Table created successfully');
    }
  } catch (err) {
    console.log('⚠️  Could not create table via RPC, continuing...');
  }
}

setupProfiles();