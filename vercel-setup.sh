#!/bin/bash

######################################
# Vercel Environment Setup Script
# Run this script to configure environment variables in Vercel
######################################

echo "🚀 Setting up Vercel environment variables for Zignals production..."

# Basic site configuration
echo "📍 Setting up basic site configuration..."
vercel env add NEXT_PUBLIC_SITE_URL
echo "Enter your site URL (e.g., https://zignals.org):"

vercel env add NEXT_PUBLIC_BASE_URL
echo "Enter your base URL (same as site URL):"

vercel env add NEXTAUTH_URL
echo "Enter your NextAuth URL (same as site URL):"

# NextAuth Secret
echo "🔐 Setting up NextAuth secret..."
vercel env add NEXTAUTH_SECRET
echo "Enter your NextAuth secret (generate with: openssl rand -hex 32):"

# Admin configuration
echo "👑 Setting up admin configuration..."
vercel env add ALLOWED_ADMIN_EMAILS
echo "Enter admin emails (comma-separated):"

# Authentication configuration
echo "🔐 Setting up authentication..."
echo "Add your authentication provider environment variables manually:"
echo "  - Use 'vercel env add YOUR_AUTH_KEY' for each authentication variable"
echo "  - Refer to your authentication provider's documentation"
echo "  - Update the env.production.example file with your specific auth variables"

# Supabase configuration
echo "🗄 Setting up Supabase database..."
vercel env add NEXT_PUBLIC_SUPABASE_URL
echo "Enter your Supabase project URL:"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo "Enter your Supabase anon key:"

vercel env add SUPABASE_SERVICE_ROLE_KEY
echo "Enter your Supabase service role key:"

# Redis configuration
echo "🗄 Setting up Redis (Upstash)..."
vercel env add REDIS_HOST
echo "Enter your Redis host (with port):"

vercel env add REDIS_PASSWORD
echo "Enter your Redis password:"

# Rate limiting
echo "🚦 Setting up rate limiting..."
vercel env add RATE_LIMITING_ENABLED
echo "Enable rate limiting? (true/false):"

vercel env add RATE_LIMIT_STORAGE
echo "Enter rate limit storage type (redis):"

# Optional: GeoIP service
echo "🌐 Setting up GeoIP service (optional)..."
vercel env add GEOIP_SERVICE_URL
echo "Enter your GeoIP service URL (or press Enter to skip):"

vercel env add GEOIP_API_KEY
echo "Enter your GeoIP API key (or press Enter to skip):"

# Security logging
echo "📊 Setting up security logging..."
vercel env add SECURITY_LOGGING_ENABLED
echo "Enable security logging? (true/false):"

vercel env add SECURITY_LOG_LEVEL
echo "Enter security log level (info/debug/warn/error):"

echo "✅ Vercel environment setup complete!"
echo "🔒 Remember to:"
echo "   1. Never commit actual secrets to version control"
echo "   2. Rotate any compromised keys immediately"
echo "   3. Use strong, unique secrets for production"
echo "   4. Test your deployment after setup"
