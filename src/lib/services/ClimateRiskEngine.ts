export interface ClimateRiskData {
  overallRisk: 'low' | 'medium' | 'high' | 'extreme'
  riskScore: number // 0-100
  primaryThreats: string[]
  timeHorizon: '5-year' | '10-year' | '30-year'
  location: {
    lat: number
    lng: number
    city: string
    state: string
  }
  risks: {
    flood: FloodRisk
    wildfire: WildfireRisk
    hurricane: HurricaneRisk
    tornado: TornadoRisk
    earthquake: EarthquakeRisk
    seaLevelRise: SeaLevelRisk
    extremeHeat: ExtremeHeatRisk
    drought: DroughtRisk
    winterStorms: WinterStormRisk
  }
  impacts: {
    propertyValue: ImpactAssessment
    insurance: ImpactAssessment
    rental: ImpactAssessment
    liquidity: ImpactAssessment
  }
  adaptation: AdaptationRecommendations
  confidence: number
}

export interface FloodRisk {
  probability: number // 0-1
  severity: 'minimal' | 'moderate' | 'major' | 'catastrophic'
  floodZone: string
  historicalEvents: number
  projectedIncrease: number
  mitigationOptions: string[]
  insuranceRequired: boolean
  avgInsuranceCost: number
}

export interface WildfireRisk {
  probability: number
  severity: 'low' | 'moderate' | 'high' | 'extreme'
  fireZone: string
  defensibleSpace: boolean
  vegetationRisk: string
  evacuationRoutes: number
  mitigationOptions: string[]
  insuranceAvailability: 'available' | 'limited' | 'unavailable'
}

export interface HurricaneRisk {
  probability: number
  category: 1 | 2 | 3 | 4 | 5
  season: 'low' | 'normal' | 'active' | 'hyperactive'
  stormSurge: number
  windSpeed: number
  historicalHits: number
  evacuationZone: string
  buildingStandards: 'basic' | 'enhanced' | 'fortified'
}

export interface TornadoRisk {
  probability: number
  alleyLocation: boolean
  f5Potential: boolean
  shelterAvailability: boolean
  warningTime: number
  historicalActivity: 'low' | 'moderate' | 'high'
}

export interface EarthquakeRisk {
  probability: number
  magnitude: number
  faultProximity: number
  soilType: 'stable' | 'moderate' | 'unstable'
  buildingStandards: 'basic' | 'seismic' | 'enhanced'
  liquefactionRisk: boolean
}

export interface SeaLevelRisk {
  currentElevation: number
  projectedRise: number
  timeToImpact: number
  saltwaterIntrusion: boolean
  coastalErosion: boolean
  tidalFlooding: boolean
}

export interface ExtremeHeatRisk {
  daysOver100F: number
  heatIndex: number
  coolingCosts: number
  healthRisks: 'low' | 'moderate' | 'high'
  infrastructure: 'resilient' | 'vulnerable'
}

export interface DroughtRisk {
  severity: 'mild' | 'moderate' | 'severe' | 'extreme'
  waterRestrictions: boolean
  landscapingImpact: boolean
  foundationRisk: boolean
  waterCosts: number
}

export interface WinterStormRisk {
  probability: number
  severity: 'light' | 'moderate' | 'heavy' | 'blizzard'
  icingRisk: boolean
  powerOutages: 'rare' | 'occasional' | 'frequent'
  heatingCosts: number
}

export interface ImpactAssessment {
  shortTerm: { min: number; max: number; likely: number }
  longTerm: { min: number; max: number; likely: number }
  confidence: number
  description: string
}

export interface AdaptationRecommendations {
  immediate: AdaptationAction[]
  shortTerm: AdaptationAction[]
  longTerm: AdaptationAction[]
  totalCost: { min: number; max: number }
  priorityActions: string[]
}

export interface AdaptationAction {
  action: string
  cost: number
  effectiveness: number
  timeframe: string
  description: string
  requirement: 'optional' | 'recommended' | 'required'
}

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'extreme'
export type DroughtSeverity = 'mild' | 'moderate' | 'severe' | 'extreme'
export type WinterStormSeverity = 'light' | 'moderate' | 'heavy' | 'blizzard'
export type HurricaneCategory = 1 | 2 | 3 | 4 | 5

export class ClimateRiskEngine {
  private static instance: ClimateRiskEngine
  private riskDatabase: Map<string, any> = new Map()
  
  static getInstance(): ClimateRiskEngine {
    if (!ClimateRiskEngine.instance) {
      ClimateRiskEngine.instance = new ClimateRiskEngine()
    }
    return ClimateRiskEngine.instance
  }
  
  async analyzeClimateRisk(
    lat: number,
    lng: number,
    city: string,
    state: string,
    timeHorizon: '5-year' | '10-year' | '30-year' = '10-year'
  ): Promise<ClimateRiskData> {
    console.log(`🌍 Analyzing climate risk for ${city}, ${state}...`)
    
    const location = { lat, lng, city, state }
    
    // Analyze each risk category
    const risks = {
      flood: await this.analyzeFloodRisk(location),
      wildfire: await this.analyzeWildfireRisk(location),
      hurricane: await this.analyzeHurricaneRisk(location),
      tornado: await this.analyzeTornadoRisk(location),
      earthquake: await this.analyzeEarthquakeRisk(location),
      seaLevelRise: await this.analyzeSeaLevelRisk(location),
      extremeHeat: await this.analyzeExtremeHeatRisk(location),
      drought: await this.analyzeDroughtRisk(location),
      winterStorms: await this.analyzeWinterStormRisk(location)
    }
    
    // Calculate overall risk score
    const riskScore = this.calculateOverallRiskScore(risks)
    const overallRisk = this.categorizeRisk(riskScore)
    
    // Identify primary threats
    const primaryThreats = this.identifyPrimaryThreats(risks)
    
    // Assess impacts
    const impacts = await this.assessImpacts(risks, timeHorizon)
    
    // Generate adaptation recommendations
    const adaptation = await this.generateAdaptationRecommendations(risks, impacts)
    
    return {
      overallRisk,
      riskScore,
      primaryThreats,
      timeHorizon,
      location,
      risks,
      impacts,
      adaptation,
      confidence: this.calculateConfidence(location)
    }
  }
  
  protected async analyzeFloodRisk(location: any): Promise<FloodRisk> {
    // Determine flood zone based on geographic location
    const floodZone = this.determineFloodZone(location)
    const isCoastal = Math.abs(location.lat) > 25 && Math.abs(location.lat) < 45
    const isRiverValley = location.city.toLowerCase().includes('valley') || 
                         location.city.toLowerCase().includes('river')
    
    let probability = 0.05 // Base 5% flood risk
    if (floodZone.startsWith('A')) probability = 0.25 // 25% annual chance
    if (floodZone.startsWith('V')) probability = 0.35 // 35% for velocity zones
    if (isCoastal) probability += 0.10
    if (isRiverValley) probability += 0.15
    
    const severity = probability > 0.3 ? 'catastrophic' : 
                    probability > 0.2 ? 'major' :
                    probability > 0.1 ? 'moderate' : 'minimal'
    
    return {
      probability,
      severity,
      floodZone,
      historicalEvents: Math.floor(Math.random() * 10),
      projectedIncrease: 0.15 + Math.random() * 0.25, // 15-40% increase
      mitigationOptions: [
        'Flood insurance',
        'Elevation certificates',
        'Flood vents',
        'Landscaping modifications',
        'Sump pump systems'
      ],
      insuranceRequired: floodZone.startsWith('A') || floodZone.startsWith('V'),
      avgInsuranceCost: floodZone.startsWith('A') ? 2500 : floodZone.startsWith('V') ? 4500 : 800
    }
  }
  
  protected async analyzeWildfireRisk(location: any): Promise<WildfireRisk> {
    const wildfireStates = ['CA', 'OR', 'WA', 'ID', 'MT', 'WY', 'CO', 'UT', 'NV', 'AZ', 'NM', 'TX']
    const isWildfireRegion = wildfireStates.includes(location.state)
    
    let probability = 0.02 // Base 2% risk
    if (isWildfireRegion) probability = 0.15 + Math.random() * 0.20 // 15-35%
    if (location.city.toLowerCase().includes('forest') || 
        location.city.toLowerCase().includes('pine')) probability += 0.10
    
    const severity = probability > 0.25 ? 'extreme' :
                    probability > 0.15 ? 'high' :
                    probability > 0.08 ? 'moderate' : 'low'
    
    return {
      probability,
      severity,
      fireZone: isWildfireRegion ? 'High Risk' : 'Moderate Risk',
      defensibleSpace: Math.random() > 0.3,
      vegetationRisk: severity === 'extreme' ? 'Dense vegetation' : 
                     severity === 'high' ? 'Moderate vegetation' : 'Sparse vegetation',
      evacuationRoutes: Math.floor(1 + Math.random() * 4),
      mitigationOptions: [
        'Defensible space creation',
        'Fire-resistant landscaping',
        'Roof and siding upgrades',
        'Sprinkler systems',
        'Emergency planning'
      ],
      insuranceAvailability: severity === 'extreme' ? 'limited' : 
                           severity === 'high' ? 'limited' : 'available'
    }
  }
  
  protected async analyzeHurricaneRisk(location: any): Promise<HurricaneRisk> {
    const hurricaneStates = ['FL', 'TX', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC', 'VA', 'MD', 'DE', 'NJ', 'NY', 'CT', 'RI', 'MA', 'NH', 'ME']
    const isHurricaneRegion = hurricaneStates.includes(location.state)
    const isGulfCoast = ['FL', 'TX', 'LA', 'MS', 'AL'].includes(location.state)
    
    let probability = 0.01 // Base 1% risk for inland areas
    if (isHurricaneRegion) probability = 0.20 + Math.random() * 0.30 // 20-50%
    if (isGulfCoast) probability += 0.15
    
    const category = probability > 0.4 ? 5 :
                    probability > 0.3 ? 4 :
                    probability > 0.2 ? 3 :
                    probability > 0.1 ? 2 : 1
    
    return {
      probability,
      category,
      season: Math.random() > 0.7 ? 'hyperactive' :
              Math.random() > 0.5 ? 'active' :
              Math.random() > 0.3 ? 'normal' : 'low',
      stormSurge: isGulfCoast ? 8 + Math.random() * 12 : 3 + Math.random() * 8,
      windSpeed: 75 + category * 15 + Math.random() * 20,
      historicalHits: Math.floor(Math.random() * 20),
      evacuationZone: isGulfCoast ? 'Zone A' : isHurricaneRegion ? 'Zone B' : 'Zone C',
      buildingStandards: category >= 4 ? 'fortified' : category >= 2 ? 'enhanced' : 'basic'
    }
  }
  
  protected async analyzeTornadoRisk(location: any): Promise<TornadoRisk> {
    const tornadoAlley = ['TX', 'OK', 'KS', 'NE', 'IA', 'AR', 'MO', 'IL', 'IN', 'OH']
    const isInTornadoAlley = tornadoAlley.includes(location.state)
    
    let probability = 0.02 // Base 2% risk
    if (isInTornadoAlley) probability = 0.15 + Math.random() * 0.25 // 15-40%
    
    return {
      probability,
      alleyLocation: isInTornadoAlley,
      f5Potential: isInTornadoAlley && ['TX', 'OK', 'KS'].includes(location.state),
      shelterAvailability: Math.random() > 0.4,
      warningTime: 8 + Math.random() * 15, // 8-23 minutes
      historicalActivity: probability > 0.25 ? 'high' :
                         probability > 0.10 ? 'moderate' : 'low'
    }
  }
  
  protected async analyzeEarthquakeRisk(location: any): Promise<EarthquakeRisk> {
    const earthquakeStates = ['CA', 'AK', 'NV', 'HI', 'WA', 'OR', 'ID', 'MT', 'UT', 'WY', 'CO', 'NM', 'TX', 'AR', 'TN', 'KY', 'MO', 'IL', 'IN', 'OH', 'SC', 'NC', 'VA', 'WV', 'PA', 'NY', 'VT', 'NH', 'ME', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD']
    const isEarthquakeRegion = earthquakeStates.includes(location.state)
    const isHighRisk = ['CA', 'AK', 'NV'].includes(location.state)
    
    let probability = 0.01 // Base 1% risk
    if (isEarthquakeRegion) probability = 0.05 + Math.random() * 0.15 // 5-20%
    if (isHighRisk) probability = 0.20 + Math.random() * 0.30 // 20-50%
    
    return {
      probability,
      magnitude: 4.0 + Math.random() * 4.0, // 4.0-8.0 magnitude
      faultProximity: Math.random() * 100, // Distance in miles
      soilType: Math.random() > 0.7 ? 'unstable' :
                Math.random() > 0.4 ? 'moderate' : 'stable',
      buildingStandards: isHighRisk ? 'enhanced' : 
                        isEarthquakeRegion ? 'seismic' : 'basic',
      liquefactionRisk: isHighRisk && Math.random() > 0.6
    }
  }
  
  protected async analyzeSeaLevelRisk(location: any): Promise<SeaLevelRisk> {
    const coastalStates = ['FL', 'CA', 'TX', 'NY', 'NC', 'VA', 'SC', 'GA', 'LA', 'WA', 'OR', 'ME', 'MA', 'MD', 'NJ', 'DE', 'CT', 'RI', 'NH', 'AL', 'MS', 'AK', 'HI']
    const isCoastal = coastalStates.includes(location.state)
    
    // Estimate elevation (simplified)
    let elevation = 50 + Math.random() * 200 // 50-250 feet
    if (isCoastal && Math.random() > 0.7) elevation = Math.random() * 20 // Some coastal areas are low
    
    return {
      currentElevation: elevation,
      projectedRise: isCoastal ? 1 + Math.random() * 3 : 0, // 1-4 feet rise
      timeToImpact: isCoastal && elevation < 10 ? 10 + Math.random() * 20 : 50 + Math.random() * 50,
      saltwaterIntrusion: isCoastal && elevation < 15,
      coastalErosion: isCoastal && Math.random() > 0.5,
      tidalFlooding: isCoastal && elevation < 8
    }
  }
  
  protected async analyzeExtremeHeatRisk(location: any): Promise<ExtremeHeatRisk> {
    const hotStates = ['AZ', 'NV', 'TX', 'FL', 'LA', 'MS', 'AL', 'GA', 'SC', 'AR', 'TN', 'OK', 'NM', 'CA']
    const isHotRegion = hotStates.includes(location.state)
    
    const baseDays = isHotRegion ? 30 + Math.random() * 60 : Math.random() * 20
    
    return {
      daysOver100F: baseDays,
      heatIndex: 95 + Math.random() * 25,
      coolingCosts: 1200 + baseDays * 15,
      healthRisks: baseDays > 60 ? 'high' :
                  baseDays > 30 ? 'moderate' : 'low',
      infrastructure: baseDays > 45 ? 'vulnerable' : 'resilient'
    }
  }
  
  protected async analyzeDroughtRisk(location: any): Promise<DroughtRisk> {
    const droughtStates = ['CA', 'NV', 'AZ', 'UT', 'CO', 'NM', 'TX', 'OK', 'KS', 'NE', 'WY', 'MT', 'ID', 'OR', 'WA']
    const isDroughtRegion = droughtStates.includes(location.state)
    
    const severity = isDroughtRegion ? 
      (Math.random() > 0.7 ? 'extreme' :
       Math.random() > 0.4 ? 'severe' : 'moderate') : 'mild'
    
    return {
      severity,
      waterRestrictions: isDroughtRegion && Math.random() > 0.3,
      landscapingImpact: severity === 'extreme' || severity === 'severe',
      foundationRisk: severity === 'extreme',
      waterCosts: isDroughtRegion ? 800 + Math.random() * 1200 : 400 + Math.random() * 400
    }
  }
  
  protected async analyzeWinterStormRisk(location: any): Promise<WinterStormRisk> {
    const coldStates = ['AK', 'MT', 'ND', 'SD', 'MN', 'WI', 'MI', 'ME', 'VT', 'NH', 'NY', 'PA', 'OH', 'IN', 'IL', 'IA', 'NE', 'CO', 'WY', 'ID', 'WA', 'OR']
    const isColdRegion = coldStates.includes(location.state)
    
    let probability = 0.05 // Base 5% risk
    if (isColdRegion) probability = 0.25 + Math.random() * 0.35 // 25-60%
    
    return {
      probability,
      severity: probability > 0.45 ? 'blizzard' :
               probability > 0.30 ? 'heavy' :
               probability > 0.15 ? 'moderate' : 'light',
      icingRisk: isColdRegion && Math.random() > 0.4,
      powerOutages: probability > 0.40 ? 'frequent' :
                   probability > 0.20 ? 'occasional' : 'rare',
      heatingCosts: isColdRegion ? 1500 + Math.random() * 2000 : 200 + Math.random() * 500
    }
  }
  
  protected calculateOverallRiskScore(risks: any): number {
    const weights = {
      flood: 0.20,
      wildfire: 0.15,
      hurricane: 0.15,
      tornado: 0.10,
      earthquake: 0.10,
      seaLevelRise: 0.10,
      extremeHeat: 0.08,
      drought: 0.07,
      winterStorms: 0.05
    }
    
    let totalScore = 0
    totalScore += risks.flood.probability * 100 * weights.flood
    totalScore += risks.wildfire.probability * 100 * weights.wildfire
    totalScore += risks.hurricane.probability * 100 * weights.hurricane
    totalScore += risks.tornado.probability * 100 * weights.tornado
    totalScore += risks.earthquake.probability * 100 * weights.earthquake
    totalScore += (risks.seaLevelRise.currentElevation < 20 ? 80 : 20) * weights.seaLevelRise
    totalScore += (risks.extremeHeat.daysOver100F / 100 * 100) * weights.extremeHeat
    totalScore += (risks.drought.severity === 'extreme' ? 80 : 
                  risks.drought.severity === 'severe' ? 60 :
                  risks.drought.severity === 'moderate' ? 40 : 20) * weights.drought
    totalScore += risks.winterStorms.probability * 100 * weights.winterStorms
    
    return Math.min(100, Math.max(0, totalScore))
  }
  
  protected categorizeRisk(score: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (score < 25) return 'low'
    if (score < 50) return 'medium'
    if (score < 75) return 'high'
    return 'extreme'
  }
  
  protected identifyPrimaryThreats(risks: any): string[] {
    const threats = []
    
    if (risks.flood.probability > 0.15) threats.push('Flooding')
    if (risks.wildfire.probability > 0.15) threats.push('Wildfire')
    if (risks.hurricane.probability > 0.20) threats.push('Hurricane')
    if (risks.tornado.probability > 0.15) threats.push('Tornado')
    if (risks.earthquake.probability > 0.15) threats.push('Earthquake')
    if (risks.seaLevelRise.currentElevation < 15) threats.push('Sea Level Rise')
    if (risks.extremeHeat.daysOver100F > 45) threats.push('Extreme Heat')
    if (risks.drought.severity === 'extreme' || risks.drought.severity === 'severe') threats.push('Drought')
    if (risks.winterStorms.probability > 0.30) threats.push('Winter Storms')
    
    return threats.slice(0, 3) // Top 3 threats
  }
  
  protected async assessImpacts(risks: any, timeHorizon: string): Promise<any> {
    const timeMultiplier = timeHorizon === '5-year' ? 1 : timeHorizon === '10-year' ? 2 : 5
    
    return {
      propertyValue: {
        shortTerm: { min: -0.05, max: -0.02, likely: -0.03 },
        longTerm: { min: -0.15 * timeMultiplier, max: -0.05 * timeMultiplier, likely: -0.10 * timeMultiplier },
        confidence: 75,
        description: 'Climate risks may reduce property values due to increased insurance costs and buyer concerns'
      },
      insurance: {
        shortTerm: { min: 0.10, max: 0.30, likely: 0.20 },
        longTerm: { min: 0.25 * timeMultiplier, max: 0.75 * timeMultiplier, likely: 0.50 * timeMultiplier },
        confidence: 85,
        description: 'Insurance premiums expected to rise significantly in high-risk areas'
      },
      rental: {
        shortTerm: { min: -0.02, max: 0.05, likely: 0.01 },
        longTerm: { min: -0.10 * timeMultiplier, max: 0.10 * timeMultiplier, likely: 0.02 * timeMultiplier },
        confidence: 65,
        description: 'Rental demand may fluctuate based on climate adaptation and resident preferences'
      },
      liquidity: {
        shortTerm: { min: -0.10, max: -0.05, likely: -0.07 },
        longTerm: { min: -0.30 * timeMultiplier, max: -0.10 * timeMultiplier, likely: -0.20 * timeMultiplier },
        confidence: 70,
        description: 'Properties in high-risk areas may become harder to sell quickly'
      }
    }
  }
  
  protected async generateAdaptationRecommendations(risks: any, impacts: any): Promise<AdaptationRecommendations> {
    const immediate: AdaptationAction[] = []
    const shortTerm: AdaptationAction[] = []
    const longTerm: AdaptationAction[] = []
    
    // Flood adaptations
    if (risks.flood.probability > 0.15) {
      immediate.push({
        action: 'Flood Insurance',
        cost: risks.flood.avgInsuranceCost,
        effectiveness: 90,
        timeframe: 'Immediate',
        description: 'Obtain comprehensive flood insurance coverage',
        requirement: 'required'
      })
      
      shortTerm.push({
        action: 'Flood Mitigation',
        cost: 15000,
        effectiveness: 75,
        timeframe: '6-12 months',
        description: 'Install flood barriers, elevation systems, or drainage improvements',
        requirement: 'recommended'
      })
    }
    
    // Wildfire adaptations
    if (risks.wildfire.probability > 0.15) {
      immediate.push({
        action: 'Defensible Space',
        cost: 5000,
        effectiveness: 80,
        timeframe: '1-3 months',
        description: 'Create and maintain defensible space around property',
        requirement: 'required'
      })
      
      shortTerm.push({
        action: 'Fire-Resistant Materials',
        cost: 25000,
        effectiveness: 85,
        timeframe: '6-18 months',
        description: 'Upgrade roof, siding, and windows to fire-resistant materials',
        requirement: 'recommended'
      })
    }
    
    // Hurricane adaptations
    if (risks.hurricane.probability > 0.20) {
      immediate.push({
        action: 'Storm Shutters',
        cost: 3000,
        effectiveness: 70,
        timeframe: '1-2 months',
        description: 'Install storm shutters or impact-resistant windows',
        requirement: 'recommended'
      })
      
      longTerm.push({
        action: 'Structural Reinforcement',
        cost: 50000,
        effectiveness: 90,
        timeframe: '1-3 years',
        description: 'Strengthen foundation, roof, and overall structure',
        requirement: 'optional'
      })
    }
    
    const totalCost = {
      min: [...immediate, ...shortTerm, ...longTerm].reduce((sum, action) => sum + action.cost * 0.7, 0),
      max: [...immediate, ...shortTerm, ...longTerm].reduce((sum, action) => sum + action.cost * 1.3, 0)
    }
    
    return {
      immediate,
      shortTerm,
      longTerm,
      totalCost,
      priorityActions: immediate.filter(a => a.requirement === 'required').map(a => a.action)
    }
  }
  
  private calculateConfidence(location: any): number {
    // Base confidence on data availability and location specificity
    let confidence = 75 // Base confidence
    
    // Increase confidence for well-studied areas
    const wellStudiedStates = ['CA', 'FL', 'TX', 'NY']
    if (wellStudiedStates.includes(location.state)) confidence += 10
    
    // Decrease confidence for remote areas
    if (location.city.includes('Rural') || location.city.includes('Remote')) confidence -= 15
    
    return Math.min(95, Math.max(60, confidence))
  }
  
  private determineFloodZone(location: any): string {
    // Simplified flood zone determination
    const coastalStates = ['FL', 'CA', 'TX', 'NY', 'NC']
    if (coastalStates.includes(location.state)) {
      return Math.random() > 0.7 ? 'VE' : Math.random() > 0.5 ? 'AE' : 'X'
    }
    
    return Math.random() > 0.8 ? 'A' : 'X'
  }
} 