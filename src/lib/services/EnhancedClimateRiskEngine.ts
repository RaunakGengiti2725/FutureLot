import { ClimateRiskEngine, ClimateRiskData, FloodRisk, WildfireRisk, HurricaneRisk, TornadoRisk, EarthquakeRisk, SeaLevelRisk, ExtremeHeatRisk, DroughtRisk, WinterStormRisk, RiskSeverity, DroughtSeverity, WinterStormSeverity, HurricaneCategory } from './ClimateRiskEngine'
import axios from 'axios'
import { expandedCityData } from '../data/ExtendedCityData'

interface NOAAResponse {
  success: boolean
  data?: any
  error?: string
}

export class EnhancedClimateRiskEngine extends ClimateRiskEngine {
  private static enhancedInstance: EnhancedClimateRiskEngine | null = null
  private cityDataMap: Map<string, any> = new Map()
  private readonly NOAA_API_KEY = process.env.NOAA_API_KEY || ''
  private readonly NOAA_BASE_URL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2'
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly cache: Map<string, { data: any; timestamp: number }> = new Map()

  protected constructor() {
    super()
    this.initializeCityData()
  }

  static getInstance(): EnhancedClimateRiskEngine {
    if (!EnhancedClimateRiskEngine.enhancedInstance) {
      EnhancedClimateRiskEngine.enhancedInstance = new EnhancedClimateRiskEngine()
    }
    return EnhancedClimateRiskEngine.enhancedInstance
  }

  private initializeCityData() {
    this.cityDataMap = new Map(
      expandedCityData.map(city => [`${city.name.toLowerCase()}_${city.state.toLowerCase()}`, city])
    )
  }

  async analyzeClimateRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    timeHorizon: '5-year' | '10-year' | '30-year' = '10-year'
  ): Promise<ClimateRiskData> {
    console.log(`🌍 Enhanced: Analyzing climate risk for ${city}, ${state}...`)

    try {
      // Get historical climate data from NOAA
      const [
        historicalTemps,
        historicalPrecip,
        historicalEvents
      ] = await Promise.all([
        this.getHistoricalTemperatures(lat, lng),
        this.getHistoricalPrecipitation(lat, lng),
        this.getHistoricalEvents(city, state)
      ])

      // Get city-specific data
      const cityData = this.getCityData(city, state)

      // Enhanced risk analysis
      const risks = {
        flood: await this.analyzeEnhancedFloodRisk(lat, lng, city, state, historicalPrecip, cityData),
        wildfire: await this.analyzeEnhancedWildfireRisk(lat, lng, city, state, historicalTemps, cityData),
        hurricane: await this.analyzeEnhancedHurricaneRisk(lat, lng, city, state, historicalEvents, cityData),
        tornado: await this.analyzeEnhancedTornadoRisk(lat, lng, city, state, historicalEvents, cityData),
        earthquake: await this.analyzeEnhancedEarthquakeRisk(lat, lng, city, state, cityData),
        seaLevelRise: await this.analyzeEnhancedSeaLevelRisk(lat, lng, city, state, cityData),
        extremeHeat: await this.analyzeEnhancedExtremeHeatRisk(lat, lng, city, state, historicalTemps, cityData),
        drought: await this.analyzeEnhancedDroughtRisk(lat, lng, city, state, historicalPrecip, cityData),
        winterStorms: await this.analyzeEnhancedWinterStormRisk(lat, lng, city, state, historicalTemps, cityData)
      }

      // Calculate enhanced risk score
      const riskScore = this.calculateEnhancedRiskScore(risks, cityData)
      const overallRisk = this.categorizeRisk(riskScore)

      // Identify primary threats with historical validation
      const primaryThreats = this.identifyEnhancedPrimaryThreats(risks, historicalEvents)

      // Assess impacts with regional economic data
      const impacts = await this.assessEnhancedImpacts(risks, timeHorizon, cityData)

      // Generate adaptation recommendations with local context
      const adaptation = await this.generateEnhancedAdaptationRecommendations(risks, impacts, cityData)

      return {
        overallRisk,
        riskScore,
        primaryThreats,
        timeHorizon,
        location: { lat, lng, city, state },
        risks,
        impacts,
        adaptation,
        confidence: this.calculateEnhancedConfidence(historicalEvents, cityData)
      }
    } catch (error) {
      console.error('Error in enhanced climate risk analysis:', error)
      return super.analyzeClimateRisk(lat, lng, city, state, timeHorizon)
    }
  }

  private async getHistoricalTemperatures(lat: number, lng: number): Promise<NOAAResponse> {
    const cacheKey = `temp_${lat}_${lng}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(`${this.NOAA_BASE_URL}/data`, {
        params: {
          datasetid: 'GHCND',
          locationid: `POINT(${lng} ${lat})`,
          startdate: this.getHistoricalStartDate(),
          enddate: this.getCurrentDate(),
          datatypeid: ['TMAX', 'TMIN', 'TAVG'],
          limit: 1000
        },
        headers: {
          'token': this.NOAA_API_KEY
        }
      })

      const result: NOAAResponse = {
        success: true,
        data: response.data
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

  private async getHistoricalPrecipitation(lat: number, lng: number): Promise<NOAAResponse> {
    const cacheKey = `precip_${lat}_${lng}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(`${this.NOAA_BASE_URL}/data`, {
        params: {
          datasetid: 'GHCND',
          locationid: `POINT(${lng} ${lat})`,
          startdate: this.getHistoricalStartDate(),
          enddate: this.getCurrentDate(),
          datatypeid: ['PRCP', 'SNOW'],
          limit: 1000
        },
        headers: {
          'token': this.NOAA_API_KEY
        }
      })

      const result: NOAAResponse = {
        success: true,
        data: response.data
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

  private async getHistoricalEvents(city: string, state: string): Promise<NOAAResponse> {
    const cacheKey = `events_${city}_${state}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(`${this.NOAA_BASE_URL}/data`, {
        params: {
          datasetid: 'GHCND',
          locationid: `CITY:${state}${city}`,
          startdate: this.getHistoricalStartDate(),
          enddate: this.getCurrentDate(),
          datatypeid: 'AWND',
          limit: 1000
        },
        headers: {
          'token': this.NOAA_API_KEY
        }
      })

      const result: NOAAResponse = {
        success: true,
        data: response.data
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

  private async analyzeEnhancedFloodRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalPrecip: NOAAResponse,
    cityData: any
  ): Promise<FloodRisk> {
    try {
      const baseRisk = await super.analyzeFloodRisk({ lat, lng, city, state })
      
      if (!historicalPrecip.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const precipData = historicalPrecip.data.results || []
      const extremePrecipEvents = precipData.filter((event: any) => event.value > 50).length
      const floodRiskMultiplier = 1 + (extremePrecipEvents / precipData.length)

      return {
        ...baseRisk,
        probability: Math.min(1, baseRisk.probability * floodRiskMultiplier),
        historicalEvents: extremePrecipEvents,
        projectedIncrease: baseRisk.projectedIncrease * (cityData.climateRiskScore / 50)
      }
    } catch (error) {
      console.error('Error in enhanced flood risk analysis:', error)
      return super.analyzeFloodRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedWildfireRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalTemps: NOAAResponse,
    cityData: any
  ): Promise<WildfireRisk> {
    try {
      const baseRisk = await super.analyzeWildfireRisk({ lat, lng, city, state })
      
      if (!historicalTemps.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const tempData = historicalTemps.data.results || []
      const extremeHeatDays = tempData.filter((event: any) => event.value > 95).length
      const wildfireRiskMultiplier = 1 + (extremeHeatDays / tempData.length)

      return {
        ...baseRisk,
        probability: Math.min(1, baseRisk.probability * wildfireRiskMultiplier),
        severity: this.calculateSeverity(baseRisk.probability * wildfireRiskMultiplier),
        fireZone: this.determineFireZone(cityData)
      }
    } catch (error) {
      console.error('Error in enhanced wildfire risk analysis:', error)
      return super.analyzeWildfireRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedHurricaneRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalEvents: NOAAResponse,
    cityData: any
  ): Promise<HurricaneRisk> {
    try {
      const baseRisk = await super.analyzeHurricaneRisk({ lat, lng, city, state })
      
      if (!historicalEvents.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const eventData = historicalEvents.data.results || []
      const hurricaneEvents = eventData.filter((event: any) => event.value > 50).length
      const hurricaneRiskMultiplier = 1 + (hurricaneEvents / eventData.length)

      return {
        ...baseRisk,
        probability: Math.min(1, baseRisk.probability * hurricaneRiskMultiplier),
        category: this.calculateHurricaneCategory(baseRisk.probability * hurricaneRiskMultiplier),
        stormSurge: baseRisk.stormSurge * (cityData.climateRiskScore / 50)
      }
    } catch (error) {
      console.error('Error in enhanced hurricane risk analysis:', error)
      return super.analyzeHurricaneRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedTornadoRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalEvents: NOAAResponse,
    cityData: any
  ): Promise<TornadoRisk> {
    try {
      const baseRisk = await super.analyzeTornadoRisk({ lat, lng, city, state })
      
      if (!historicalEvents.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const eventData = historicalEvents.data.results || []
      const tornadoEvents = eventData.filter((event: any) => event.value > 40).length
      const tornadoRiskMultiplier = 1 + (tornadoEvents / eventData.length)

      return {
        ...baseRisk,
        probability: Math.min(1, baseRisk.probability * tornadoRiskMultiplier)
      }
    } catch (error) {
      console.error('Error in enhanced tornado risk analysis:', error)
      return super.analyzeTornadoRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedEarthquakeRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    cityData: any
  ): Promise<EarthquakeRisk> {
    try {
      const baseRisk = await super.analyzeEarthquakeRisk({ lat, lng, city, state })
      
      if (!cityData) {
        return baseRisk
      }

      return {
        ...baseRisk,
        probability: Math.min(1, baseRisk.probability * (cityData.climateRiskScore / 50)),
        magnitude: baseRisk.magnitude * (cityData.climateRiskScore / 50)
      }
    } catch (error) {
      console.error('Error in enhanced earthquake risk analysis:', error)
      return super.analyzeEarthquakeRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedSeaLevelRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    cityData: any
  ): Promise<SeaLevelRisk> {
    try {
      const baseRisk = await super.analyzeSeaLevelRisk({ lat, lng, city, state })
      
      if (!cityData) {
        return baseRisk
      }

      return {
        ...baseRisk,
        projectedRise: baseRisk.projectedRise * (cityData.climateRiskScore / 50),
        timeToImpact: baseRisk.timeToImpact * (50 / cityData.climateRiskScore)
      }
    } catch (error) {
      console.error('Error in enhanced sea level risk analysis:', error)
      return super.analyzeSeaLevelRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedExtremeHeatRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalTemps: NOAAResponse,
    cityData: any
  ): Promise<ExtremeHeatRisk> {
    try {
      const baseRisk = await super.analyzeExtremeHeatRisk({ lat, lng, city, state })
      
      if (!historicalTemps.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const tempData = historicalTemps.data.results || []
      const extremeHeatDays = tempData.filter((event: any) => event.value > 95).length

      return {
        ...baseRisk,
        daysOver100F: extremeHeatDays
      }
    } catch (error) {
      console.error('Error in enhanced extreme heat risk analysis:', error)
      return super.analyzeExtremeHeatRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedDroughtRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalPrecip: NOAAResponse,
    cityData: any
  ): Promise<DroughtRisk> {
    try {
      const baseRisk = await super.analyzeDroughtRisk({ lat, lng, city, state })
      
      if (!historicalPrecip.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const precipData = historicalPrecip.data.results || []
      const lowPrecipDays = precipData.filter((event: any) => event.value < 0.01).length
      const droughtRiskMultiplier = 1 + (lowPrecipDays / precipData.length)

      const severity: DroughtSeverity = droughtRiskMultiplier > 1.75 ? 'extreme' :
                                      droughtRiskMultiplier > 1.5 ? 'severe' :
                                      droughtRiskMultiplier > 1.25 ? 'moderate' : 'mild'

      return {
        ...baseRisk,
        severity,
        waterRestrictions: droughtRiskMultiplier > 1.5
      }
    } catch (error) {
      console.error('Error in enhanced drought risk analysis:', error)
      return super.analyzeDroughtRisk({ lat, lng, city, state })
    }
  }

  private async analyzeEnhancedWinterStormRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    historicalTemps: NOAAResponse,
    cityData: any
  ): Promise<WinterStormRisk> {
    try {
      const baseRisk = await super.analyzeWinterStormRisk({ lat, lng, city, state })
      
      if (!historicalTemps.success || !cityData) {
        return baseRisk
      }

      // Enhance risk calculation with historical data
      const tempData = historicalTemps.data.results || []
      const freezingDays = tempData.filter((event: any) => event.value < 32).length
      const winterRiskMultiplier = 1 + (freezingDays / tempData.length)

      const probability = Math.min(1, baseRisk.probability * winterRiskMultiplier)
      const severity: WinterStormSeverity = probability > 0.75 ? 'blizzard' :
                                          probability > 0.5 ? 'heavy' :
                                          probability > 0.25 ? 'moderate' : 'light'

      return {
        ...baseRisk,
        probability,
        severity
      }
    } catch (error) {
      console.error('Error in enhanced winter storm risk analysis:', error)
      return super.analyzeWinterStormRisk({ lat, lng, city, state })
    }
  }

  private async assessEnhancedImpacts(
    risks: any,
    timeHorizon: string,
    cityData: any
  ): Promise<any> {
    const baseImpacts = await super.assessImpacts(risks, timeHorizon)
    
    if (!cityData) {
      return baseImpacts
    }

    const riskMultiplier = cityData.climateRiskScore / 50

    return {
      ...baseImpacts,
      propertyValue: {
        ...baseImpacts.propertyValue,
        shortTerm: this.adjustImpactValues(baseImpacts.propertyValue.shortTerm, riskMultiplier),
        longTerm: this.adjustImpactValues(baseImpacts.propertyValue.longTerm, riskMultiplier)
      },
      insurance: {
        ...baseImpacts.insurance,
        shortTerm: this.adjustImpactValues(baseImpacts.insurance.shortTerm, riskMultiplier),
        longTerm: this.adjustImpactValues(baseImpacts.insurance.longTerm, riskMultiplier)
      },
      rental: {
        ...baseImpacts.rental,
        shortTerm: this.adjustImpactValues(baseImpacts.rental.shortTerm, riskMultiplier),
        longTerm: this.adjustImpactValues(baseImpacts.rental.longTerm, riskMultiplier)
      },
      liquidity: {
        ...baseImpacts.liquidity,
        shortTerm: this.adjustImpactValues(baseImpacts.liquidity.shortTerm, riskMultiplier),
        longTerm: this.adjustImpactValues(baseImpacts.liquidity.longTerm, riskMultiplier)
      }
    }
  }

  private calculateSeverity(probability: number): RiskSeverity {
    if (probability > 0.75) return 'extreme'
    if (probability > 0.5) return 'high'
    if (probability > 0.25) return 'moderate'
    return 'low'
  }

  private calculateHurricaneCategory(probability: number): HurricaneCategory {
    if (probability > 0.8) return 5
    if (probability > 0.6) return 4
    if (probability > 0.4) return 3
    if (probability > 0.2) return 2
    return 1
  }

  private determineFireZone(cityData: any): string {
    const riskScore = cityData.climateRiskScore
    if (riskScore > 75) return 'Extreme Risk'
    if (riskScore > 50) return 'High Risk'
    if (riskScore > 25) return 'Moderate Risk'
    return 'Low Risk'
  }

  private adjustImpactValues(impact: any, multiplier: number): any {
    return {
      min: impact.min * multiplier,
      max: impact.max * multiplier,
      likely: impact.likely * multiplier
    }
  }

  private calculateEnhancedRiskScore(risks: any, cityData: any): number {
    const baseScore = super.calculateOverallRiskScore(risks)
    
    if (!cityData) {
      return baseScore
    }

    // Adjust score based on city-specific factors
    const cityRiskMultiplier = cityData.climateRiskScore / 50
    return Math.min(100, baseScore * cityRiskMultiplier)
  }

  private identifyEnhancedPrimaryThreats(risks: any, historicalEvents: NOAAResponse): string[] {
    const baseThreats = super.identifyPrimaryThreats(risks)
    
    if (!historicalEvents.success) {
      return baseThreats
    }

    // Validate threats against historical events
    const eventData = historicalEvents.data.results || []
    const historicalThreats = this.extractThreatsFromEvents(eventData)
    
    return this.mergeAndPrioritizeThreats(baseThreats, historicalThreats)
  }

  private extractThreatsFromEvents(events: any[]): string[] {
    const threatCounts = new Map<string, number>()
    
    events.forEach(event => {
      const threat = this.categorizeEventAsThreat(event)
      if (threat) {
        threatCounts.set(threat, (threatCounts.get(threat) || 0) + 1)
      }
    })

    return Array.from(threatCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([threat]) => threat)
      .slice(0, 3)
  }

  private categorizeEventAsThreat(event: any): string | null {
    // Categorize NOAA events into our threat categories
    const value = event.value
    const datatype = event.datatype

    if (datatype === 'PRCP' && value > 50) return 'Flooding'
    if (datatype === 'TMAX' && value > 100) return 'Extreme Heat'
    if (datatype === 'SNOW' && value > 12) return 'Winter Storms'
    if (datatype === 'AWND' && value > 50) return 'Hurricane'
    
    return null
  }

  private mergeAndPrioritizeThreats(baseThreats: string[], historicalThreats: string[]): string[] {
    const prioritizedThreats = new Set([...historicalThreats, ...baseThreats])
    return Array.from(prioritizedThreats).slice(0, 3)
  }

  private calculateEnhancedConfidence(historicalEvents: NOAAResponse, cityData: any): number {
    let confidence = 75 // Base confidence

    if (historicalEvents.success) {
      confidence += 10 // Boost for historical data availability
    }

    if (cityData) {
      confidence += 5 // Boost for city-specific data
    }

    return Math.min(95, confidence)
  }

  private async generateEnhancedAdaptationRecommendations(
    risks: any,
    impacts: any,
    cityData: any
  ): Promise<any> {
    const baseRecommendations = await super.generateAdaptationRecommendations(risks, impacts)
    
    if (!cityData) {
      return baseRecommendations
    }

    // Enhance recommendations with city-specific data
    const riskScore = cityData.climateRiskScore
    const enhancedRecommendations = {
      ...baseRecommendations,
      immediate: this.enhanceActions(baseRecommendations.immediate, riskScore),
      shortTerm: this.enhanceActions(baseRecommendations.shortTerm, riskScore),
      longTerm: this.enhanceActions(baseRecommendations.longTerm, riskScore)
    }

    return enhancedRecommendations
  }

  private enhanceActions(actions: any[], riskScore: number): any[] {
    return actions.map(action => ({
      ...action,
      cost: action.cost * (riskScore / 50),
      effectiveness: Math.min(100, action.effectiveness * (riskScore / 50)),
      priority: this.adjustPriority(action.priority, riskScore)
    }))
  }

  private adjustPriority(priority: string, riskScore: number): string {
    if (riskScore > 75) {
      return priority === 'LOW' ? 'MEDIUM' : priority === 'MEDIUM' ? 'HIGH' : 'CRITICAL'
    }
    return priority
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

  private getHistoricalStartDate(): string {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 10)
    return date.toISOString().split('T')[0]
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0]
  }
} 