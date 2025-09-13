import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Image src="/zignal-logo.png" alt="Zignal Logo" width={120} height={48} className="w-auto h-12" />
            <div>
              <h1 className="text-2xl font-bold text-[#EAF2FF]">Admin Panel</h1>
              <p className="text-[#EAF2FF]/70">System administration, {user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              className="border-[#33E1DA]/30 text-[#EAF2FF] hover:bg-[#33E1DA]/10 bg-transparent"
            >
              <Link href="/dashboard">Member Dashboard</Link>
            </Button>
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="outline"
                className="border-[#33E1DA]/30 text-[#EAF2FF] hover:bg-[#33E1DA]/10 bg-transparent"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Admin Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass border-[#33E1DA]/20">
            <CardHeader>
              <CardTitle className="text-[#EAF2FF]">User Management</CardTitle>
              <CardDescription className="text-[#EAF2FF]/70">Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33E1DA]">1,247</div>
              <p className="text-[#EAF2FF]/60">Total Users</p>
            </CardContent>
          </Card>

          <Card className="glass border-[#33E1DA]/20">
            <CardHeader>
              <CardTitle className="text-[#EAF2FF]">Signal Analytics</CardTitle>
              <CardDescription className="text-[#EAF2FF]/70">Monitor signal performance and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33E1DA]">94.2%</div>
              <p className="text-[#EAF2FF]/60">Success Rate</p>
            </CardContent>
          </Card>

          <Card className="glass border-[#33E1DA]/20">
            <CardHeader>
              <CardTitle className="text-[#EAF2FF]">System Status</CardTitle>
              <CardDescription className="text-[#EAF2FF]/70">Monitor system health and uptime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33E1DA]">99.9%</div>
              <p className="text-[#EAF2FF]/60">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#EAF2FF] mb-4">Admin Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              Manage Users
            </Button>
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              Signal Config
            </Button>
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              System Logs
            </Button>
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
