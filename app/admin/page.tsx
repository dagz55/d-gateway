import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">System administration, {user.email}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Member Dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signal Analytics</CardTitle>
            <CardDescription>Monitor signal performance and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Monitor system health and uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button asChild className="h-16">
            <Link href="/admin/users">Manage Users</Link>
          </Button>
          <Button asChild className="h-16">
            <Link href="/admin/signals">Manage Signals</Link>
          </Button>
          <Button className="h-16">System Logs</Button>
          <Button className="h-16">Analytics</Button>
        </div>
      </div>
    </div>
  )
}
