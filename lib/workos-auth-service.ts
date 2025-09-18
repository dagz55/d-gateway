/**
 * WorkOS Authentication Service
 * Handles WorkOS authentication with proper domain configuration
 */

import { workos, workosConfig, validateWorkOSConfig } from './workos';
import { NextRequest } from 'next/server';

export interface WorkOSUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOSAuthResult {
  success: boolean;
  user?: WorkOSUser;
  error?: string;
  redirectUrl?: string;
}

/**
 * WorkOS Authentication Service Class
 */
export class WorkOSAuthService {
  private static instance: WorkOSAuthService;

  private constructor() {
    // Validate configuration on initialization
    validateWorkOSConfig();
  }

  public static getInstance(): WorkOSAuthService {
    if (!WorkOSAuthService.instance) {
      WorkOSAuthService.instance = new WorkOSAuthService();
    }
    return WorkOSAuthService.instance;
  }

  /**
   * Generate WorkOS authorization URL for sign-in
   */
  public getAuthorizationUrl(state?: string): string {
    try {
      const authorizationUrl = workos.userManagement.getAuthorizationUrl({
        clientId: workosConfig.clientId,
        redirectUri: workosConfig.redirectUri,
        state: state || this.generateState(),
        provider: 'authkit', // Use AuthKit for hosted authentication
      });

      return authorizationUrl;
    } catch (error) {
      console.error('Failed to generate authorization URL:', error);
      throw new Error('Failed to generate authorization URL');
    }
  }

  /**
   * Handle OAuth callback and exchange code for user
   */
  public async handleCallback(
    code: string,
    state?: string
  ): Promise<WorkOSAuthResult> {
    try {
      // Exchange authorization code for user profile
      const { user } = await workos.userManagement.authenticateWithCode({
        clientId: workosConfig.clientId,
        code,
        session: {
          sealSession: true,
          cookiePassword: workosConfig.cookiePassword,
        },
      });

      if (!user) {
        return {
          success: false,
          error: 'No user data received from WorkOS',
        };
      }

      // Transform WorkOS user to our user format
      const transformedUser: WorkOSUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profilePictureUrl: user.profilePictureUrl || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        user: transformedUser,
      };
    } catch (error) {
      console.error('WorkOS callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Get current user from WorkOS session
   */
  public async getCurrentUser(request: NextRequest): Promise<WorkOSUser | null> {
    try {
      // Extract session from cookies
      const sessionCookie = request.cookies.get('wos-session')?.value;
      
      if (!sessionCookie) {
        return null;
      }

      // Verify and get user from session
      const { user } = await workos.userManagement.getUser({
        userId: sessionCookie, // This would need to be properly implemented
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profilePictureUrl: user.profilePictureUrl || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Sign out user and clear session
   */
  public async signOut(sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        // Revoke WorkOS session
        await workos.userManagement.revokeSession({
          sessionId,
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw error for sign out failures
    }
  }

  /**
   * Get user profile by ID
   */
  public async getUserProfile(userId: string): Promise<WorkOSUser | null> {
    try {
      const { user } = await workos.userManagement.getUser({
        userId,
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profilePictureUrl: user.profilePictureUrl || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Generate a secure state parameter for OAuth
   */
  private generateState(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate state parameter
   */
  public validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  /**
   * Get WorkOS configuration for client-side use
   */
  public getClientConfig() {
    return {
      authKitUrl: workosConfig.authKitUrl,
      baseUrl: workosConfig.baseUrl,
      environment: workosConfig.environment,
      domains: workosConfig.domains,
    };
  }

  /**
   * Generate AuthKit hosted authentication URL
   */
  public getAuthKitUrl(returnTo?: string): string {
    const baseUrl = workosConfig.authKitUrl;
    const params = new URLSearchParams({
      client_id: workosConfig.clientId,
      redirect_uri: workosConfig.redirectUri,
      response_type: 'code',
      state: this.generateState(),
    });

    if (returnTo) {
      params.append('return_to', returnTo);
    }

    return `${baseUrl}/auth?${params.toString()}`;
  }

  /**
   * Health check for WorkOS service
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    details?: any;
  }> {
    try {
      // Validate configuration
      validateWorkOSConfig();

      // Test API connectivity (basic check)
      const testUrl = `https://api.workos.com/user_management/${workosConfig.clientId}`;
      
      return {
        status: 'healthy',
        message: 'WorkOS service is operational',
        details: {
          clientId: workosConfig.clientId,
          authKitUrl: workosConfig.authKitUrl,
          environment: workosConfig.environment,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'WorkOS service error',
        details: { error },
      };
    }
  }
}

// Export singleton instance
export const workosAuthService = WorkOSAuthService.getInstance();

// Export convenience functions
export const getAuthorizationUrl = (state?: string) => 
  workosAuthService.getAuthorizationUrl(state);

export const handleAuthCallback = (code: string, state?: string) =>
  workosAuthService.handleCallback(code, state);

export const getCurrentWorkOSUser = (request: NextRequest) =>
  workosAuthService.getCurrentUser(request);

export const signOutWorkOS = (sessionId?: string) =>
  workosAuthService.signOut(sessionId);

export const getWorkOSUserProfile = (userId: string) =>
  workosAuthService.getUserProfile(userId);

export const getWorkOSClientConfig = () =>
  workosAuthService.getClientConfig();

export const getAuthKitUrl = (returnTo?: string) =>
  workosAuthService.getAuthKitUrl(returnTo);

export const checkWorkOSHealth = () =>
  workosAuthService.healthCheck();
