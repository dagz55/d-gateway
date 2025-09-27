import AdminWelcomeHeader from '@/components/admin/AdminWelcomeHeader';
import PlatformStats from '@/components/admin/PlatformStats';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { QuickActions } from '@/components/admin/QuickActions';

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard space-y-8 p-6 dashboard-bg min-h-screen">
      {/* Enhanced backdrop with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20 pointer-events-none" />

      {/* Main content with proper z-index */}
      <div className="relative z-10 space-y-8">
        <AdminWelcomeHeader />
        <PlatformStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-activity-card p-8 group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h3 className="text-xl font-semibold text-foreground gradient-text">
                Recent Activity
              </h3>
            </div>
            <RecentActivity />
          </div>

          <div className="glass-activity-card p-8 group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <h3 className="text-xl font-semibold text-foreground gradient-text">
                Quick Actions
              </h3>
            </div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
