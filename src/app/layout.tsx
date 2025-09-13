import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false,  // Disable preload to fix warning
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Zignal - Advanced Trading Signals Platform',
  description: 'Advanced trading signals platform featuring real-time analytics, market data, and comprehensive trading tools',
  keywords: ['trading', 'signals', 'cryptocurrency', 'analytics', 'zignal'],
  authors: [{ name: 'Big4Trading' }],
  openGraph: {
    title: 'Zignal - Advanced Trading Signals Platform',
    description: 'Advanced trading signals platform featuring real-time analytics, market data, and comprehensive trading tools',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zignal - Advanced Trading Signals Platform',
    description: 'Advanced trading signals platform featuring real-time analytics, market data, and comprehensive trading tools',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}