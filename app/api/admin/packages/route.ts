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

    // Validate required fields with detailed error messages
    const requiredFields = [
      { field: 'name', value: name, message: 'Package name is required' },
      { field: 'description', value: description, message: 'Package description is required' },
      { field: 'price', value: price, message: 'Package price is required' },
      { field: 'duration_days', value: duration_days, message: 'Package duration is required' }
    ];

    for (const { field, value, message } of requiredFields) {
      if (value === undefined || value === null || value === '') {
        return NextResponse.json(
          { error: message },
          { status: 400 }
        );
      }
    }

    // Validate data types and ranges
    const priceNum = parseFloat(price);
    const durationNum = parseInt(duration_days);

    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid number greater than or equal to 0' },
        { status: 400 }
      );
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a valid number greater than 0 days' },
        { status: 400 }
      );
    }

    // Validate features array if provided
    if (features && !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'Features must be an array' },
        { status: 400 }
      );
    }

    // Validate string lengths
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Package name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: 'Package description must be 500 characters or less' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Create the package with admin client (bypasses RLS)
    // Let database handle timestamps automatically
    const { data: newPackage, error } = await supabase
      .from('packages')
      .insert([{
        name,
        description,
        price: priceNum,
        duration_days: durationNum,
        features: features || [],
        active
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

  } catch (error) {
    console.error('Error creating package:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create package';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}