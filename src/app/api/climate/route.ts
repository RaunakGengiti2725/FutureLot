import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const lat = parseFloat(searchParams.get('lat') || '37.7749')
    const lng = parseFloat(searchParams.get('lng') || '-122.4194')

    // Mock climate risk data
    const climateData = {
      location: location || 'San Francisco, CA',
      coordinates: { lat, lng },
      overallRisk: 'Medium',
      risks: {
        flood: {
          level: 'Low',
          probability: 0.15,
          description: 'Minimal flood risk due to elevation and drainage systems',
          factors: ['Elevation above sea level', 'Storm water infrastructure', 'Historical data']
        },
        fire: {
          level: 'Medium',
          probability: 0.35,
          description: 'Moderate wildfire risk from surrounding vegetation',
          factors: ['Vegetation density', 'Fire history', 'Wind patterns', 'Emergency access']
        },
        heat: {
          level: 'Low',
          probability: 0.20,
          description: 'Low extreme heat risk due to coastal location',
          factors: ['Coastal cooling', 'Urban heat island effect', 'Building materials']
        },
        earthquake: {
          level: 'High',
          probability: 0.75,
          description: 'High earthquake risk due to fault lines',
          factors: ['Proximity to fault lines', 'Building age', 'Soil conditions']
        },
        seaLevel: {
          level: 'Medium',
          probability: 0.40,
          description: 'Moderate sea level rise risk over 30 years',
          factors: ['Current elevation', 'Projected sea level rise', 'Coastal protection']
        }
      },
      projections: {
        2030: {
          overallRisk: 'Medium',
          temperature: '+1.2°C',
          seaLevel: '+0.1m',
          precipitation: '+5%'
        },
        2050: {
          overallRisk: 'High',
          temperature: '+2.1°C',
          seaLevel: '+0.3m',
          precipitation: '+12%'
        }
      },
      recommendations: [
        'Consider flood insurance for properties below 20ft elevation',
        'Implement fire-resistant landscaping and building materials',
        'Upgrade to earthquake-resistant building standards',
        'Monitor sea level rise projections for coastal properties'
      ],
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(climateData)
  } catch (error) {
    console.error('Climate API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { locations } = body

    // Mock batch climate analysis
    const results = locations.map((location: any) => ({
      location: location.address,
      lat: location.lat,
      lng: location.lng,
      overallRisk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      floodRisk: Math.random() * 0.5,
      fireRisk: Math.random() * 0.8,
      heatRisk: Math.random() * 0.6,
      earthquakeRisk: Math.random() * 0.3 + 0.7, // SF has high earthquake risk
      impactScore: Math.random() * 10 + 1
    }))

    return NextResponse.json({ results, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Climate POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 