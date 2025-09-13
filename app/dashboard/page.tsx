import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default async function DashboardPage() {
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
              <h1 className="text-2xl font-bold text-[#EAF2FF]">Member Dashboard</h1>
              <p className="text-[#EAF2FF]/70">Welcome back, {user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              className="border-[#33E1DA]/30 text-[#EAF2FF] hover:bg-[#33E1DA]/10 bg-transparent"
            >
              <Link href="/admin">Admin Panel</Link>
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

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass border-[#33E1DA]/20">
            <CardHeader>
              <CardTitle className="text-[#EAF2FF]">Trading Signals</CardTitle>
              <CardDescription className="text-[#EAF2FF]/70">
                Latest market insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33E1DA]">+24.7%</div>
              <p className="text-[#EAF2FF]/60">Portfolio Performance</p>
            </CardContent>
          </Card>

          <Card className="glass border-[#33E1DA]/20">
            <CardHeader>
              <CardTitle className="text-[#EAF2FF]">Active Positions</CardTitle>
              <CardDescription className="text-[#EAF2FF]/70">Your current trading positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33E1DA]">12</div>
              <p className="text-[#EAF2FF]/60">Open Trades</p>
            </CardContent>
          </Card>

          <Card className="glass border-[#33E1DA]/20">
            <CardHeader>
              <CardTitle className="text-[#EAF2FF]">Account Status</CardTitle>
              <CardDescription className="text-[#EAF2FF]/70">Your membership details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#33E1DA]">Pro</div>
              <p className="text-[#EAF2FF]/60">Membership Level</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#EAF2FF] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              View Signals
            </Button>
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              Portfolio
            </Button>
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              Settings
            </Button>
            <Button className="h-16 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90">
              Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
