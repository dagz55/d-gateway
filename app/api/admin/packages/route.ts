import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get all packages with subscriber count
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get subscriber count for each package
    const packagesWithCounts = await Promise.all(
      (packages || []).map(async (pkg) => {
        const { count } = await supabase
          .from('user_packages')
          .select('*', { count: 'exact', head: true })
          .eq('package_id', pkg.id)
          .eq('status', 'active');

        return {
          ...pkg,
          subscriber_count: count || 0
        };
      })
    );

    return NextResponse.json(packagesWithCounts);

  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      duration_days,
      features,
      active = true
    } = body;

    // Validate required fields
    if (!name || !description || !price || !duration_days) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, duration_days' },
        { status: 400 }
      );
    }

    // Validate price and duration
    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be greater than or equal to 0' },
        { status: 400 }
      );
    }

    if (duration_days <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0 days' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Create the package with admin client (bypasses RLS)
    const { data: newPackage, error } = await supabase
      .from('packages')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        duration_days: parseInt(duration_days),
        features: features || [],
        active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      package: newPackage
    });

  } catch (error: any) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create package' },
      { status: 500 }
    );
  }
}