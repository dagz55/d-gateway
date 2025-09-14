import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/serverClient'
import Header from '@/components/layout/Header'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      redirect('/')
    }
    return (
      <div className="min-h-screen dashboard-bg">
        <Header />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    )
  } catch (e) {
    redirect('/')
  }
}

