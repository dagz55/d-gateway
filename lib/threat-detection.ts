/**
 * Advanced Threat Detection Algorithms
 * Real-time threat detection and behavioral analysis for the Zignal authentication system
 */

import { NextRequest } from 'next/server';
import { 
  SecurityEvent, 
  SecurityEventType, 
  ThreatPattern,
  SecurityEventSeverity,
  SecurityEventMetadata,
  THREAT_SCORE_WEIGHTS 
} from './security-events';
import { extractClientIP } from './ip-utils';
import { securityLogger } from './security-logger';

/**
 * Threat Detection Engine
 */
export class ThreatDetectionEngine {
  private static instance: ThreatDetectionEngine;
  private threatPatterns: Map<string, ThreatPattern> = new Map();
  private suspiciousIPs: Map<string, SuspiciousIPInfo> = new Map();
  private userSessions: Map<string, UserSessionInfo> = new Map();
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map();
  
  // Detection thresholds and configuration
  private readonly config = {
    bruteForce: {
      maxAttempts: 5,
      timeWindow: 300000, // 5 minutes
      blockDuration: 3600000, // 1 hour
    },
    credentialStuffing: {
      maxAttempts: 10,
      timeWindow: 600000, // 10 minutes
      crossUserThreshold: 5,
    },
    velocityAttack: {
      maxRequestsPerMinute: 60,
      maxLoginsPerMinute: 10,
      timeWindow: 60000, // 1 minute
    },
    sessionAnomaly: {
      maxConcurrentSessions: 3,
      deviceChangeThreshold: 2,
      locationChangeThreshold: 1,
    },
    behaviorAnalysis: {
      learningPeriod: 2592000000, // 30 days
      anomalyThreshold: 0.7,
      minimumDataPoints: 10,
    },
  };

  private constructor() {
    this.initializeThreatPatterns();
    this.startCleanupProcess();
  }

  public static getInstance(): ThreatDetectionEngine {
    if (!ThreatDetectionEngine.instance) {
      ThreatDetectionEngine.instance = new ThreatDetectionEngine();
    }
    return ThreatDetectionEngine.instance;
  }

  /**
   * Analyze a security event for threats
   */
  public async analyzeEvent(event: SecurityEvent, request?: NextRequest): Promise<ThreatAnalysisResult> {
    const analysis: ThreatAnalysisResult = {
      eventId: event.id,
      threats: [],
      riskScore: event.threatScore,
      recommendations: [],
      actions: [],
      confidence: 0.5,
    };

    try {
      // Run all threat detection algorithms
      await Promise.all([
        this.detectBruteForce(event, analysis),
        this.detectCredentialStuffing(event, analysis),
        this.detectVelocityAttack(event, analysis),
        this.detectSessionAnomalies(event, analysis),
        this.detectBehaviorAnomalies(event, analysis),
        this.detectSuspiciousPatterns(event, analysis),
        this.detectAutomatedAttacks(event, analysis),
        this.detectAccountEnumeration(event, analysis),
      ]);

      // Calculate final risk score and confidence
      analysis.riskScore = this.calculateFinalRiskScore(analysis);
      analysis.confidence = this.calculateConfidence(analysis);

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

      // Determine required actions
      analysis.actions = this.determineActions(analysis);

      return analysis;
    } catch (error) {
      console.error('Threat analysis error:', error);
      return analysis;
    }
  }

  /**
   * Brute Force Attack Detection
   */
  private async detectBruteForce(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    if (event.eventType !== 'auth_login_failure') return;

    const ipAddress = event.ipAddress;
    const currentTime = new Date(event.timestamp).getTime();
    
    // Get or create suspicious IP info
    let ipInfo = this.suspiciousIPs.get(ipAddress);
    if (!ipInfo) {
      ipInfo = {
        ipAddress,
        failedAttempts: [],
        firstSeen: currentTime,
        lastSeen: currentTime,
        userTargets: new Set(),
        threatScore: 0,
        blocked: false,
      };
      this.suspiciousIPs.set(ipAddress, ipInfo);
    }

    // Update IP info
    ipInfo.lastSeen = currentTime;
    ipInfo.failedAttempts.push(currentTime);
    if (event.userId) {
      ipInfo.userTargets.add(event.userId);
    }

    // Clean old attempts
    ipInfo.failedAttempts = ipInfo.failedAttempts.filter(
      time => currentTime - time < this.config.bruteForce.timeWindow
    );

    // Check for brute force
    if (ipInfo.failedAttempts.length >= this.config.bruteForce.maxAttempts) {
      const threat: DetectedThreat = {
        type: 'brute_force',
        severity: 'high',
        confidence: 0.9,
        description: `Brute force attack detected from ${ipAddress}`,
        evidence: {
          failedAttempts: ipInfo.failedAttempts.length,
          timeWindow: this.config.bruteForce.timeWindow,
          targetUsers: Array.from(ipInfo.userTargets),
        },
        riskScore: THREAT_SCORE_WEIGHTS.BRUTE_FORCE,
      };

      analysis.threats.push(threat);
      
      // Log threat event
      await securityLogger.logEvent('threat_brute_force_detected', {
        message: threat.description,
        metadata: {
          ipAddress,
          failedAttempts: ipInfo.failedAttempts.length,
          targetUsers: Array.from(ipInfo.userTargets),
          timeWindow: this.config.bruteForce.timeWindow,
        },
        correlationId: event.correlationId,
        parentEventId: event.id,
      });

      // Mark IP as blocked
      ipInfo.blocked = true;
      ipInfo.threatScore = Math.min(ipInfo.threatScore + threat.riskScore, 100);
    }
  }

  /**
   * Credential Stuffing Detection
   */
  private async detectCredentialStuffing(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    if (event.eventType !== 'auth_login_failure') return;

    const ipAddress = event.ipAddress;
    const currentTime = new Date(event.timestamp).getTime();
    
    const ipInfo = this.suspiciousIPs.get(ipAddress);
    if (!ipInfo) return;

    // Check for multiple user targets (characteristic of credential stuffing)
    if (ipInfo.userTargets.size >= this.config.credentialStuffing.crossUserThreshold) {
      const recentFailures = ipInfo.failedAttempts.filter(
        time => currentTime - time < this.config.credentialStuffing.timeWindow
      );

      if (recentFailures.length >= this.config.credentialStuffing.maxAttempts) {
        const threat: DetectedThreat = {
          type: 'credential_stuffing',
          severity: 'high',
          confidence: 0.85,
          description: `Credential stuffing attack detected from ${ipAddress}`,
          evidence: {
            targetUsers: Array.from(ipInfo.userTargets),
            attemptCount: recentFailures.length,
            timeWindow: this.config.credentialStuffing.timeWindow,
          },
          riskScore: THREAT_SCORE_WEIGHTS.CREDENTIAL_STUFFING,
        };

        analysis.threats.push(threat);

        await securityLogger.logEvent('threat_credential_stuffing', {
          message: threat.description,
          metadata: threat.evidence,
          correlationId: event.correlationId,
          parentEventId: event.id,
        });
      }
    }
  }

  /**
   * Velocity Attack Detection
   */
  private async detectVelocityAttack(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    const ipAddress = event.ipAddress;
    const currentTime = new Date(event.timestamp).getTime();
    
    const ipInfo = this.suspiciousIPs.get(ipAddress);
    if (!ipInfo) return;

    // Check request velocity
    const recentRequests = ipInfo.failedAttempts.filter(
      time => currentTime - time < this.config.velocityAttack.timeWindow
    );

    const requestsPerMinute = recentRequests.length;
    const maxAllowed = event.eventType.includes('login') ? 
      this.config.velocityAttack.maxLoginsPerMinute : 
      this.config.velocityAttack.maxRequestsPerMinute;

    if (requestsPerMinute > maxAllowed) {
      const threat: DetectedThreat = {
        type: 'velocity_attack',
        severity: 'medium',
        confidence: 0.8,
        description: `High velocity attack detected from ${ipAddress}`,
        evidence: {
          requestsPerMinute,
          threshold: maxAllowed,
          eventType: event.eventType,
        },
        riskScore: THREAT_SCORE_WEIGHTS.VELOCITY_ATTACK,
      };

      analysis.threats.push(threat);

      await securityLogger.logEvent('threat_velocity_attack', {
        message: threat.description,
        metadata: threat.evidence,
        correlationId: event.correlationId,
        parentEventId: event.id,
      });
    }
  }

  /**
   * Session Anomaly Detection
   */
  private async detectSessionAnomalies(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    if (!event.userId || !event.sessionId) return;

    const userId = event.userId;
    const sessionId = event.sessionId;
    
    // Get or create user session info
    let userInfo = this.userSessions.get(userId);
    if (!userInfo) {
      userInfo = {
        userId,
        activeSessions: new Map(),
        recentDeviceChanges: [],
        recentLocationChanges: [],
        lastActivity: new Date(event.timestamp).getTime(),
      };
      this.userSessions.set(userId, userInfo);
    }

    const currentTime = new Date(event.timestamp).getTime();
    userInfo.lastActivity = currentTime;

    // Track session info
    if (!userInfo.activeSessions.has(sessionId)) {
      userInfo.activeSessions.set(sessionId, {
        sessionId,
        createdAt: currentTime,
        lastActivity: currentTime,
        deviceFingerprint: event.deviceFingerprint?.fingerprint,
        ipAddress: event.ipAddress,
        geolocation: event.geolocation,
      });
    }

    // Check for concurrent session anomalies
    if (userInfo.activeSessions.size > this.config.sessionAnomaly.maxConcurrentSessions) {
      const threat: DetectedThreat = {
        type: 'concurrent_sessions',
        severity: 'medium',
        confidence: 0.7,
        description: `Suspicious concurrent sessions for user ${userId}`,
        evidence: {
          activeSessions: userInfo.activeSessions.size,
          threshold: this.config.sessionAnomaly.maxConcurrentSessions,
          sessionIds: Array.from(userInfo.activeSessions.keys()),
        },
        riskScore: THREAT_SCORE_WEIGHTS.SESSION_ANOMALY,
      };

      analysis.threats.push(threat);
    }

    // Detect rapid device/location changes
    if (event.eventType === 'session_device_change') {
      userInfo.recentDeviceChanges.push(currentTime);
      userInfo.recentDeviceChanges = userInfo.recentDeviceChanges.filter(
        time => currentTime - time < 300000 // 5 minutes
      );

      if (userInfo.recentDeviceChanges.length > this.config.sessionAnomaly.deviceChangeThreshold) {
        const threat: DetectedThreat = {
          type: 'rapid_device_changes',
          severity: 'high',
          confidence: 0.85,
          description: `Rapid device changes detected for user ${userId}`,
          evidence: {
            changeCount: userInfo.recentDeviceChanges.length,
            timeWindow: 300000,
          },
          riskScore: THREAT_SCORE_WEIGHTS.DEVICE_CHANGE * 3,
        };

        analysis.threats.push(threat);

        await securityLogger.logEvent('auth_session_hijack_detected', {
          message: threat.description,
          metadata: threat.evidence,
          correlationId: event.correlationId,
          parentEventId: event.id,
        });
      }
    }
  }

  /**
   * Behavioral Anomaly Detection
   */
  private async detectBehaviorAnomalies(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    if (!event.userId) return;

    const userId = event.userId;
    const currentTime = new Date(event.timestamp).getTime();
    
    // Get or create behavior profile
    let profile = this.behaviorProfiles.get(userId);
    if (!profile) {
      profile = {
        userId,
        createdAt: currentTime,
        lastUpdated: currentTime,
        loginPatterns: {
          typicalHours: [],
          typicalDays: [],
          averageSessionDuration: 0,
          totalSessions: 0,
        },
        devicePatterns: {
          knownDevices: [],
          typicalUserAgents: [],
        },
        locationPatterns: {
          typicalCountries: [],
          typicalCities: [],
          typicalTimezones: [],
        },
        riskFactors: [],
        anomalyScore: 0,
      };
      this.behaviorProfiles.set(userId, profile);
    }

    // Update profile
    this.updateBehaviorProfile(profile, event);

    // Analyze for anomalies
    const anomalies = this.analyzeBehaviorAnomalies(profile, event);
    
    if (anomalies.length > 0) {
      const threat: DetectedThreat = {
        type: 'behavior_anomaly',
        severity: this.calculateAnomalySeverity(anomalies),
        confidence: this.calculateAnomalyConfidence(profile, anomalies),
        description: `Behavioral anomalies detected for user ${userId}`,
        evidence: {
          anomalies,
          profileAge: currentTime - profile.createdAt,
          totalSessions: profile.loginPatterns.totalSessions,
        },
        riskScore: THREAT_SCORE_WEIGHTS.MULTIPLE_FAILURES,
      };

      analysis.threats.push(threat);

      await securityLogger.logEvent('threat_anomalous_behavior', {
        message: threat.description,
        metadata: threat.evidence,
        correlationId: event.correlationId,
        parentEventId: event.id,
      });
    }
  }

  /**
   * Suspicious Pattern Detection
   */
  private async detectSuspiciousPatterns(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    const patterns = this.checkEventPatterns(event);
    
    for (const pattern of patterns) {
      if (await this.evaluatePattern(pattern, event)) {
        const threat: DetectedThreat = {
          type: 'suspicious_pattern',
          severity: pattern.severity,
          confidence: 0.75,
          description: `Suspicious pattern detected: ${pattern.name}`,
          evidence: {
            patternName: pattern.name,
            patternDescription: pattern.description,
            matchedConditions: pattern.conditions.length,
          },
          riskScore: this.getPatternRiskScore(pattern.name),
        };

        analysis.threats.push(threat);

        await securityLogger.logEvent('security_policy_violation', {
          message: threat.description,
          metadata: threat.evidence,
          correlationId: event.correlationId,
          parentEventId: event.id,
        });
      }
    }
  }

  /**
   * Automated Attack Detection
   */
  private async detectAutomatedAttacks(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    if (!event.userAgent) return;

    const automationIndicators = [
      /curl/i, /wget/i, /python/i, /requests/i, /http/i,
      /bot/i, /crawler/i, /spider/i, /scraper/i, /automated/i,
      /headless/i, /phantom/i, /selenium/i, /webdriver/i
    ];

    const isAutomated = automationIndicators.some(pattern => 
      pattern.test(event.userAgent)
    );

    if (isAutomated) {
      const threat: DetectedThreat = {
        type: 'automated_attack',
        severity: 'medium',
        confidence: 0.8,
        description: 'Automated tool detected',
        evidence: {
          userAgent: event.userAgent,
          patterns: automationIndicators.filter(p => p.test(event.userAgent)).map(p => p.source),
        },
        riskScore: THREAT_SCORE_WEIGHTS.BOT_DETECTION,
      };

      analysis.threats.push(threat);

      await securityLogger.logEvent('threat_suspicious_automation', {
        message: threat.description,
        metadata: threat.evidence,
        correlationId: event.correlationId,
        parentEventId: event.id,
      });
    }
  }

  /**
   * Account Enumeration Detection
   */
  private async detectAccountEnumeration(event: SecurityEvent, analysis: ThreatAnalysisResult): Promise<void> {
    if (event.eventType !== 'auth_login_failure') return;

    const ipAddress = event.ipAddress;
    const ipInfo = this.suspiciousIPs.get(ipAddress);
    
    if (ipInfo && ipInfo.userTargets.size >= 10) {
      // Large number of different user targets suggests enumeration
      const threat: DetectedThreat = {
        type: 'account_enumeration',
        severity: 'medium',
        confidence: 0.7,
        description: `Account enumeration detected from ${ipAddress}`,
        evidence: {
          targetCount: ipInfo.userTargets.size,
          attemptCount: ipInfo.failedAttempts.length,
        },
        riskScore: THREAT_SCORE_WEIGHTS.FAILED_LOGIN * 2,
      };

      analysis.threats.push(threat);

      await securityLogger.logEvent('threat_account_enumeration', {
        message: threat.description,
        metadata: threat.evidence,
        correlationId: event.correlationId,
        parentEventId: event.id,
      });
    }
  }

  /**
   * Helper Methods
   */
  private initializeThreatPatterns(): void {
    // Initialize common threat patterns
    const patterns: ThreatPattern[] = [
      {
        id: 'rapid_login_failures',
        name: 'Rapid Login Failures',
        description: 'Multiple rapid login failures from same IP',
        severity: 'high',
        conditions: [
          {
            eventType: 'auth_login_failure',
            threshold: 5,
            timeWindow: 300000, // 5 minutes
          }
        ],
        actions: [
          { type: 'alert', config: { severity: 'high' } },
          { type: 'block', config: { duration: 3600000 } },
        ],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more patterns as needed
    ];

    patterns.forEach(pattern => {
      this.threatPatterns.set(pattern.id, pattern);
    });
  }

  private updateBehaviorProfile(profile: UserBehaviorProfile, event: SecurityEvent): void {
    const currentTime = new Date(event.timestamp);
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    // Update login patterns
    if (event.eventType === 'auth_login_success') {
      if (!profile.loginPatterns.typicalHours.includes(hour)) {
        profile.loginPatterns.typicalHours.push(hour);
      }
      if (!profile.loginPatterns.typicalDays.includes(day)) {
        profile.loginPatterns.typicalDays.push(day);
      }
      profile.loginPatterns.totalSessions++;
    }

    // Update device patterns
    if (event.deviceFingerprint?.fingerprint) {
      const exists = profile.devicePatterns.knownDevices.some(
        device => device.fingerprint === event.deviceFingerprint?.fingerprint
      );
      if (!exists) {
        profile.devicePatterns.knownDevices.push({
          fingerprint: event.deviceFingerprint.fingerprint,
          firstSeen: event.timestamp,
          lastSeen: event.timestamp,
          userAgent: event.userAgent,
        });
      }
    }

    // Update location patterns
    if (event.geolocation) {
      if (event.geolocation.country && 
          !profile.locationPatterns.typicalCountries.includes(event.geolocation.country)) {
        profile.locationPatterns.typicalCountries.push(event.geolocation.country);
      }
      if (event.geolocation.city && 
          !profile.locationPatterns.typicalCities.includes(event.geolocation.city)) {
        profile.locationPatterns.typicalCities.push(event.geolocation.city);
      }
    }

    profile.lastUpdated = new Date(event.timestamp).getTime();
  }

  private analyzeBehaviorAnomalies(profile: UserBehaviorProfile, event: SecurityEvent): string[] {
    const anomalies: string[] = [];
    const currentTime = new Date(event.timestamp);
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    // Check time anomalies
    if (profile.loginPatterns.typicalHours.length > 0 && 
        !profile.loginPatterns.typicalHours.includes(hour)) {
      anomalies.push('unusual_hour');
    }

    if (profile.loginPatterns.typicalDays.length > 0 && 
        !profile.loginPatterns.typicalDays.includes(day)) {
      anomalies.push('unusual_day');
    }

    // Check device anomalies
    if (event.deviceFingerprint?.fingerprint) {
      const isKnownDevice = profile.devicePatterns.knownDevices.some(
        device => device.fingerprint === event.deviceFingerprint?.fingerprint
      );
      if (!isKnownDevice && profile.devicePatterns.knownDevices.length > 0) {
        anomalies.push('unknown_device');
      }
    }

    // Check location anomalies
    if (event.geolocation?.country) {
      if (profile.locationPatterns.typicalCountries.length > 0 &&
          !profile.locationPatterns.typicalCountries.includes(event.geolocation.country)) {
        anomalies.push('unusual_country');
      }
    }

    return anomalies;
  }

  private calculateAnomalySeverity(anomalies: string[]): SecurityEventSeverity {
    if (anomalies.length >= 3) return 'high';
    if (anomalies.length >= 2) return 'medium';
    return 'low';
  }

  private calculateAnomalyConfidence(profile: UserBehaviorProfile, anomalies: string[]): number {
    const profileAge = Date.now() - profile.createdAt;
    const dataPoints = profile.loginPatterns.totalSessions;
    
    // Higher confidence with more data and older profiles
    let confidence = 0.3;
    
    if (profileAge > this.config.behaviorAnalysis.learningPeriod) {
      confidence += 0.3;
    }
    
    if (dataPoints >= this.config.behaviorAnalysis.minimumDataPoints) {
      confidence += 0.2;
    }
    
    confidence += Math.min(anomalies.length * 0.1, 0.3);
    
    return Math.min(confidence, 0.95);
  }

  private checkEventPatterns(event: SecurityEvent): ThreatPattern[] {
    return Array.from(this.threatPatterns.values()).filter(pattern => 
      pattern.enabled && 
      pattern.conditions.some(condition => condition.eventType === event.eventType)
    );
  }

  private async evaluatePattern(pattern: ThreatPattern, event: SecurityEvent): Promise<boolean> {
    // Simplified pattern evaluation - in production, implement full condition checking
    for (const condition of pattern.conditions) {
      if (condition.eventType === event.eventType) {
        // Check if threshold is met (this would require historical data lookup)
        return true; // Simplified for demo
      }
    }
    return false;
  }

  private getPatternRiskScore(patternName: string): number {
    const patternScores: Record<string, number> = {
      'rapid_login_failures': 40,
      'credential_stuffing': 50,
      'brute_force': 60,
      'session_hijacking': 70,
    };
    
    return patternScores[patternName] || 20;
  }

  private calculateFinalRiskScore(analysis: ThreatAnalysisResult): number {
    let totalScore = analysis.riskScore;
    
    analysis.threats.forEach(threat => {
      totalScore += threat.riskScore * threat.confidence;
    });
    
    return Math.min(totalScore, 100);
  }

  private calculateConfidence(analysis: ThreatAnalysisResult): number {
    if (analysis.threats.length === 0) return 0.5;
    
    const avgConfidence = analysis.threats.reduce((sum, threat) => 
      sum + threat.confidence, 0) / analysis.threats.length;
    
    return avgConfidence;
  }

  private generateRecommendations(analysis: ThreatAnalysisResult): string[] {
    const recommendations: string[] = [];
    
    analysis.threats.forEach(threat => {
      switch (threat.type) {
        case 'brute_force':
          recommendations.push('Block IP address temporarily');
          recommendations.push('Implement progressive delays');
          break;
        case 'credential_stuffing':
          recommendations.push('Require MFA for affected accounts');
          recommendations.push('Force password reset for targeted users');
          break;
        case 'behavior_anomaly':
          recommendations.push('Require additional verification');
          recommendations.push('Monitor user activity closely');
          break;
        case 'automated_attack':
          recommendations.push('Implement CAPTCHA challenge');
          recommendations.push('Apply stricter rate limiting');
          break;
      }
    });
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  private determineActions(analysis: ThreatAnalysisResult): ThreatAction[] {
    const actions: ThreatAction[] = [];
    
    analysis.threats.forEach(threat => {
      if (threat.severity === 'critical' || threat.confidence > 0.8) {
        actions.push({
          type: 'block',
          target: 'ip',
          duration: 3600000, // 1 hour
          reason: threat.description,
        });
        
        actions.push({
          type: 'alert',
          target: 'security_team',
          priority: 'high',
          reason: threat.description,
        });
      } else if (threat.severity === 'high') {
        actions.push({
          type: 'monitor',
          target: 'user',
          duration: 1800000, // 30 minutes
          reason: threat.description,
        });
      }
    });
    
    return actions;
  }

  private startCleanupProcess(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000);
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - 86400000; // 24 hours
    
    // Clean suspicious IPs
    for (const [ip, info] of this.suspiciousIPs) {
      if (info.lastSeen < cutoffTime) {
        this.suspiciousIPs.delete(ip);
      }
    }
    
    // Clean user sessions
    for (const [userId, info] of this.userSessions) {
      if (info.lastActivity < cutoffTime) {
        this.userSessions.delete(userId);
      }
    }
  }

  /**
   * Public API
   */
  public getSuspiciousIPs(): SuspiciousIPInfo[] {
    return Array.from(this.suspiciousIPs.values());
  }

  public getUserSessions(): UserSessionInfo[] {
    return Array.from(this.userSessions.values());
  }

  public getBehaviorProfiles(): UserBehaviorProfile[] {
    return Array.from(this.behaviorProfiles.values());
  }

  public addThreatPattern(pattern: ThreatPattern): void {
    this.threatPatterns.set(pattern.id, pattern);
  }

  public removeThreatPattern(patternId: string): void {
    this.threatPatterns.delete(patternId);
  }

  public getThreatPatterns(): ThreatPattern[] {
    return Array.from(this.threatPatterns.values());
  }
}

// Type definitions
interface ThreatAnalysisResult {
  eventId: string;
  threats: DetectedThreat[];
  riskScore: number;
  recommendations: string[];
  actions: ThreatAction[];
  confidence: number;
}

interface DetectedThreat {
  type: string;
  severity: SecurityEventSeverity;
  confidence: number;
  description: string;
  evidence: Record<string, any>;
  riskScore: number;
}

interface ThreatAction {
  type: 'block' | 'monitor' | 'alert' | 'escalate';
  target: 'ip' | 'user' | 'session' | 'security_team';
  duration?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

interface SuspiciousIPInfo {
  ipAddress: string;
  failedAttempts: number[];
  firstSeen: number;
  lastSeen: number;
  userTargets: Set<string>;
  threatScore: number;
  blocked: boolean;
}

interface UserSessionInfo {
  userId: string;
  activeSessions: Map<string, SessionDetails>;
  recentDeviceChanges: number[];
  recentLocationChanges: number[];
  lastActivity: number;
}

interface SessionDetails {
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  deviceFingerprint?: string;
  ipAddress: string;
  geolocation?: any;
}

interface UserBehaviorProfile {
  userId: string;
  createdAt: number;
  lastUpdated: number;
  loginPatterns: {
    typicalHours: number[];
    typicalDays: number[];
    averageSessionDuration: number;
    totalSessions: number;
  };
  devicePatterns: {
    knownDevices: Array<{
      fingerprint: string;
      firstSeen: string;
      lastSeen: string;
      userAgent: string;
    }>;
    typicalUserAgents: string[];
  };
  locationPatterns: {
    typicalCountries: string[];
    typicalCities: string[];
    typicalTimezones: string[];
  };
  riskFactors: string[];
  anomalyScore: number;
}

// Export singleton instance
export const threatDetection = ThreatDetectionEngine.getInstance();

// Convenience function for analyzing events
export const analyzeThreat = threatDetection.analyzeEvent.bind(threatDetection);