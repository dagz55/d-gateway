import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

/**
 * Clerk Webhook Handler for User Sync
 *
 * This webhook ensures that all Clerk user events are automatically
 * synced to Supabase user_profiles table for production consistency
 */

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    image_url?: string;
    public_metadata?: { role?: string; isAdmin?: boolean };
    created_at: number;
    updated_at: number;
  };
}

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    // Get webhook headers and body
    const headerPayload = req.headers;
    const svixId = headerPayload.get('svix-id');
    const svixTimestamp = headerPayload.get('svix-timestamp');
    const svixSignature = headerPayload.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    const payload = await req.text();

    // Verify the webhook
    const webhook = new Webhook(webhookSecret);
    const event = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;

    console.log('📨 Clerk Webhook Event:', event.type, event.data.id);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Handle different event types
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await syncUserToSupabase(supabase, event.data);
        break;

      case 'user.deleted':
        await removeUserFromSupabase(supabase, event.data.id);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ success: true, event: event.type });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function syncUserToSupabase(supabase: any, userData: ClerkWebhookEvent['data']) {
  try {
    const email = userData.email_addresses[0]?.email_address || '';
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
    const isAdmin = userData.public_metadata?.role === 'admin' || userData.public_metadata?.isAdmin === true;

    const profileData = {
      clerk_user_id: userData.id,
      email: email,
      username: userData.username || email.split('@')[0],
      full_name: fullName,
      avatar_url: userData.image_url || null,
      is_admin: isAdmin,
      role: isAdmin ? 'admin' : 'member',
      created_at: new Date(userData.created_at).toISOString(),
      updated_at: new Date(userData.updated_at).toISOString(),
      // Default values for required fields
      age: 25,
      gender: 'not_specified',
      trader_level: 'beginner',
      account_balance: 0,
      is_verified: true,
      package: 'free',
      status: 'active',
      timezone: 'UTC',
      language: 'en',
      phone: null,
      country: null,
      bio: null,
      social_links: {},
      trading_preferences: {}
    };

    // Use upsert to handle both create and update scenarios
    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`❌ Error syncing user ${email} to Supabase:`, error);
      throw error;
    }

    console.log(`✅ Successfully synced user ${email} to Supabase`);

  } catch (error) {
    console.error('❌ User sync error:', error);
    throw error;
  }
}

async function removeUserFromSupabase(supabase: any, clerkUserId: string) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error(`❌ Error removing user ${clerkUserId} from Supabase:`, error);
      throw error;
    }

    console.log(`✅ Successfully removed user ${clerkUserId} from Supabase`);

  } catch (error) {
    console.error('❌ User removal error:', error);
    throw error;
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Clerk webhook endpoint active',
    timestamp: new Date().toISOString(),
    configured: !!webhookSecret
  });
}