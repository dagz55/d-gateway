// Clerk Backend API Connection with Comprehensive Error Handling and Validation
// Node.js/JavaScript Implementation

const https = require('https');
const crypto = require('crypto');

class ClerkAPIConnection {
  constructor(config = {}) {
    // Validate required configuration
    this.validateConfig(config);
    
    this.baseURL = config.baseURL || 'https://api.clerk.com';
    this.version = config.version || 'v1';
    this.secretKey = config.secretKey;
    this.publishableKey = config.publishableKey;
    this.jwtKey = config.jwtKey; // Optional for networkless JWT verification
    this.timeout = config.timeout || 30000; // 30 seconds default timeout
    
    // Request rate limiting
    this.rateLimitInfo = {
      requests: 0,
      resetTime: Date.now() + 60000 // Reset every minute
    };
    
    console.log('✅ Clerk API Connection initialized successfully');
  }

  /**
   * Validate configuration parameters
   */
  validateConfig(config) {
    const requiredFields = ['secretKey'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`❌ Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    // Validate secret key format
    if (!config.secretKey.startsWith('sk_')) {
      throw new Error('❌ Invalid secret key format. Secret keys should start with "sk_"');
    }

    // Validate publishable key format if provided
    if (config.publishableKey && !config.publishableKey.startsWith('pk_')) {
      throw new Error('❌ Invalid publishable key format. Publishable keys should start with "pk_"');
    }

    console.log('✅ Configuration validation passed');
  }

  /**
   * Generic method to make API requests with comprehensive error handling
   */
  async makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Rate limiting check
        this.checkRateLimit();

        const url = new URL(`${this.baseURL}/${this.version}${endpoint}`);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: method.toUpperCase(),
          timeout: this.timeout,
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Clerk-API-Client/1.0.0',
            ...headers
          }
        };

        // Add content length for POST/PUT requests
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          const jsonData = JSON.stringify(data);
          options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = https.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            try {
              // Update rate limit info from headers
              this.updateRateLimitInfo(res.headers);

              const parsedResponse = responseData ? JSON.parse(responseData) : {};
              
              if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`✅ ${method.toUpperCase()} ${endpoint} - Success (${res.statusCode})`);
                resolve({
                  success: true,
                  status: res.statusCode,
                  data: parsedResponse,
                  headers: res.headers
                });
              } else {
                console.error(`❌ ${method.toUpperCase()} ${endpoint} - Error (${res.statusCode})`);
                reject(new Error(`API Error: ${res.statusCode} - ${parsedResponse.message || responseData}`));
              }
            } catch (parseError) {
              reject(new Error(`❌ Failed to parse response: ${parseError.message}`));
            }
          });
        });

        req.on('error', (error) => {
          console.error(`❌ Request error for ${method.toUpperCase()} ${endpoint}:`, error.message);
          reject(new Error(`Request failed: ${error.message}`));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`❌ Request timeout after ${this.timeout}ms`));
        });

        // Send data for POST/PUT requests
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          req.write(JSON.stringify(data));
        }

        req.end();
      } catch (error) {
        reject(new Error(`❌ Request setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Check rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    if (now > this.rateLimitInfo.resetTime) {
      this.rateLimitInfo.requests = 0;
      this.rateLimitInfo.resetTime = now + 60000;
    }

    if (this.rateLimitInfo.requests >= 100) { // Assumed rate limit
      throw new Error('❌ Rate limit exceeded. Please wait before making more requests.');
    }

    this.rateLimitInfo.requests++;
  }

  /**
   * Update rate limit information from response headers
   */
  updateRateLimitInfo(headers) {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitInfo.remaining = parseInt(headers['x-ratelimit-remaining']);
    }
    if (headers['x-ratelimit-reset']) {
      this.rateLimitInfo.resetTime = parseInt(headers['x-ratelimit-reset']) * 1000;
    }
  }

  /**
   * Test connection to Clerk API
   */
  async testConnection() {
    try {
      console.log('🔍 Testing Clerk API connection...');
      const response = await this.makeRequest('GET', '/users?limit=1');
      console.log('✅ Connection test successful');
      return {
        success: true,
        message: 'Connection to Clerk API established successfully',
        rateLimitRemaining: this.rateLimitInfo.remaining
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * User Management Methods
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `/users${queryParams ? `?${queryParams}` : ''}`;
      return await this.makeRequest('GET', endpoint);
    } catch (error) {
      throw new Error(`❌ Failed to get users: ${error.message}`);
    }
  }

  async getUser(userId) {
    if (!userId) {
      throw new Error('❌ User ID is required');
    }
    try {
      return await this.makeRequest('GET', `/users/${userId}`);
    } catch (error) {
      throw new Error(`❌ Failed to get user ${userId}: ${error.message}`);
    }
  }

  async createUser(userData) {
    if (!userData || typeof userData !== 'object') {
      throw new Error('❌ Valid user data object is required');
    }
    try {
      return await this.makeRequest('POST', '/users', userData);
    } catch (error) {
      throw new Error(`❌ Failed to create user: ${error.message}`);
    }
  }

  async updateUser(userId, userData) {
    if (!userId) {
      throw new Error('❌ User ID is required');
    }
    if (!userData || typeof userData !== 'object') {
      throw new Error('❌ Valid user data object is required');
    }
    try {
      return await this.makeRequest('PATCH', `/users/${userId}`, userData);
    } catch (error) {
      throw new Error(`❌ Failed to update user ${userId}: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    if (!userId) {
      throw new Error('❌ User ID is required');
    }
    try {
      return await this.makeRequest('DELETE', `/users/${userId}`);
    } catch (error) {
      throw new Error(`❌ Failed to delete user ${userId}: ${error.message}`);
    }
  }

  /**
   * Session Management Methods
   */
  async getSessions(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `/sessions${queryParams ? `?${queryParams}` : ''}`;
      return await this.makeRequest('GET', endpoint);
    } catch (error) {
      throw new Error(`❌ Failed to get sessions: ${error.message}`);
    }
  }

  async getSession(sessionId) {
    if (!sessionId) {
      throw new Error('❌ Session ID is required');
    }
    try {
      return await this.makeRequest('GET', `/sessions/${sessionId}`);
    } catch (error) {
      throw new Error(`❌ Failed to get session ${sessionId}: ${error.message}`);
    }
  }

  async revokeSession(sessionId) {
    if (!sessionId) {
      throw new Error('❌ Session ID is required');
    }
    try {
      return await this.makeRequest('POST', `/sessions/${sessionId}/revoke`);
    } catch (error) {
      throw new Error(`❌ Failed to revoke session ${sessionId}: ${error.message}`);
    }
  }

  /**
   * Organization Management Methods
   */
  async getOrganizations(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = `/organizations${queryParams ? `?${queryParams}` : ''}`;
      return await this.makeRequest('GET', endpoint);
    } catch (error) {
      throw new Error(`❌ Failed to get organizations: ${error.message}`);
    }
  }

  async createOrganization(orgData) {
    if (!orgData || typeof orgData !== 'object') {
      throw new Error('❌ Valid organization data object is required');
    }
    try {
      return await this.makeRequest('POST', '/organizations', orgData);
    } catch (error) {
      throw new Error(`❌ Failed to create organization: ${error.message}`);
    }
  }

  /**
   * JWT Token Verification (Networkless)
   */
  verifyJWT(token) {
    if (!this.jwtKey) {
      throw new Error('❌ JWT key is required for networkless verification');
    }
    if (!token) {
      throw new Error('❌ Token is required');
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, this.jwtKey, { algorithms: ['RS256'] });
      
      // Additional validation
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new Error('❌ Token has expired');
      }
      if (decoded.nbf && decoded.nbf > now) {
        throw new Error('❌ Token not yet valid');
      }

      console.log('✅ JWT verification successful');
      return {
        success: true,
        userId: decoded.sub,
        sessionId: decoded.sid,
        claims: decoded
      };
    } catch (error) {
      throw new Error(`❌ JWT verification failed: ${error.message}`);
    }
  }

  /**
   * Webhook verification
   */
  verifyWebhook(payload, signature, secret) {
    if (!payload || !signature || !secret) {
      throw new Error('❌ Payload, signature, and secret are required for webhook verification');
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isValid) {
        throw new Error('❌ Invalid webhook signature');
      }

      console.log('✅ Webhook verification successful');
      return { success: true, verified: true };
    } catch (error) {
      throw new Error(`❌ Webhook verification failed: ${error.message}`);
    }
  }

  /**
   * Health check and connection status
   */
  getConnectionStatus() {
    return {
      baseURL: this.baseURL,
      version: this.version,
      hasSecretKey: !!this.secretKey,
      hasPublishableKey: !!this.publishableKey,
      hasJwtKey: !!this.jwtKey,
      rateLimitInfo: this.rateLimitInfo,
      lastCheckTime: new Date().toISOString()
    };
  }
}

module.exports = { ClerkAPIConnection };