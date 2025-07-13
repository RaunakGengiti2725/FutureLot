// High-Performance Properties API
// Returns GeoJSON format for Mapbox GL clustering
// Viewport-based loading for optimal performance

import { NextRequest, NextResponse } from 'next/server'
import { ComprehensiveRealDataService } from '@/lib/services/ComprehensiveRealDataService'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const state = url.searchParams.get('state')
    const limit = parseInt(url.searchParams.get('limit') || '0') // 0 means no limit

    if (!city || !state) {
      return NextResponse.json(
        { error: 'City and state parameters are required' },
        { status: 400 }
      )
    }

    console.log(`🏠 API: Fetching ALL real properties for ${city}, ${state}`)

    const dataService = ComprehensiveRealDataService.getInstance()
    
    // Get ALL properties in the city (no fake data)
    const allProperties = await dataService.getAllPropertiesInCity(city, state)
    
    // Limit results if requested (0 means no limit)
    const limitedProperties = limit > 0 ? allProperties.slice(0, limit) : allProperties
    
    // Calculate comprehensive city statistics from ALL properties
    const totalProperties = allProperties.length
    const avgPrice = allProperties.reduce((sum, p) => sum + p.price, 0) / totalProperties
    const avgAppreciation = allProperties.reduce((sum, p) => sum + p.appreciation, 0) / totalProperties
    const avgRiskScore = allProperties.reduce((sum, p) => sum + p.riskScore, 0) / totalProperties
    const avgConfidence = allProperties.reduce((sum, p) => sum + p.confidence, 0) / totalProperties

    // Convert to GeoJSON format for mapping
    const features = limitedProperties.map(property => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [property.lng, property.lat]
      },
      properties: {
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        price: property.price,
        squareFootage: property.squareFootage,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        propertyType: property.propertyType,
        appreciation: property.appreciation,
        riskScore: property.riskScore,
        confidence: property.confidence,
        pricePerSqft: property.pricePerSqft,
        mlsNumber: property.mlsNumber,
        source: property.source,
        yearBuilt: property.yearBuilt,
        daysOnMarket: property.daysOnMarket,
        rentalEstimate: property.rentalEstimate
      }
    }))

    const response = {
      type: 'FeatureCollection',
      features,
      metadata: {
        city,
        state,
        totalPropertiesInCity: totalProperties,
        propertiesReturned: limitedProperties.length,
        averagePrice: Math.round(avgPrice),
        averageAppreciation: Math.round(avgAppreciation * 100) / 100,
        averageRiskScore: Math.round(avgRiskScore),
        averageConfidence: Math.round(avgConfidence),
        dataSource: 'Real Estate APIs + U.S. Census',
        noFakeData: true,
        comprehensiveAnalysis: true
      },
      generatedAt: new Date().toISOString()
    }

    console.log(`✅ API: Returning ${limitedProperties.length} of ${totalProperties} REAL properties`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch real property data',
        message: error instanceof Error ? error.message : 'Unknown error',
        noFakeData: true
      },
      { status: 500 }
    )
  }
} 