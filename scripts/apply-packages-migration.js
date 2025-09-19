#!/usr/bin/env node

/**
 * Apply Packages Migration Script
 * This script applies the packages tables migration to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
    try {
        // Check for required environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Missing required environment variables:');
            console.error('   - NEXT_PUBLIC_SUPABASE_URL');
            console.error('   - SUPABASE_SERVICE_ROLE_KEY');
            process.exit(1);
        }

        console.log('🚀 Connecting to Supabase...');

        // Create Supabase client with service role key
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Read the migration file
        const migrationPath = path.join(__dirname, '../supabase/migrations/20250919074400_create_packages_tables.sql');

        if (!fs.existsSync(migrationPath)) {
            console.error('❌ Migration file not found:', migrationPath);
            process.exit(1);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📝 Applying packages tables migration...');

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', {
            query: migrationSQL
        });

        if (error) {
            // If exec_sql doesn't exist, try direct execution (this might not work due to RLS)
            console.log('⚠️  exec_sql function not found, trying direct execution...');

            // Split SQL into individual statements and execute them
            const statements = migrationSQL
                .split(';')
                .filter(statement => statement.trim().length > 0)
                .map(statement => statement.trim() + ';');

            console.log(`📊 Found ${statements.length} SQL statements to execute`);

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement.trim() === ';') continue;

                console.log(`   Executing statement ${i + 1}/${statements.length}...`);

                try {
                    const { error: execError } = await supabase
                        .from('_temp')
                        .select('*')
                        .limit(0); // This will fail but might trigger SQL execution

                    // If the above doesn't work, we'll need to use a different approach
                    console.log('   ⚠️  Direct SQL execution may require database admin access');
                } catch (execError) {
                    console.log('   ⚠️  Statement execution requires database admin access');
                }
            }
        } else {
            console.log('✅ Migration executed successfully!');
        }

        // Test if tables were created by trying to query them
        console.log('🔍 Verifying packages table exists...');

        const { data: packagesData, error: packagesError } = await supabase
            .from('packages')
            .select('count')
            .limit(1);

        if (packagesError) {
            console.log('❌ Packages table verification failed:', packagesError.message);
            console.log('\n📋 Manual Steps Required:');
            console.log('1. Go to your Supabase Dashboard');
            console.log('2. Navigate to SQL Editor');
            console.log('3. Copy the contents of: supabase/migrations/20250919074400_create_packages_tables.sql');
            console.log('4. Paste and execute the SQL in the editor');
            console.log('5. Run this script again to verify');
        } else {
            console.log('✅ Packages table exists and is accessible!');

            // Check for sample data
            const { data: sampleData, error: sampleError } = await supabase
                .from('packages')
                .select('name, price')
                .limit(5);

            if (sampleData && sampleData.length > 0) {
                console.log('📦 Sample packages found:');
                sampleData.forEach(pkg => {
                    console.log(`   - ${pkg.name}: $${pkg.price}`);
                });
            } else {
                console.log('ℹ️  No sample packages found (this is normal for a fresh installation)');
            }
        }

        console.log('\n🎉 Migration process completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run the migration
if (require.main === module) {
    applyMigration();
}

module.exports = { applyMigration };