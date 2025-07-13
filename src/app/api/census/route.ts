import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const censusKey = process.env.CENSUS_API_KEY || '232e915bc6951f76e24e173ef14f64e430c8fc10'
  
  // Build the Census API URL with all the parameters
  const params = new URLSearchParams(searchParams)
  params.append('key', censusKey)
  
  const censusUrl = `https://api.census.gov/data/2021/acs/acs5?${params.toString()}`
  
  try {
    const response = await fetch(censusUrl)
    if (!response.ok) {
      throw new Error(`Census API responded with status: ${response.status}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Census API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Census data' },
      { status: 500 }
    )
  }
} 