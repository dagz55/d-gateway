#!/usr/bin/env node

/**
 * Generate Random Secrets for Environment Variables
 * Generates cryptographically secure random secrets for JWT and WorkOS
 */

const crypto = require('crypto');

console.log('🔐 Generating Random Secrets for Environment Variables\n');

// Generate secrets with correct lengths
const jwtSecret = crypto.randomBytes(32).toString('hex'); // 64 characters for JWT (32+ required)
const cookiePassword = crypto.randomBytes(16).toString('hex'); // 32 characters for WorkOS (exactly 32 required)

console.log('📋 Copy these to your .env.local file:\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`WORKOS_COOKIE_PASSWORD=${cookiePassword}`);

console.log('\n✅ JWT_SECRET: 64 characters (32+ required) ✓');
console.log('✅ WORKOS_COOKIE_PASSWORD: 32 characters (exactly 32 required) ✓');
console.log('🔒 These are cryptographically secure random secrets.');
console.log('⚠️  Keep these secrets secure and never commit them to version control.');
