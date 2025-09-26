#!/bin/bash

# Production Environment Setup Script for Zignal
# This script helps set up all required environment variables in Vercel

echo "🚀 Setting up Zignal Production Environment Variables"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt_for_env() {
    local var_name=$1
    local description=$2
    local example=$3
    local is_secret=${4:-true}
    
    echo -e "\n${BLUE}Setting up: ${var_name}${NC}"
    echo -e "${YELLOW}Description: ${description}${NC}"
    if [ ! -z "$example" ]; then
        echo -e "${YELLOW}Example: ${example}${NC}"
    fi
    
    read -p "Enter value: " value
    
    if [ ! -z "$value" ]; then
        if [ "$is_secret" = true ]; then
            echo "Setting secret environment variable..."
            vercel env add "$var_name" production <<< "$value"
        else
            echo "Setting public environment variable..."
            vercel env add "$var_name" production <<< "$value"
        fi
        echo -e "${GREEN}✅ ${var_name} set successfully${NC}"
    else
        echo -e "${RED}❌ Skipped ${var_name}${NC}"
    fi
}

# Check if vercel is installed and logged in
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
    echo "npm i -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Project not linked to Vercel. Running vercel link...${NC}"
    vercel link
fi

echo -e "\n${BLUE}📝 Please have the following information ready:${NC}"
echo "1. Clerk Production Secret Key (starts with sk_live_)"
echo "2. Clerk Production Publishable Key (starts with pk_live_)"
echo "3. Your production domain (e.g., https://zignal.vercel.app)"
echo "4. Supabase production credentials"
echo "5. Admin email addresses"
echo ""

read -p "Press Enter to continue when ready..."

# Clerk Configuration
echo -e "\n${BLUE}🔐 Clerk Configuration${NC}"
prompt_for_env "CLERK_SECRET_KEY" "Clerk Production Secret Key" "sk_live_..." true
prompt_for_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk Production Publishable Key" "pk_live_..." true

# Generate or prompt for secrets
echo -e "\n${BLUE}🔑 Security Secrets${NC}"
echo "Generating secure random secrets..."

# Generate NEXTAUTH_SECRET (for any NextAuth usage)
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
vercel env add "NEXTAUTH_SECRET" production <<< "$NEXTAUTH_SECRET"
echo -e "${GREEN}✅ NEXTAUTH_SECRET set${NC}"

# Generate JWT_SECRET (64 characters)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated JWT_SECRET: [hidden for security]"
vercel env add "JWT_SECRET" production <<< "$JWT_SECRET"
echo -e "${GREEN}✅ JWT_SECRET set${NC}"

# Site Configuration
echo -e "\n${BLUE}🌐 Site Configuration${NC}"
prompt_for_env "NEXT_PUBLIC_SITE_URL" "Your production domain" "https://zignal.vercel.app" false

# Clerk handles redirects automatically
if [ ! -z "$value" ]; then
    SITE_URL="$value"
    echo -e "${GREEN}✅ Clerk redirect URIs configured automatically${NC}"
    echo "   Clerk handles redirects automatically based on your domain: $SITE_URL"
fi

# Supabase Configuration
echo -e "\n${BLUE}🗄️  Supabase Configuration${NC}"
prompt_for_env "NEXT_PUBLIC_SUPABASE_URL" "Supabase Project URL" "https://your-project.supabase.co" false
prompt_for_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase Anon Key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." false
prompt_for_env "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role Key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." true

# Admin Configuration
echo -e "\n${BLUE}👑 Admin Configuration${NC}"
prompt_for_env "ALLOWED_ADMIN_EMAILS" "Admin email addresses (comma-separated)" "dagz55@gmail.com,admin@signals.org" true

# Security Configuration
echo -e "\n${BLUE}🛡️  Security Configuration${NC}"
vercel env add "SECURITY_LOGGING_ENABLED" production <<< "true"
vercel env add "SECURITY_LOG_LEVEL" production <<< "info"
echo -e "${GREEN}✅ Security configuration set${NC}"

# Optional: Advanced Clerk Configuration
echo -e "\n${YELLOW}🔧 Optional: Advanced Clerk Configuration${NC}"
read -p "Do you want to configure advanced Clerk settings? (y/n): " configure_advanced

if [[ $configure_advanced =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Advanced Clerk Settings${NC}"
    prompt_for_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL" "Custom sign-in URL" "/sign-in" false
    prompt_for_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL" "Custom sign-up URL" "/sign-up" false
    prompt_for_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" "After sign-in redirect" "/dashboard" false
    prompt_for_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" "After sign-up redirect" "/dashboard" false
fi

echo -e "\n${GREEN}🎉 Environment setup complete!${NC}"
echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Verify all variables are set: vercel env ls"
echo "2. Deploy to production: vercel --prod"
echo "3. Update Clerk dashboard with production domain"
echo "4. Test the production deployment"

echo -e "\n${YELLOW}⚠️  Important Reminders:${NC}"
echo "• Update Clerk dashboard with production domain"
echo "• Ensure Supabase storage bucket 'public_image' exists"
echo "• Test all functionality after deployment"
echo "• Monitor logs for any issues"

echo -e "\n${GREEN}✅ Ready for production deployment!${NC}"
