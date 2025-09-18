/**
 * Rate Limiting Storage Layer
 * Provides in-memory storage with Redis fallback for production scaling
 */

import { RATE_LIMIT_CONFIG, STORAGE_KEYS } from './rate-limit-config';

// In-memory storage interface
interface MemoryStorageEntry {
  value: number;
  expiry: number;
  window?: number[];
}

// Redis client type (if using Redis)
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ex?: number): Promise<string>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  del(key: string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zremrangebyscore(key: string, min: string, max: string): Promise<number>;
  zcard(key: string): Promise<number>;
}

// In-memory storage implementation
class MemoryStorage {
  private storage = new Map<string, MemoryStorageEntry>();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Clean up expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (entry.expiry < now) {
        this.storage.delete(key);
      }
    }
  }
  
  async get(key: string): Promise<string | null> {
    const entry = this.storage.get(key);
    if (!entry || entry.expiry < Date.now()) {
      this.storage.delete(key);
      return null;
    }
    return entry.value.toString();
  }
  
  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + (ttl * 1000) : Date.now() + 3600000; // Default 1 hour
    this.storage.set(key, {
      value: parseInt(value),
      expiry
    });
  }
  
  async incr(key: string, ttl?: number): Promise<number> {
    const entry = this.storage.get(key);
    const now = Date.now();
    
    if (!entry || entry.expiry < now) {
      const expiry = ttl ? now + (ttl * 1000) : now + 3600000;
      this.storage.set(key, { value: 1, expiry });
      return 1;
    }
    
    entry.value++;
    return entry.value;
  }
  
  async del(key: string): Promise<void> {
    this.storage.delete(key);
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.storage.get(key);
    if (entry) {
      entry.expiry = Date.now() + (seconds * 1000);
    }
  }
  
  // Sliding window implementation for memory storage
  async addToSlidingWindow(key: string, timestamp: number, windowSize: number): Promise<number> {
    const entry = this.storage.get(key);
    const now = Date.now();
    const windowStart = now - (windowSize * 1000);
    
    if (!entry) {
      this.storage.set(key, {
        value: 1,
        expiry: now + (windowSize * 1000) + 60000, // Extra buffer
        window: [timestamp]
      });
      return 1;
    }
    
    // Clean old entries
    entry.window = entry.window?.filter(ts => ts > windowStart) || [];
    entry.window.push(timestamp);
    entry.value = entry.window.length;
    
    return entry.value;
  }
  
  async getSlidingWindowCount(key: string, windowSize: number): Promise<number> {
    const entry = this.storage.get(key);
    if (!entry || !entry.window) return 0;
    
    const windowStart = Date.now() - (windowSize * 1000);
    const validEntries = entry.window.filter(ts => ts > windowStart);
    
    // Update the entry
    if (validEntries.length !== entry.window.length) {
      entry.window = validEntries;
      entry.value = validEntries.length;
    }
    
    return entry.value;
  }
  
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.storage.clear();
  }
}

// Redis storage implementation
class RedisStorage {
  private client: RedisClient;
  
  constructor(redisClient: RedisClient) {
    this.client = redisClient;
  }
  
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }
  
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, ttl);
    } else {
      await this.client.set(key, value);
    }
  }
  
  async incr(key: string, ttl?: number): Promise<number> {
    const result = await this.client.incr(key);
    if (ttl && result === 1) {
      await this.client.expire(key, ttl);
    }
    return result;
  }
  
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }
  
  // Sliding window implementation using Redis sorted sets
  async addToSlidingWindow(key: string, timestamp: number, windowSize: number): Promise<number> {
    const now = Date.now();
    const windowStart = now - (windowSize * 1000);
    
    // Remove old entries
    await this.client.zremrangebyscore(key, '0', windowStart.toString());
    
    // Add current timestamp
    await this.client.zadd(key, timestamp, `${timestamp}-${Math.random()}`);
    
    // Set expiry
    await this.client.expire(key, windowSize + 60); // Extra buffer
    
    // Return count
    return await this.client.zcard(key);
  }
  
  async getSlidingWindowCount(key: string, windowSize: number): Promise<number> {
    const now = Date.now();
    const windowStart = now - (windowSize * 1000);
    
    // Clean old entries
    await this.client.zremrangebyscore(key, '0', windowStart.toString());
    
    return await this.client.zcard(key);
  }
}

// Storage interface
interface RateLimitStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  incr(key: string, ttl?: number): Promise<number>;
  del(key: string): Promise<void>;
  expire(key: string, seconds: number): Promise<void>;
  addToSlidingWindow(key: string, timestamp: number, windowSize: number): Promise<number>;
  getSlidingWindowCount(key: string, windowSize: number): Promise<number>;
}

// Global storage instance
let storageInstance: RateLimitStorage | null = null;

/**
 * Initialize rate limiting storage
 */
export async function initializeStorage(): Promise<RateLimitStorage> {
  if (storageInstance) {
    return storageInstance;
  }
  
  if (RATE_LIMIT_CONFIG.storage === 'redis') {
    try {
      // Try to initialize Redis client
      const redisClient = await createRedisClient();
      storageInstance = new RedisStorage(redisClient);
      
      if (RATE_LIMIT_CONFIG.debug) {
        console.log('✅ Rate limiting using Redis storage');
      }
    } catch (error) {
      console.warn('Failed to initialize Redis, falling back to memory storage:', error);
      storageInstance = new MemoryStorage();
    }
  } else {
    storageInstance = new MemoryStorage();
    
    if (RATE_LIMIT_CONFIG.debug) {
      console.log('✅ Rate limiting using memory storage');
    }
  }
  
  return storageInstance;
}

/**
 * Get the current storage instance
 */
export function getStorage(): RateLimitStorage {
  if (!storageInstance) {
    throw new Error('Rate limiting storage not initialized. Call initializeStorage() first.');
  }
  return storageInstance;
}

/**
 * Create Redis client (stub implementation)
 * In production, you would use a proper Redis client like ioredis
 */
async function createRedisClient(): Promise<RedisClient> {
  // This is a stub implementation. In production, you would use:
  // import Redis from 'ioredis';
  // const redis = new Redis(process.env.REDIS_URL);
  
  throw new Error('Redis client not implemented. Using memory storage.');
}

/**
 * Rate limiting data access object
 */
export class RateLimitDAO {
  private storage: RateLimitStorage;
  
  constructor(storage: RateLimitStorage) {
    this.storage = storage;
  }
  
  /**
   * Increment request count for a key
   */
  async incrementRequestCount(key: string, windowSize: number): Promise<number> {
    if (RATE_LIMIT_CONFIG.advanced.slidingWindow) {
      return await this.storage.addToSlidingWindow(key, Date.now(), windowSize);
    } else {
      return await this.storage.incr(STORAGE_KEYS.REQUEST_COUNT(key), windowSize);
    }
  }
  
  /**
   * Get current request count for a key
   */
  async getRequestCount(key: string, windowSize?: number): Promise<number> {
    if (RATE_LIMIT_CONFIG.advanced.slidingWindow && windowSize) {
      return await this.storage.getSlidingWindowCount(STORAGE_KEYS.SLIDING_WINDOW(key), windowSize);
    } else {
      const count = await this.storage.get(STORAGE_KEYS.REQUEST_COUNT(key));
      return count ? parseInt(count) : 0;
    }
  }
  
  /**
   * Add penalty for a key
   */
  async addPenalty(key: string, penaltySeconds: number): Promise<void> {
    const currentPenalty = await this.getPenalty(key);
    const newPenalty = Math.min(
      currentPenalty + penaltySeconds,
      RATE_LIMIT_CONFIG.penalties.maxPenalty
    );
    
    await this.storage.set(
      STORAGE_KEYS.PENALTY(key), 
      newPenalty.toString(), 
      newPenalty
    );
  }
  
  /**
   * Get current penalty for a key
   */
  async getPenalty(key: string): Promise<number> {
    const penalty = await this.storage.get(STORAGE_KEYS.PENALTY(key));
    return penalty ? parseInt(penalty) : 0;
  }
  
  /**
   * Block a key for a specific duration
   */
  async blockKey(key: string, durationSeconds: number, reason?: string): Promise<void> {
    const blockData = {
      reason: reason || 'Rate limit exceeded',
      blockedAt: Date.now(),
      expiresAt: Date.now() + (durationSeconds * 1000)
    };
    
    await this.storage.set(
      STORAGE_KEYS.BLOCK(key),
      JSON.stringify(blockData),
      durationSeconds
    );
  }
  
  /**
   * Check if a key is blocked
   */
  async isBlocked(key: string): Promise<{blocked: boolean; reason?: string; expiresAt?: number}> {
    const blockData = await this.storage.get(STORAGE_KEYS.BLOCK(key));
    if (!blockData) {
      return { blocked: false };
    }
    
    try {
      const parsed = JSON.parse(blockData);
      return {
        blocked: true,
        reason: parsed.reason,
        expiresAt: parsed.expiresAt
      };
    } catch {
      return { blocked: false };
    }
  }
  
  /**
   * Record a violation
   */
  async recordViolation(key: string): Promise<number> {
    const violationCount = await this.storage.incr(
      STORAGE_KEYS.VIOLATIONS(key),
      RATE_LIMIT_CONFIG.penalties.autoBlockDuration
    );
    
    // Auto-block if threshold exceeded
    if (RATE_LIMIT_CONFIG.advanced.autoBlocking && 
        violationCount >= RATE_LIMIT_CONFIG.penalties.autoBlockThreshold) {
      await this.blockKey(
        key,
        RATE_LIMIT_CONFIG.penalties.autoBlockDuration,
        `Auto-blocked after ${violationCount} violations`
      );
    }
    
    return violationCount;
  }
  
  /**
   * Get violation count
   */
  async getViolationCount(key: string): Promise<number> {
    const count = await this.storage.get(STORAGE_KEYS.VIOLATIONS(key));
    return count ? parseInt(count) : 0;
  }
  
  /**
   * Mark IP as honeypot trigger
   */
  async markHoneypotTrigger(ip: string): Promise<void> {
    await this.storage.set(
      STORAGE_KEYS.HONEYPOT(ip),
      Date.now().toString(),
      RATE_LIMIT_CONFIG.penalties.autoBlockDuration
    );
  }
  
  /**
   * Check if IP triggered honeypot
   */
  async isHoneypotTrigger(ip: string): Promise<boolean> {
    const trigger = await this.storage.get(STORAGE_KEYS.HONEYPOT(ip));
    return trigger !== null;
  }
  
  /**
   * Mark IP as suspicious
   */
  async markSuspicious(ip: string, reason: string): Promise<void> {
    const suspiciousData = {
      reason,
      markedAt: Date.now(),
      count: (await this.getSuspiciousCount(ip)) + 1
    };
    
    await this.storage.set(
      STORAGE_KEYS.SUSPICIOUS(ip),
      JSON.stringify(suspiciousData),
      3600 // 1 hour
    );
  }
  
  /**
   * Get suspicious activity count
   */
  async getSuspiciousCount(ip: string): Promise<number> {
    const data = await this.storage.get(STORAGE_KEYS.SUSPICIOUS(ip));
    if (!data) return 0;
    
    try {
      const parsed = JSON.parse(data);
      return parsed.count || 0;
    } catch {
      return 0;
    }
  }
  
  /**
   * Clear all data for a key (admin function)
   */
  async clearKey(key: string): Promise<void> {
    const keysToDelete = [
      STORAGE_KEYS.REQUEST_COUNT(key),
      STORAGE_KEYS.PENALTY(key),
      STORAGE_KEYS.BLOCK(key),
      STORAGE_KEYS.VIOLATIONS(key),
      STORAGE_KEYS.SLIDING_WINDOW(key),
      STORAGE_KEYS.HONEYPOT(key),
      STORAGE_KEYS.SUSPICIOUS(key)
    ];
    
    for (const keyToDelete of keysToDelete) {
      await this.storage.del(keyToDelete);
    }
  }
}

/**
 * Create rate limit DAO instance
 */
export async function createRateLimitDAO(): Promise<RateLimitDAO> {
  const storage = await initializeStorage();
  return new RateLimitDAO(storage);
}

/**
 * Cleanup storage on process exit
 */
process.on('beforeExit', () => {
  if (storageInstance && storageInstance instanceof MemoryStorage) {
    (storageInstance as any).destroy();
  }
});