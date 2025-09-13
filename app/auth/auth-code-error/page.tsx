import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0F1F]">
      <Card className="w-full max-w-md glass border-[#33E1DA]/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#EAF2FF]">Authentication Error</CardTitle>
          <CardDescription className="text-[#EAF2FF]/70">
            There was an issue with the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#EAF2FF]/80 text-center">
            The authentication code was invalid or expired. Please try signing in again.
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] hover:from-[#1A7FB3]/90 hover:to-[#33E1DA]/90"
          >
            <Link href="/">Return to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
