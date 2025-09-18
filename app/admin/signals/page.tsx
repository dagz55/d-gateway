import { getCurrentUser } from '@/lib/auth-middleware'
import { redirect } from 'next/navigation'
import AdminSignalsManager from '@/components/admin/AdminSignalsManager'

export const dynamic = 'force-dynamic'

export default async function AdminSignalsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/')
  return <AdminSignalsManager />
}

