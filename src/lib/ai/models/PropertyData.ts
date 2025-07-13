// Property data models for AI feature engineering
export interface PropertyFeatures {
  // Location features
  latitude: number
  longitude: number
  walkScore: number
  transitScore: number
  bikeScore: number
  
  // Property characteristics
  squareFootage: number
  bedrooms: number
  bathrooms: number
  lotSize: number
  yearBuilt: number
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family'
  
  // Economic indicators
  medianHouseholdIncome: number
  employmentRate: number
  populationDensity: number
  crimeRate: number
  
  // Market features
  currentPrice: number
  pricePerSqFt: number
  daysOnMarket: number
  inventoryLevel: number
  
  // Infrastructure & Development
  distanceToDowntown: number
  distanceToSchools: number
  distanceToTransit: number
  plannedDevelopments: number
  
  // Climate risks
  floodRisk: number
  fireRisk: number
  earthquakeRisk: number
  seaLevelRisk: number
  
  // Market dynamics
  seasonality: number // seasonal market factor (-0.1 to 0.1)
  supplyDemandRatio: number
  mortgageRates: number
  
  // Historical data
  price6MonthsAgo: number
  price1YearAgo: number
  price2YearsAgo: number
}

export interface PropertyPrediction {
  propertyId: string
  currentPrice: number
  predictions: {
    sixMonth: {
      price: number
      appreciation: number
      confidence: number
    }
    twelveMonth: {
      price: number
      appreciation: number
      confidence: number
    }
    thirtySixMonth: {
      price: number
      appreciation: number
      confidence: number
    }
  }
  factors: {
    positive: Array<{
      factor: string
      impact: number
      description: string
    }>
    negative: Array<{
      factor: string
      impact: number
      description: string
    }>
  }
  riskScore: number
  timestamp: Date
}

export interface MarketConditions {
  region: string
  season: 'spring' | 'summer' | 'fall' | 'winter'
  interestRates: number
  inflationRate: number
  gdpGrowth: number
  employmentRate: number
  housingStartsGrowth: number
  constructionCosts: number
  populationGrowth: number
}

export interface PredictionResult {
  predictions: {
    sixMonth: {
      price: number
      appreciation: number
      confidence: number
    }
    twelveMonth: {
      price: number
      appreciation: number
      confidence: number
    }
    thirtySixMonth: {
      price: number
      appreciation: number
      confidence: number
    }
  }
  factors: {
    positive: Array<{
      factor: string
      impact: number
      description: string
    }>
    negative: Array<{
      factor: string
      impact: number
      description: string
    }>
  }
  riskScore: number
  marketConditions: MarketConditions
  confidence: number
} 