/**
 * IP Address Utilities and Geolocation
 * Utilities for IP address validation, extraction, and geolocation
 */

import { NextRequest } from 'next/server';

/**
 * IP Address validation and utility functions
 */

// IPv4 and IPv6 regex patterns
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

// Private IP ranges (RFC 1918, RFC 4193)
const PRIVATE_IPV4_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255', cidr: '10.0.0.0/8' },
  { start: '172.16.0.0', end: '172.31.255.255', cidr: '172.16.0.0/12' },
  { start: '192.168.0.0', end: '192.168.255.255', cidr: '192.168.0.0/16' },
  { start: '127.0.0.0', end: '127.255.255.255', cidr: '127.0.0.0/8' }, // Loopback
];

// Cloud provider IP ranges (basic detection)
const CLOUD_PROVIDERS = {
  AWS: [
    '52.0.0.0/8',
    '54.0.0.0/8',
    '3.0.0.0/8'
  ],
  CLOUDFLARE: [
    '103.21.244.0/22',
    '103.22.200.0/22',
    '173.245.48.0/20'
  ],
  GOOGLE: [
    '35.0.0.0/8',
    '34.0.0.0/8'
  ]
};

export interface IPInfo {
  ip: string;
  type: 'ipv4' | 'ipv6' | 'unknown';
  isPrivate: boolean;
  isLoopback: boolean;
  isCloudProvider: boolean;
  cloudProvider?: string;
  source: string; // Header source
  proxied: boolean;
  geolocation?: GeolocationInfo;
  asn?: ASNInfo;
}

export interface GeolocationInfo {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  threat?: ThreatInfo;
}

export interface ASNInfo {
  asn: number;
  organization: string;
  type: 'hosting' | 'isp' | 'business' | 'education' | 'government' | 'unknown';
}

export interface ThreatInfo {
  isTor: boolean;
  isProxy: boolean;
  isVPN: boolean;
  isMalicious: boolean;
  threatTypes: string[];
  riskScore: number; // 0-100
}

/**
 * Extract client IP address from Next.js request
 * Follows best practices for IP extraction with security considerations
 */
export function extractClientIP(request: NextRequest): IPInfo {
  const headers = request.headers;
  
  // Priority order for IP extraction (most trusted first)
  const ipSources = [
    { header: 'cf-connecting-ip', name: 'Cloudflare' },
    { header: 'x-real-ip', name: 'Real-IP' },
    { header: 'x-forwarded-for', name: 'X-Forwarded-For' },
    { header: 'x-vercel-forwarded-for', name: 'Vercel' },
    { header: 'fastly-client-ip', name: 'Fastly' },
    { header: 'x-client-ip', name: 'Client-IP' },
    { header: 'x-cluster-client-ip', name: 'Cluster-Client-IP' },
    { header: 'forwarded', name: 'Forwarded' }
  ];
  
  let extractedIP = 'unknown';
  let source = 'unknown';
  let proxied = false;
  
  // Try each header in priority order
  for (const { header, name } of ipSources) {
    const headerValue = headers.get(header);
    if (headerValue) {
      // Handle X-Forwarded-For which can contain multiple IPs
      if (header === 'x-forwarded-for') {
        const ips = headerValue.split(',').map(ip => ip.trim());
        extractedIP = ips[0]; // First IP is usually the original client
        proxied = ips.length > 1;
      } else if (header === 'forwarded') {
        // Parse RFC 7239 Forwarded header
        const forwardedMatch = headerValue.match(/for=([^;,\s]+)/);
        if (forwardedMatch) {
          extractedIP = forwardedMatch[1].replace(/"/g, '');
        }
      } else {
        extractedIP = headerValue;
      }
      
      source = name;
      break;
    }
  }
  
  // Fallback to connection remote address
  if (extractedIP === 'unknown') {
    // In Next.js, request.ip might be available in some environments
    extractedIP = (request as any).ip || 'unknown';
    source = 'connection';
  }
  
  // Clean and validate the IP
  extractedIP = cleanIP(extractedIP);
  
  return {
    ip: extractedIP,
    type: getIPType(extractedIP),
    isPrivate: isPrivateIP(extractedIP),
    isLoopback: isLoopbackIP(extractedIP),
    isCloudProvider: isCloudProviderIP(extractedIP),
    cloudProvider: getCloudProvider(extractedIP),
    source,
    proxied
  };
}

/**
 * Clean and normalize IP address
 */
function cleanIP(ip: string): string {
  if (!ip || ip === 'unknown') return 'unknown';
  
  // Remove brackets from IPv6 addresses
  ip = ip.replace(/^\[|\]$/g, '');
  
  // Remove port numbers
  const portIndex = ip.lastIndexOf(':');
  if (portIndex > 0 && !ip.includes('::')) {
    // Only remove port if it's not an IPv6 address
    const potentialPort = ip.substring(portIndex + 1);
    if (/^\d+$/.test(potentialPort)) {
      ip = ip.substring(0, portIndex);
    }
  }
  
  return ip.trim();
}

/**
 * Determine IP address type
 */
function getIPType(ip: string): 'ipv4' | 'ipv6' | 'unknown' {
  if (IPV4_REGEX.test(ip)) return 'ipv4';
  if (IPV6_REGEX.test(ip)) return 'ipv6';
  return 'unknown';
}

/**
 * Check if IP is in private range
 */
function isPrivateIP(ip: string): boolean {
  if (getIPType(ip) !== 'ipv4') return false;
  
  const ipNum = ipToNumber(ip);
  if (ipNum === null) return false;
  
  return PRIVATE_IPV4_RANGES.some(range => {
    const startNum = ipToNumber(range.start);
    const endNum = ipToNumber(range.end);
    return startNum !== null && endNum !== null && ipNum >= startNum && ipNum <= endNum;
  });
}

/**
 * Check if IP is loopback
 */
function isLoopbackIP(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.');
}

/**
 * Check if IP belongs to a cloud provider
 */
function isCloudProviderIP(ip: string): boolean {
  return getCloudProvider(ip) !== undefined;
}

/**
 * Get cloud provider for IP
 */
function getCloudProvider(ip: string): string | undefined {
  for (const [provider, ranges] of Object.entries(CLOUD_PROVIDERS)) {
    for (const range of ranges) {
      if (ipInRange(ip, range)) {
        return provider;
      }
    }
  }
  return undefined;
}

/**
 * Convert IPv4 address to number
 */
function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  
  const nums = parts.map(part => parseInt(part, 10));
  if (nums.some(num => isNaN(num) || num < 0 || num > 255)) return null;
  
  return (nums[0] << 24) + (nums[1] << 16) + (nums[2] << 8) + nums[3];
}

/**
 * Check if IP is in CIDR range (basic implementation)
 */
function ipInRange(ip: string, cidr: string): boolean {
  if (getIPType(ip) !== 'ipv4') return false;
  
  const [network, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);
  
  if (ipNum === null || networkNum === null) return false;
  
  const mask = ~((1 << (32 - prefix)) - 1);
  return (ipNum & mask) === (networkNum & mask);
}

/**
 * Enhanced IP analysis with security checks
 */
export async function analyzeIP(ipInfo: IPInfo): Promise<IPInfo> {
  // Add geolocation if enabled and IP is public
  if (!ipInfo.isPrivate && !ipInfo.isLoopback && ipInfo.ip !== 'unknown') {
    try {
      ipInfo.geolocation = await getGeolocation(ipInfo.ip);
    } catch (error) {
      console.warn('Failed to get geolocation for IP:', ipInfo.ip, error);
    }
  }
  
  // Add threat intelligence
  try {
    ipInfo.geolocation = {
      ...ipInfo.geolocation,
      threat: await getThreatIntelligence(ipInfo.ip)
    };
  } catch (error) {
    console.warn('Failed to get threat intelligence for IP:', ipInfo.ip, error);
  }
  
  return ipInfo;
}

/**
 * Get geolocation information for IP
 * This is a stub implementation - in production, use a service like MaxMind, IPStack, etc.
 */
async function getGeolocation(ip: string): Promise<GeolocationInfo> {
  // In production, integrate with a geolocation service
  // Example services: MaxMind GeoIP2, IPStack, IP-API
  
  if (process.env.GEOIP_SERVICE_URL && process.env.GEOIP_API_KEY) {
    try {
      // Example API call (replace with actual service)
      const response = await fetch(`${process.env.GEOIP_SERVICE_URL}/${ip}?key=${process.env.GEOIP_API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'XX',
          region: data.region_name,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          isp: data.isp
        };
      }
    } catch (error) {
      console.warn('Geolocation service error:', error);
    }
  }
  
  // Fallback to basic detection
  return {
    country: 'Unknown',
    countryCode: 'XX'
  };
}

/**
 * Get threat intelligence for IP
 * This is a stub implementation - in production, use services like VirusTotal, AbuseIPDB, etc.
 */
async function getThreatIntelligence(ip: string): Promise<ThreatInfo> {
  // In production, integrate with threat intelligence services
  // Example services: VirusTotal, AbuseIPDB, Shodan, etc.
  
  const threatInfo: ThreatInfo = {
    isTor: false,
    isProxy: false,
    isVPN: false,
    isMalicious: false,
    threatTypes: [],
    riskScore: 0
  };
  
  // Basic threat detection patterns
  if (ip.includes('tor') || ip.includes('exit')) {
    threatInfo.isTor = true;
    threatInfo.threatTypes.push('tor');
    threatInfo.riskScore += 30;
  }
  
  // Check against known malicious IP patterns
  const maliciousPatterns = [
    /^1\.1\.1\.1$/, // Example pattern
    /^8\.8\.8\.8$/, // Public DNS might be suspicious in some contexts
  ];
  
  if (maliciousPatterns.some(pattern => pattern.test(ip))) {
    threatInfo.riskScore += 20;
  }
  
  // Cloud provider IPs might have higher risk score
  if (getCloudProvider(ip)) {
    threatInfo.riskScore += 10;
  }
  
  threatInfo.isMalicious = threatInfo.riskScore > 50;
  
  return threatInfo;
}

/**
 * Generate rate limiting key for IP
 */
export function generateIPRateLimitKey(ipInfo: IPInfo, prefix: string = 'ip'): string {
  // Use a sanitized version of the IP for the key
  const sanitizedIP = ipInfo.ip.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${prefix}:${sanitizedIP}`;
}

/**
 * Generate rate limiting key for user
 */
export function generateUserRateLimitKey(userId: string, prefix: string = 'user'): string {
  return `${prefix}:${userId}`;
}

/**
 * Check if IP should be rate limited based on geolocation
 */
export function shouldApplyGeoRateLimit(geolocation?: GeolocationInfo): boolean {
  if (!geolocation) return false;
  
  // Example: Apply stricter limits for certain countries
  const restrictedCountries = ['CN', 'RU', 'KP']; // Example list
  return restrictedCountries.includes(geolocation.countryCode);
}

/**
 * Get rate limit multiplier based on threat score
 */
export function getThreatRateLimitMultiplier(threat?: ThreatInfo): number {
  if (!threat) return 1;
  
  if (threat.isMalicious) return 0.1; // Very restrictive
  if (threat.isTor || threat.isProxy) return 0.3;
  if (threat.isVPN) return 0.5;
  if (threat.riskScore > 50) return 0.7;
  if (threat.riskScore > 30) return 0.8;
  
  return 1; // Normal rate limit
}

/**
 * Anonymize IP for logging (GDPR compliance)
 */
export function anonymizeIP(ip: string): string {
  if (getIPType(ip) === 'ipv4') {
    // Zero out the last octet
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  } else if (getIPType(ip) === 'ipv6') {
    // Zero out the last 4 groups
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(':') + '::';
    }
  }
  
  return 'anonymized';
}

/**
 * Validate IP whitelist entry
 */
export function validateWhitelistEntry(entry: string): boolean {
  // Check if it's a valid IP address
  if (getIPType(entry) !== 'unknown') return true;
  
  // Check if it's a valid CIDR range
  if (entry.includes('/')) {
    const [ip, prefix] = entry.split('/');
    const prefixNum = parseInt(prefix, 10);
    return getIPType(ip) !== 'unknown' && 
           prefixNum >= 0 && prefixNum <= (getIPType(ip) === 'ipv4' ? 32 : 128);
  }
  
  return false;
}

/**
 * Check if IP matches whitelist entry
 */
export function isIPWhitelisted(ip: string, whitelist: string[]): boolean {
  for (const entry of whitelist) {
    if (entry === '*') return true; // Wildcard
    if (entry === ip) return true; // Exact match
    if (entry.includes('/') && ipInRange(ip, entry)) return true; // CIDR match
  }
  return false;
}