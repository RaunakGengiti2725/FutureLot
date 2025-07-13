import { NextRequest, NextResponse } from 'next/server'
import { RealInvestmentAnalyzer } from '../../../lib/services/RealInvestmentAnalyzer'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    console.log(`🔍 Processing REAL investment analysis for: ${address}`)

    const analyzer = new RealInvestmentAnalyzer()
    const analysis = await analyzer.analyzeInvestmentOpportunity(address)

    // Return comprehensive real analysis
    return NextResponse.json({
      success: true,
      analysis,
      disclaimer: 'This analysis is based on real market data and economic indicators. Past performance does not guarantee future results. Please consult with a qualified financial advisor before making investment decisions.',
      dataValidation: {
        realDataSources: analysis.actualDataSources,
        confidence: analysis.confidenceScore,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in real investment analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze investment opportunity' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
    }

    console.log(`🔍 Processing REAL investment analysis for: ${address}`)

    const analyzer = new RealInvestmentAnalyzer()
    const analysis = await analyzer.analyzeInvestmentOpportunity(address)

    // Return comprehensive real analysis
    return NextResponse.json({
      success: true,
      analysis,
      disclaimer: 'This analysis is based on real market data and economic indicators. Past performance does not guarantee future results. Please consult with a qualified financial advisor before making investment decisions.',
      dataValidation: {
        realDataSources: analysis.actualDataSources,
        confidence: analysis.confidenceScore,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in real investment analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze investment opportunity' },
      { status: 500 }
    )
  }
} 