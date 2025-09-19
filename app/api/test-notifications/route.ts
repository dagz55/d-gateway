import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Sample notifications to create
    const sampleNotifications = [
      {
        user_id: userId,
        title: 'New Trade Signal',
        message: 'BTC/USDT Buy signal triggered at $67,500. Check your dashboard for details.',
        type: 'trade',
        is_read: false,
      },
      {
        user_id: userId,
        title: 'Portfolio Update',
        message: 'Your portfolio value increased by 5.2% today. Great job!',
        type: 'success',
        is_read: false,
      },
      {
        user_id: userId,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM UTC.',
        type: 'system',
        is_read: false,
      },
      {
        user_id: userId,
        title: 'Risk Alert',
        message: 'ETH position is down 3.5%. Consider reviewing your stop-loss settings.',
        type: 'warning',
        is_read: false,
      },
    ];

    const { data, error } = await supabase
      .from('notifications')
      .insert(sampleNotifications)
      .select();

    if (error) {
      console.error('Error creating test notifications:', error);
      return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${data.length} test notifications`,
      notifications: data
    });

  } catch (error) {
    console.error('Error in test-notifications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting test notifications:', error);
      return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'All notifications deleted successfully'
    });

  } catch (error) {
    console.error('Error in test-notifications DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}