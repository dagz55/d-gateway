import crypto from 'crypto';
import { createWorkOSSupabaseClient } from './supabase/workosClient';
import { TokenFamily } from './token-manager';

// Database schema for token storage
export interface StoredTokenFamily {
  id: string;
  family_id: string;
  user_id: string;
  session_id: string;
  created_at: string;
  last_used: string;
  token_chain: string[];
  revoked: boolean;
  revoked_at?: string;
  revoked_reason?: string;
  expires_at: string;
}

export interface StoredRefreshToken {
  id: string;
  token_hash: string;
  family_id: string;
  user_id: string;
  session_id: string;
  access_token_id: string;
  created_at: string;
  expires_at: string;
  invalidated: boolean;
  invalidated_at?: string;
}

/**
 * Secure refresh token storage manager
 */
export class RefreshTokenStore {
  private static instance: RefreshTokenStore;
  private supabaseClient: any;

  private constructor() {
    this.supabaseClient = createWorkOSSupabaseClient();
  }

  public static getInstance(): RefreshTokenStore {
    if (!RefreshTokenStore.instance) {
      RefreshTokenStore.instance = new RefreshTokenStore();
    }
    return RefreshTokenStore.instance;
  }

  /**
   * Hash token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create new token family
   */
  public async createTokenFamily(family: {
    familyId: string;
    userId: string;
    sessionId: string;
    refreshTokenJti: string;
    expiresAt: Date;
  }): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('token_families')
        .insert({
          family_id: family.familyId,
          user_id: family.userId,
          session_id: family.sessionId,
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
          token_chain: [family.refreshTokenJti],
          revoked: false,
          expires_at: family.expiresAt.toISOString(),
        });

      if (error) {
        console.error('Failed to create token family:', error);
        throw new Error('Token family creation failed');
      }
    } catch (error) {
      console.error('Token family creation error:', error);
      throw error;
    }
  }

  /**
   * Get token family by ID
   */
  public async getTokenFamily(familyId: string): Promise<TokenFamily | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('token_families')
        .select('*')
        .eq('family_id', familyId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        familyId: data.family_id,
        userId: data.user_id,
        sessionId: data.session_id,
        createdAt: new Date(data.created_at).getTime(),
        lastUsed: new Date(data.last_used).getTime(),
        tokenChain: data.token_chain || [],
        revoked: data.revoked,
        revokedAt: data.revoked_at ? new Date(data.revoked_at).getTime() : undefined,
        revokedReason: data.revoked_reason,
      };
    } catch (error) {
      console.error('Token family fetch error:', error);
      return null;
    }
  }

  /**
   * Update token family chain and usage
   */
  public async updateTokenFamily(
    familyId: string,
    updates: {
      lastUsed?: number;
      tokenChain?: string[];
    }
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.lastUsed) {
        updateData.last_used = new Date(updates.lastUsed).toISOString();
      }

      if (updates.tokenChain) {
        updateData.token_chain = updates.tokenChain;
      }

      const { error } = await this.supabaseClient
        .from('token_families')
        .update(updateData)
        .eq('family_id', familyId);

      if (error) {
        console.error('Failed to update token family:', error);
        throw new Error('Token family update failed');
      }
    } catch (error) {
      console.error('Token family update error:', error);
      throw error;
    }
  }

  /**
   * Revoke token family for security
   */
  public async revokeTokenFamily(familyId: string, reason: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('token_families')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_reason: reason,
        })
        .eq('family_id', familyId);

      if (error) {
        console.error('Failed to revoke token family:', error);
        throw new Error('Token family revocation failed');
      }

      // Also invalidate all refresh tokens in this family
      await this.invalidateTokensByFamily(familyId);
    } catch (error) {
      console.error('Token family revocation error:', error);
      throw error;
    }
  }

  /**
   * Store refresh token securely
   */
  public async storeRefreshToken(token: {
    tokenHash: string;
    familyId: string;
    userId: string;
    sessionId: string;
    accessTokenId: string;
    expiresAt: Date;
  }): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('refresh_tokens')
        .insert({
          token_hash: token.tokenHash,
          family_id: token.familyId,
          user_id: token.userId,
          session_id: token.sessionId,
          access_token_id: token.accessTokenId,
          created_at: new Date().toISOString(),
          expires_at: token.expiresAt.toISOString(),
          invalidated: false,
        });

      if (error) {
        console.error('Failed to store refresh token:', error);
        throw new Error('Refresh token storage failed');
      }
    } catch (error) {
      console.error('Refresh token storage error:', error);
      throw error;
    }
  }

  /**
   * Validate refresh token existence and status
   */
  public async validateRefreshToken(tokenHash: string): Promise<{
    valid: boolean;
    token?: StoredRefreshToken;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('refresh_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Token not found' };
      }

      // Check if token is invalidated
      if (data.invalidated) {
        return { valid: false, error: 'Token invalidated' };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (now > expiresAt) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, token: data };
    } catch (error) {
      console.error('Refresh token validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * Invalidate specific refresh token
   */
  public async invalidateToken(tokenJti: string): Promise<void> {
    try {
      // We need to find the token by JTI in the token chain
      // For now, we'll mark all tokens in the family as potentially invalidated
      // In a production system, you'd want a more precise mapping
      
      const { error } = await this.supabaseClient
        .from('refresh_tokens')
        .update({
          invalidated: true,
          invalidated_at: new Date().toISOString(),
        })
        .eq('access_token_id', tokenJti);

      if (error) {
        console.error('Failed to invalidate token:', error);
        throw new Error('Token invalidation failed');
      }
    } catch (error) {
      console.error('Token invalidation error:', error);
      throw error;
    }
  }

  /**
   * Invalidate all tokens in a family
   */
  public async invalidateTokensByFamily(familyId: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('refresh_tokens')
        .update({
          invalidated: true,
          invalidated_at: new Date().toISOString(),
        })
        .eq('family_id', familyId);

      if (error) {
        console.error('Failed to invalidate family tokens:', error);
        throw new Error('Family token invalidation failed');
      }
    } catch (error) {
      console.error('Family token invalidation error:', error);
      throw error;
    }
  }

  /**
   * Invalidate all tokens for a user session
   */
  public async invalidateTokensBySession(sessionId: string): Promise<void> {
    try {
      // Revoke all token families for this session
      const { error: familyError } = await this.supabaseClient
        .from('token_families')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_reason: 'Session invalidated',
        })
        .eq('session_id', sessionId);

      if (familyError) {
        console.error('Failed to revoke session families:', familyError);
      }

      // Invalidate all refresh tokens for this session
      const { error: tokenError } = await this.supabaseClient
        .from('refresh_tokens')
        .update({
          invalidated: true,
          invalidated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (tokenError) {
        console.error('Failed to invalidate session tokens:', tokenError);
        throw new Error('Session token invalidation failed');
      }
    } catch (error) {
      console.error('Session token invalidation error:', error);
      throw error;
    }
  }

  /**
   * Invalidate all tokens for a user
   */
  public async invalidateTokensByUser(userId: string): Promise<void> {
    try {
      // Revoke all token families for this user
      const { error: familyError } = await this.supabaseClient
        .from('token_families')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_reason: 'User tokens revoked',
        })
        .eq('user_id', userId);

      if (familyError) {
        console.error('Failed to revoke user families:', familyError);
      }

      // Invalidate all refresh tokens for this user
      const { error: tokenError } = await this.supabaseClient
        .from('refresh_tokens')
        .update({
          invalidated: true,
          invalidated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (tokenError) {
        console.error('Failed to invalidate user tokens:', tokenError);
        throw new Error('User token invalidation failed');
      }
    } catch (error) {
      console.error('User token invalidation error:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens and families
   */
  public async cleanupExpiredTokens(currentTimestamp: number): Promise<void> {
    try {
      const now = new Date(currentTimestamp * 1000);

      // Delete expired refresh tokens
      const { error: tokenError } = await this.supabaseClient
        .from('refresh_tokens')
        .delete()
        .lt('expires_at', now.toISOString());

      if (tokenError) {
        console.error('Failed to cleanup expired tokens:', tokenError);
      }

      // Delete expired token families
      const { error: familyError } = await this.supabaseClient
        .from('token_families')
        .delete()
        .lt('expires_at', now.toISOString());

      if (familyError) {
        console.error('Failed to cleanup expired families:', familyError);
      }
    } catch (error) {
      console.error('Token cleanup error:', error);
    }
  }

  /**
   * Get user active sessions
   */
  public async getUserActiveSessions(userId: string): Promise<TokenFamily[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('token_families')
        .select('*')
        .eq('user_id', userId)
        .eq('revoked', false)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Failed to get user sessions:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        familyId: row.family_id,
        userId: row.user_id,
        sessionId: row.session_id,
        createdAt: new Date(row.created_at).getTime(),
        lastUsed: new Date(row.last_used).getTime(),
        tokenChain: row.token_chain || [],
        revoked: row.revoked,
        revokedAt: row.revoked_at ? new Date(row.revoked_at).getTime() : undefined,
        revokedReason: row.revoked_reason,
      }));
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Get token statistics for monitoring
   */
  public async getTokenStatistics(): Promise<{
    totalFamilies: number;
    activeFamilies: number;
    revokedFamilies: number;
    totalTokens: number;
    activeTokens: number;
    invalidatedTokens: number;
  }> {
    try {
      const [familiesResult, tokensResult] = await Promise.all([
        this.supabaseClient
          .from('token_families')
          .select('revoked', { count: 'exact' }),
        this.supabaseClient
          .from('refresh_tokens')
          .select('invalidated', { count: 'exact' })
      ]);

      const families = familiesResult.data || [];
      const tokens = tokensResult.data || [];

      return {
        totalFamilies: families.length,
        activeFamilies: families.filter((f: any) => !f.revoked).length,
        revokedFamilies: families.filter((f: any) => f.revoked).length,
        totalTokens: tokens.length,
        activeTokens: tokens.filter((t: any) => !t.invalidated).length,
        invalidatedTokens: tokens.filter((t: any) => t.invalidated).length,
      };
    } catch (error) {
      console.error('Token statistics error:', error);
      return {
        totalFamilies: 0,
        activeFamilies: 0,
        revokedFamilies: 0,
        totalTokens: 0,
        activeTokens: 0,
        invalidatedTokens: 0,
      };
    }
  }
}

// Export singleton instance
export const refreshTokenStore = RefreshTokenStore.getInstance();