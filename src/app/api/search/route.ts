import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'suggestions'

    if (type === 'suggestions') {
      // Mock location suggestions
      const suggestions = [
        'San Francisco, CA',
        'New York, NY',
        'Los Angeles, CA',
        'Chicago, IL',
        'Seattle, WA',
        'Austin, TX',
        'Denver, CO',
        'Portland, OR'
      ].filter(location => 
        query ? location.toLowerCase().includes(query.toLowerCase()) : true
      ).slice(0, 8)

      return NextResponse.json({ suggestions })
    }

    if (type === 'properties') {
      // Mock property data
      const properties = [
        {
          id: 1,
          address: '123 Mission St, San Francisco, CA',
          lat: 37.7749,
          lng: -122.4194,
          price: 1200000,
          appreciation: 12.4,
          riskScore: 'Low',
          type: 'Condo',
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1200,
          yearBuilt: 2015
        },
        {
          id: 2,
          address: '456 Castro St, San Francisco, CA',
          lat: 37.7649,
          lng: -122.4350,
          price: 1800000,
          appreciation: 8.7,
          riskScore: 'Medium',
          type: 'House',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1800,
          yearBuilt: 1950
        },
        {
          id: 3,
          address: '789 Fillmore St, San Francisco, CA',
          lat: 37.7849,
          lng: -122.4194,
          price: 950000,
          appreciation: 15.2,
          riskScore: 'Low',
          type: 'Condo',
          bedrooms: 1,
          bathrooms: 1,
          sqft: 800,
          yearBuilt: 2010
        }
      ]

      return NextResponse.json({ properties })
    }

    return NextResponse.json({ error: 'Invalid search type' }, { status: 400 })
  } catch (error) {
    console.error('Search API error:', error)
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
    const { location, filters } = body

    // Mock filtered search results
    const results = {
      location,
      filters,
      properties: [
        {
          id: 1,
          address: `${Math.floor(Math.random() * 9999)} Main St, ${location}`,
          lat: 37.7749 + (Math.random() - 0.5) * 0.1,
          lng: -122.4194 + (Math.random() - 0.5) * 0.1,
          price: Math.floor(Math.random() * 1000000) + 500000,
          appreciation: Math.random() * 20 + 5,
          riskScore: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          type: ['Condo', 'House', 'Townhouse'][Math.floor(Math.random() * 3)]
        }
      ],
      total: Math.floor(Math.random() * 1000) + 100,
      avgAppreciation: Math.random() * 15 + 5,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 