/**
 * Clerk Integration Utilities for Supabase
 * 
 * This module provides utilities for integrating Clerk authentication
 * with Supabase user profiles, especially for photo upload functionality.
 */

import { createClientSupabaseClient } from './client';
import { createServerSupabaseClient } from './server';

export interface UserProfileWithClerk {
  id: string;
  user_id: string;
  clerk_user_id: string | null;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  age: number;
  gender: string;
  trader_level: string;
  account_balance: number;
  is_verified: boolean;
  package: string;
  status: string;
  timezone: string;
  language: string;
  phone: string | null;
  country: string | null;
  bio: string | null;
  social_links: Record<string, any>;
  trading_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile by Clerk user ID (client-side)
 */
export async function getUserProfileByClerkId(clerkUserId: string): Promise<UserProfileWithClerk | null> {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile by Clerk ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Get user profile by Clerk user ID (server-side)
 */
export async function getUserProfileByClerkIdServer(clerkUserId: string): Promise<UserProfileWithClerk | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile by Clerk ID (server):', error);
    return null;
  }
  
  return data;
}

/**
 * Update user avatar by Clerk user ID
 */
export async function updateUserAvatarByClerkId(
  clerkUserId: string, 
  avatarUrl: string
): Promise<boolean> {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    })
    .eq('clerk_user_id', clerkUserId);
  
  if (error) {
    console.error('Error updating user avatar by Clerk ID:', error);
    return false;
  }
  
  return true;
}

/**
 * Create or update user profile with Clerk user ID
 */
export async function upsertUserProfileWithClerkId(
  clerkUserId: string,
  profileData: Partial<UserProfileWithClerk>
): Promise<UserProfileWithClerk | null> {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      clerk_user_id: clerkUserId,
      ...profileData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clerk_user_id',
      ignoreDuplicates: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting user profile with Clerk ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Link existing user profile to Clerk user ID
 */
export async function linkUserProfileToClerkId(
  userId: string,
  clerkUserId: string
): Promise<boolean> {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      clerk_user_id: clerkUserId,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error linking user profile to Clerk ID:', error);
    return false;
  }
  
  return true;
}

/**
 * Check if Clerk user ID already exists in profiles
 */
export async function clerkUserIdExists(clerkUserId: string): Promise<boolean> {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error checking Clerk user ID existence:', error);
    return false;
  }
  
  return !!data;
}

/**
 * Get all user profiles with Clerk integration
 */
export async function getAllUserProfilesWithClerk(): Promise<UserProfileWithClerk[]> {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all user profiles with Clerk:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Sync Clerk user data with Supabase profile
 */
export async function syncClerkUserWithProfile(
  clerkUserId: string,
  clerkUserData: {
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    imageUrl?: string;
  }
): Promise<UserProfileWithClerk | null> {
  const fullName = `${clerkUserData.firstName || ''} ${clerkUserData.lastName || ''}`.trim();
  
  return await upsertUserProfileWithClerkId(clerkUserId, {
    email: clerkUserData.email,
    username: clerkUserData.username || clerkUserData.email.split('@')[0],
    full_name: fullName || clerkUserData.email.split('@')[0],
    avatar_url: clerkUserData.imageUrl || null,
  });
}

/**
 * Photo upload specific utilities
 */
export const photoUploadUtils = {
  /**
   * Get user's current avatar URL by Clerk ID
   */
  async getCurrentAvatarUrl(clerkUserId: string): Promise<string | null> {
    const profile = await getUserProfileByClerkId(clerkUserId);
    return profile?.avatar_url || null;
  },

  /**
   * Update avatar URL and return success status
   */
  async updateAvatar(clerkUserId: string, avatarUrl: string): Promise<boolean> {
    return await updateUserAvatarByClerkId(clerkUserId, avatarUrl);
  },

  /**
   * Delete avatar (set to null)
   */
  async deleteAvatar(clerkUserId: string): Promise<boolean> {
    return await updateUserAvatarByClerkId(clerkUserId, '');
  },

  /**
   * Get user profile for photo upload context
   */
  async getProfileForUpload(clerkUserId: string): Promise<{
    id: string;
    username: string;
    currentAvatarUrl: string | null;
  } | null> {
    const profile = await getUserProfileByClerkId(clerkUserId);
    
    if (!profile) return null;
    
    return {
      id: profile.id,
      username: profile.username,
      currentAvatarUrl: profile.avatar_url
    };
  }
};
