import { sessionManager, InvalidationReason, UserSession } from './session-manager';
import { logSecurityEvent } from './session-security';
import { createClient } from '@supabase/supabase-js';

export interface InvalidationOptions {
  excludeCurrentSession?: boolean;
  currentSessionId?: string;
  gracefulShutdown?: boolean;
  notifyUser?: boolean;
  metadata?: Record<string, any>;
}

export interface InvalidationResult {
  success: boolean;
  invalidatedCount: number;
  errors?: string[];
  notificationsSent?: number;
}

export interface SessionInvalidationRule {
  trigger: InvalidationTrigger;
  scope: InvalidationScope;
  graceful: boolean;
  notification: boolean;
  conditions?: InvalidationCondition[];
}

export type InvalidationTrigger = 
  | 'password_change'
  | 'email_change'
  | 'permissions_change'
  | 'security_breach'
  | 'suspicious_activity'
  | 'admin_action'
  | 'device_compromised'
  | 'location_anomaly'
  | 'concurrent_limit_exceeded'
  | 'account_locked'
  | 'token_leaked';

export type InvalidationScope = 
  | 'current_session'
  | 'all_sessions'
  | 'all_except_current'
  | 'device_sessions'
  | 'location_sessions'
  | 'old_sessions'
  | 'untrusted_sessions';

export interface InvalidationCondition {
  type: 'device' | 'location' | 'age' | 'permissions' | 'ip_range';
  value: string | number;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface GracefulInvalidationOptions {
  warningTimeMinutes: number;
  redirectUrl?: string;
  message: string;
  allowExtension?: boolean;
  extensionMinutes?: number;
}

export class SessionInvalidationManager {
  private supabase: any;
  
  // Predefined invalidation rules
  private readonly INVALIDATION_RULES: Record<InvalidationTrigger, SessionInvalidationRule> = {
    password_change: {
      trigger: 'password_change',
      scope: 'all_except_current',
      graceful: true,
      notification: true,
    },
    email_change: {
      trigger: 'email_change',
      scope: 'all_except_current',
      graceful: true,
      notification: true,
    },
    permissions_change: {
      trigger: 'permissions_change',
      scope: 'all_sessions',
      graceful: true,
      notification: true,
    },
    security_breach: {
      trigger: 'security_breach',
      scope: 'all_sessions',
      graceful: false,
      notification: true,
    },
    suspicious_activity: {
      trigger: 'suspicious_activity',
      scope: 'untrusted_sessions',
      graceful: true,
      notification: true,
    },
    admin_action: {
      trigger: 'admin_action',
      scope: 'all_sessions',
      graceful: true,
      notification: true,
    },
    device_compromised: {
      trigger: 'device_compromised',
      scope: 'device_sessions',
      graceful: false,
      notification: true,
    },
    location_anomaly: {
      trigger: 'location_anomaly',
      scope: 'location_sessions',
      graceful: true,
      notification: true,
    },
    concurrent_limit_exceeded: {
      trigger: 'concurrent_limit_exceeded',
      scope: 'old_sessions',
      graceful: true,
      notification: false,
    },
    account_locked: {
      trigger: 'account_locked',
      scope: 'all_sessions',
      graceful: false,
      notification: true,
    },
    token_leaked: {
      trigger: 'token_leaked',
      scope: 'all_sessions',
      graceful: false,
      notification: true,
    },
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Trigger session invalidation based on predefined rules
   */
  async triggerInvalidation(
    userId: string,
    trigger: InvalidationTrigger,
    triggeredBy: string,
    options: InvalidationOptions = {}
  ): Promise<InvalidationResult> {
    const rule = this.INVALIDATION_RULES[trigger];
    
    if (!rule) {
      throw new Error(`Unknown invalidation trigger: ${trigger}`);
    }

    logSecurityEvent('invalidation_triggered', {
      userId,
      trigger,
      triggeredBy,
      scope: rule.scope,
      graceful: rule.graceful,
    });

    try {
      // Get sessions to invalidate based on scope
      const sessionsToInvalidate = await this.getSessionsByScope(
        userId,
        rule.scope,
        options.currentSessionId,
        rule.conditions
      );

      if (sessionsToInvalidate.length === 0) {
        return {
          success: true,
          invalidatedCount: 0,
        };
      }

      // Handle graceful invalidation if required
      if (rule.graceful && options.gracefulShutdown !== false) {
        await this.scheduleGracefulInvalidation(
          userId,
          sessionsToInvalidate,
          trigger,
          triggeredBy
        );
      }

      // Invalidate sessions
      await sessionManager.invalidateSessions(
        userId,
        sessionsToInvalidate.map(s => s.sessionId),
        this.mapTriggerToReason(trigger),
        triggeredBy,
        options.metadata
      );

      // Send notifications if required
      let notificationsSent = 0;
      if (rule.notification && options.notifyUser !== false) {
        notificationsSent = await this.sendInvalidationNotifications(
          userId,
          trigger,
          sessionsToInvalidate.length
        );
      }

      return {
        success: true,
        invalidatedCount: sessionsToInvalidate.length,
        notificationsSent,
      };

    } catch (error) {
      console.error('Session invalidation failed:', error);
      
      logSecurityEvent('invalidation_failed', {
        userId,
        trigger,
        triggeredBy,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        invalidatedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get sessions based on invalidation scope
   */
  private async getSessionsByScope(
    userId: string,
    scope: InvalidationScope,
    currentSessionId?: string,
    conditions?: InvalidationCondition[]
  ): Promise<UserSession[]> {
    const allSessions = await sessionManager.getUserSessions(userId);
    
    let filteredSessions = allSessions;

    // Apply scope filtering
    switch (scope) {
      case 'current_session':
        filteredSessions = currentSessionId 
          ? allSessions.filter(s => s.sessionId === currentSessionId)
          : [];
        break;
        
      case 'all_sessions':
        // No additional filtering needed
        break;
        
      case 'all_except_current':
        filteredSessions = currentSessionId
          ? allSessions.filter(s => s.sessionId !== currentSessionId)
          : allSessions;
        break;
        
      case 'device_sessions':
        // This would be enhanced with specific device ID filtering
        // For now, we'll filter based on metadata
        break;
        
      case 'location_sessions':
        // Filter sessions from suspicious locations
        filteredSessions = allSessions.filter(s => this.isSuspiciousLocation(s));
        break;
        
      case 'old_sessions':
        // Filter sessions older than 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = allSessions.filter(s => 
          new Date(s.createdAt) < sevenDaysAgo
        );
        break;
        
      case 'untrusted_sessions':
        // Filter sessions from untrusted devices or locations
        filteredSessions = allSessions.filter(s => this.isUntrustedSession(s));
        break;
    }

    // Apply additional conditions if provided
    if (conditions && conditions.length > 0) {
      filteredSessions = this.applyInvalidationConditions(filteredSessions, conditions);
    }

    return filteredSessions;
  }

  /**
   * Check if a location is suspicious
   */
  private isSuspiciousLocation(session: UserSession): boolean {
    // Implement location-based suspicious activity detection
    // For now, we'll return false (no suspicious locations)
    return false;
  }

  /**
   * Check if a session is untrusted
   */
  private isUntrustedSession(session: UserSession): boolean {
    // Check if device is trusted, location is known, etc.
    // For now, we'll check if the device was recently created
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(session.createdAt) > oneDayAgo;
  }

  /**
   * Apply additional invalidation conditions
   */
  private applyInvalidationConditions(
    sessions: UserSession[],
    conditions: InvalidationCondition[]
  ): UserSession[] {
    return sessions.filter(session => {
      return conditions.every(condition => {
        switch (condition.type) {
          case 'device':
            return this.checkCondition(session.deviceId, condition);
          case 'location':
            return this.checkCondition(session.location.country || '', condition);
          case 'age':
            const ageHours = (Date.now() - new Date(session.createdAt).getTime()) / (60 * 60 * 1000);
            return this.checkCondition(ageHours, condition);
          case 'permissions':
            return this.checkCondition(session.permissions?.join(',') || '', condition);
          case 'ip_range':
            return this.checkCondition(session.ipAddress, condition);
          default:
            return true;
        }
      });
    });
  }

  /**
   * Check a single condition
   */
  private checkCondition(
    sessionValue: string | number,
    condition: InvalidationCondition
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return sessionValue === condition.value;
      case 'not_equals':
        return sessionValue !== condition.value;
      case 'greater_than':
        return typeof sessionValue === 'number' && sessionValue > (condition.value as number);
      case 'less_than':
        return typeof sessionValue === 'number' && sessionValue < (condition.value as number);
      case 'contains':
        return typeof sessionValue === 'string' && 
               sessionValue.toLowerCase().includes((condition.value as string).toLowerCase());
      default:
        return true;
    }
  }

  /**
   * Schedule graceful invalidation with warning
   */
  private async scheduleGracefulInvalidation(
    userId: string,
    sessions: UserSession[],
    trigger: InvalidationTrigger,
    triggeredBy: string
  ): Promise<void> {
    const gracefulOptions: GracefulInvalidationOptions = {
      warningTimeMinutes: 5,
      message: this.getGracefulInvalidationMessage(trigger),
      redirectUrl: '/auth/login',
      allowExtension: false,
    };

    // Store graceful invalidation schedule
    const scheduleData = {
      user_id: userId,
      session_ids: sessions.map(s => s.sessionId),
      trigger: trigger,
      triggered_by: triggeredBy,
      warning_time_minutes: gracefulOptions.warningTimeMinutes,
      message: gracefulOptions.message,
      redirect_url: gracefulOptions.redirectUrl,
      allow_extension: gracefulOptions.allowExtension,
      scheduled_at: new Date().toISOString(),
      execute_at: new Date(Date.now() + gracefulOptions.warningTimeMinutes * 60 * 1000).toISOString(),
      status: 'scheduled',
    };

    await this.supabase
      .from('graceful_invalidation_schedule')
      .insert(scheduleData);

    logSecurityEvent('graceful_invalidation_scheduled', {
      userId,
      sessionCount: sessions.length,
      trigger,
      executeAt: scheduleData.execute_at,
    });
  }

  /**
   * Get user-friendly message for graceful invalidation
   */
  private getGracefulInvalidationMessage(trigger: InvalidationTrigger): string {
    const messages: Record<InvalidationTrigger, string> = {
      password_change: 'Your password has been changed. You will be logged out of other devices in 5 minutes for security.',
      email_change: 'Your email has been changed. You will be logged out of all devices in 5 minutes for security.',
      permissions_change: 'Your account permissions have been updated. Please log in again to continue.',
      security_breach: 'Suspicious activity detected. Logging out immediately for your security.',
      suspicious_activity: 'Unusual activity detected on your account. Some sessions will be terminated.',
      admin_action: 'An administrator has requested to log you out. You will be disconnected in 5 minutes.',
      device_compromised: 'One of your devices may be compromised. Logging out immediately.',
      location_anomaly: 'Login from an unusual location detected. Some sessions will be terminated.',
      concurrent_limit_exceeded: 'Too many active sessions. Oldest sessions will be terminated.',
      account_locked: 'Your account has been locked. Logging out immediately.',
      token_leaked: 'A security token may have been compromised. Logging out immediately.',
    };

    return messages[trigger] || 'You will be logged out for security reasons.';
  }

  /**
   * Send invalidation notifications to user
   */
  private async sendInvalidationNotifications(
    userId: string,
    trigger: InvalidationTrigger,
    sessionCount: number
  ): Promise<number> {
    try {
      // Get user profile for notification details
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('email, first_name, notification_preferences')
        .eq('user_id', userId)
        .single();

      if (!profile || !profile.email) {
        return 0;
      }

      // Create notification record
      const notification = {
        user_id: userId,
        type: 'session_invalidation',
        title: this.getNotificationTitle(trigger),
        message: this.getNotificationMessage(trigger, sessionCount),
        data: {
          trigger,
          sessionCount,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        read: false,
      };

      await this.supabase
        .from('user_notifications')
        .insert(notification);

      // Send email notification if enabled
      if (profile.notification_preferences?.email_security !== false) {
        await this.sendEmailNotification(profile.email, notification);
      }

      return 1;
    } catch (error) {
      console.error('Failed to send invalidation notification:', error);
      return 0;
    }
  }

  /**
   * Get notification title based on trigger
   */
  private getNotificationTitle(trigger: InvalidationTrigger): string {
    const titles: Record<InvalidationTrigger, string> = {
      password_change: 'Password Changed - Security Logout',
      email_change: 'Email Changed - Security Logout',
      permissions_change: 'Account Permissions Updated',
      security_breach: 'Security Alert - Immediate Logout',
      suspicious_activity: 'Suspicious Activity Detected',
      admin_action: 'Administrative Action - Logout Required',
      device_compromised: 'Device Security Alert',
      location_anomaly: 'Unusual Login Location',
      concurrent_limit_exceeded: 'Session Limit Reached',
      account_locked: 'Account Locked',
      token_leaked: 'Security Token Compromised',
    };

    return titles[trigger] || 'Security Action Required';
  }

  /**
   * Get notification message based on trigger
   */
  private getNotificationMessage(trigger: InvalidationTrigger, sessionCount: number): string {
    const sessionText = sessionCount === 1 ? 'session' : 'sessions';
    
    const messages: Record<InvalidationTrigger, string> = {
      password_change: `Your password was changed and ${sessionCount} ${sessionText} were logged out for security.`,
      email_change: `Your email was changed and ${sessionCount} ${sessionText} were logged out for security.`,
      permissions_change: `Your account permissions were updated and ${sessionCount} ${sessionText} were logged out.`,
      security_breach: `A security breach was detected and ${sessionCount} ${sessionText} were immediately logged out.`,
      suspicious_activity: `Suspicious activity was detected and ${sessionCount} ${sessionText} were logged out.`,
      admin_action: `An administrator logged out ${sessionCount} ${sessionText} from your account.`,
      device_compromised: `A compromised device was detected and related ${sessionText} were logged out.`,
      location_anomaly: `An unusual login location was detected and ${sessionCount} ${sessionText} were logged out.`,
      concurrent_limit_exceeded: `Session limit exceeded and ${sessionCount} older ${sessionText} were logged out.`,
      account_locked: `Your account was locked and all ${sessionText} were logged out.`,
      token_leaked: `A security token was compromised and ${sessionCount} ${sessionText} were logged out.`,
    };

    return messages[trigger] || `${sessionCount} ${sessionText} were logged out for security reasons.`;
  }

  /**
   * Send email notification (placeholder implementation)
   */
  private async sendEmailNotification(email: string, notification: any): Promise<void> {
    // In production, integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`Email notification would be sent to ${email}:`, notification);
  }

  /**
   * Map invalidation trigger to session manager reason
   */
  private mapTriggerToReason(trigger: InvalidationTrigger): InvalidationReason {
    const mapping: Record<InvalidationTrigger, InvalidationReason> = {
      password_change: 'password_change',
      email_change: 'password_change', // Treat email change as password-level security event
      permissions_change: 'permission_change',
      security_breach: 'security_breach',
      suspicious_activity: 'suspicious_activity',
      admin_action: 'admin_action',
      device_compromised: 'device_change',
      location_anomaly: 'location_change',
      concurrent_limit_exceeded: 'max_sessions_exceeded',
      account_locked: 'account_locked',
      token_leaked: 'token_compromised',
    };

    return mapping[trigger] || 'admin_action';
  }

  /**
   * Process scheduled graceful invalidations
   */
  async processScheduledInvalidations(): Promise<number> {
    const now = new Date().toISOString();
    
    const { data: scheduledInvalidations } = await this.supabase
      .from('graceful_invalidation_schedule')
      .select('*')
      .eq('status', 'scheduled')
      .lte('execute_at', now);

    if (!scheduledInvalidations || scheduledInvalidations.length === 0) {
      return 0;
    }

    let processedCount = 0;

    for (const scheduled of scheduledInvalidations) {
      try {
        // Execute the invalidation
        await sessionManager.invalidateSessions(
          scheduled.user_id,
          scheduled.session_ids,
          this.mapTriggerToReason(scheduled.trigger),
          scheduled.triggered_by
        );

        // Mark as executed
        await this.supabase
          .from('graceful_invalidation_schedule')
          .update({
            status: 'executed',
            executed_at: new Date().toISOString(),
          })
          .eq('id', scheduled.id);

        processedCount++;
      } catch (error) {
        console.error('Failed to process scheduled invalidation:', error);
        
        // Mark as failed
        await this.supabase
          .from('graceful_invalidation_schedule')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', scheduled.id);
      }
    }

    return processedCount;
  }
}

// Export singleton instance
export const sessionInvalidationManager = new SessionInvalidationManager();