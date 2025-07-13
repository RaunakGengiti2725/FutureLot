'use client'

import { useSession } from 'next-auth/react'
import { LandingPage } from '@/components/LandingPage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <LandingPage isAuthenticated={status === 'authenticated'} session={session} />
} 