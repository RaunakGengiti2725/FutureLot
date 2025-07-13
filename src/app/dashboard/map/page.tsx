'use client'

import { InvestmentZoneMap } from '@/components/dashboard/InvestmentZoneMap'

export default function MapPage() {
  // Default to Austin if no city is selected
  const defaultCity = { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 }

  return (
    <div className="h-full w-full -m-6">
      <div className="bg-white shadow-sm h-full">
        <InvestmentZoneMap selectedCity={defaultCity} />
      </div>
    </div>
  )
} 