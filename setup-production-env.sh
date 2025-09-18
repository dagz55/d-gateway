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
echo "1. WorkOS Production API Key (starts with sk_live_)"
echo "2. WorkOS Production Client ID (starts with client_)"
echo "3. Your production domain (e.g., https://zignal.vercel.app)"
echo "4. Supabase production credentials"
echo "5. Admin email addresses"
echo ""

read -p "Press Enter to continue when ready..."

# WorkOS Configuration
echo -e "\n${BLUE}🔐 WorkOS Configuration${NC}"
prompt_for_env "WORKOS_API_KEY" "WorkOS Production API Key" "sk_live_..." true
prompt_for_env "WORKOS_CLIENT_ID" "WorkOS Production Client ID" "client_..." true

# Generate or prompt for secrets
echo -e "\n${BLUE}🔑 Security Secrets${NC}"
echo "Generating secure random secrets..."

# Generate WORKOS_COOKIE_PASSWORD (exactly 32 characters)
COOKIE_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
echo "Generated WORKOS_COOKIE_PASSWORD: $COOKIE_PASSWORD"
vercel env add "WORKOS_COOKIE_PASSWORD" production <<< "$COOKIE_PASSWORD"
echo -e "${GREEN}✅ WORKOS_COOKIE_PASSWORD set${NC}"

# Generate JWT_SECRET (64 characters)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated JWT_SECRET: [hidden for security]"
vercel env add "JWT_SECRET" production <<< "$JWT_SECRET"
echo -e "${GREEN}✅ JWT_SECRET set${NC}"

# Site Configuration
echo -e "\n${BLUE}🌐 Site Configuration${NC}"
prompt_for_env "NEXT_PUBLIC_SITE_URL" "Your production domain" "https://zignal.vercel.app" false

# Auto-generate redirect URIs based on site URL
if [ ! -z "$value" ]; then
    SITE_URL="$value"
    REDIRECT_URI="${SITE_URL}/api/auth/workos/callback"
    LOGOUT_REDIRECT_URI="${SITE_URL}/"
    
    vercel env add "WORKOS_REDIRECT_URI" production <<< "$REDIRECT_URI"
    vercel env add "WORKOS_LOGOUT_REDIRECT_URI" production <<< "$LOGOUT_REDIRECT_URI"
    
    echo -e "${GREEN}✅ Auto-generated redirect URIs:${NC}"
    echo "   WORKOS_REDIRECT_URI: $REDIRECT_URI"
    echo "   WORKOS_LOGOUT_REDIRECT_URI: $LOGOUT_REDIRECT_URI"
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

# Optional: Advanced WorkOS Configuration
echo -e "\n${YELLOW}🔧 Optional: Advanced WorkOS Configuration${NC}"
read -p "Do you want to configure advanced WorkOS settings? (y/n): " configure_advanced

if [[ $configure_advanced =~ ^[Yy]$ ]]; then
    prompt_for_env "WORKOS_AUTHKIT_DOMAIN" "Custom AuthKit domain" "your-domain.authkit.app" true
    prompt_for_env "WORKOS_EMAIL_DOMAIN" "Custom email domain" "your-domain.com" true
fi

echo -e "\n${GREEN}🎉 Environment setup complete!${NC}"
echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Verify all variables are set: vercel env ls"
echo "2. Deploy to production: vercel --prod"
echo "3. Update WorkOS redirect URIs in dashboard"
echo "4. Test the production deployment"

echo -e "\n${YELLOW}⚠️  Important Reminders:${NC}"
echo "• Update WorkOS dashboard with production redirect URIs"
echo "• Ensure Supabase storage bucket 'public_image' exists"
echo "• Test all functionality after deployment"
echo "• Monitor logs for any issues"

echo -e "\n${GREEN}✅ Ready for production deployment!${NC}"
