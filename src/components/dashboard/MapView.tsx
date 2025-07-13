'use client'

import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapViewProps {
  selectedCity?: {
    name: string
    state: string
    lat: number
    lng: number
  }
}

export function MapView({ selectedCity }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapboxgl, setMapboxgl] = useState<any>(null)

  // Initialize Mapbox GL
  useEffect(() => {
    let isMounted = true
    const initMapbox = async () => {
      try {
        console.log('🗺️ Starting map initialization...')
        setLoading(true)
        setError(null)

        // Dynamic import for client-side only
        const mapboxgl = await import('mapbox-gl')
        if (!isMounted) return

        // Use environment variable for token
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
        mapboxgl.default.accessToken = token

        // Verify container exists and has size
        if (!mapContainer.current) {
          throw new Error('Map container not found')
        }

        const containerWidth = mapContainer.current.offsetWidth
        const containerHeight = mapContainer.current.offsetHeight
        if (containerWidth === 0 || containerHeight === 0) {
          throw new Error('Map container has zero size')
        }

        // Initialize map
        const defaultCenter = selectedCity ? 
          [selectedCity.lng, selectedCity.lat] as [number, number] : 
          [-98.5795, 39.8283] as [number, number] // US center
        
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: defaultCenter,
          zoom: selectedCity ? 12 : 4,
          minZoom: 2,
          maxZoom: 18
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

        // Wait for map to load
        map.current.on('load', () => {
          if (!isMounted) return
          console.log('✅ Map loaded successfully')
          setLoading(false)
        })

        // Handle map errors
        map.current.on('error', (e: any) => {
          if (!isMounted) return
          console.error('❌ Map error:', e)
          setError('Failed to load map tiles')
        })

        setMapboxgl(mapboxgl.default)

      } catch (error) {
        if (!isMounted) return
        console.error('❌ Failed to initialize map:', error)
        setError(error instanceof Error ? error.message : 'Failed to load map')
        setLoading(false)
      }
    }

    initMapbox()
    return () => {
      isMounted = false
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Handle city selection changes
  useEffect(() => {
    if (!map.current || !selectedCity || !mapboxgl) return

    try {
      map.current.flyTo({
        center: [selectedCity.lng, selectedCity.lat],
        zoom: 12,
        duration: 2000,
        essential: true
      })
    } catch (error) {
      console.error('Failed to update map view:', error)
    }
  }, [selectedCity, mapboxgl])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 bg-gray-100" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-center">
            <div className="w-16 h-16 mb-4 mx-auto">
              <div className="rounded-full bg-blue-100 p-4">
                <svg className="w-8 h-8 text-blue-600 animate-pulse" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600">Loading Investment Zone Map</p>
            <p className="text-sm text-gray-500">{selectedCity?.name || 'United States'}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center p-6 max-w-sm mx-auto">
            <div className="w-16 h-16 mb-4 mx-auto text-red-500">
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Loading Error</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 