'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { CensusDataService } from '@/lib/services/CensusDataService'
import { loadAdminBoundaries } from '@/utils/mapLayers';
import type { Feature, FeatureCollection, Polygon } from 'geojson';

// Initial states to load first (high population states)
const INITIAL_STATES = ['06', '48', '12', '36', '17'] // CA, TX, FL, NY, IL

interface CountyProperties {
  GEO_ID?: string;
  STATE?: string;
  COUNTY?: string;
  NAME?: string;
  LSAD?: string;
  CENSUSAREA?: number;
  score?: number;
  [key: string]: any;
}

interface CountyFeature extends Feature<Polygon, CountyProperties> {
  properties: CountyProperties; // Make properties required and explicitly typed
}

interface CountyCollection extends FeatureCollection<Polygon, CountyProperties> {
  features: CountyFeature[]; // Make features required and explicitly typed
}

interface InvestmentZoneMapProps {
  selectedCity?: { name: string; state: string; lat: number; lng: number } | null
}

interface CountyData {
  fips: string
  county: string
  score: number
  metrics: {
    medianHomeValue: number
    medianIncome: number
    population: number
    populationGrowth: number
    employmentGrowth: number
    medianAge: number
  }
  grade: 'excellent' | 'good' | 'fair' | 'poor'
  color: string
}

export function InvestmentZoneMap({ selectedCity }: InvestmentZoneMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (!mapContainer.current) return

    const initializeMap = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Initializing map...')

        // Check for Mapbox token
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!mapboxToken) {
          throw new Error('Mapbox token not found in environment variables')
        }

        // Initialize Mapbox
        mapboxgl.accessToken = mapboxToken
        console.log('Mapbox token configured')

        // Create map instance
        const container = mapContainer.current
        if (!container) {
          throw new Error('Map container not found')
        }

        map.current = new mapboxgl.Map({
          container,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [-98.5795, 39.8283],
          zoom: 3.5,
          trackResize: true,
          collectResourceTiming: false,
          attributionControl: false,
          preserveDrawingBuffer: false
        })

        // Add custom attribution control
        map.current.addControl(new mapboxgl.AttributionControl({
          compact: true,
          customAttribution: 'FutureLot Investment Analysis'
        }))

        // Wait for map to load
        map.current.on('load', async () => {
          try {
            console.log('Map loaded, fetching data...')
            const censusService = CensusDataService.getInstance()
            
            // Load initial data
            setLoadingProgress(10)
            const countyData = await censusService.getCountyInvestmentScoresForStates(INITIAL_STATES)
            console.log(`Loaded data for ${countyData.length} counties`)
            console.log('Sample Census county data:', {
              first: countyData[0],
              second: countyData[1],
              total: countyData.length
            })
            setLoadingProgress(50)

            const mapInstance = map.current
            if (!mapInstance) return

            // Create a GeoJSON source with empty data initially
            mapInstance.addSource('counties', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              }
            })

            // Add fill layer
            mapInstance.addLayer({
              id: 'counties-fill',
              type: 'fill',
              source: 'counties',
              paint: {
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['number', ['get', 'score'], 0],
                  0, '#ef4444',    // Poor (< 40%)
                  0.4, '#eab308',  // Fair (40-59%)
                  0.6, '#3b82f6',  // Good (60-74%)
                  0.75, '#22c55e'  // Excellent (75%+)
                ],
                'fill-opacity': 0.4
              }
            })

            // Add border layer
            mapInstance.addLayer({
              id: 'counties-border',
              type: 'line',
              source: 'counties',
              paint: {
                'line-color': '#ffffff',
                'line-width': 0.5,
                'line-opacity': 0.5
              }
            })

            // Fetch county boundaries GeoJSON
            const response = await fetch('/data/us-counties.geojson')
            if (!response.ok) {
              throw new Error('Failed to load county boundaries')
            }
            const geojsonData = await response.json() as CountyCollection;
            
            // Log the structure of the first feature to debug
            console.log('GeoJSON first feature structure:', 
              JSON.stringify(geojsonData.features[0], null, 2)
            );

            // Add investment scores to GeoJSON properties
            geojsonData.features = geojsonData.features.map((feature: CountyFeature) => {
              const props = feature.properties;
              
              // Get FIPS either by combining STATE+COUNTY or extracting from GEO_ID
              let fips: string | null = null;
              
              if (props.STATE && props.COUNTY) {
                // Pad STATE and COUNTY with zeros if needed
                const state = props.STATE.padStart(2, '0');
                const county = props.COUNTY.padStart(3, '0');
                fips = state + county;
              } else if (props.GEO_ID && props.GEO_ID.startsWith('0500000US')) {
                // Extract FIPS from GEO_ID (format: '0500000US51041' -> '51041')
                fips = props.GEO_ID.substring(9);
              }

              if (!fips) {
                console.warn('Could not determine FIPS code for feature:', props);
                return feature;
              }

              try {
                const state = fips.substring(0, 2);
                const county = fips.substring(2);
                const countyInfo = countyData.find(c => {
                  const cState = c.fips.substring(0, 2);
                  const cCounty = c.fips.substring(2);
                  return cState === state && cCounty === county;
                });

                if (countyInfo) {
                  console.log(`Mapped county ${props.NAME} (${fips}) with score:`, countyInfo.score);
                }

                return {
                  ...feature,
                  properties: {
                    ...props,
                    score: countyInfo?.score || 0
                  }
                };
              } catch (error) {
                console.error(`Error processing feature with FIPS ${fips}:`, error);
                return feature;
              }
            });

            // Log some sample data to verify
            console.log('First 5 features after mapping:', 
              geojsonData.features.slice(0, 5).map(f => ({
                name: f.properties.NAME,
                state: f.properties.STATE,
                county: f.properties.COUNTY,
                geoId: f.properties.GEO_ID,
                score: f.properties.score
              }))
            );

            // Update the source with actual data
            const source = mapInstance.getSource('counties') as mapboxgl.GeoJSONSource
            source.setData(geojsonData)

            // Remove the legend creation code
            setLoadingProgress(100)
            setLoading(false)
            console.log('Map setup complete')

          } catch (error) {
            console.error('Error setting up map data:', error)
            setError(error instanceof Error ? error.message : 'Failed to load map data')
            setLoading(false)
          }
        })

        // Handle map errors
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e.error)
          setError(`Map error: ${e.error?.message || 'Unknown error'}`)
          setLoading(false)
        })

      } catch (err) {
        console.error('Map initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize map')
        setLoading(false)
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error loading map</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">US Investment Zone Analysis</h1>
          <p className="text-gray-600">
            Discover high-potential investment zones across the United States with detailed market analysis.
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="text-sm font-medium text-gray-700">Excellent (Top 25%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-sm font-medium text-gray-700">Good (Top 40%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
                <span className="text-sm font-medium text-gray-700">Fair (Middle 35%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm font-medium text-gray-700">Limited (Bottom 25%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <div ref={mapContainer} className="w-full h-[600px]" />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="w-16 h-16 mb-4 mx-auto">
                  <div className="rounded-full bg-blue-100 p-4">
                    <svg className="w-8 h-8 text-blue-600 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Loading Investment Zone Map</p>
                <p className="text-sm text-gray-500">{loadingProgress}% complete...</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected County Details */}
        {selectedCounty && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCounty.county}</h3>
                  <p className="text-gray-600">Investment Grade: {selectedCounty.grade}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Median Home Value</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedCounty.metrics.medianHomeValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Median Income</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedCounty.metrics.medianIncome.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Population</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedCounty.metrics.population.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Median Age</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedCounty.metrics.medianAge.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 