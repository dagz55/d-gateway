import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// Session configuration constants
export const SESSION_CONFIG = {
  COOKIE_NAME: 'wos-session',
  MAX_AGE: 60 * 60 * 24, // 24 hours in seconds
  FINGERPRINT_COOKIE: 'session-fp',
  TIMEOUT_WARNING: 60 * 60 * 23, // 23 hours - warn 1 hour before expiry
} as const;

// Enhanced cookie configuration for secure sessions
export interface SecureSessionConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  domain?: string;
  path: string;
}

// Session fingerprint interface for security validation
export interface SessionFingerprint {
  userAgent: string;
  ipAddress: string;
  timestamp: number;
}

// Enhanced session data interface
export interface SecureSessionData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  sessionCreated: number;
  sessionExpiry: number;
  fingerprint: string;
}

// Comprehensive security event types for CSRF protection and general security
export type SecurityEventType = 
  // Session events
  | 'session_created' 
  | 'session_expired' 
  | 'fingerprint_mismatch' 
  | 'session_cleared'
  | 'session_creation_failed'
  // User authentication events
  | 'user_logout'
  | 'login_failed'
  | 'login_success'
  // Profile management events
  | 'unauthorized_profile_access'
  | 'profile_auto_created'
  | 'profile_api_error'
  | 'unauthorized_profile_update_attempt'
  | 'invalid_profile_field'
  | 'profile_updated'
  | 'profile_update_error'
  | 'profile_created'
  | 'unauthorized_profile_update'
  | 'unauthorized_username_update'
  | 'username_updated'
  | 'unauthorized_password_update'
  | 'password_change_attempted'
  // Avatar/file management events
  | 'unauthorized_avatar_upload'
  | 'invalid_avatar_upload'
  | 'avatar_updated'
  | 'invalid_file_type'
  | 'file_too_large'
  | 'avatar_uploaded'
  | 'unauthorized_avatar_removal'
  | 'avatar_removed'
  // Financial transaction events
  | 'unauthorized_deposit_attempt'
  | 'invalid_deposit_data'
  | 'suspicious_deposit_amount'
  | 'invalid_currency'
  | 'deposit_created'
  | 'deposit_creation_failed'
  // CSRF protection events
  | 'csrf_rate_limit_exceeded'
  | 'csrf_token_generated'
  | 'csrf_token_generation_failed'
  | 'csrf_fingerprint_mismatch'
  | 'csrf_token_validation_failed'
  | 'csrf_token_rotated'
  | 'csrf_validation_error'
  | 'csrf_attack_blocked'
  | 'csrf_middleware_error'
  | 'csrf_tokens_cleared'
  | 'csrf_slow_validation'
  | 'csrf_middleware_exception'
  | 'csrf_origin_mismatch'
  | 'csrf_referer_mismatch'
  | 'csrf_suspicious_user_agent'
  | 'csrf_security_check_error'
  | 'csrf_dev_bypass_used';

/**
 * Get secure cookie configuration based on environment
 */
export function getSecureSessionConfig(): SecureSessionConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Validate COOKIE_DOMAIN if provided
  const cookieDomain = process.env.COOKIE_DOMAIN;
  if (cookieDomain && !isValidDomain(cookieDomain)) {
    console.warn('Invalid COOKIE_DOMAIN provided, ignoring:', cookieDomain);
  }

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: SESSION_CONFIG.MAX_AGE,
    domain: isProduction && cookieDomain && isValidDomain(cookieDomain) ? cookieDomain : undefined,
    path: '/'
  };
}

/**
 * Validate domain format for cookie configuration
 */
function isValidDomain(domain: string): boolean {
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainPattern.test(domain) && domain.length <= 253;
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for') || 'unknown';
  
  // Get the most reliable IP address
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || remoteAddr;
  
  return ipAddress;
}

/**
 * Generate session fingerprint for additional security
 */
export function generateSessionFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ipAddress = getClientIP(request);
  
  const fingerprint: SessionFingerprint = {
    userAgent: userAgent.substring(0, 200), // Limit length for security
    ipAddress,
    timestamp: Date.now()
  };

  // Create a hash of the fingerprint data
  const fingerprintString = JSON.stringify(fingerprint);
  return createHash('sha256').update(fingerprintString).digest('hex');
}

/**
 * Validate session fingerprint against current request
 */
export function validateSessionFingerprint(
  storedFingerprint: string, 
  currentRequest: NextRequest
): boolean {
  try {
    const currentFingerprint = generateSessionFingerprint(currentRequest);
    
    // For now, we'll do a simple comparison
    // In production, you might want to allow some flexibility for IP changes
    // while maintaining strict user-agent validation
    const userAgent = currentRequest.headers.get('user-agent') || 'unknown';
    const currentFingerprintData = {
      userAgent: userAgent.substring(0, 200),
      ipAddress: 'flexible', // Allow IP changes for mobile users
      timestamp: 0
    };
    
    const flexibleFingerprint = createHash('sha256')
      .update(JSON.stringify(currentFingerprintData))
      .digest('hex');
    
    // Check if user agent matches (strict) or if exact fingerprint matches
    return storedFingerprint === currentFingerprint || 
           storedFingerprint.includes(userAgent.substring(0, 50));
  } catch (error) {
    console.error('Fingerprint validation error:', error);
    return false;
  }
}

/**
 * Create secure session data with enhanced security features
 */
export function createSecureSessionData(
  userData: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    createdAt: string;
    updatedAt: string;
  },
  request: NextRequest
): SecureSessionData {
  const now = Date.now();
  const expiry = now + (SESSION_CONFIG.MAX_AGE * 1000);
  
  return {
    ...userData,
    sessionCreated: now,
    sessionExpiry: expiry,
    fingerprint: generateSessionFingerprint(request)
  };
}

/**
 * Validate session data for security and expiry
 */
export function validateSecureSession(
  sessionData: any,
  request: NextRequest
): { valid: boolean; reason?: string } {
  try {
    // Check if session data exists and has required fields
    if (!sessionData || typeof sessionData !== 'object') {
      return { valid: false, reason: 'Invalid session data' };
    }

    const { userId, sessionCreated, sessionExpiry, fingerprint } = sessionData;

    // Check required fields
    if (!userId || !sessionCreated || !sessionExpiry || !fingerprint) {
      return { valid: false, reason: 'Missing required session fields' };
    }

    // Check session expiry
    const now = Date.now();
    if (now > sessionExpiry) {
      return { valid: false, reason: 'Session expired' };
    }

    // Validate session fingerprint
    if (!validateSessionFingerprint(fingerprint, request)) {
      return { valid: false, reason: 'Invalid session fingerprint' };
    }

    // Check session age (additional security check)
    const sessionAge = now - sessionCreated;
    const maxSessionAge = SESSION_CONFIG.MAX_AGE * 1000;
    if (sessionAge > maxSessionAge) {
      return { valid: false, reason: 'Session too old' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, reason: 'Session validation failed' };
  }
}

/**
 * Securely set session cookie with enhanced configuration
 */
export async function setSecureSessionCookie(
  sessionData: SecureSessionData
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const config = getSecureSessionConfig();
    
    // Set main session cookie
    cookieStore.set(SESSION_CONFIG.COOKIE_NAME, JSON.stringify(sessionData), config);
    
    // Set fingerprint cookie for additional validation
    cookieStore.set(SESSION_CONFIG.FINGERPRINT_COOKIE, sessionData.fingerprint, {
      ...config,
      httpOnly: false, // Allow client-side access for timeout warnings
      maxAge: config.maxAge
    });
    
    console.log('Secure session cookie set successfully');
  } catch (error) {
    console.error('Failed to set secure session cookie:', error);
    throw error;
  }
}

/**
 * Securely clear session cookies
 */
export async function clearSecureSessionCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    
    // Clear main session cookie
    cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
    
    // Clear fingerprint cookie
    cookieStore.delete(SESSION_CONFIG.FINGERPRINT_COOKIE);
    
    console.log('Session cookies cleared successfully');
  } catch (error) {
    console.error('Failed to clear session cookies:', error);
    throw error;
  }
}

/**
 * Get session timeout warning threshold
 */
export function getSessionTimeoutWarning(sessionData: SecureSessionData): {
  shouldWarn: boolean;
  timeRemaining: number;
} {
  const now = Date.now();
  const timeRemaining = sessionData.sessionExpiry - now;
  const warningThreshold = 60 * 60 * 1000; // 1 hour in milliseconds
  
  return {
    shouldWarn: timeRemaining <= warningThreshold && timeRemaining > 0,
    timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000))
  };
}

/**
 * Environment variable validation for session security
 */
export function validateSessionEnvironment(): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    warnings.push('NODE_ENV should be set to "production" or "development"');
  }
  
  // Check COOKIE_DOMAIN in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.COOKIE_DOMAIN) {
      warnings.push('COOKIE_DOMAIN should be set in production for security');
    } else if (!isValidDomain(process.env.COOKIE_DOMAIN)) {
      errors.push('COOKIE_DOMAIN format is invalid');
    }
  }
  
  // Check if running over HTTPS in production
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL?.startsWith('https://')) {
    warnings.push('Application should run over HTTPS in production');
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(
  event: SecurityEventType,
  details: Record<string, any> = {}
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    environment: process.env.NODE_ENV
  };
  
  // In production, you might want to send this to a security monitoring service
  if (process.env.NODE_ENV === 'production') {
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
  } else {
    console.log('Security Event:', event, details);
  }
}