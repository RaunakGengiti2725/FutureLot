import { PropertyFeatures, MarketConditions } from '../models/PropertyData'
import { format, subMonths, addMonths } from 'date-fns'

interface TrainingDataPoint {
  features: PropertyFeatures
  market: MarketConditions
  actualAppreciation: number[]
}

export class TrainingDataGenerator {
  private readonly SF_NEIGHBORHOODS = [
    { name: 'SOMA', lat: 37.7749, lng: -122.4194, premium: 1.2 },
    { name: 'Mission', lat: 37.7599, lng: -122.4148, premium: 1.1 },
    { name: 'Castro', lat: 37.7609, lng: -122.4350, premium: 1.15 },
    { name: 'Pacific Heights', lat: 37.7936, lng: -122.4286, premium: 1.8 },
    { name: 'Richmond', lat: 37.7806, lng: -122.4644, premium: 0.9 },
    { name: 'Sunset', lat: 37.7431, lng: -122.4660, premium: 0.85 },
    { name: 'Nob Hill', lat: 37.7946, lng: -122.4094, premium: 1.6 },
    { name: 'Marina', lat: 37.8021, lng: -122.4416, premium: 1.3 },
    { name: 'Mission Bay', lat: 37.7706, lng: -122.3893, premium: 1.4 },
    { name: 'Potrero Hill', lat: 37.7576, lng: -122.4013, premium: 1.25 }
  ]

  private readonly PROPERTY_TYPES = [
    { type: 'single_family', weight: 0.3 },
    { type: 'condo', weight: 0.4 },
    { type: 'townhouse', weight: 0.2 },
    { type: 'multi_family', weight: 0.1 }
  ]

  // Generate realistic training data with maximum scale for ultimate accuracy
  generateTrainingData(numSamples: number = 1000000): TrainingDataPoint[] {
    console.log(`🚀 Generating ${numSamples} ultra-high-quality training samples for market dominance...`)
    const trainingData: TrainingDataPoint[] = []
    
    // Generate data in optimized batches for memory efficiency
    const batchSize = 25000
    const batches = Math.ceil(numSamples / batchSize)
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize
      const batchEnd = Math.min(batchStart + batchSize, numSamples)
      
      console.log(`Processing batch ${batch + 1}/${batches}: samples ${batchStart}-${batchEnd}`)
      
      for (let i = batchStart; i < batchEnd; i++) {
        const neighborhood = this.getRandomNeighborhood()
        const propertyType = this.getRandomPropertyType()
        const features = this.generatePropertyFeatures(neighborhood, propertyType)
        const market = this.generateMarketConditions()
        const actualAppreciation = this.calculateRealisticAppreciation(features, market)
        
        trainingData.push({
          features,
          market,
          actualAppreciation
        })
      }
    }
    
    console.log(`Generated ${trainingData.length} training samples successfully`)
    return trainingData
  }

  private getRandomNeighborhood() {
    return this.SF_NEIGHBORHOODS[Math.floor(Math.random() * this.SF_NEIGHBORHOODS.length)]
  }

  private getRandomPropertyType() {
    const rand = Math.random()
    let cumulative = 0
    
    for (const type of this.PROPERTY_TYPES) {
      cumulative += type.weight
      if (rand <= cumulative) {
        return type.type
      }
    }
    
    return 'condo'
  }

  private generatePropertyFeatures(neighborhood: any, propertyType: string): PropertyFeatures {
    const basePrice = this.calculateBasePrice(neighborhood, propertyType)
    const yearBuilt = this.randomBetween(1950, 2020)
    const squareFootage = this.generateSquareFootage(propertyType)
    const bedrooms = this.generateBedrooms(propertyType, squareFootage)
    const bathrooms = this.generateBathrooms(bedrooms)
    
    return {
      // Location features
      latitude: neighborhood.lat + (Math.random() - 0.5) * 0.02,
      longitude: neighborhood.lng + (Math.random() - 0.5) * 0.02,
      walkScore: this.generateWalkScore(neighborhood),
      transitScore: this.generateTransitScore(neighborhood),
      bikeScore: this.generateBikeScore(neighborhood),
      
      // Property characteristics
      squareFootage,
      bedrooms,
      bathrooms,
      lotSize: this.generateLotSize(propertyType),
      yearBuilt,
      propertyType: propertyType as 'single_family' | 'condo' | 'townhouse' | 'multi_family',
      
      // Economic indicators
      medianHouseholdIncome: this.generateIncome(neighborhood),
      employmentRate: this.randomBetween(0.92, 0.98),
      populationDensity: this.generatePopulationDensity(neighborhood),
      crimeRate: this.generateCrimeRate(neighborhood),
      
      // Market features
      currentPrice: basePrice,
      pricePerSqFt: basePrice / squareFootage,
      daysOnMarket: this.randomBetween(15, 90),
      inventoryLevel: this.randomBetween(2, 8),
      
      // Infrastructure & Development
      distanceToDowntown: this.calculateDistanceToDowntown(neighborhood.lat, neighborhood.lng),
      distanceToSchools: this.randomBetween(0.2, 2.5),
      distanceToTransit: this.randomBetween(0.1, 1.5),
      plannedDevelopments: this.generatePlannedDevelopments(neighborhood),
      
      // Climate risks
      floodRisk: this.generateFloodRisk(neighborhood),
      fireRisk: this.generateFireRisk(neighborhood),
      earthquakeRisk: 0.3, // SF has consistent earthquake risk
      seaLevelRisk: this.generateSeaLevelRisk(neighborhood),
      
      // Market dynamics
      seasonality: this.generateSeasonality(),
      supplyDemandRatio: 0.8 + Math.random() * 0.4,
      mortgageRates: 5.0 + Math.random() * 3.0,
      
      // Historical data
      price6MonthsAgo: basePrice * this.randomBetween(0.95, 1.05),
      price1YearAgo: basePrice * this.randomBetween(0.90, 1.10),
      price2YearsAgo: basePrice * this.randomBetween(0.85, 1.15)
    }
  }

  private generateMarketConditions(): MarketConditions {
    const seasons = ['spring', 'summer', 'fall', 'winter'] as const
    
    return {
      region: 'San Francisco Bay Area',
      season: seasons[Math.floor(Math.random() * seasons.length)],
      interestRates: this.randomBetween(3.0, 7.5),
      inflationRate: this.randomBetween(1.5, 5.0),
      gdpGrowth: this.randomBetween(-0.5, 4.0),
      employmentRate: this.randomBetween(0.92, 0.98),
      housingStartsGrowth: this.randomBetween(-10, 15),
      constructionCosts: this.randomBetween(200, 400),
      populationGrowth: this.randomBetween(0.5, 2.5)
    }
  }

  private calculateBasePrice(neighborhood: any, propertyType: string): number {
    const basePrices = {
      'single_family': 1200000,
      'condo': 800000,
      'townhouse': 1000000,
      'multi_family': 1500000
    }
    
    const basePrice = basePrices[propertyType as keyof typeof basePrices]
    return basePrice * neighborhood.premium * this.randomBetween(0.7, 1.3)
  }

  private generateSquareFootage(propertyType: string): number {
    const ranges = {
      'single_family': [1200, 3500],
      'condo': [600, 1800],
      'townhouse': [1000, 2500],
      'multi_family': [2000, 5000]
    }
    
    const range = ranges[propertyType as keyof typeof ranges]
    return Math.floor(this.randomBetween(range[0], range[1]))
  }

  private generateBedrooms(propertyType: string, squareFootage: number): number {
    if (squareFootage < 800) return 1
    if (squareFootage < 1200) return Math.random() > 0.5 ? 2 : 1
    if (squareFootage < 1800) return Math.random() > 0.3 ? 3 : 2
    if (squareFootage < 2500) return Math.random() > 0.4 ? 4 : 3
    return Math.floor(this.randomBetween(3, 6))
  }

  private generateBathrooms(bedrooms: number): number {
    return Math.max(1, Math.floor(bedrooms * 0.75) + (Math.random() > 0.5 ? 1 : 0))
  }

  private generateLotSize(propertyType: string): number {
    if (propertyType === 'condo') return 0
    return Math.floor(this.randomBetween(2000, 8000))
  }

  private generateWalkScore(neighborhood: any): number {
    const baseScore = Math.max(50, Math.min(100, 70 + (neighborhood.premium - 1) * 30))
    return Math.floor(baseScore + this.randomBetween(-10, 10))
  }

  private generateTransitScore(neighborhood: any): number {
    const baseScore = Math.max(30, Math.min(100, 60 + (neighborhood.premium - 1) * 25))
    return Math.floor(baseScore + this.randomBetween(-15, 15))
  }

  private generateBikeScore(neighborhood: any): number {
    const baseScore = Math.max(40, Math.min(100, 65 + (neighborhood.premium - 1) * 20))
    return Math.floor(baseScore + this.randomBetween(-20, 20))
  }

  private generateIncome(neighborhood: any): number {
    const baseIncome = 80000 + (neighborhood.premium - 1) * 50000
    return Math.floor(baseIncome * this.randomBetween(0.8, 1.2))
  }

  private generatePopulationDensity(neighborhood: any): number {
    return Math.floor(this.randomBetween(5000, 25000) * neighborhood.premium)
  }

  private generateCrimeRate(neighborhood: any): number {
    const baseCrime = Math.max(10, 60 - (neighborhood.premium - 1) * 20)
    return Math.floor(baseCrime + this.randomBetween(-10, 10))
  }

  private calculateDistanceToDowntown(lat: number, lng: number): number {
    // Downtown SF: 37.7749, -122.4194
    const downtownLat = 37.7749
    const downtownLng = -122.4194
    
    const latDiff = lat - downtownLat
    const lngDiff = lng - downtownLng
    
    // Approximate distance in miles
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69
  }

  private generatePlannedDevelopments(neighborhood: any): number {
    // Hot neighborhoods have more development
    const base = Math.floor(neighborhood.premium * 3)
    return Math.max(0, base + Math.floor(this.randomBetween(-2, 5)))
  }

  private generateFloodRisk(neighborhood: any): number {
    // Lower elevation areas have higher flood risk
    const baseRisk = neighborhood.name === 'Mission Bay' ? 0.7 : 0.2
    return Math.max(0, Math.min(1, baseRisk + this.randomBetween(-0.1, 0.1)))
  }

  private generateFireRisk(neighborhood: any): number {
    // Hills and older areas have higher fire risk
    const baseRisk = ['Pacific Heights', 'Nob Hill'].includes(neighborhood.name) ? 0.4 : 0.15
    return Math.max(0, Math.min(1, baseRisk + this.randomBetween(-0.05, 0.1)))
  }

  private generateSeaLevelRisk(neighborhood: any): number {
    // Coastal areas have higher sea level risk
    const baseRisk = ['Marina', 'Mission Bay'].includes(neighborhood.name) ? 0.6 : 0.1
    return Math.max(0, Math.min(1, baseRisk + this.randomBetween(-0.1, 0.1)))
  }

  // Generate seasonality factor
  private generateSeasonality(): number {
    const currentMonth = new Date().getMonth()
    // Spring/Summer positive impact, Fall/Winter negative impact
    if (currentMonth >= 3 && currentMonth <= 8) {
      return 0.05 + Math.random() * 0.05 // 0.05 to 0.10
    } else {
      return -0.05 + Math.random() * 0.05 // -0.05 to 0.00
    }
  }

  // Calculate realistic appreciation based on multiple factors
  private calculateRealisticAppreciation(features: PropertyFeatures, market: MarketConditions): number[] {
    const baseAppreciation = 0.06 // 6% annual base

    // Location factor
    const locationMultiplier = this.getLocationMultiplier(features.walkScore, features.transitScore)
    
    // Property factor
    const propertyMultiplier = this.getPropertyMultiplier(features)
    
    // Market factor
    const marketMultiplier = this.getMarketMultiplier(market)
    
    // Risk factor
    const riskMultiplier = this.getRiskMultiplier(features)
    
    // Combined multiplier
    const totalMultiplier = locationMultiplier * propertyMultiplier * marketMultiplier * riskMultiplier
    
    // Add some random variation
    const randomFactor = this.randomBetween(0.8, 1.2)
    
    const annualAppreciation = baseAppreciation * totalMultiplier * randomFactor
    
    // Return 6m, 12m, 36m appreciations
    return [
      annualAppreciation * 0.5, // 6 months
      annualAppreciation,       // 12 months
      annualAppreciation * 3    // 36 months
    ]
  }

  private getLocationMultiplier(walkScore: number, transitScore: number): number {
    return 0.8 + (walkScore + transitScore) / 200 * 0.4
  }

  private getPropertyMultiplier(features: PropertyFeatures): number {
    let multiplier = 1.0
    
    // Age factor
    const age = new Date().getFullYear() - features.yearBuilt
    if (age < 10) multiplier *= 1.1
    else if (age > 50) multiplier *= 0.95
    
    // Size factor
    if (features.squareFootage > 2000) multiplier *= 1.05
    
    // Property type factor
    if (features.propertyType === 'single_family') multiplier *= 1.1
    else if (features.propertyType === 'condo') multiplier *= 1.0
    
    return multiplier
  }

  private getMarketMultiplier(market: MarketConditions): number {
    let multiplier = 1.0
    
    // Interest rate impact
    if (market.interestRates < 4) multiplier *= 1.2
    else if (market.interestRates > 6) multiplier *= 0.8
    
    // GDP growth impact
    multiplier *= (1 + market.gdpGrowth * 0.1)
    
    // Employment impact
    multiplier *= (0.5 + market.employmentRate * 0.5)
    
    return multiplier
  }

  private getRiskMultiplier(features: PropertyFeatures): number {
    const totalRisk = features.floodRisk + features.fireRisk + features.earthquakeRisk + features.seaLevelRisk
    return Math.max(0.7, 1.2 - totalRisk * 0.3)
  }

  // Helper method for generating random values between min and max
  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }
} 