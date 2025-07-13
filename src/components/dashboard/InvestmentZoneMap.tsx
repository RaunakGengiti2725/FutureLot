'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Home, MapPin } from 'lucide-react'

// Define types for our investment zones
interface InvestmentZoneMapProps {
  selectedCity?: { name: string; state: string; lat: number; lng: number } | null
}

interface InvestmentZone {
  id: string
  name: string
  bounds: [[number, number], [number, number]]
  grade: 'excellent' | 'good' | 'fair' | 'poor'
  color: string
  description: string
  avgAppreciation: number
  avgPrice: number
  properties: number
}

export function InvestmentZoneMap({ selectedCity }: InvestmentZoneMapProps) {
  const [zones, setZones] = useState<InvestmentZone[]>([])
  const [selectedZone, setSelectedZone] = useState<InvestmentZone | null>(null)

  // Get city coordinates with defaults
  const cityName = selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'Austin, TX'

  // Get investment zones for different cities
  const getCityInvestmentZones = (cityName: string): InvestmentZone[] => {
    const baseZones = {
      'Austin': [
        {
          id: 'austin-downtown',
          name: 'Downtown Austin',
          bounds: [[30.2500, -97.7600], [30.2750, -97.7300]] as [[number, number], [number, number]],
          grade: 'excellent' as const,
          color: '#10B981',
          description: 'Prime urban development zone with high appreciation potential',
          avgAppreciation: 18.5,
          avgPrice: 650000,
          properties: 1250
        },
        {
          id: 'austin-east',
          name: 'East Austin',
          bounds: [[30.2400, -97.7300], [30.2800, -97.7000]] as [[number, number], [number, number]],
          grade: 'excellent' as const,
          color: '#059669',
          description: 'Rapidly gentrifying area with tech worker influx',
          avgAppreciation: 22.1,
          avgPrice: 485000,
          properties: 1850
        },
        {
          id: 'austin-south',
          name: 'South Austin',
          bounds: [[30.2200, -97.7800], [30.2500, -97.7400]] as [[number, number], [number, number]],
          grade: 'good' as const,
          color: '#3B82F6',
          description: 'Established neighborhoods with steady growth',
          avgAppreciation: 15.3,
          avgPrice: 520000,
          properties: 2100
        }
      ],
      'Miami': [
        {
          id: 'miami-downtown',
          name: 'Downtown Miami',
          bounds: [[25.7500, -80.2000], [25.7800, -80.1800]] as [[number, number], [number, number]],
          grade: 'excellent' as const,
          color: '#10B981',
          description: 'International business district with luxury development',
          avgAppreciation: 16.2,
          avgPrice: 750000,
          properties: 980
        },
        {
          id: 'miami-wynwood',
          name: 'Wynwood',
          bounds: [[25.7900, -80.2100], [25.8100, -80.1950]] as [[number, number], [number, number]],
          grade: 'excellent' as const,
          color: '#059669',
          description: 'Arts district experiencing rapid transformation',
          avgAppreciation: 19.8,
          avgPrice: 580000,
          properties: 1200
        }
      ],
      'San Diego': [
        {
          id: 'sandiego-downtown',
          name: 'Downtown San Diego',
          bounds: [[32.7000, -117.1700], [32.7200, -117.1500]] as [[number, number], [number, number]],
          grade: 'excellent' as const,
          color: '#10B981',
          description: 'Urban core with luxury condos and waterfront access',
          avgAppreciation: 14.8,
          avgPrice: 850000,
          properties: 1100
        },
        {
          id: 'sandiego-lajolla',
          name: 'La Jolla',
          bounds: [[32.8200, -117.2800], [32.8500, -117.2500]] as [[number, number], [number, number]],
          grade: 'excellent' as const,
          color: '#059669',
          description: 'Premium coastal area with consistent appreciation',
          avgAppreciation: 12.5,
          avgPrice: 1250000,
          properties: 800
        },
        {
          id: 'sandiego-hillcrest',
          name: 'Hillcrest',
          bounds: [[32.7400, -117.1700], [32.7600, -117.1500]] as [[number, number], [number, number]],
          grade: 'good' as const,
          color: '#3B82F6',
          description: 'Central location with urban amenities',
          avgAppreciation: 11.2,
          avgPrice: 720000,
          properties: 1400
        }
      ]
    }

    return baseZones[cityName as keyof typeof baseZones] || baseZones['Austin']
  }

  // Initialize zones when component mounts or city changes
  useEffect(() => {
    const cityZones = getCityInvestmentZones(selectedCity?.name || 'Austin')
    setZones(cityZones)
    console.log(`📍 Generated ${cityZones.length} investment zones for ${cityName}`)
  }, [selectedCity, cityName])

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Investment Zone Analysis</h1>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-medium text-gray-700">{cityName}</span>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover high-potential investment zones with detailed market analysis, appreciation rates, and property insights.
        </p>
      </div>

      {/* Zone Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Investment Grade Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Excellent (15%+ growth)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Good (10-15% growth)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Fair (5-10% growth)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Poor (<5% growth)</span>
          </div>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            onClick={() => setSelectedZone(zone)}
            className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedZone?.id === zone.id 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: zone.color }}
                ></div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  zone.grade === 'excellent' ? 'bg-green-100 text-green-800' :
                  zone.grade === 'good' ? 'bg-blue-100 text-blue-800' :
                  zone.grade === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {zone.grade.charAt(0).toUpperCase() + zone.grade.slice(1)}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{zone.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">Growth</span>
                </div>
                <div className="text-lg font-bold text-green-600">+{zone.avgAppreciation}%</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Avg Price</span>
                </div>
                <div className="text-sm font-bold text-blue-600">${(zone.avgPrice / 1000).toFixed(0)}K</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg col-span-2">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Home className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">Properties</span>
                </div>
                <div className="text-lg font-bold text-purple-600">{zone.properties.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Zone Analysis */}
      {selectedZone && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedZone.name} - Detailed Analysis</h2>
            <p className="text-gray-700">{selectedZone.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Annual Growth</h4>
              <div className="text-2xl font-bold text-green-600">+{selectedZone.avgAppreciation}%</div>
              <p className="text-xs text-gray-600 mt-1">Expected appreciation</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Average Price</h4>
              <div className="text-2xl font-bold text-blue-600">${selectedZone.avgPrice.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Market median</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <Home className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Total Properties</h4>
              <div className="text-2xl font-bold text-purple-600">{selectedZone.properties.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">In this zone</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setSelectedZone(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 