import React from 'react'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import AuthProvider from '@/components/providers/AuthProvider'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FutureLot.ai - AI-Powered Real Estate Predictions',
  description: 'Discover tomorrow\'s hottest neighborhoods today with AI-driven property insights, investment analysis, and market predictions.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 