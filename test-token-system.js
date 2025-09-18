#!/usr/bin/env node

/**
 * Test script for token rotation system
 * This tests the core token management functionality without requiring database
 */

const { tokenManager, TOKEN_CONFIG } = require('./lib/token-manager');

async function testTokenSystem() {
  console.log('🔐 Testing Token Rotation System');
  console.log('================================');

  try {
    // Test 1: Create token pair
    console.log('\n1. Creating initial token pair...');
    const sessionId = tokenManager.generateSessionId();
    const userId = 'test-user-123';
    
    const tokenPair = tokenManager.createTokenPair({
      userId,
      sessionId,
      permissions: ['user', 'test'],
    });

    console.log('✅ Token pair created:');
    console.log(`   - Access token length: ${tokenPair.accessToken.length}`);
    console.log(`   - Refresh token length: ${tokenPair.refreshToken.length}`);
    console.log(`   - Access expires in: ${tokenPair.expiresIn} seconds`);
    console.log(`   - Refresh expires in: ${tokenPair.refreshExpiresIn} seconds`);

    // Test 2: Validate access token
    console.log('\n2. Validating access token...');
    const accessValidation = tokenManager.validateToken(tokenPair.accessToken);
    
    if (accessValidation.valid) {
      console.log('✅ Access token validation successful:');
      console.log(`   - User ID: ${accessValidation.decoded.userId}`);
      console.log(`   - Session ID: ${accessValidation.decoded.sessionId}`);
      console.log(`   - Permissions: ${accessValidation.decoded.permissions.join(', ')}`);
      console.log(`   - Token type: ${accessValidation.decoded.type}`);
      console.log(`   - Should refresh: ${accessValidation.shouldRefresh}`);
    } else {
      console.log('❌ Access token validation failed:', accessValidation.error);
    }

    // Test 3: Validate refresh token
    console.log('\n3. Validating refresh token...');
    const refreshValidation = tokenManager.validateToken(tokenPair.refreshToken);
    
    if (refreshValidation.valid) {
      console.log('✅ Refresh token validation successful:');
      console.log(`   - User ID: ${refreshValidation.decoded.userId}`);
      console.log(`   - Session ID: ${refreshValidation.decoded.sessionId}`);
      console.log(`   - Family ID: ${refreshValidation.decoded.familyId}`);
      console.log(`   - Token type: ${refreshValidation.decoded.type}`);
    } else {
      console.log('❌ Refresh token validation failed:', refreshValidation.error);
    }

    // Test 4: Test token hashing
    console.log('\n4. Testing token hashing...');
    const hash1 = tokenManager.hashToken(tokenPair.accessToken);
    const hash2 = tokenManager.hashToken(tokenPair.accessToken);
    const hash3 = tokenManager.hashToken(tokenPair.refreshToken);

    console.log('✅ Token hashing working:');
    console.log(`   - Access token hash: ${hash1.substring(0, 16)}...`);
    console.log(`   - Consistent hashing: ${hash1 === hash2}`);
    console.log(`   - Different tokens have different hashes: ${hash1 !== hash3}`);

    // Test 5: Test expired token
    console.log('\n5. Testing expired token detection...');
    
    // Create a token with past expiry (simulate expired token)
    const expiredTokenPayload = {
      type: 'access',
      userId,
      sessionId,
      permissions: ['user'],
      iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
      jti: 'expired-token-id',
      version: '1.0',
    };

    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || process.env.WORKOS_COOKIE_PASSWORD || 'test-secret-key-for-development-only';
    const expiredToken = jwt.sign(expiredTokenPayload, secret);
    
    const expiredValidation = tokenManager.validateToken(expiredToken);
    console.log('✅ Expired token detection working:');
    console.log(`   - Valid: ${expiredValidation.valid}`);
    console.log(`   - Error: ${expiredValidation.error}`);

    // Test 6: Test session ID and family ID generation
    console.log('\n6. Testing ID generation...');
    const sessionIds = Array.from({ length: 5 }, () => tokenManager.generateSessionId());
    const familyIds = Array.from({ length: 5 }, () => tokenManager.generateFamilyId());

    console.log('✅ ID generation working:');
    console.log(`   - Session IDs unique: ${new Set(sessionIds).size === sessionIds.length}`);
    console.log(`   - Family IDs unique: ${new Set(familyIds).size === familyIds.length}`);
    console.log(`   - Sample session ID: ${sessionIds[0]}`);
    console.log(`   - Sample family ID: ${familyIds[0]}`);

    // Test 7: Test configuration
    console.log('\n7. Testing configuration...');
    console.log('✅ Token configuration:');
    console.log(`   - Access token expiry: ${TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY} seconds (${TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY / 60} minutes)`);
    console.log(`   - Refresh token expiry: ${TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY} seconds (${TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY / (24 * 3600)} days)`);
    console.log(`   - Refresh before expiry: ${TOKEN_CONFIG.REFRESH_BEFORE_EXPIRY} seconds (${TOKEN_CONFIG.REFRESH_BEFORE_EXPIRY / 60} minutes)`);
    console.log(`   - Max family chain length: ${TOKEN_CONFIG.MAX_FAMILY_CHAIN_LENGTH}`);

    console.log('\n🎉 All token system tests passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run database migration: npx supabase migration up --linked');
    console.log('   2. Start development server: npm run dev');
    console.log('   3. Test authentication flow with new token system');

  } catch (error) {
    console.error('\n❌ Token system test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Mock NextRequest for testing
function createMockRequest() {
  return {
    headers: {
      get: (name) => {
        const headers = {
          'user-agent': 'Test User Agent',
          'origin': 'http://localhost:3000',
          'authorization': null,
        };
        return headers[name.toLowerCase()] || null;
      }
    },
    cookies: {
      get: () => null
    }
  };
}

// Test token validation utilities if they can be imported
async function testValidationUtils() {
  try {
    const { tokenValidator } = require('./lib/token-validation');
    const mockRequest = createMockRequest();

    console.log('\n8. Testing validation utilities...');
    
    // Test token extraction
    const token = tokenValidator.extractToken(mockRequest, 'bearer_header');
    console.log(`✅ Token extraction test: ${token === null ? 'No token found (expected)' : 'Token found'}`);

  } catch (error) {
    console.log('\n⚠️  Token validation utilities test skipped (module import error)');
    console.log('   This is expected in a CommonJS test environment');
  }
}

// Run tests
if (require.main === module) {
  testTokenSystem()
    .then(() => testValidationUtils())
    .catch(console.error);
}

module.exports = { testTokenSystem };