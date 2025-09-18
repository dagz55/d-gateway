import { randomBytes, createHash, timingSafeEqual } from 'crypto';

/**
 * Cryptographic utilities for secure token generation and validation
 * Follows OWASP recommendations for CSRF protection
 */

export interface TokenResult {
  token: string;
  timestamp: number;
  fingerprint: string;
  hash: string;
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a secure CSRF token with timestamp and fingerprint binding
 */
export function generateCSRFToken(
  sessionFingerprint: string,
  timestamp: number = Date.now()
): TokenResult {
  // Generate random token
  const token = generateSecureToken(32);
  
  // Create hash of token + fingerprint + timestamp for integrity
  const dataToHash = `${token}:${sessionFingerprint}:${timestamp}`;
  const hash = createHash('sha256').update(dataToHash).digest('hex');
  
  return {
    token,
    timestamp,
    fingerprint: sessionFingerprint,
    hash
  };
}

/**
 * Validate CSRF token with timing-safe comparison
 */
export function validateCSRFToken(
  providedToken: string,
  storedTokenData: TokenResult,
  sessionFingerprint: string,
  maxAge: number = 3600000 // 1 hour default
): {
  valid: boolean;
  reason?: string;
} {
  try {
    // Check token age
    const now = Date.now();
    if (now - storedTokenData.timestamp > maxAge) {
      return { valid: false, reason: 'Token expired' };
    }

    // Check fingerprint binding
    if (storedTokenData.fingerprint !== sessionFingerprint) {
      return { valid: false, reason: 'Fingerprint mismatch' };
    }

    // Validate token integrity
    const expectedDataToHash = `${storedTokenData.token}:${sessionFingerprint}:${storedTokenData.timestamp}`;
    const expectedHash = createHash('sha256').update(expectedDataToHash).digest('hex');
    
    if (!timingSafeEqual(Buffer.from(storedTokenData.hash, 'hex'), Buffer.from(expectedHash, 'hex'))) {
      return { valid: false, reason: 'Token integrity check failed' };
    }

    // Validate provided token matches stored token using timing-safe comparison
    if (!timingSafeEqual(Buffer.from(providedToken, 'hex'), Buffer.from(storedTokenData.token, 'hex'))) {
      return { valid: false, reason: 'Token mismatch' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Token validation error' };
  }
}

/**
 * Generate session fingerprint from request headers
 */
export function generateSessionFingerprint(
  userAgent: string | null,
  acceptLanguage: string | null,
  acceptEncoding: string | null,
  clientIP: string
): string {
  const data = [
    userAgent || 'unknown',
    acceptLanguage || 'unknown',
    acceptEncoding || 'unknown',
    clientIP
  ].join('|');
  
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Secure token encoding for cookie storage
 */
export function encodeTokenForCookie(tokenData: TokenResult): string {
  const tokenString = JSON.stringify(tokenData);
  return Buffer.from(tokenString).toString('base64');
}

/**
 * Secure token decoding from cookie storage
 */
export function decodeTokenFromCookie(encodedToken: string): TokenResult | null {
  try {
    const tokenString = Buffer.from(encodedToken, 'base64').toString('utf-8');
    const tokenData = JSON.parse(tokenString);
    
    // Validate structure
    if (!tokenData.token || !tokenData.timestamp || !tokenData.fingerprint || !tokenData.hash) {
      return null;
    }
    
    return tokenData as TokenResult;
  } catch (error) {
    return null;
  }
}

/**
 * Generate secure random nonce for additional security
 */
export function generateNonce(length: number = 16): string {
  return randomBytes(length).toString('base64');
}

/**
 * Rate limiting token bucket for CSRF token generation
 */
class TokenRateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>();
  private readonly maxTokens: number = 10;
  private readonly refillRate: number = 1; // tokens per minute
  private readonly windowMs: number = 60000; // 1 minute

  /**
   * Check if request is allowed based on IP-based rate limiting
   */
  isAllowed(clientIP: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(clientIP);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.buckets.set(clientIP, bucket);
    }

    // Calculate tokens to add based on time elapsed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.windowMs) * this.refillRate;
    
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Clean up old buckets to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [ip, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(ip);
      }
    }
  }
}

export const csrfRateLimiter = new TokenRateLimiter();

// Clean up rate limiter every hour
setInterval(() => {
  csrfRateLimiter.cleanup();
}, 60 * 60 * 1000);