import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';
import { logSecurityEvent } from './session-security';
import { getClientIP } from './auth-middleware';

export interface UserDevice {
  deviceId: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: DeviceType;
  operatingSystem: string;
  browser: string;
  isTrusted: boolean;
  isActive: boolean;
  firstSeen: string;
  lastSeen: string;
  lastIP: string;
  location: DeviceLocation;
  metadata: DeviceMetadata;
}

export interface DeviceLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DeviceMetadata {
  userAgent: string;
  screenResolution?: string;
  language: string;
  timezone: string;
  platform: string;
  colorDepth?: number;
  plugins?: string[];
  fonts?: string[];
  canvas?: string;
  webgl?: string;
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'smart_tv' | 'game_console' | 'unknown';

export interface DeviceVerificationRequest {
  deviceId: string;
  userId: string;
  verificationCode: string;
  requestedAt: string;
  expiresAt: string;
  verificationMethod: 'email' | 'sms' | 'authenticator';
  verified: boolean;
}

export interface DeviceSecurityPolicy {
  requireVerificationForNewDevices: boolean;
  trustDeviceAfterVerification: boolean;
  deviceTrustDurationDays: number;
  maxTrustedDevices: number;
  blockUntrustedDevices: boolean;
  requireReVerificationDays: number;
}

export const DEFAULT_DEVICE_SECURITY_POLICY: DeviceSecurityPolicy = {
  requireVerificationForNewDevices: true,
  trustDeviceAfterVerification: true,
  deviceTrustDurationDays: 30,
  maxTrustedDevices: 10,
  blockUntrustedDevices: false,
  requireReVerificationDays: 90,
};

export class DeviceManager {
  private supabase: any;
  private securityPolicy: DeviceSecurityPolicy;

  constructor(securityPolicy: Partial<DeviceSecurityPolicy> = {}) {
    this.securityPolicy = { ...DEFAULT_DEVICE_SECURITY_POLICY, ...securityPolicy };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Generate device fingerprint from request
   */
  generateDeviceFingerprint(request: any): string {
    const userAgent = request.headers?.get?.('user-agent') || '';
    const acceptLanguage = request.headers?.get?.('accept-language') || '';
    const acceptEncoding = request.headers?.get?.('accept-encoding') || '';
    const acceptCharset = request.headers?.get?.('accept-charset') || '';
    
    const fingerprintData = [
      userAgent,
      acceptLanguage,
      acceptEncoding,
      acceptCharset,
    ].join('|');

    return createHash('sha256').update(fingerprintData).digest('hex');
  }

  /**
   * Extract device information from user agent
   */
  private parseUserAgent(userAgent: string): {
    deviceType: DeviceType;
    operatingSystem: string;
    browser: string;
    deviceName: string;
  } {
    const ua = userAgent.toLowerCase();
    
    // Detect device type
    let deviceType: DeviceType = 'unknown';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    } else if (ua.includes('smart-tv') || ua.includes('smarttv')) {
      deviceType = 'smart_tv';
    } else if (ua.includes('playstation') || ua.includes('xbox') || ua.includes('nintendo')) {
      deviceType = 'game_console';
    } else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux')) {
      deviceType = 'desktop';
    }

    // Detect operating system
    let operatingSystem = 'Unknown';
    if (ua.includes('windows')) operatingSystem = 'Windows';
    else if (ua.includes('mac os')) operatingSystem = 'macOS';
    else if (ua.includes('linux')) operatingSystem = 'Linux';
    else if (ua.includes('android')) operatingSystem = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) operatingSystem = 'iOS';

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('edge')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    // Generate device name
    const deviceName = `${browser} on ${operatingSystem}`;

    return {
      deviceType,
      operatingSystem,
      browser,
      deviceName,
    };
  }

  /**
   * Register or update device information
   */
  async registerDevice(userId: string, request: any): Promise<UserDevice> {
    const deviceFingerprint = this.generateDeviceFingerprint(request);
    const userAgent = request.headers?.get?.('user-agent') || '';
    const acceptLanguage = request.headers?.get?.('accept-language') || '';
    const ipAddress = getClientIP(request);

    // Parse device information
    const deviceInfo = this.parseUserAgent(userAgent);

    // Check if device already exists
    const { data: existingDevice } = await this.supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceFingerprint)
      .single();

    const now = new Date().toISOString();
    const deviceMetadata: DeviceMetadata = {
      userAgent,
      language: acceptLanguage,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: deviceInfo.operatingSystem,
    };

    if (existingDevice) {
      // Update existing device
      const updatedDevice = {
        ...existingDevice,
        last_seen: now,
        last_ip: ipAddress,
        metadata: { ...existingDevice.metadata, ...deviceMetadata },
        is_active: true,
      };

      await this.supabase
        .from('user_devices')
        .update(updatedDevice)
        .eq('device_id', existingDevice.device_id);

      logSecurityEvent('device_updated', {
        userId,
        deviceId: existingDevice.device_id,
        deviceType: deviceInfo.deviceType,
        ipAddress,
      });

      return this.mapDatabaseDeviceToUserDevice(updatedDevice);
    } else {
      // Create new device
      const deviceId = randomBytes(16).toString('hex');
      
      const newDevice = {
        device_id: deviceId,
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        device_name: deviceInfo.deviceName,
        device_type: deviceInfo.deviceType,
        operating_system: deviceInfo.operatingSystem,
        browser: deviceInfo.browser,
        is_trusted: false, // New devices start as untrusted
        is_active: true,
        first_seen: now,
        last_seen: now,
        last_ip: ipAddress,
        location_data: await this.getLocationFromIP(ipAddress),
        metadata: deviceMetadata,
      };

      const { error } = await this.supabase
        .from('user_devices')
        .insert(newDevice);

      if (error) {
        console.error('Failed to register device:', error);
        throw new Error('Device registration failed');
      }

      logSecurityEvent('device_registered', {
        userId,
        deviceId,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
        ipAddress,
        requiresVerification: this.securityPolicy.requireVerificationForNewDevices,
      });

      // Start device verification process if required
      if (this.securityPolicy.requireVerificationForNewDevices) {
        await this.initiateDeviceVerification(deviceId, userId);
      }

      return this.mapDatabaseDeviceToUserDevice(newDevice);
    }
  }

  /**
   * Get location from IP address
   */
  private async getLocationFromIP(ipAddress: string): Promise<DeviceLocation> {
    try {
      // In production, integrate with IP geolocation service
      return {
        country: 'US',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'America/Los_Angeles',
      };
    } catch (error) {
      console.warn('Failed to get location from IP:', error);
      return {};
    }
  }

  /**
   * Map database device to UserDevice interface
   */
  private mapDatabaseDeviceToUserDevice(dbDevice: any): UserDevice {
    return {
      deviceId: dbDevice.device_id,
      userId: dbDevice.user_id,
      deviceFingerprint: dbDevice.device_fingerprint,
      deviceName: dbDevice.device_name,
      deviceType: dbDevice.device_type,
      operatingSystem: dbDevice.operating_system,
      browser: dbDevice.browser,
      isTrusted: dbDevice.is_trusted,
      isActive: dbDevice.is_active,
      firstSeen: dbDevice.first_seen,
      lastSeen: dbDevice.last_seen,
      lastIP: dbDevice.last_ip,
      location: dbDevice.location_data || {},
      metadata: dbDevice.metadata || {},
    };
  }

  /**
   * Get user's devices
   */
  async getUserDevices(userId: string, includeInactive: boolean = false): Promise<UserDevice[]> {
    let query = this.supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', userId);

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: devices, error } = await query.order('last_seen', { ascending: false });

    if (error) {
      console.error('Failed to get user devices:', error);
      return [];
    }

    return devices.map(device => this.mapDatabaseDeviceToUserDevice(device));
  }

  /**
   * Trust a device after verification
   */
  async trustDevice(deviceId: string, userId: string, trustedBy: string): Promise<void> {
    // Check device trust limits
    const trustedDevices = await this.getTrustedDevicesCount(userId);
    if (trustedDevices >= this.securityPolicy.maxTrustedDevices) {
      throw new Error('Maximum trusted devices limit reached');
    }

    const trustExpiry = this.securityPolicy.deviceTrustDurationDays > 0
      ? new Date(Date.now() + this.securityPolicy.deviceTrustDurationDays * 24 * 60 * 60 * 1000)
      : null;

    const { error } = await this.supabase
      .from('user_devices')
      .update({
        is_trusted: true,
        trusted_at: new Date().toISOString(),
        trusted_by: trustedBy,
        trust_expires_at: trustExpiry?.toISOString(),
      })
      .eq('device_id', deviceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to trust device:', error);
      throw new Error('Device trust operation failed');
    }

    logSecurityEvent('device_trusted', {
      userId,
      deviceId,
      trustedBy,
      trustExpiry: trustExpiry?.toISOString(),
    });
  }

  /**
   * Revoke trust from a device
   */
  async revokeTrust(deviceId: string, userId: string, revokedBy: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_devices')
      .update({
        is_trusted: false,
        trust_revoked_at: new Date().toISOString(),
        trust_revoked_by: revokedBy,
      })
      .eq('device_id', deviceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to revoke device trust:', error);
      throw new Error('Device trust revocation failed');
    }

    logSecurityEvent('device_trust_revoked', {
      userId,
      deviceId,
      revokedBy,
    });
  }

  /**
   * Get count of trusted devices for user
   */
  private async getTrustedDevicesCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('user_devices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_trusted', true)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to count trusted devices:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Initiate device verification process
   */
  async initiateDeviceVerification(
    deviceId: string,
    userId: string,
    method: 'email' | 'sms' | 'authenticator' = 'email'
  ): Promise<DeviceVerificationRequest> {
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const verificationRequest: DeviceVerificationRequest = {
      deviceId,
      userId,
      verificationCode,
      requestedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      verificationMethod: method,
      verified: false,
    };

    // Store verification request
    const { error } = await this.supabase
      .from('device_verification_requests')
      .insert({
        device_id: deviceId,
        user_id: userId,
        verification_code: verificationCode,
        requested_at: verificationRequest.requestedAt,
        expires_at: verificationRequest.expiresAt,
        verification_method: method,
        verified: false,
      });

    if (error) {
      console.error('Failed to create device verification request:', error);
      throw new Error('Device verification initiation failed');
    }

    // Send verification code
    await this.sendVerificationCode(userId, verificationCode, method);

    logSecurityEvent('device_verification_initiated', {
      userId,
      deviceId,
      method,
    });

    return verificationRequest;
  }

  /**
   * Generate verification code
   */
  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  /**
   * Send verification code to user
   */
  private async sendVerificationCode(
    userId: string,
    code: string,
    method: 'email' | 'sms' | 'authenticator'
  ): Promise<void> {
    // Get user contact information
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('email, phone_number')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    switch (method) {
      case 'email':
        if (!profile.email) {
          throw new Error('No email address found for verification');
        }
        await this.sendEmailVerification(profile.email, code);
        break;
      
      case 'sms':
        if (!profile.phone_number) {
          throw new Error('No phone number found for verification');
        }
        await this.sendSMSVerification(profile.phone_number, code);
        break;
      
      case 'authenticator':
        // For authenticator, we would generate a QR code or use TOTP
        // For now, just log the code
        console.log(`Authenticator verification code for user ${userId}: ${code}`);
        break;
    }
  }

  /**
   * Send email verification (placeholder)
   */
  private async sendEmailVerification(email: string, code: string): Promise<void> {
    // In production, integrate with email service
    console.log(`Email verification code sent to ${email}: ${code}`);
  }

  /**
   * Send SMS verification (placeholder)
   */
  private async sendSMSVerification(phoneNumber: string, code: string): Promise<void> {
    // In production, integrate with SMS service
    console.log(`SMS verification code sent to ${phoneNumber}: ${code}`);
  }

  /**
   * Verify device with code
   */
  async verifyDevice(deviceId: string, userId: string, verificationCode: string): Promise<boolean> {
    // Get verification request
    const { data: verificationRequest } = await this.supabase
      .from('device_verification_requests')
      .select('*')
      .eq('device_id', deviceId)
      .eq('user_id', userId)
      .eq('verification_code', verificationCode)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!verificationRequest) {
      logSecurityEvent('device_verification_failed', {
        userId,
        deviceId,
        reason: 'Invalid or expired verification code',
      });
      return false;
    }

    // Mark verification as complete
    await this.supabase
      .from('device_verification_requests')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verificationRequest.id);

    // Trust the device if policy allows
    if (this.securityPolicy.trustDeviceAfterVerification) {
      await this.trustDevice(deviceId, userId, 'verification');
    }

    logSecurityEvent('device_verified', {
      userId,
      deviceId,
      verificationMethod: verificationRequest.verification_method,
    });

    return true;
  }

  /**
   * Check if device verification is required
   */
  async requiresVerification(deviceId: string, userId: string): Promise<boolean> {
    if (!this.securityPolicy.requireVerificationForNewDevices) {
      return false;
    }

    const { data: device } = await this.supabase
      .from('user_devices')
      .select('is_trusted, first_seen')
      .eq('device_id', deviceId)
      .eq('user_id', userId)
      .single();

    if (!device) {
      return true; // Unknown devices require verification
    }

    // Check if device is trusted and trust hasn't expired
    if (device.is_trusted) {
      // Check if re-verification is required based on policy
      if (this.securityPolicy.requireReVerificationDays > 0) {
        const daysSinceFirstSeen = (Date.now() - new Date(device.first_seen).getTime()) / (24 * 60 * 60 * 1000);
        return daysSinceFirstSeen > this.securityPolicy.requireReVerificationDays;
      }
      return false;
    }

    return true;
  }

  /**
   * Mark device as inactive
   */
  async deactivateDevice(deviceId: string, userId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_devices')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason,
      })
      .eq('device_id', deviceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to deactivate device:', error);
      throw new Error('Device deactivation failed');
    }

    logSecurityEvent('device_deactivated', {
      userId,
      deviceId,
      reason,
    });
  }

  /**
   * Clean up old devices and verification requests
   */
  async cleanupOldDevices(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Clean up old verification requests
    await this.supabase
      .from('device_verification_requests')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Mark old inactive devices as archived
    const { data: oldDevices } = await this.supabase
      .from('user_devices')
      .select('device_id')
      .eq('is_active', false)
      .lt('last_seen', thirtyDaysAgo);

    if (oldDevices && oldDevices.length > 0) {
      await this.supabase
        .from('user_devices')
        .update({ archived: true })
        .in('device_id', oldDevices.map(d => d.device_id));
    }

    return oldDevices?.length || 0;
  }

  /**
   * Detect suspicious device activity
   */
  async detectSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
    recommendations: string[];
  }> {
    const devices = await this.getUserDevices(userId, true);
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // Check for rapid device registrations
    const recentDevices = devices.filter(d => {
      const deviceAge = Date.now() - new Date(d.firstSeen).getTime();
      return deviceAge < 24 * 60 * 60 * 1000; // Less than 24 hours old
    });

    if (recentDevices.length > 3) {
      reasons.push('Multiple new devices registered in 24 hours');
      recommendations.push('Review recent device registrations and revoke trust from unfamiliar devices');
    }

    // Check for devices from different geographical locations
    const locations = devices
      .map(d => `${d.location.country}-${d.location.region}`)
      .filter(Boolean);
    
    if (new Set(locations).size > 3) {
      reasons.push('Devices registered from multiple geographical locations');
      recommendations.push('Verify all device locations and consider enabling location-based restrictions');
    }

    // Check for unusual device types
    const deviceTypes = devices.map(d => d.deviceType);
    const unusualTypes = deviceTypes.filter(type => 
      type === 'game_console' || type === 'smart_tv'
    );

    if (unusualTypes.length > 0) {
      reasons.push('Unusual device types detected');
      recommendations.push('Verify ownership of all registered devices');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
      recommendations,
    };
  }
}

// Export singleton instance
export const deviceManager = new DeviceManager();