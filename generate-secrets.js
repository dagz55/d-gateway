#!/usr/bin/env node

/**
 * Generate Random Secrets for Environment Variables
 * Generates cryptographically secure random secrets for JWT
 */

const crypto = require('crypto');

console.log('🔐 Generating Random Secrets for Environment Variables\n');

// Generate secrets with correct lengths
const jwtSecret = crypto.randomBytes(32).toString('hex'); // 64 characters for JWT (32+ required)

console.log('📋 Copy these to your .env.local file:\n');
console.log(`JWT_SECRET=${jwtSecret}`);

console.log('\n✅ JWT_SECRET: 64 characters (32+ required) ✓');
console.log('🔒 This is a cryptographically secure random secret.');
console.log('⚠️  Keep this secret secure and never commit it to version control.');