import { NextRequest, NextResponse } from 'next/server'
import { FreeInvestmentAnalyzer } from '../../../lib/services/FreeInvestmentAnalyzer'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    console.log(`🆓 Processing FREE investment analysis for: ${address}`)

    const analyzer = new FreeInvestmentAnalyzer()
    const analysis = await analyzer.analyzeInvestmentOpportunity(address)

    // Return comprehensive free analysis
    return NextResponse.json({
      success: true,
      analysis,
      costBreakdown: {
        totalCost: '$0.00',
        apiCosts: '$0.00',
        dataSources: 'All Free Government APIs',
        savingsVsPaid: '$80-130/month saved'
      },
      disclaimer: 'This analysis uses FREE government data sources and public records. While comprehensive, paid data sources may provide additional accuracy.',
      freeDataSources: analysis.freeDataSources,
      meta: {
        generatedAt: new Date().toISOString(),
        processingTime: 'Real-time',
        costEffective: true
      }
    })

  } catch (error) {
    console.error('Error in free investment analysis:', error)
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

    console.log(`🆓 Processing FREE investment analysis for: ${address}`)

    const analyzer = new FreeInvestmentAnalyzer()
    const analysis = await analyzer.analyzeInvestmentOpportunity(address)

    // Return comprehensive free analysis
    return NextResponse.json({
      success: true,
      analysis,
      costBreakdown: {
        totalCost: '$0.00',
        apiCosts: '$0.00',
        dataSources: 'All Free Government APIs',
        savingsVsPaid: '$80-130/month saved'
      },
      disclaimer: 'This analysis uses FREE government data sources and public records. While comprehensive, paid data sources may provide additional accuracy.',
      freeDataSources: analysis.freeDataSources,
      meta: {
        generatedAt: new Date().toISOString(),
        processingTime: 'Real-time',
        costEffective: true
      }
    })

  } catch (error) {
    console.error('Error in free investment analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze investment opportunity' },
      { status: 500 }
    )
  }
} 