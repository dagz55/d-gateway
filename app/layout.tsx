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
    <html lang="en" data-scroll-behavior="smooth" className="bg-background text-foreground" suppressHydrationWarning>
      <head>
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        {/* Preload critical resources for better performance */}
        <link rel="preload" href="/zignal-logo.png" as="image" type="image/png" media="(min-width: 1024px)" fetchPriority="high" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        {process.env.NODE_ENV === 'production' && (process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true') && <Analytics />}
      </body>
    </html>
  )
}
