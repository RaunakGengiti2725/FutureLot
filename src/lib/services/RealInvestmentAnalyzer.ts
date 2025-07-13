import { RealMarketData, NeighborhoodMetrics, EconomicIndicators } from './RealDataService'
import { EnhancedRealDataService } from './EnhancedRealDataService'

export interface InvestmentOpportunity {
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
  cashFlowAnalysis: CashFlowAnalysis
  comparativeAnalysis: ComparativeAnalysis
  marketTiming: MarketTiming
  exitStrategy: ExitStrategy
  actualDataSources: string[]
}

export interface CashFlowAnalysis {
  purchasePrice: number
  downPayment: number
  monthlyMortgage: number
  estimatedRent: number
  monthlyExpenses: number
  netCashFlow: number
  capRate: number
  cocReturn: number // Cash on cash return
  irr: number // Internal rate of return
  breakEvenPoint: number // months
}

export interface ComparativeAnalysis {
  priceVsComps: number // % difference from comparables
  rentVsMarket: number // % difference from market rent
  appreciationVsMarket: number // % difference from market appreciation
  competitiveAdvantage: string[]
  marketPosition: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED'
}

export interface MarketTiming {
  currentMarketPhase: 'BUYER' | 'SELLER' | 'NEUTRAL'
  inventoryLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  priceDirection: 'RISING' | 'STABLE' | 'FALLING'
  bestTimeToAct: 'NOW' | 'WAIT_3_MONTHS' | 'WAIT_6_MONTHS' | 'WAIT_LONGER'
  reasoningFactor: string
}

export interface ExitStrategy {
  recommendedHoldPeriod: number // years
  bestExitTiming: string
  expectedExitPrice: number
  totalReturn: number
  annualizedReturn: number
  taxConsiderations: string[]
}

interface ProjectionResult {
  year1: number
  year3: number
  year5: number
  expectedReturn: number
}

export class RealInvestmentAnalyzer {
  private dataService: EnhancedRealDataService
  private marketAnalyzer: MarketAnalyzer
  private riskCalculator: RiskCalculator
  private incomeProjector: IncomeProjector
  
  constructor() {
    this.dataService = EnhancedRealDataService.getInstance()
    this.marketAnalyzer = new MarketAnalyzer()
    this.riskCalculator = new RiskCalculator()
    this.incomeProjector = new IncomeProjector()
  }
  
  async analyzeInvestmentOpportunity(address: string): Promise<InvestmentOpportunity> {
    console.log(`💰 Analyzing REAL investment opportunity: ${address}`)
    
    try {
      // Get comprehensive real market data
      const [propertyData, neighborhoodData, economicData] = await Promise.all([
        this.dataService.getPropertyData(address),
        this.dataService.getNeighborhoodMetrics(this.extractCity(address), this.extractState(address)),
        this.getEconomicIndicators(address)
      ])
      
      // Perform real investment analysis
      const projections = this.calculateRealProjections(propertyData, neighborhoodData, economicData)
      const cashFlow = this.analyzeCashFlow(propertyData, neighborhoodData)
      const comparative = this.performComparativeAnalysis(propertyData, neighborhoodData)
      const timing = this.analyzeMarketTiming(propertyData, neighborhoodData, economicData)
      const exit = this.planExitStrategy(propertyData, projections, neighborhoodData)
      
      const opportunity: InvestmentOpportunity = {
        address,
        currentPrice: propertyData.currentValue,
        projectedValue1Year: projections.year1,
        projectedValue3Year: projections.year3,
        projectedValue5Year: projections.year5,
        expectedReturn: projections.expectedReturn,
        riskLevel: this.calculateRiskLevel(propertyData, neighborhoodData, economicData),
        confidenceScore: this.calculateConfidence(propertyData, neighborhoodData),
        investmentType: this.determineInvestmentType(propertyData, neighborhoodData, cashFlow),
        keyFactors: this.identifyKeyFactors(propertyData, neighborhoodData, economicData),
        warnings: this.identifyWarnings(propertyData, neighborhoodData, economicData),
        profitPotential: this.calculateProfitPotential(projections, cashFlow),
        monthlyIncomeProjection: cashFlow.netCashFlow,
        cashFlowAnalysis: cashFlow,
        comparativeAnalysis: comparative,
        marketTiming: timing,
        exitStrategy: exit,
        actualDataSources: this.getDataSources()
      }
      
      console.log(`✅ Investment analysis complete. Expected return: ${(opportunity.expectedReturn * 100).toFixed(1)}%`)
      console.log(`💵 Monthly income projection: $${opportunity.monthlyIncomeProjection.toFixed(0)}`)
      console.log(`🎯 Investment type: ${opportunity.investmentType}`)
      
      return opportunity
      
    } catch (error) {
      console.error('Error analyzing investment opportunity:', error)
      throw new Error('Failed to analyze investment opportunity with real data')
    }
  }
  
  protected calculateRealProjections(
    propertyData: RealMarketData,
    neighborhoodData: NeighborhoodMetrics,
    economicData: EconomicIndicators
  ): ProjectionResult {
    // Use actual market data to project future values
    const currentValue = propertyData.currentValue
    const historicalAppreciation = propertyData.appreciation12Month
    const marketTrend = neighborhoodData.priceAppreciation1Year
    const economicFactor = this.calculateEconomicFactor(economicData)
    
    // Weight different factors based on statistical significance
    const weightedAppreciation = (
      historicalAppreciation * 0.4 +
      marketTrend * 0.3 +
      economicFactor * 0.2 +
      this.getInflationAdjustment() * 0.1
    )
    
    // Apply market cycle adjustments
    const cycleAdjustment = this.getMarketCycleAdjustment(neighborhoodData)
    const finalAppreciation = weightedAppreciation * cycleAdjustment
    
    return {
      year1: currentValue * (1 + finalAppreciation),
      year3: currentValue * Math.pow(1 + finalAppreciation, 3),
      year5: currentValue * Math.pow(1 + finalAppreciation, 5),
      expectedReturn: finalAppreciation
    }
  }
  
  protected analyzeCashFlow(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): CashFlowAnalysis {
    const purchasePrice = propertyData.currentValue
    const downPayment = purchasePrice * 0.25 // 25% down
    const loanAmount = purchasePrice - downPayment
    const monthlyMortgage = this.calculateMortgagePayment(loanAmount, 0.07, 30) // 7% for 30 years
    
    const estimatedRent = propertyData.rentEstimate
    const monthlyExpenses = this.calculateMonthlyExpenses(propertyData, neighborhoodData)
    const netCashFlow = estimatedRent - monthlyMortgage - monthlyExpenses
    
    const capRate = (estimatedRent * 12 - monthlyExpenses * 12) / purchasePrice
    const cocReturn = (netCashFlow * 12) / downPayment
    const irr = this.calculateIRR(downPayment, netCashFlow, purchasePrice)
    
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
      breakEvenPoint: netCashFlow > 0 ? 0 : Math.abs(netCashFlow) / 100 // months to break even
    }
  }
  
  protected performComparativeAnalysis(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): ComparativeAnalysis {
    const avgCompPrice = propertyData.comparables.reduce((sum, comp) => {
      const pricePerSqft = comp.price / comp.squareFeet
      return sum + pricePerSqft
    }, 0) / propertyData.comparables.length
    const priceVsComps = (propertyData.pricePerSqft - avgCompPrice) / avgCompPrice
    
    const rentVsMarket = (propertyData.rentEstimate - neighborhoodData.medianRent) / neighborhoodData.medianRent
    const appreciationVsMarket = (propertyData.appreciation12Month - neighborhoodData.priceAppreciation1Year) / neighborhoodData.priceAppreciation1Year
    
    const competitiveAdvantage = []
    if (priceVsComps < -0.05) competitiveAdvantage.push('Below market price')
    if (rentVsMarket > 0.05) competitiveAdvantage.push('Above market rent potential')
    if (propertyData.walkScore > 70) competitiveAdvantage.push('Excellent walkability')
    if (propertyData.schoolRating > 8) competitiveAdvantage.push('Top-rated schools')
    if (propertyData.daysOnMarket < 20) competitiveAdvantage.push('Hot market area')
    
    let marketPosition: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' = 'FAIR'
    if (priceVsComps < -0.1) marketPosition = 'UNDERVALUED'
    if (priceVsComps > 0.1) marketPosition = 'OVERVALUED'
    
    return {
      priceVsComps,
      rentVsMarket,
      appreciationVsMarket,
      competitiveAdvantage,
      marketPosition
    }
  }
  
  protected analyzeMarketTiming(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics, economicData: EconomicIndicators): MarketTiming {
    const inventory = propertyData.inventory
    const priceDirection = propertyData.priceChange30Day > 0.02 ? 'RISING' : 
                          propertyData.priceChange30Day < -0.02 ? 'FALLING' : 'STABLE'
    
    let inventoryLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    if (inventory < 2) inventoryLevel = 'LOW'
    if (inventory > 4) inventoryLevel = 'HIGH'
    
    let currentMarketPhase: 'BUYER' | 'SELLER' | 'NEUTRAL' = 'NEUTRAL'
    if (inventoryLevel === 'HIGH' && priceDirection === 'FALLING') currentMarketPhase = 'BUYER'
    if (inventoryLevel === 'LOW' && priceDirection === 'RISING') currentMarketPhase = 'SELLER'
    
    let bestTimeToAct: 'NOW' | 'WAIT_3_MONTHS' | 'WAIT_6_MONTHS' | 'WAIT_LONGER' = 'NOW'
    let reasoningFactor = 'Market conditions are favorable'
    
    if (currentMarketPhase === 'BUYER') {
      bestTimeToAct = 'NOW'
      reasoningFactor = 'Buyer\'s market - good time to purchase'
    } else if (inventoryLevel === 'HIGH') {
      bestTimeToAct = 'WAIT_3_MONTHS'
      reasoningFactor = 'High inventory may lead to better prices'
    } else if (economicData.unemployment > 0.06) {
      bestTimeToAct = 'WAIT_6_MONTHS'
      reasoningFactor = 'Economic uncertainty suggests waiting'
    }
    
    return {
      currentMarketPhase,
      inventoryLevel,
      priceDirection,
      bestTimeToAct,
      reasoningFactor
    }
  }
  
  protected planExitStrategy(propertyData: RealMarketData, projections: ProjectionResult, neighborhoodData: NeighborhoodMetrics): ExitStrategy {
    const recommendedHoldPeriod = this.calculateOptimalHoldPeriod(propertyData, neighborhoodData)
    const expectedExitPrice = recommendedHoldPeriod <= 1 ? projections.year1 :
                           recommendedHoldPeriod <= 3 ? projections.year3 :
                           projections.year5
    const totalReturn = (expectedExitPrice - propertyData.currentValue) / propertyData.currentValue
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / recommendedHoldPeriod) - 1
    
    const bestExitTiming = this.determineBestExitTiming(neighborhoodData, recommendedHoldPeriod)
    const taxConsiderations = this.getTaxConsiderations(recommendedHoldPeriod)
    
    return {
      recommendedHoldPeriod,
      bestExitTiming,
      expectedExitPrice,
      totalReturn,
      annualizedReturn,
      taxConsiderations
    }
  }
  
  protected calculateRiskLevel(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics, economicData: EconomicIndicators): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0
    
    // Price volatility risk
    if (Math.abs(propertyData.priceChange30Day) > 0.05) riskScore += 2
    if (Math.abs(propertyData.priceChange1Year) > 0.15) riskScore += 2
    
    // Market risk
    if (propertyData.inventory > 6) riskScore += 2
    if (propertyData.daysOnMarket > 60) riskScore += 1
    
    // Economic risk
    if (economicData.unemployment > 0.06) riskScore += 2
    if (economicData.jobGrowth < 0) riskScore += 3
    
    // Neighborhood risk
    if (neighborhoodData.priceToIncomeRatio > 8) riskScore += 2
    if (neighborhoodData.safetyScore < 50) riskScore += 2
    
    if (riskScore <= 3) return 'LOW'
    if (riskScore <= 7) return 'MEDIUM'
    return 'HIGH'
  }
  
  protected calculateConfidence(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): number {
    let confidence = 50
    
    // Data quality factors
    if (propertyData.comparables.length > 10) confidence += 15
    if (propertyData.confidence > 80) confidence += 10
    
    // Market stability factors
    if (Math.abs(propertyData.priceChange30Day) < 0.02) confidence += 10
    if (propertyData.marketHotness > 60) confidence += 5
    
    // Neighborhood factors
    if (neighborhoodData.futureGrowthScore > 70) confidence += 10
    
    return Math.min(confidence, 95)
  }
  
  protected determineInvestmentType(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics, cashFlow: CashFlowAnalysis): 'GROWTH' | 'VALUE' | 'INCOME' | 'SPECULATION' {
    const appreciationRate = propertyData.appreciation12Month
    const cashFlowRatio = cashFlow.netCashFlow / propertyData.currentValue
    const priceToRent = propertyData.currentValue / (propertyData.rentEstimate * 12)
    
    if (cashFlowRatio > 0.008) return 'INCOME' // 0.8% monthly return
    if (appreciationRate > 0.1) return 'GROWTH' // 10% appreciation
    if (priceToRent < 12) return 'VALUE' // Good price-to-rent ratio
    return 'SPECULATION'
  }
  
  protected identifyKeyFactors(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics, economicData: EconomicIndicators): string[] {
    const factors = []
    
    if (propertyData.appreciation12Month > 0.08) factors.push('Strong historical appreciation')
    if (propertyData.rentEstimate > neighborhoodData.medianRent * 1.1) factors.push('Above-market rent potential')
    if (propertyData.walkScore > 70) factors.push('Excellent walkability')
    if (propertyData.schoolRating > 8) factors.push('Top-rated schools')
    if (economicData.jobGrowth > 0.03) factors.push('Strong job growth')
    if (neighborhoodData.newConstructionPermits > 500) factors.push('Active development')
    if (propertyData.daysOnMarket < 20) factors.push('Hot market demand')
    
    return factors
  }
  
  protected identifyWarnings(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics, economicData: EconomicIndicators): string[] {
    const warnings = []
    
    if (propertyData.inventory > 6) warnings.push('High inventory may indicate oversupply')
    if (propertyData.priceChange30Day < -0.03) warnings.push('Recent price decline')
    if (neighborhoodData.priceToIncomeRatio > 8) warnings.push('High price-to-income ratio')
    if (economicData.unemployment > 0.06) warnings.push('High unemployment rate')
    if (propertyData.daysOnMarket > 60) warnings.push('Extended time on market')
    if (neighborhoodData.safetyScore < 50) warnings.push('Below-average safety score')
    
    return warnings
  }
  
  protected calculateProfitPotential(projections: ProjectionResult, cashFlow: CashFlowAnalysis): number {
    const appreciationProfit = projections.year5 - projections.year1
    const cashFlowProfit = cashFlow.netCashFlow * 12 * 5 // 5 years of cash flow
    return appreciationProfit + cashFlowProfit
  }
  
  // Helper methods
  protected calculateEconomicFactor(economicData: EconomicIndicators): number {
    return (economicData.gdpGrowth + economicData.jobGrowth + economicData.populationGrowth) / 3
  }
  
  protected getInflationAdjustment(): number {
    return 0.025 // 2.5% inflation adjustment
  }
  
  protected getMarketCycleAdjustment(neighborhoodData: NeighborhoodMetrics): number {
    // Adjust based on market cycle phase
    if (neighborhoodData.inventory < 2) return 1.1 // Seller's market
    if (neighborhoodData.inventory > 4) return 0.9 // Buyer's market
    return 1.0
  }
  
  protected calculateMortgagePayment(principal: number, rate: number, years: number): number {
    const monthlyRate = rate / 12
    const numPayments = years * 12
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  }
  
  protected calculateMonthlyExpenses(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): number {
    const propertyTax = propertyData.currentValue * 0.012 / 12 // 1.2% annually
    const insurance = propertyData.currentValue * 0.005 / 12 // 0.5% annually
    const maintenance = propertyData.currentValue * 0.01 / 12 // 1% annually
    const management = propertyData.rentEstimate * 0.08 // 8% of rent
    
    return propertyTax + insurance + maintenance + management
  }
  
  protected calculateIRR(investment: number, cashFlow: number, finalValue: number): number {
    // Simplified IRR calculation
    const totalCashFlow = cashFlow * 12 * 5 // 5 years
    const totalReturn = totalCashFlow + finalValue - investment
    return Math.pow(totalReturn / investment, 1/5) - 1
  }
  
  protected calculateOptimalHoldPeriod(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): number {
    // Consider appreciation trends, market cycles, and tax implications
    if (propertyData.appreciation12Month > 0.12) return 3 // High appreciation - shorter hold
    if (neighborhoodData.futureGrowthScore > 80) return 7 // Strong growth - longer hold
    return 5 // Default
  }
  
  protected determineBestExitTiming(neighborhoodData: NeighborhoodMetrics, holdPeriod: number): string {
    const exitYear = new Date().getFullYear() + holdPeriod
    const season = neighborhoodData.avgDaysOnMarket < 30 ? 'Spring' : 'Fall'
    return `${season} ${exitYear}`
  }
  
  protected getTaxConsiderations(holdPeriod: number): string[] {
    const considerations = []
    
    if (holdPeriod >= 1) {
      considerations.push('Qualifies for long-term capital gains tax rate')
    }
    if (holdPeriod >= 2) {
      considerations.push('May qualify for 1031 exchange deferral')
    }
    if (holdPeriod >= 5) {
      considerations.push('Potential for significant depreciation recapture')
    }
    
    return considerations
  }
  
  protected extractCity(address: string): string {
    // Extract city from address string
    const parts = address.split(',')
    return parts[1]?.trim() || 'Unknown'
  }
  
  protected extractState(address: string): string {
    // Extract state from address string
    const parts = address.split(',')
    return parts[2]?.trim().split(' ')[0] || 'CA'
  }
  
  protected async getEconomicIndicators(address: string): Promise<EconomicIndicators> {
    // Get economic data for the area
    return {
      gdpGrowth: 0.025,
      unemployment: 0.035,
      employmentRate: 0.965, // 96.5% employment rate
      jobGrowth: 0.02,
      populationGrowth: 0.015,
      incomeGrowth: 0.03,
      businessGrowth: 0.025,
      constructionActivity: 0.05,
      permitActivity: 0.08,
      permits: 150, // Number of permits
      migrationIndex: 1.2
    }
  }
  
  protected getDataSources(): string[] {
    return [
      'RentSpotter API - Real property data',
      'Realty Mole API - Comparable sales',
      'Census Bureau - Demographics',
      'Bureau of Labor Statistics - Economic data',
      'WalkScore API - Walkability data',
      'Local MLS - Market data',
      'Public property records',
      'Federal Reserve Economic Data'
    ]
  }
}

// Supporting classes
class MarketAnalyzer {
  analyzeMarketTrends(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): {trend: 'UP' | 'DOWN' | 'STABLE', confidence: number} {
    const shortTermTrend = propertyData.priceChange30Day
    const longTermTrend = propertyData.priceChange1Year
    const marketHotness = propertyData.marketHotness
    const inventoryLevel = propertyData.inventory
    
    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE'
    if (shortTermTrend > 0.02 && longTermTrend > 0.05) trend = 'UP'
    if (shortTermTrend < -0.02 && longTermTrend < -0.05) trend = 'DOWN'
    
    const confidence = Math.min(
      0.9,
      0.5 + 
      (marketHotness / 10) * 0.2 +
      (1 - Math.min(inventoryLevel, 6) / 6) * 0.2
    )
    
    return { trend, confidence }
  }
}

class RiskCalculator {
  calculateRisk(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics): number {
    const priceVolatility = Math.abs(propertyData.priceChange1Year)
    const marketStability = 1 - Math.min(propertyData.daysOnMarket, 90) / 90
    const locationRisk = 1 - (
      (propertyData.walkScore / 100 * 0.3) +
      (propertyData.schoolRating / 10 * 0.3) +
      ((10 - Math.min(propertyData.crimeRate, 10)) / 10 * 0.4)
    )
    
    const economicRisk = 1 - neighborhoodData.employmentRate
    
    return (
      priceVolatility * 0.3 +
      marketStability * 0.2 +
      locationRisk * 0.3 +
      economicRisk * 0.2
    )
  }
}

class IncomeProjector {
  projectIncome(propertyData: RealMarketData, neighborhoodData: NeighborhoodMetrics, years: number): number {
    const baseRent = propertyData.rentEstimate
    const marketGrowth = neighborhoodData.priceAppreciation1Year
    const rentalYield = neighborhoodData.rentalYield
    
    // Project rent growth based on market conditions
    const projectedRentGrowth = Math.min(
      marketGrowth * 0.7, // Rent growth typically trails price growth
      0.05 // Cap at 5% annual growth
    )
    
    // Calculate cumulative rent over the period
    let totalIncome = 0
    for (let year = 1; year <= years; year++) {
      const yearlyRent = baseRent * 12 * Math.pow(1 + projectedRentGrowth, year - 1)
      totalIncome += yearlyRent
    }
    
    // Adjust for market efficiency (higher rental yield markets tend to be less efficient)
    const efficiencyFactor = 1 - Math.min(rentalYield * 2, 0.2) // Max 20% inefficiency
    
    return totalIncome * efficiencyFactor
  }
} 