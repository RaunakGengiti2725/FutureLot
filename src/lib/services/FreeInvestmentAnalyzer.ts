import { FreeDataService, FreeMarketData, FreeNeighborhoodData } from './FreeDataService'

export interface FreeInvestmentOpportunity {
  address: string
  currentPrice: number
  projectedValue1Year: number
  projectedValue3Year: number
  projectedValue5Year: number
  expectedReturn: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  confidenceScore: number
  investmentType: 'GROWTH' | 'VALUE' | 'INCOME' | 'SPECULATION'
  keyFactors: string[]
  warnings: string[]
  profitPotential: number
  monthlyIncomeProjection: number
  cashFlowAnalysis: FreeCashFlowAnalysis
  comparativeAnalysis: FreeComparativeAnalysis
  marketTiming: FreeMarketTiming
  exitStrategy: FreeExitStrategy
  freeDataSources: string[]
}

export interface FreeCashFlowAnalysis {
  purchasePrice: number
  downPayment: number
  monthlyMortgage: number
  estimatedRent: number
  monthlyExpenses: number
  netCashFlow: number
  capRate: number
  cocReturn: number
  irr: number
  breakEvenPoint: number
  cashOnCashReturn: number
  debtServiceCoverage: number
}

export interface FreeComparativeAnalysis {
  priceVsComps: number
  rentVsMarket: number
  appreciationVsMarket: number
  competitiveAdvantage: string[]
  marketPosition: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED'
  valueScore: number
}

export interface FreeMarketTiming {
  currentMarketPhase: 'BUYER' | 'SELLER' | 'NEUTRAL'
  inventoryLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  priceDirection: 'RISING' | 'STABLE' | 'FALLING'
  bestTimeToAct: 'NOW' | 'WAIT_3_MONTHS' | 'WAIT_6_MONTHS' | 'WAIT_LONGER'
  reasoningFactor: string
  marketScore: number
}

export interface FreeExitStrategy {
  recommendedHoldPeriod: number
  bestExitTiming: string
  expectedExitPrice: number
  totalReturn: number
  annualizedReturn: number
  taxConsiderations: string[]
  optimalStrategy: string
}

export class FreeInvestmentAnalyzer {
  private dataService: FreeDataService

  constructor() {
    this.dataService = FreeDataService.getInstance()
  }

  async analyzeInvestmentOpportunity(address: string): Promise<FreeInvestmentOpportunity> {
    console.log(`💰 Analyzing FREE investment opportunity: ${address}`)

    try {
      // Get free market data
      const propertyData = await this.dataService.getFreePropertyData(address)
      const neighborhoodData = await this.dataService.getFreeNeighborhoodData(
        this.extractCity(address),
        this.extractState(address)
      )

      // Perform comprehensive analysis
      const projections = this.calculateProjections(propertyData, neighborhoodData)
      const cashFlow = this.analyzeCashFlow(propertyData, neighborhoodData)
      const comparative = this.performComparativeAnalysis(propertyData, neighborhoodData)
      const timing = this.analyzeMarketTiming(propertyData, neighborhoodData)
      const exit = this.planExitStrategy(propertyData, projections, neighborhoodData)

      const opportunity: FreeInvestmentOpportunity = {
        address,
        currentPrice: propertyData.estimatedValue,
        projectedValue1Year: projections.year1,
        projectedValue3Year: projections.year3,
        projectedValue5Year: projections.year5,
        expectedReturn: projections.expectedReturn,
        riskLevel: this.calculateRiskLevel(propertyData, neighborhoodData),
        confidenceScore: this.calculateConfidence(propertyData, neighborhoodData),
        investmentType: this.determineInvestmentType(propertyData, neighborhoodData, cashFlow),
        keyFactors: this.identifyKeyFactors(propertyData, neighborhoodData),
        warnings: this.identifyWarnings(propertyData, neighborhoodData),
        profitPotential: this.calculateProfitPotential(projections, cashFlow),
        monthlyIncomeProjection: cashFlow.netCashFlow,
        cashFlowAnalysis: cashFlow,
        comparativeAnalysis: comparative,
        marketTiming: timing,
        exitStrategy: exit,
        freeDataSources: this.getFreeDataSources()
      }

      console.log(`✅ FREE investment analysis complete!`)
      console.log(`💵 Expected return: ${(opportunity.expectedReturn * 100).toFixed(1)}%`)
      console.log(`💰 Monthly income: $${opportunity.monthlyIncomeProjection.toFixed(0)}`)
      console.log(`🎯 Investment type: ${opportunity.investmentType}`)
      console.log(`📊 Profit potential: $${opportunity.profitPotential.toFixed(0)}`)

      return opportunity

    } catch (error) {
      console.error('Error analyzing investment opportunity:', error)
      throw new Error('Failed to analyze investment opportunity with free data')
    }
  }

  private calculateProjections(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): any {
    const currentValue = propertyData.estimatedValue
    const historicalAppreciation = propertyData.marketMetrics.priceAppreciation
    const neighborhoodAppreciation = neighborhoodData.appreciation
    const economicFactor = neighborhoodData.economicScore / 100 * 0.02
    
    // Weight factors for projection
    const weightedAppreciation = (
      historicalAppreciation * 0.5 +
      neighborhoodAppreciation * 0.3 +
      economicFactor * 0.2
    )
    
    // Apply growth score multiplier
    const growthMultiplier = 1 + (neighborhoodData.growthScore - 50) / 500
    const finalAppreciation = Math.max(0, weightedAppreciation * growthMultiplier)
    
    return {
      year1: currentValue * (1 + finalAppreciation),
      year3: currentValue * Math.pow(1 + finalAppreciation, 3),
      year5: currentValue * Math.pow(1 + finalAppreciation, 5),
      expectedReturn: finalAppreciation
    }
  }

  private analyzeCashFlow(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): FreeCashFlowAnalysis {
    const purchasePrice = propertyData.estimatedValue
    const downPayment = purchasePrice * 0.25 // 25% down
    const loanAmount = purchasePrice - downPayment
    const interestRate = 0.0675 // 6.75% current mortgage rate
    const monthlyMortgage = this.calculateMortgagePayment(loanAmount, interestRate, 30)
    
    const estimatedRent = propertyData.rentEstimate
    const monthlyExpenses = this.calculateMonthlyExpenses(propertyData, neighborhoodData)
    const netCashFlow = estimatedRent - monthlyMortgage - monthlyExpenses
    
    const annualRent = estimatedRent * 12
    const annualExpenses = monthlyExpenses * 12
    const noi = annualRent - annualExpenses // Net Operating Income
    const capRate = noi / purchasePrice
    const cocReturn = (netCashFlow * 12) / downPayment
    const irr = this.calculateIRR(downPayment, netCashFlow, purchasePrice)
    
    const cashOnCashReturn = (netCashFlow * 12) / downPayment
    const debtServiceCoverage = noi / (monthlyMortgage * 12)
    
    return {
      purchasePrice,
      downPayment,
      monthlyMortgage,
      estimatedRent,
      monthlyExpenses,
      netCashFlow,
      capRate,
      cocReturn,
      irr,
      breakEvenPoint: netCashFlow > 0 ? 0 : Math.abs(netCashFlow) / 200,
      cashOnCashReturn,
      debtServiceCoverage
    }
  }

  private performComparativeAnalysis(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): FreeComparativeAnalysis {
    const propertyPrice = propertyData.estimatedValue
    const marketPrice = neighborhoodData.medianHomeValue
    const priceVsComps = (propertyPrice - marketPrice) / marketPrice
    
    const propertyRent = propertyData.rentEstimate
    const marketRent = neighborhoodData.medianRent
    const rentVsMarket = (propertyRent - marketRent) / marketRent
    
    const propertyAppreciation = propertyData.marketMetrics.priceAppreciation
    const marketAppreciation = neighborhoodData.appreciation
    const appreciationVsMarket = (propertyAppreciation - marketAppreciation) / marketAppreciation
    
    const competitiveAdvantage = []
    if (priceVsComps < -0.05) competitiveAdvantage.push('Below market price')
    if (rentVsMarket > 0.05) competitiveAdvantage.push('Above market rent potential')
    if (propertyData.marketMetrics.walkScore > 70) competitiveAdvantage.push('Excellent walkability')
    if (propertyData.marketMetrics.schoolRating > 8) competitiveAdvantage.push('Top-rated schools')
    if (propertyData.marketMetrics.daysOnMarket < 25) competitiveAdvantage.push('Hot market area')
    if (propertyData.marketMetrics.crimeRate < 30) competitiveAdvantage.push('Low crime rate')
    
    let marketPosition: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' = 'FAIR'
    if (priceVsComps < -0.1) marketPosition = 'UNDERVALUED'
    if (priceVsComps > 0.1) marketPosition = 'OVERVALUED'
    
    const valueScore = this.calculateValueScore(priceVsComps, rentVsMarket, appreciationVsMarket)
    
    return {
      priceVsComps,
      rentVsMarket,
      appreciationVsMarket,
      competitiveAdvantage,
      marketPosition,
      valueScore
    }
  }

  private analyzeMarketTiming(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): FreeMarketTiming {
    const inventory = propertyData.marketMetrics.inventory
    const daysOnMarket = propertyData.marketMetrics.daysOnMarket
    const employmentRate = propertyData.marketMetrics.employmentRate
    const marketHotness = propertyData.marketMetrics.marketHotness
    
    let inventoryLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    if (inventory < 2) inventoryLevel = 'LOW'
    if (inventory > 4) inventoryLevel = 'HIGH'
    
    const priceDirection = propertyData.marketMetrics.priceAppreciation > 0.04 ? 'RISING' : 
                          propertyData.marketMetrics.priceAppreciation < -0.02 ? 'FALLING' : 'STABLE'
    
    let currentMarketPhase: 'BUYER' | 'SELLER' | 'NEUTRAL' = 'NEUTRAL'
    if (inventoryLevel === 'HIGH' && priceDirection === 'FALLING') currentMarketPhase = 'BUYER'
    if (inventoryLevel === 'LOW' && priceDirection === 'RISING') currentMarketPhase = 'SELLER'
    
    let bestTimeToAct: 'NOW' | 'WAIT_3_MONTHS' | 'WAIT_6_MONTHS' | 'WAIT_LONGER' = 'NOW'
    let reasoningFactor = 'Market conditions are neutral'
    
    if (currentMarketPhase === 'BUYER') {
      bestTimeToAct = 'NOW'
      reasoningFactor = 'Buyer\'s market - great time to purchase'
    } else if (inventoryLevel === 'HIGH') {
      bestTimeToAct = 'WAIT_3_MONTHS'
      reasoningFactor = 'High inventory may lead to better deals'
    } else if (employmentRate < 92) {
      bestTimeToAct = 'WAIT_6_MONTHS'
      reasoningFactor = 'Employment concerns suggest caution'
    } else if (marketHotness > 80) {
      bestTimeToAct = 'NOW'
      reasoningFactor = 'Hot market - act quickly'
    }
    
    const marketScore = this.calculateMarketScore(inventoryLevel, priceDirection, employmentRate, marketHotness)
    
    return {
      currentMarketPhase,
      inventoryLevel,
      priceDirection,
      bestTimeToAct,
      reasoningFactor,
      marketScore
    }
  }

  private planExitStrategy(propertyData: FreeMarketData, projections: any, neighborhoodData: FreeNeighborhoodData): FreeExitStrategy {
    const expectedReturn = projections.expectedReturn
    const growthScore = neighborhoodData.growthScore
    
    // Calculate optimal hold period
    let recommendedHoldPeriod = 5 // Default
    if (expectedReturn > 0.10) recommendedHoldPeriod = 3 // High appreciation - shorter hold
    if (growthScore > 80) recommendedHoldPeriod = 7 // Strong growth - longer hold
    if (expectedReturn < 0.04) recommendedHoldPeriod = 2 // Low appreciation - quick flip
    
    const expectedExitPrice = projections[`year${recommendedHoldPeriod}`] || projections.year5
    const totalReturn = (expectedExitPrice - propertyData.estimatedValue) / propertyData.estimatedValue
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / recommendedHoldPeriod) - 1
    
    const bestExitTiming = this.determineBestExitTiming(recommendedHoldPeriod)
    const taxConsiderations = this.getTaxConsiderations(recommendedHoldPeriod)
    const optimalStrategy = this.determineOptimalStrategy(expectedReturn, growthScore, neighborhoodData)
    
    return {
      recommendedHoldPeriod,
      bestExitTiming,
      expectedExitPrice,
      totalReturn,
      annualizedReturn,
      taxConsiderations,
      optimalStrategy
    }
  }

  private calculateRiskLevel(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0
    
    // Employment risk
    if (propertyData.marketMetrics.employmentRate < 92) riskScore += 2
    if (propertyData.marketMetrics.employmentRate < 88) riskScore += 3
    
    // Market risk
    if (propertyData.marketMetrics.inventory > 6) riskScore += 2
    if (propertyData.marketMetrics.daysOnMarket > 60) riskScore += 1
    
    // Economic risk
    if (neighborhoodData.economicScore < 60) riskScore += 2
    if (neighborhoodData.growthScore < 50) riskScore += 2
    
    // Affordability risk
    if (neighborhoodData.medianHomeValue / neighborhoodData.medianIncome > 7) riskScore += 2
    
    // Crime risk
    if (propertyData.marketMetrics.crimeRate > 60) riskScore += 2
    
    if (riskScore <= 3) return 'LOW'
    if (riskScore <= 7) return 'MEDIUM'
    return 'HIGH'
  }

  private calculateConfidence(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): number {
    let confidence = 70 // Base confidence for free data
    
    // Data quality factors
    if (propertyData.comparables.length > 3) confidence += 10
    if (propertyData.marketMetrics.confidence > 80) confidence += 5
    
    // Market stability
    if (propertyData.marketMetrics.daysOnMarket < 40) confidence += 5
    if (propertyData.marketMetrics.marketHotness > 60) confidence += 5
    
    // Economic factors
    if (neighborhoodData.economicScore > 70) confidence += 5
    if (neighborhoodData.growthScore > 60) confidence += 5
    
    return Math.min(confidence, 90)
  }

  private determineInvestmentType(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData, cashFlow: FreeCashFlowAnalysis): 'GROWTH' | 'VALUE' | 'INCOME' | 'SPECULATION' {
    const appreciationRate = propertyData.marketMetrics.priceAppreciation
    const cashFlowRatio = cashFlow.netCashFlow / propertyData.estimatedValue
    const capRate = cashFlow.capRate
    const priceToIncome = propertyData.estimatedValue / neighborhoodData.medianIncome
    
    if (cashFlowRatio > 0.008) return 'INCOME' // Good cash flow
    if (appreciationRate > 0.08) return 'GROWTH' // Strong appreciation
    if (capRate > 0.08 && priceToIncome < 6) return 'VALUE' // Good value
    return 'SPECULATION'
  }

  private identifyKeyFactors(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): string[] {
    const factors = []
    
    if (propertyData.marketMetrics.priceAppreciation > 0.06) factors.push('Strong price appreciation')
    if (propertyData.rentEstimate > neighborhoodData.medianRent * 1.1) factors.push('Above-market rent potential')
    if (propertyData.marketMetrics.walkScore > 70) factors.push('Excellent walkability')
    if (propertyData.marketMetrics.schoolRating > 7.5) factors.push('Good schools')
    if (propertyData.marketMetrics.employmentRate > 95) factors.push('Strong employment')
    if (neighborhoodData.growthScore > 70) factors.push('Growing area')
    if (propertyData.marketMetrics.daysOnMarket < 25) factors.push('Hot market demand')
    if (propertyData.marketMetrics.crimeRate < 25) factors.push('Low crime rate')
    
    return factors
  }

  private identifyWarnings(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): string[] {
    const warnings = []
    
    if (propertyData.marketMetrics.inventory > 6) warnings.push('High inventory levels')
    if (propertyData.marketMetrics.employmentRate < 92) warnings.push('Below-average employment')
    if (neighborhoodData.medianHomeValue / neighborhoodData.medianIncome > 7) warnings.push('High price-to-income ratio')
    if (propertyData.marketMetrics.daysOnMarket > 60) warnings.push('Extended market time')
    if (propertyData.marketMetrics.crimeRate > 60) warnings.push('High crime rate')
    if (neighborhoodData.economicScore < 60) warnings.push('Weak economic indicators')
    
    return warnings
  }

  private calculateProfitPotential(projections: any, cashFlow: FreeCashFlowAnalysis): number {
    const appreciationProfit = projections.year5 - projections.year1
    const cashFlowProfit = cashFlow.netCashFlow * 12 * 5 // 5 years
    const totalProfit = appreciationProfit + cashFlowProfit
    
    return Math.max(0, totalProfit)
  }

  // Helper calculation methods
  private calculateMortgagePayment(principal: number, rate: number, years: number): number {
    const monthlyRate = rate / 12
    const numPayments = years * 12
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  private calculateMonthlyExpenses(propertyData: FreeMarketData, neighborhoodData: FreeNeighborhoodData): number {
    const propertyTax = propertyData.estimatedValue * 0.012 / 12 // 1.2% annually
    const insurance = propertyData.estimatedValue * 0.006 / 12 // 0.6% annually
    const maintenance = propertyData.estimatedValue * 0.01 / 12 // 1% annually
    const management = propertyData.rentEstimate * 0.08 // 8% of rent
    const vacancy = propertyData.rentEstimate * 0.05 // 5% vacancy factor
    
    return propertyTax + insurance + maintenance + management + vacancy
  }

  private calculateIRR(investment: number, cashFlow: number, finalValue: number): number {
    // Simplified IRR calculation
    const years = 5
    const totalCashFlow = cashFlow * 12 * years
    const totalReturn = totalCashFlow + finalValue - investment
    return Math.pow(totalReturn / investment, 1 / years) - 1
  }

  private calculateValueScore(priceVsComps: number, rentVsMarket: number, appreciationVsMarket: number): number {
    const priceScore = Math.max(0, 50 - (priceVsComps * 100)) // Lower price = higher score
    const rentScore = Math.max(0, 50 + (rentVsMarket * 100)) // Higher rent = higher score
    const appreciationScore = Math.max(0, 50 + (appreciationVsMarket * 100)) // Higher appreciation = higher score
    
    return (priceScore + rentScore + appreciationScore) / 3
  }

  private calculateMarketScore(inventoryLevel: string, priceDirection: string, employmentRate: number, marketHotness: number): number {
    let score = 50
    
    if (inventoryLevel === 'LOW') score += 15
    if (inventoryLevel === 'HIGH') score -= 10
    
    if (priceDirection === 'RISING') score += 10
    if (priceDirection === 'FALLING') score -= 15
    
    score += (employmentRate - 90) * 2
    score += (marketHotness - 50) * 0.5
    
    return Math.max(0, Math.min(100, score))
  }

  private determineBestExitTiming(holdPeriod: number): string {
    const exitYear = new Date().getFullYear() + holdPeriod
    const season = 'Spring' // Spring is typically best for real estate sales
    return `${season} ${exitYear}`
  }

  private getTaxConsiderations(holdPeriod: number): string[] {
    const considerations = []
    
    if (holdPeriod >= 1) {
      considerations.push('Qualifies for long-term capital gains rate (lower taxes)')
    }
    if (holdPeriod >= 2) {
      considerations.push('May qualify for 1031 like-kind exchange')
    }
    if (holdPeriod >= 5) {
      considerations.push('Consider depreciation recapture implications')
    }
    
    return considerations
  }

  private determineOptimalStrategy(expectedReturn: number, growthScore: number, neighborhoodData: FreeNeighborhoodData): string {
    if (expectedReturn > 0.12) return 'Buy and hold for appreciation'
    if (neighborhoodData.rentalYield > 8) return 'Buy and hold for cash flow'
    if (growthScore > 80) return 'Long-term hold in growth market'
    if (expectedReturn < 0.04) return 'Fix and flip strategy'
    return 'Balanced buy and hold approach'
  }

  private extractCity(address: string): string {
    const parts = address.split(',')
    return parts[1]?.trim() || 'Unknown'
  }

  private extractState(address: string): string {
    const parts = address.split(',')
    return parts[2]?.trim().split(' ')[0] || 'CA'
  }

  private getFreeDataSources(): string[] {
    return [
      'US Census Bureau (FREE)',
      'Bureau of Labor Statistics (FREE)',
      'OpenStreetMap Geocoding (FREE)',
      'FBI Crime Data API (FREE)',
      'Department of Education (FREE)',
      'Public Property Records (FREE)',
      'Economic Research Calculations (FREE)'
    ]
  }
} 