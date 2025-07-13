import { MarketPredictionsService } from './MarketPredictionsService'
import { EnsembleAIService } from '../ai/advanced/EnsembleAIService'
import { ClimateRiskEngine } from './ClimateRiskEngine'
import { EnhancedRealDataService } from './EnhancedRealDataService'
import { expandedCityData } from '../data/ExtendedCityData'
import axios from 'axios'

interface FredResponse {
  success: boolean
  data?: any
  error?: string
}

export class EnhancedMarketPredictionsService extends MarketPredictionsService {
  private static enhancedInstance: EnhancedMarketPredictionsService | null = null
  private cityDataMap: Map<string, any> = new Map()
  private readonly FRED_API_KEY = process.env.FRED_API_KEY || ''
  private readonly FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series'
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly dataService: EnhancedRealDataService
  private readonly climateRisk: ClimateRiskEngine

  protected constructor() {
    super()
    this.initializeCityData()
    this.dataService = EnhancedRealDataService.getInstance()
    this.climateRisk = ClimateRiskEngine.getInstance()
  }

  static getInstance(): EnhancedMarketPredictionsService {
    if (!EnhancedMarketPredictionsService.enhancedInstance) {
      EnhancedMarketPredictionsService.enhancedInstance = new EnhancedMarketPredictionsService()
    }
    return EnhancedMarketPredictionsService.enhancedInstance
  }

  private initializeCityData() {
    this.cityDataMap = new Map(
      expandedCityData.map(city => [`${city.name.toLowerCase()}_${city.state.toLowerCase()}`, city])
    )
  }

  async predictMarket(
    region: string,
    timeframe: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' = '1Y'
  ): Promise<MarketPrediction> {
    console.log(`📈 Enhanced: Generating market prediction for ${region} (${timeframe})...`)

    try {
      // Get city data
      const [city, state] = region.split(',').map(s => s.trim())
      const cityData = this.getCityData(city, state)

      // Get enhanced data
      const [
        economicFactors,
        demographicFactors,
        policyFactors,
        technologyFactors,
        climateFactors,
        fredData
      ] = await Promise.all([
        this.analyzeEnhancedEconomicFactors(region),
        this.analyzeEnhancedDemographics(region),
        this.analyzeEnhancedPolicyFactors(region),
        this.analyzeEnhancedTechnologyFactors(region),
        this.analyzeEnhancedClimateFactors(region),
        this.getFredEconomicData(region)
      ])

      // Generate enhanced prediction
      const prediction = await this.generateEnhancedPrediction(
        economicFactors,
        demographicFactors,
        policyFactors,
        technologyFactors,
        climateFactors,
        fredData,
        timeframe,
        cityData
      )

      // Create enhanced scenarios
      const scenarios = await this.generateEnhancedScenarios(prediction, timeframe, cityData)

      // Identify enhanced indicators
      const keyIndicators = await this.identifyEnhancedKeyIndicators(region, cityData)

      // Assess enhanced risks and opportunities
      const risks = await this.assessEnhancedRisks(region, timeframe, cityData)
      const opportunities = await this.identifyEnhancedOpportunities(region, timeframe, cityData)

      return {
        region,
        timeframe,
        prediction,
        drivers: {
          economic: economicFactors,
          demographic: demographicFactors,
          policy: policyFactors,
          technology: technologyFactors,
          climate: climateFactors
        },
        scenarios,
        keyIndicators,
        risks,
        opportunities
      }
    } catch (error) {
      console.error('Error in enhanced market prediction:', error)
      return super.predictMarket(region, timeframe)
    }
  }

  private async getFredEconomicData(region: string): Promise<FredResponse> {
    const cacheKey = `fred_${region}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      // Get relevant FRED series for the region
      const series = await this.getRelevantFredSeries(region)
      const observations = await Promise.all(
        series.map(s => this.getFredSeriesData(s))
      )

      const result: FredResponse = {
        success: true,
        data: {
          series,
          observations
        }
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error'
      }
    }
  }

  private async getRelevantFredSeries(region: string): Promise<string[]> {
    const [city, state] = region.split(',').map(s => s.trim())
    const stateCode = this.getStateCode(state)

    return [
      `HOUST${stateCode}`, // Housing Starts
      `LAUST${stateCode}`, // Unemployment Rate
      `MEHOINUS${stateCode}A672N`, // Median Household Income
      `RGMP${stateCode}`, // Real GDP
      `PCPI${stateCode}`, // Per Capita Personal Income
      `ACTLISCOU${stateCode}`, // Active Listings Count
      `MEDLISPRI${stateCode}`, // Median Listing Price
      `MSPUS${stateCode}`, // Median Sales Price
      `RRVRUSQ159N${stateCode}` // Rental Vacancy Rate
    ]
  }

  private async getFredSeriesData(series: string): Promise<any> {
    try {
      const response = await axios.get(`${this.FRED_BASE_URL}/observations`, {
        params: {
          series_id: series,
          api_key: this.FRED_API_KEY,
          file_type: 'json',
          sort_order: 'desc',
          limit: 100
        }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching FRED series ${series}:`, error)
      return null
    }
  }

  private async analyzeEnhancedEconomicFactors(region: string): Promise<EconomicFactor[]> {
    const [city, state] = region.split(',').map(s => s.trim())
    const cityData = this.getCityData(city, state)
    const baseFactors = await super.analyzeEconomicFactors(region)

    if (!cityData) {
      return baseFactors
    }

    return baseFactors.map(factor => ({
      ...factor,
      impact: factor.impact * (cityData.investorInterest / 50),
      severity: Math.min(100, factor.severity * (cityData.developmentIndex / 50))
    }))
  }

  private async analyzeEnhancedDemographics(region: string): Promise<DemographicFactor[]> {
    const [city, state] = region.split(',').map(s => s.trim())
    const cityData = this.getCityData(city, state)
    const baseFactors = await super.analyzeDemographics(region)

    if (!cityData) {
      return baseFactors
    }

    return baseFactors.map(factor => ({
      ...factor,
      impact: factor.impact * (cityData.population / 500000),
      severity: Math.min(100, factor.severity * (cityData.employmentRate / 50))
    }))
  }

  private async analyzeEnhancedPolicyFactors(region: string): Promise<PolicyFactor[]> {
    const [city, state] = region.split(',').map(s => s.trim())
    const cityData = this.getCityData(city, state)
    const baseFactors = await super.analyzePolicyFactors(region)

    if (!cityData) {
      return baseFactors
    }

    return baseFactors.map(factor => ({
      ...factor,
      impact: factor.impact * (cityData.permitActivity / 50),
      severity: Math.min(100, factor.severity * (cityData.developmentIndex / 50))
    }))
  }

  private async analyzeEnhancedTechnologyFactors(region: string): Promise<TechnologyFactor[]> {
    const [city, state] = region.split(',').map(s => s.trim())
    const cityData = this.getCityData(city, state)
    const baseFactors = await super.analyzeTechnologyFactors(region)

    if (!cityData) {
      return baseFactors
    }

    return baseFactors.map(factor => ({
      ...factor,
      impact: factor.impact * (cityData.developmentIndex / 50),
      severity: Math.min(100, factor.severity * (cityData.investorInterest / 50))
    }))
  }

  private async analyzeEnhancedClimateFactors(region: string): Promise<ClimateFactor[]> {
    const [city, state] = region.split(',').map(s => s.trim())
    const cityData = this.getCityData(city, state)
    const baseFactors = await super.analyzeClimateFactors(region)

    if (!cityData) {
      return baseFactors
    }

    return baseFactors.map(factor => ({
      ...factor,
      impact: factor.impact * (cityData.climateRiskScore / 50),
      severity: Math.min(100, factor.severity * (cityData.climateRiskScore / 50))
    }))
  }

  private async generateEnhancedPrediction(
    economicFactors: EconomicFactor[],
    demographicFactors: DemographicFactor[],
    policyFactors: PolicyFactor[],
    technologyFactors: TechnologyFactor[],
    climateFactors: ClimateFactor[],
    fredData: FredResponse,
    timeframe: string,
    cityData: any
  ): Promise<any> {
    const basePrediction = await super.generatePrediction(
      economicFactors,
      demographicFactors,
      policyFactors,
      technologyFactors,
      climateFactors,
      timeframe
    )

    if (!cityData || !fredData.success) {
      return basePrediction
    }

    // Enhance prediction with city and FRED data
    const fredTrends = this.analyzeFredTrends(fredData.data)
    const cityMultiplier = this.calculateCityMultiplier(cityData)

    return {
      ...basePrediction,
      priceChange: basePrediction.priceChange * cityMultiplier * fredTrends.priceMultiplier,
      direction: this.determineDirection(basePrediction.priceChange * cityMultiplier * fredTrends.priceMultiplier),
      confidence: Math.min(95, basePrediction.confidence * (cityData.developmentIndex / 50)),
      volatility: basePrediction.volatility * (cityData.climateRiskScore / 50)
    }
  }

  private analyzeFredTrends(fredData: any): any {
    const trends = {
      priceMultiplier: 1,
      economicHealth: 0,
      marketStrength: 0
    }

    if (!fredData || !fredData.observations) {
      return trends
    }

    // Analyze price trends
    const priceSeries = fredData.observations.find((o: any) => o.series_id.startsWith('MSPUS'))
    if (priceSeries) {
      const recentPrices = priceSeries.observations.slice(0, 12)
      const priceChange = this.calculateChange(recentPrices)
      trends.priceMultiplier = 1 + (priceChange / 100)
    }

    // Analyze economic health
    const gdpSeries = fredData.observations.find((o: any) => o.series_id.startsWith('RGMP'))
    const incomeSeries = fredData.observations.find((o: any) => o.series_id.startsWith('PCPI'))
    if (gdpSeries && incomeSeries) {
      const gdpGrowth = this.calculateChange(gdpSeries.observations.slice(0, 4))
      const incomeGrowth = this.calculateChange(incomeSeries.observations.slice(0, 4))
      trends.economicHealth = (gdpGrowth + incomeGrowth) / 2
    }

    // Analyze market strength
    const listingsSeries = fredData.observations.find((o: any) => o.series_id.startsWith('ACTLISCOU'))
    const vacancySeries = fredData.observations.find((o: any) => o.series_id.startsWith('RRVRUSQ159N'))
    if (listingsSeries && vacancySeries) {
      const listingsChange = this.calculateChange(listingsSeries.observations.slice(0, 6))
      const vacancyChange = this.calculateChange(vacancySeries.observations.slice(0, 6))
      trends.marketStrength = -1 * (listingsChange + vacancyChange) / 2 // Inverse relationship
    }

    return trends
  }

  private calculateChange(observations: any[]): number {
    if (!observations || observations.length < 2) {
      return 0
    }

    const oldest = observations[observations.length - 1].value
    const newest = observations[0].value
    return ((newest - oldest) / oldest) * 100
  }

  private calculateCityMultiplier(cityData: any): number {
    const growthScore = (
      cityData.priceAppreciationYoY +
      cityData.rentGrowthRate +
      cityData.permitActivity / 100 +
      cityData.developmentIndex / 100
    ) / 4

    return 1 + (growthScore / 100)
  }

  private determineDirection(priceChange: number): 'bull' | 'bear' | 'neutral' {
    if (priceChange > 5) return 'bull'
    if (priceChange < -5) return 'bear'
    return 'neutral'
  }

  private async generateEnhancedScenarios(
    prediction: any,
    timeframe: string,
    cityData: any
  ): Promise<any> {
    const baseScenarios = await super.generateScenarios(prediction, timeframe)

    if (!cityData) {
      return baseScenarios
    }

    const riskMultiplier = cityData.climateRiskScore / 50
    const growthMultiplier = cityData.developmentIndex / 50

    return {
      optimistic: this.adjustScenario(baseScenarios.optimistic, growthMultiplier),
      baseline: baseScenarios.baseline,
      pessimistic: this.adjustScenario(baseScenarios.pessimistic, riskMultiplier)
    }
  }

  private adjustScenario(scenario: any, multiplier: number): any {
    return {
      ...scenario,
      priceChange: scenario.priceChange * multiplier,
      rentGrowth: scenario.rentGrowth * multiplier,
      vacancyRate: scenario.vacancyRate * (2 - multiplier),
      absorption: scenario.absorption * multiplier
    }
  }

  private async identifyEnhancedKeyIndicators(region: string, cityData: any): Promise<any[]> {
    const baseIndicators = await super.identifyKeyIndicators(region)

    if (!cityData) {
      return baseIndicators
    }

    return baseIndicators.map(indicator => ({
      ...indicator,
      value: indicator.value * (cityData.developmentIndex / 50),
      weight: indicator.weight * (cityData.investorInterest / 50),
      confidence: Math.min(95, indicator.confidence * (cityData.developmentIndex / 50))
    }))
  }

  private async assessEnhancedRisks(
    region: string,
    timeframe: string,
    cityData: any
  ): Promise<any[]> {
    const baseRisks = await super.assessRisks(region, timeframe)

    if (!cityData) {
      return baseRisks
    }

    return baseRisks.map(risk => ({
      ...risk,
      probability: risk.probability * (cityData.climateRiskScore / 50),
      impact: risk.impact * (cityData.developmentIndex / 50),
      mitigation: this.enhanceMitigation(risk.mitigation, cityData)
    }))
  }

  private enhanceMitigation(mitigation: any, cityData: any): any {
    return {
      ...mitigation,
      effectiveness: mitigation.effectiveness * (cityData.developmentIndex / 50),
      cost: mitigation.cost * (cityData.affordabilityIndex / 50),
      timeframe: mitigation.timeframe
    }
  }

  private async identifyEnhancedOpportunities(
    region: string,
    timeframe: string,
    cityData: any
  ): Promise<any[]> {
    const baseOpportunities = await super.identifyOpportunities(region, timeframe)

    if (!cityData) {
      return baseOpportunities
    }

    return baseOpportunities.map(opportunity => ({
      ...opportunity,
      potential: opportunity.potential * (cityData.investorInterest / 50),
      confidence: Math.min(95, opportunity.confidence * (cityData.developmentIndex / 50)),
      timeline: opportunity.timeline
    }))
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

  private getStateCode(state: string): string {
    const stateMap: { [key: string]: string } = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY'
    }

    return stateMap[state] || state
  }
} 