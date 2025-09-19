#!/bin/bash

# Apply RLS Policy Fixes
# This script applies the RLS policy fixes to resolve security issues

echo "🔒 Applying RLS Policy Fixes for ZIGNAL Database..."
echo "=================================================="

# Check if migration file exists
if [ ! -f "supabase/migrations/20250919190000_fix_missing_rls_policies.sql" ]; then
    echo "❌ Migration file not found!"
    echo "Please ensure you're in the project root directory."
    exit 1
fi

# Check if we have Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "📋 Migration file: supabase/migrations/20250919190000_fix_missing_rls_policies.sql"
echo ""

# Option 1: Apply via Supabase CLI (recommended)
echo "🚀 Option 1: Apply via Supabase CLI"
echo "Run: npx supabase db push --linked"
echo ""

# Option 2: Apply manually via psql
echo "🔧 Option 2: Apply manually via psql"
echo "If you have direct database access:"
echo "psql 'postgresql://postgres:[password]@[host]:[port]/postgres' -f supabase/migrations/20250919190000_fix_missing_rls_policies.sql"
echo ""

# Option 3: Apply via Supabase dashboard
echo "🌐 Option 3: Apply via Supabase Dashboard"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of the migration file"
echo "4. Execute the SQL"
echo ""

# Ask user which option they want
read -p "Which option would you like to use? (1/2/3 or 'test' to run RLS tests): " choice

case $choice in
    1)
        echo "🚀 Applying migration via Supabase CLI..."
        npx supabase db push --linked
        if [ $? -eq 0 ]; then
            echo "✅ Migration applied successfully!"
        else
            echo "❌ Migration failed. Check the output above for details."
        fi
        ;;
    2)
        echo "📋 Manual application selected."
        echo "Please run the psql command shown above with your database credentials."
        ;;
    3)
        echo "🌐 Dashboard application selected."
        echo "Please follow the steps shown above to apply via the Supabase dashboard."
        ;;
    test)
        echo "🧪 Running RLS policy tests..."
        if [ -f "test-rls-policies.js" ]; then
            node test-rls-policies.js
        else
            echo "❌ Test file not found!"
        fi
        ;;
    *)
        echo "❓ Invalid option. Please run the script again and choose 1, 2, 3, or 'test'."
        ;;
esac

echo ""
echo "📚 For more information about RLS policies, see:"
echo "https://supabase.com/docs/guides/database/postgres/row-level-security"