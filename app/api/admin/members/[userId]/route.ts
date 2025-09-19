import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { clerkClient } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { userId } = params;

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found' },
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
      .from('profiles')
      .select('*')
      .eq('id', userId)
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
      created_at: clerkUser.createdAt.toISOString(),
      last_sign_in_at: clerkUser.lastSignInAt?.toISOString(),
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
  { params }: { params: { userId: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { userId } = params;
    const body = await request.json();
    const { action, ...updateData } = body;

    switch (action) {
      case 'suspend':
        // Suspend user in Clerk
        const currentUser = await clerkClient.users.getUser(userId);
        const currentMetadata = currentUser.publicMetadata || {};
        await clerkClient.users.updateUser(userId, {
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

      case 'activate':
        // Activate user in Clerk
        const currentUserActivate = await clerkClient.users.getUser(userId);
        const currentMetadataActivate = currentUserActivate.publicMetadata || {};
        await clerkClient.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadataActivate,
            suspended: false,
            activatedAt: new Date().toISOString(),
            activatedBy: 'admin'
          }
        });

        return NextResponse.json({
          success: true,
          message: 'User activated successfully'
        });

      case 'promote':
        // Promote user to admin in Clerk
        const currentUserPromote = await clerkClient.users.getUser(userId);
        const currentMetadataPromote = currentUserPromote.publicMetadata || {};
        await clerkClient.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadataPromote,
            isAdmin: true,
            role: 'admin',
            promotedAt: new Date().toISOString(),
            promotedBy: 'admin'
          }
        });

        // Update in Supabase profiles if exists
        const supabase = await createServerSupabaseClient();
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            is_admin: true,
            updated_at: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: 'User promoted to admin successfully'
        });

      case 'demote':
        // Demote admin to member in Clerk
        const currentUserDemote = await clerkClient.users.getUser(userId);
        const currentMetadataDemote = currentUserDemote.publicMetadata || {};
        await clerkClient.users.updateUser(userId, {
          publicMetadata: {
            ...currentMetadataDemote,
            isAdmin: false,
            role: 'member',
            demotedAt: new Date().toISOString(),
            demotedBy: 'admin'
          }
        });

        // Update in Supabase profiles if exists
        const supabase2 = await createServerSupabaseClient();
        await supabase2
          .from('profiles')
          .upsert({
            id: userId,
            is_admin: false,
            updated_at: new Date().toISOString()
          });

        return NextResponse.json({
          success: true,
          message: 'User demoted to member successfully'
        });

      case 'update':
        // Update user details in Clerk
        const updatePayload: any = {};

        if (updateData.firstName) updatePayload.firstName = updateData.firstName;
        if (updateData.lastName) updatePayload.lastName = updateData.lastName;
        if (updateData.username) updatePayload.username = updateData.username;

        await clerkClient.users.updateUser(userId, updatePayload);

        return NextResponse.json({
          success: true,
          message: 'User updated successfully'
        });

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
  { params }: { params: { userId: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { userId } = params;

    // Delete user from Clerk
    await clerkClient.users.deleteUser(userId);

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