import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminUser } from '@/lib/admin';
import { clerkClient } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

async function getClerkClient() {
  return await clerkClient();
}

async function getClerkUserSafely(clerk: any, userId: string) {
  try {
    return await clerk.users.getUser(userId);
  } catch (error: any) {
    if (error?.status === 404 || error?.message?.includes('not found')) {
      return null; // Return null instead of throwing for 404s
    }
    throw error; // Re-throw other errors
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Get user details from Clerk
    const clerk = await getClerkClient();
    const clerkUser = await getClerkUserSafely(clerk, userId);

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    // Get additional data from Supabase
    const supabase = await createServerSupabaseClient();

    // Get user's trades
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (tradesError) {
      console.warn('Error fetching trades:', tradesError.message);
    }

    // Get user's transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.warn('Error fetching transactions:', transactionsError.message);
    }

    // Get user's signals
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (signalsError) {
      console.warn('Error fetching signals:', signalsError.message);
    }

    // Get profile from Supabase if exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Error fetching profile:', profileError.message);
    }

    const memberData = {
      user_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      display_name: clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || '',
      avatar_url: clerkUser.imageUrl,
      role: clerkUser.publicMetadata?.role || (clerkUser.publicMetadata?.isAdmin ? 'admin' : 'member'),
      is_admin: clerkUser.publicMetadata?.isAdmin || false,
      created_at: new Date(clerkUser.createdAt).toISOString(),
      last_sign_in_at: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : undefined,
      email_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
      phone: clerkUser.phoneNumbers[0]?.phoneNumber,
      banned: clerkUser.banned,
      locked: clerkUser.locked,
      trades: trades || [],
      transactions: transactions || [],
      signals: signals || [],
      profile: profile,
      stats: {
        total_trades: trades?.length || 0,
        active_trades: trades?.filter(t => t.status === 'OPEN').length || 0,
        total_volume: trades?.reduce((sum, t) => sum + (t.amount * t.price), 0) || 0,
        total_pnl: trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0,
        total_transactions: transactions?.length || 0,
        total_deposits: transactions?.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0) || 0,
        total_withdrawals: transactions?.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0) || 0,
        signals_received: signals?.length || 0
      }
    };

    return NextResponse.json(memberData);

  } catch (error) {
    console.error('Error fetching member details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;
    const clerk = await getClerkClient();

    switch (action) {
      case 'suspend': {
        const currentUser = await getClerkUserSafely(clerk, userId);
        if (!currentUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          );
        }
        const currentMetadata = currentUser.publicMetadata || {};
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadata,
            suspended: true,
            suspendedAt: new Date().toISOString(),
            suspendedBy: 'admin'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'User suspended successfully'
        });
      }
      case 'activate': {
        const currentUser = await getClerkUserSafely(clerk, userId);
        if (!currentUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          );
        }
        const currentMetadata = currentUser.publicMetadata || {};
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadata,
            suspended: false,
            activatedAt: new Date().toISOString(),
            activatedBy: 'admin'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'User activated successfully'
        });
      }
      case 'deactivate': {
        const currentUser = await getClerkUserSafely(clerk, userId);
        if (!currentUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          );
        }
        const currentMetadata = currentUser.publicMetadata || {};
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadata,
            suspended: false,
            deactivated: true,
            deactivatedAt: new Date().toISOString(),
            deactivatedBy: 'admin'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'User deactivated successfully'
        });
      }
      case 'promote': {
        const currentUser = await getClerkUserSafely(clerk, userId);
        if (!currentUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          );
        }
        const currentMetadata = currentUser.publicMetadata || {};
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadata,
            isAdmin: true,
            role: 'admin',
            promotedAt: new Date().toISOString(),
            promotedBy: 'admin'
          }
        });

        // Update in Supabase user_profiles if exists
        const supabase = await createServerSupabaseClient();
        await supabase
          .from('user_profiles')
          .upsert({
            clerk_user_id: userId,
            is_admin: true,
            updated_at: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: 'User promoted to admin successfully'
        });
      }
      case 'demote': {
        const currentUser = await getClerkUserSafely(clerk, userId);
        if (!currentUser) {
          return NextResponse.json(
            { error: 'User not found in Clerk' },
            { status: 404 }
          );
        }
        const currentMetadata = currentUser.publicMetadata || {};
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadata,
            isAdmin: false,
            role: 'member',
            demotedAt: new Date().toISOString(),
            demotedBy: 'admin'
          }
        });

        // Update in Supabase user_profiles if exists
        const supabase = await createServerSupabaseClient();
        await supabase
          .from('user_profiles')
          .upsert({
            clerk_user_id: userId,
            is_admin: false,
            updated_at: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: 'User demoted to member successfully'
        });
      }
      case 'update': {
        // Update user details in Clerk
        const updatePayload: any = {};

        // Handle both data structures (from form and modal)
        if (updateData.firstName || updateData.full_name) {
          const fullName = updateData.full_name || `${updateData.firstName} ${updateData.lastName || ''}`.trim();
          const nameParts = fullName.split(' ');
          updatePayload.firstName = nameParts[0] || '';
          updatePayload.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        if (updateData.username || updateData.display_name) {
          updatePayload.username = updateData.username || updateData.display_name;
        }

        await clerk.users.updateUser(userId, updatePayload);

        return NextResponse.json({
          success: true,
          message: 'User updated successfully'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Delete user from Clerk
    const clerk = await getClerkClient();

    // Check if user exists before trying to delete
    const userExists = await getClerkUserSafely(clerk, userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    await clerk.users.deleteUser(userId);

    // Note: Supabase data will be automatically cleaned up due to CASCADE constraints

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}
