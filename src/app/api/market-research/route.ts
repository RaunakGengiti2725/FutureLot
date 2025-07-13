import { NextRequest, NextResponse } from 'next/server'
import { MarketResearchPlatform } from '../../../lib/services/MarketResearchPlatform'

export async function POST(request: NextRequest) {
  try {
    const { cities, analysisType = 'COMPREHENSIVE' } = await request.json()

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return NextResponse.json({ error: 'Cities array is required' }, { status: 400 })
    }

    console.log(`🔍 Generating market research for ${cities.length} cities`)
    console.log(`📊 Analysis type: ${analysisType}`)

    const platform = new MarketResearchPlatform()
    const report = await platform.generateComprehensiveMarketReport(cities, analysisType)

    return NextResponse.json({
      success: true,
      report,
      meta: {
        generatedAt: new Date().toISOString(),
        citiesAnalyzed: cities.length,
        analysisType,
        dataQuality: report.dataQuality.overallScore
      }
    })

  } catch (error) {
    console.error('Error generating market research:', error)
    return NextResponse.json(
      { error: 'Failed to generate market research report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citiesParam = searchParams.get('cities')
    const analysisType = searchParams.get('analysisType') || 'COMPREHENSIVE'

    if (!citiesParam) {
      return NextResponse.json({ error: 'Cities parameter is required' }, { status: 400 })
    }

    const cities = citiesParam.split(',').map(city => city.trim())

    console.log(`🔍 Generating market research for ${cities.length} cities`)
    console.log(`📊 Analysis type: ${analysisType}`)

    const platform = new MarketResearchPlatform()
    const report = await platform.generateComprehensiveMarketReport(cities, analysisType as any)

    return NextResponse.json({
      success: true,
      report,
      meta: {
        generatedAt: new Date().toISOString(),
        citiesAnalyzed: cities.length,
        analysisType,
        dataQuality: report.dataQuality.overallScore
      }
    })

  } catch (error) {
    console.error('Error generating market research:', error)
    return NextResponse.json(
      { error: 'Failed to generate market research report' },
      { status: 500 }
    )
  }
} 