import { createServerSupabaseClient } from '@/lib/supabase/serverClient'
import { redirect } from 'next/navigation'
import AdminUsersManager from '@/components/admin/AdminUsersManager'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  return <AdminUsersManager />
}

