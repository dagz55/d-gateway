import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import AppLayout from '@/components/layout/AppLayout';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/');
    }

    return <AppLayout>{children}</AppLayout>;
  } catch (error) {
    console.warn('Supabase auth error in dashboard layout:', error);
    redirect('/');
  }
}