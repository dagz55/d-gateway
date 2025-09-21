import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Zignal — Crypto Signals Platform",
  description:
    "Trade the future. Zignal turns pro signals into clear actions. Access trading dashboard and analytics.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/zignal-dark.png",
    apple: "/zignal-dark.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="preload" href="/logo-zgnls.png" as="image" />
        <link rel="preload" href="/login_background_wallpaper_zignals04.png" as="image" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
