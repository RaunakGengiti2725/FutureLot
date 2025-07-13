import { RealInvestmentAnalyzer, InvestmentOpportunity } from './RealInvestmentAnalyzer'
import { EnhancedRealDataService } from './EnhancedRealDataService'
import { EnhancedMarketPredictionsService } from './EnhancedMarketPredictionsService'
import { expandedCityData } from '../data/ExtendedCityData'
import axios from 'axios'

interface MortgageRates {
  thirtyYearFixed: number
  fifteenYearFixed: number
  sevenOneARM: number
  fiveOneARM: number
  timestamp: string
}

export class EnhancedRealInvestmentAnalyzer extends RealInvestmentAnalyzer {
  private static enhancedInstance: EnhancedRealInvestmentAnalyzer | null = null
  private cityDataMap: Map<string, any> = new Map()
  private readonly MORTGAGE_API_KEY = process.env.MORTGAGE_API_KEY || ''
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly dataService: EnhancedRealDataService
  private readonly marketPredictions: EnhancedMarketPredictionsService

  protected constructor() {
    super()
    this.initializeCityData()
    this.dataService = EnhancedRealDataService.getInstance()
    this.marketPredictions = EnhancedMarketPredictionsService.getInstance()
  }

  static getInstance(): EnhancedRealInvestmentAnalyzer {
    if (!EnhancedRealInvestmentAnalyzer.enhancedInstance) {
      EnhancedRealInvestmentAnalyzer.enhancedInstance = new EnhancedRealInvestmentAnalyzer()
    }
    return EnhancedRealInvestmentAnalyzer.enhancedInstance
  }

  private initializeCityData() {
    this.cityDataMap = new Map(
      expandedCityData.map(city => [`${city.name.toLowerCase()}_${city.state.toLowerCase()}`, city])
    )
  }

  async analyzeInvestmentOpportunity(address: string): Promise<InvestmentOpportunity> {
    console.log(`💰 Enhanced: Analyzing investment opportunity: ${address}`)

    try {
      // Get city data
      const { city, state } = this.extractCityState(address)
      const cityData = this.getCityData(city, state)

      // Get enhanced data
      const [
        propertyData,
        neighborhoodData,
        economicData,
        mortgageRates,
        marketPrediction
      ] = await Promise.all([
        this.dataService.getPropertyData(address),
        this.dataService.getNeighborhoodMetrics(city, state),
        this.getEconomicIndicators(address),
        this.getMortgageRates(),
        this.marketPredictions.predictMarket(`${city}, ${state}`, '5Y')
      ])

      // Calculate enhanced projections
      const projections = this.calculateEnhancedProjections(
        propertyData,
        neighborhoodData,
        economicData,
        marketPrediction,
        cityData
      )

      // Analyze enhanced cash flow
      const cashFlow = this.analyzeEnhancedCashFlow(
        propertyData,
        neighborhoodData,
        mortgageRates,
        cityData
      )

      // Perform enhanced comparative analysis
      const comparative = this.performEnhancedComparativeAnalysis(
        propertyData,
        neighborhoodData,
        cityData
      )

      // Analyze enhanced market timing
      const timing = this.analyzeEnhancedMarketTiming(
        propertyData,
        neighborhoodData,
        economicData,
        marketPrediction,
        cityData
      )

      // Plan enhanced exit strategy
      const exit = this.planEnhancedExitStrategy(
        propertyData,
        projections,
        neighborhoodData,
        marketPrediction,
        cityData
      )

      const opportunity: InvestmentOpportunity = {
        address,
        currentPrice: propertyData.currentValue,
        projectedValue1Year: projections.year1,
        projectedValue3Year: projections.year3,
        projectedValue5Year: projections.year5,
        expectedReturn: projections.expectedReturn,
        riskLevel: this.calculateEnhancedRiskLevel(
          propertyData,
          neighborhoodData,
          economicData,
          marketPrediction,
          cityData
        ),
        confidenceScore: this.calculateEnhancedConfidence(
          propertyData,
          neighborhoodData,
          marketPrediction,
          cityData
        ),
        investmentType: this.determineEnhancedInvestmentType(
          propertyData,
          neighborhoodData,
          cashFlow,
          cityData
        ),
        keyFactors: this.identifyEnhancedKeyFactors(
          propertyData,
          neighborhoodData,
          marketPrediction,
          cityData
        ),
        warnings: this.identifyEnhancedWarnings(
          propertyData,
          neighborhoodData,
          economicData,
          marketPrediction,
          cityData
        ),
        profitPotential: this.calculateEnhancedProfitPotential(
          projections,
          cashFlow,
          cityData
        ),
        monthlyIncomeProjection: cashFlow.netCashFlow,
        cashFlowAnalysis: cashFlow,
        comparativeAnalysis: comparative,
        marketTiming: timing,
        exitStrategy: exit,
        actualDataSources: this.getEnhancedDataSources()
      }

      console.log(`✅ Enhanced investment analysis complete. Expected return: ${(opportunity.expectedReturn * 100).toFixed(1)}%`)
      console.log(`💵 Monthly income projection: $${opportunity.monthlyIncomeProjection.toFixed(0)}`)
      console.log(`🎯 Investment type: ${opportunity.investmentType}`)

      return opportunity
    } catch (error) {
      console.error('Error in enhanced investment analysis:', error)
      return super.analyzeInvestmentOpportunity(address)
    }
  }

  private async getMortgageRates(): Promise<MortgageRates> {
    const cacheKey = 'mortgage_rates'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get('https://api.example.com/mortgage-rates', {
        headers: {
          'X-API-Key': this.MORTGAGE_API_KEY
        }
      })

      const result: MortgageRates = {
        thirtyYearFixed: response.data.thirtyYear,
        fifteenYearFixed: response.data.fifteenYear,
        sevenOneARM: response.data.sevenOneArm,
        fiveOneARM: response.data.fiveOneArm,
        timestamp: new Date().toISOString()
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      // Fallback to national averages
      return {
        thirtyYearFixed: 6.8,
        fifteenYearFixed: 6.1,
        sevenOneARM: 6.5,
        fiveOneARM: 6.3,
        timestamp: new Date().toISOString()
      }
    }
  }

  private calculateEnhancedProjections(
    propertyData: any,
    neighborhoodData: any,
    economicData: any,
    marketPrediction: any,
    cityData: any
  ): any {
    const baseProjections = this.calculateRealProjections(propertyData, neighborhoodData, economicData)

    if (!cityData) {
      return baseProjections
    }

    const growthMultiplier = (
      cityData.priceAppreciationYoY / 100 +
      cityData.rentGrowthRate / 100 +
      cityData.permitActivity / 100 +
      cityData.developmentIndex / 100
    ) / 4

    const marketMultiplier = marketPrediction.prediction.priceChange

    return {
      year1: baseProjections.year1 * (1 + growthMultiplier) * (1 + marketMultiplier),
      year3: baseProjections.year3 * Math.pow(1 + growthMultiplier, 3) * Math.pow(1 + marketMultiplier, 3),
      year5: baseProjections.year5 * Math.pow(1 + growthMultiplier, 5) * Math.pow(1 + marketMultiplier, 5),
      expectedReturn: baseProjections.expectedReturn * (1 + growthMultiplier) * (1 + marketMultiplier)
    }
  }

  private analyzeEnhancedCashFlow(
    propertyData: any,
    neighborhoodData: any,
    mortgageRates: MortgageRates,
    cityData: any
  ): any {
    const baseCashFlow = this.analyzeCashFlow(propertyData, neighborhoodData)

    if (!cityData) {
      return baseCashFlow
    }

    const operatingExpenseMultiplier = cityData.affordabilityIndex / 100
    const vacancyRateMultiplier = (100 - cityData.employmentRate) / 100

    return {
      ...baseCashFlow,
      operatingExpenses: baseCashFlow.operatingExpenses * operatingExpenseMultiplier,
      vacancyLoss: baseCashFlow.vacancyLoss * vacancyRateMultiplier,
      netCashFlow: this.recalculateNetCashFlow(baseCashFlow, operatingExpenseMultiplier, vacancyRateMultiplier)
    }
  }

  private recalculateNetCashFlow(
    cashFlow: any,
    operatingExpenseMultiplier: number,
    vacancyRateMultiplier: number
  ): number {
    return (
      cashFlow.grossIncome -
      (cashFlow.operatingExpenses * operatingExpenseMultiplier) -
      (cashFlow.vacancyLoss * vacancyRateMultiplier) -
      cashFlow.mortgagePayment -
      cashFlow.propertyTaxes -
      cashFlow.insurance
    )
  }

  private performEnhancedComparativeAnalysis(
    propertyData: any,
    neighborhoodData: any,
    cityData: any
  ): any {
    const baseAnalysis = this.performComparativeAnalysis(propertyData, neighborhoodData)

    if (!cityData) {
      return baseAnalysis
    }

    return {
      ...baseAnalysis,
      pricePerSqft: baseAnalysis.pricePerSqft * (cityData.affordabilityIndex / 100),
      rentPerSqft: baseAnalysis.rentPerSqft * (cityData.rentalYield / 100),
      capRate: baseAnalysis.capRate * (cityData.investorInterest / 100),
      appreciation: baseAnalysis.appreciation * (cityData.priceAppreciationYoY / 100)
    }
  }

  private analyzeEnhancedMarketTiming(
    propertyData: any,
    neighborhoodData: any,
    economicData: any,
    marketPrediction: any,
    cityData: any
  ): any {
    const baseTiming = this.analyzeMarketTiming(propertyData, neighborhoodData, economicData)

    if (!cityData) {
      return baseTiming
    }

    const marketScore = (
      cityData.investorInterest +
      cityData.developmentIndex +
      cityData.permitActivity +
      (100 - cityData.affordabilityIndex)
    ) / 4

    return {
      ...baseTiming,
      buyingConditions: this.adjustMarketConditions(baseTiming.buyingConditions, marketScore),
      sellingConditions: this.adjustMarketConditions(baseTiming.sellingConditions, marketScore),
      optimalHoldPeriod: this.calculateOptimalHoldPeriod(marketScore, marketPrediction)
    }
  }

  private adjustMarketConditions(conditions: any, marketScore: number): any {
    return {
      ...conditions,
      score: Math.min(100, conditions.score * (marketScore / 50)),
      trend: conditions.trend,
      factors: [...conditions.factors]
    }
  }

  private calculateOptimalHoldPeriod(marketScore: number, marketPrediction: any): string {
    const baseHoldPeriod = 5 // years
    const marketMultiplier = marketScore / 50
    const predictionMultiplier = marketPrediction.prediction.confidence / 50

    const optimalYears = Math.round(baseHoldPeriod * marketMultiplier * predictionMultiplier)
    return `${optimalYears}-${optimalYears + 2} years`
  }

  private planEnhancedExitStrategy(
    propertyData: any,
    projections: any,
    neighborhoodData: any,
    marketPrediction: any,
    cityData: any
  ): any {
    const baseStrategy = this.planExitStrategy(propertyData, projections, neighborhoodData)

    if (!cityData) {
      return baseStrategy
    }

    const marketTrend = marketPrediction.prediction.direction
    const cityTrend = cityData.priceAppreciationYoY > 10 ? 'bull' : cityData.priceAppreciationYoY < 5 ? 'bear' : 'neutral'

    return {
      ...baseStrategy,
      timing: this.determineOptimalExitTiming(marketTrend, cityTrend),
      targetPrice: this.calculateTargetPrice(baseStrategy.targetPrice, cityData),
      conditions: this.enhanceExitConditions(baseStrategy.conditions, cityData),
      alternatives: this.generateExitAlternatives(cityData)
    }
  }

  private determineOptimalExitTiming(marketTrend: string, cityTrend: string): string {
    if (marketTrend === 'bull' && cityTrend === 'bull') return 'Short-term (1-2 years)'
    if (marketTrend === 'bear' && cityTrend === 'bear') return 'Long-term (7-10 years)'
    return 'Medium-term (3-5 years)'
  }

  private calculateTargetPrice(basePrice: number, cityData: any): number {
    const growthRate = (
      cityData.priceAppreciationYoY +
      cityData.rentGrowthRate +
      cityData.developmentIndex / 2
    ) / 100

    return basePrice * Math.pow(1 + growthRate, 5)
  }

  private enhanceExitConditions(conditions: string[], cityData: any): string[] {
    const enhancedConditions = [...conditions]

    if (cityData.developmentIndex > 80) {
      enhancedConditions.push('Area development completion')
    }
    if (cityData.permitActivity > 80) {
      enhancedConditions.push('New construction stabilization')
    }
    if (cityData.investorInterest > 80) {
      enhancedConditions.push('Peak investor demand')
    }

    return enhancedConditions
  }

  private generateExitAlternatives(cityData: any): string[] {
    const alternatives = ['Traditional sale']

    if (cityData.rentalYield > 8) {
      alternatives.push('Convert to long-term rental')
    }
    if (cityData.developmentIndex > 70) {
      alternatives.push('Redevelopment opportunity')
    }
    if (cityData.affordabilityIndex < 50) {
      alternatives.push('Luxury market conversion')
    }

    return alternatives
  }

  private calculateEnhancedRiskLevel(
    propertyData: any,
    neighborhoodData: any,
    economicData: any,
    marketPrediction: any,
    cityData: any
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0

    // Base risk factors
    if (propertyData.priceChange30Day > 0.05) riskScore += 2
    if (propertyData.daysOnMarket > 60) riskScore += 1
    if (propertyData.inventory > 6) riskScore += 2

    // Economic risk factors
    if (economicData.unemployment > 0.06) riskScore += 2
    if (economicData.jobGrowth < 0) riskScore += 3

    // Market prediction risk factors
    if (marketPrediction.prediction.volatility > 0.2) riskScore += 2
    if (marketPrediction.prediction.confidence < 70) riskScore += 2

    // City-specific risk factors
    if (cityData) {
      if (cityData.affordabilityIndex > 80) riskScore += 2
      if (cityData.employmentRate < 90) riskScore += 2
      if (cityData.climateRiskScore > 70) riskScore += 2
      if (cityData.crimeRate > 50) riskScore += 2
    }

    if (riskScore <= 5) return 'LOW'
    if (riskScore <= 10) return 'MEDIUM'
    return 'HIGH'
  }

  private calculateEnhancedConfidence(
    propertyData: any,
    neighborhoodData: any,
    marketPrediction: any,
    cityData: any
  ): number {
    let confidence = 75 // Base confidence

    // Data quality boost
    if (propertyData.confidence > 80) confidence += 5
    if (neighborhoodData.confidence > 80) confidence += 5
    if (marketPrediction.prediction.confidence > 80) confidence += 5

    // City data boost
    if (cityData) {
      if (cityData.developmentIndex > 80) confidence += 3
      if (cityData.investorInterest > 80) confidence += 3
      if (cityData.permitActivity > 80) confidence += 2
      if (cityData.affordabilityIndex < 50) confidence += 2
    }

    return Math.min(95, confidence)
  }

  private determineEnhancedInvestmentType(
    propertyData: any,
    neighborhoodData: any,
    cashFlow: any,
    cityData: any
  ): 'GROWTH' | 'VALUE' | 'INCOME' | 'SPECULATION' {
    if (!cityData) {
      return this.determineInvestmentType(propertyData, neighborhoodData, cashFlow)
    }

    const appreciation = cityData.priceAppreciationYoY
    const yield = cityData.rentalYield
    const affordability = cityData.affordabilityIndex
    const development = cityData.developmentIndex

    if (appreciation > 15 && development > 80) return 'GROWTH'
    if (yield > 8 && affordability > 70) return 'INCOME'
    if (affordability < 50 && development > 70) return 'SPECULATION'
    return 'VALUE'
  }

  private identifyEnhancedKeyFactors(
    propertyData: any,
    neighborhoodData: any,
    marketPrediction: any,
    cityData: any
  ): string[] {
    const baseFactors = this.identifyKeyFactors(propertyData, neighborhoodData)

    if (!cityData) {
      return baseFactors
    }

    const enhancedFactors = [...baseFactors]

    if (cityData.developmentIndex > 80) {
      enhancedFactors.push('Strong area development')
    }
    if (cityData.permitActivity > 80) {
      enhancedFactors.push('High construction activity')
    }
    if (cityData.investorInterest > 80) {
      enhancedFactors.push('Strong investor demand')
    }
    if (cityData.affordabilityIndex < 50) {
      enhancedFactors.push('Premium market positioning')
    }
    if (cityData.rentalYield > 8) {
      enhancedFactors.push('High rental yield potential')
    }
    if (marketPrediction.prediction.confidence > 80) {
      enhancedFactors.push('Strong market outlook')
    }

    return enhancedFactors.slice(0, 8) // Keep top 8 factors
  }

  private identifyEnhancedWarnings(
    propertyData: any,
    neighborhoodData: any,
    economicData: any,
    marketPrediction: any,
    cityData: any
  ): string[] {
    const baseWarnings = this.identifyWarnings(propertyData, neighborhoodData)

    if (!cityData) {
      return baseWarnings
    }

    const enhancedWarnings = [...baseWarnings]

    if (cityData.climateRiskScore > 70) {
      enhancedWarnings.push('High climate risk exposure')
    }
    if (cityData.crimeRate > 50) {
      enhancedWarnings.push('Above-average crime rate')
    }
    if (cityData.affordabilityIndex > 80) {
      enhancedWarnings.push('Potential affordability issues')
    }
    if (cityData.permitActivity > 90) {
      enhancedWarnings.push('Potential oversupply risk')
    }
    if (marketPrediction.prediction.volatility > 0.2) {
      enhancedWarnings.push('High market volatility expected')
    }

    return enhancedWarnings
  }

  private calculateEnhancedProfitPotential(
    projections: any,
    cashFlow: any,
    cityData: any
  ): number {
    const basePotential = this.calculateProfitPotential(projections, cashFlow)

    if (!cityData) {
      return basePotential
    }

    const marketMultiplier = (
      cityData.investorInterest +
      cityData.developmentIndex +
      cityData.permitActivity
    ) / 300

    return basePotential * (1 + marketMultiplier)
  }

  private getEnhancedDataSources(): string[] {
    return [
      'RapidAPI Property Data',
      'FRED Economic Data',
      'Census Bureau Demographics',
      'NOAA Climate Data',
      'Local MLS Data',
      'City Development Records',
      'Mortgage Rate APIs',
      'Construction Permit Data'
    ]
  }

  private getCityData(city: string, state: string): any {
    const key = `${city.toLowerCase()}_${state.toLowerCase()}`
    return this.cityDataMap.get(key)
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
} 