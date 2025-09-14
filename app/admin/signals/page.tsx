import { createServerSupabaseClient } from '@/lib/supabase/serverClient'
import { redirect } from 'next/navigation'
import AdminSignalsManager from '@/components/admin/AdminSignalsManager'

export const dynamic = 'force-dynamic'

export default async function AdminSignalsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  return <AdminSignalsManager />
}

