import { requireAdmin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Plus,
  DollarSign,
  Users,
  Calendar,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { PackageActions } from '@/components/admin/PackageActions';

interface PackageData {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  subscriber_count?: number;
}

async function getPackages(): Promise<PackageData[]> {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if packages table exists, if not return empty array
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Packages table not found, returning empty array:', error.message);
      return [];
    }

    // Get subscriber count for each package (from user_packages table)
    const packagesWithCounts = await Promise.allSettled(
      (packages || []).map(async (pkg) => {
        try {
          const { count, error: countError } = await supabase
            .from('user_packages')
            .select('*', { count: 'exact', head: true })
            .eq('package_id', pkg.id)
            .eq('status', 'active');

          if (countError) {
            console.warn(`Error fetching subscriber count for package ${pkg.id}:`, countError.message);
            return {
              ...pkg,
              subscriber_count: 0
            };
          }

          return {
            ...pkg,
            subscriber_count: count || 0
          };
        } catch (error) {
          console.error(`Error processing package ${pkg.id}:`, error);
          return {
            ...pkg,
            subscriber_count: 0
          };
        }
      })
    );

    // Filter out rejected promises and extract successful results
    const successfulPackages = packagesWithCounts
      .filter((result): result is PromiseFulfilledResult<PackageData> => result.status === 'fulfilled')
      .map(result => result.value);

    return successfulPackages;
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

export default async function AdminPackagesPage() {
  // Require admin authentication
  const adminUser = await requireAdmin();
  const packages = await getPackages();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (days: number) => {
    if (days === 30) return '1 Month';
    if (days === 90) return '3 Months';
    if (days === 365) return '1 Year';
    if (days === 7) return '1 Week';
    return `${days} Days`;
  };

  const getStatusBadge = (active: boolean) => {
    return active
      ? <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Active</Badge>
      : <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Inactive</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
              Package <span className="gradient-text">Management</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create and manage subscription packages for your platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              <Package className="h-3 w-3 mr-1" />
              {packages.length} Total Packages
            </Badge>
            <Button asChild>
              <Link href="/admin/packages/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-bold text-foreground">{packages.length}</p>
                <p className="text-xs text-blue-400">Available packages</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Packages</p>
                <p className="text-2xl font-bold text-foreground">
                  {packages.filter(p => p.active).length}
                </p>
                <p className="text-xs text-green-400">Currently active</p>
              </div>
              <Settings className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold text-foreground">
                  {packages.reduce((sum, p) => sum + (p.subscriber_count || 0), 0)}
                </p>
                <p className="text-xs text-blue-400">Active subscriptions</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Potential</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(packages.reduce((sum, p) => sum + (p.price * (p.subscriber_count || 0)), 0))}
                </p>
                <p className="text-xs text-green-400">Monthly potential</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages List */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Subscription Packages
          </CardTitle>
          <CardDescription>
            Manage your platform's subscription packages and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No packages found</h3>
              <p className="text-muted-foreground mb-6">
                Create your first subscription package to start offering services to users
              </p>
              <Button asChild>
                <Link href="/admin/packages/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Package
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-6 rounded-lg bg-card/30 border border-border/20 hover:bg-card/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Package Header */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-foreground">{pkg.name}</h3>
                        {getStatusBadge(pkg.active)}
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(pkg.duration_days)}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground">{pkg.description}</p>

                      {/* Features */}
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {pkg.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-foreground font-medium">{formatPrice(pkg.price)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-foreground">{pkg.subscriber_count || 0} subscribers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Created {new Date(pkg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <PackageActions packageId={pkg.id} packageName={pkg.name} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}