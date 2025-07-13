import axios from 'axios'
import { USRealEstateService } from './USRealEstateService'

export interface RealMarketData {
  address: string
  currentValue: number
  estimatedValue: number
  priceHistory: Array<{
    date: string
    price: number
  }>
  comparables: Array<{
    address: string
    price: number
    squareFeet: number
    bedrooms: number
    bathrooms: number
    yearBuilt: number
    distance: number
    pricePerSqft: number
  }>
  rentEstimate: number
  priceChange30Day: number
  priceChange1Year: number
  marketHotness: number
  daysOnMarket: number
  inventory: number
  pricePerSqft: number
  walkScore: number
  transitScore: number
  schoolRating: number
  crimeRate: number
  appreciation12Month: number
  confidence: number
}

export interface NeighborhoodMetrics {
  medianHomePrice: number
  priceAppreciation1Year: number
  medianRent: number
  rentalYield: number
  population: number
  medianIncome: number
  employmentRate: number
  newConstructionPermits: number
  salesVolume: number
  avgDaysOnMarket: number
  inventory: number
  priceToIncomeRatio: number
  walkability: number
  schoolQuality: number
  safetyScore: number
  futureGrowthScore: number
}

export interface EconomicIndicators {
  gdpGrowth: number
  unemployment: number
  employmentRate: number
  jobGrowth: number
  populationGrowth: number
  incomeGrowth: number
  businessGrowth: number
  constructionActivity: number
  permitActivity: number
  permits: number
  migrationIndex: number
}

export class RealDataService {
  protected static instance: RealDataService | null = null
  protected cache: Map<string, { data: any; timestamp: number }> = new Map()
  protected readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
  
  // Real API keys
  protected readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
  protected readonly ZILLOW_API_KEY = process.env.ZILLOW_API_KEY
  protected readonly WALKSCORE_API_KEY = process.env.WALKSCORE_API_KEY
  
  protected usRealEstateService: USRealEstateService
  
  protected constructor() {
    if (!this.RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is required')
    }
    this.usRealEstateService = USRealEstateService.getInstance()
  }

  public static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService()
    }
    return RealDataService.instance
  }

  protected async fetchWithCache(key: string, fetcher: () => Promise<any>) {
    const now = Date.now()
    const cached = this.cache.get(key)

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    const data = await fetcher()
    this.cache.set(key, { data, timestamp: now })
    return data
  }

  public async getCurrentMarketConditions() {
    const cacheKey = 'market_conditions'
    
    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch('https://realty-mole-property-api.p.rapidapi.com/trends', {
          headers: {
            'X-RapidAPI-Key': this.RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        return {
          region: 'United States',
          season: this.getCurrentSeason(),
          interestRates: data.mortgageRate || 6.5,
          inflationRate: data.inflationRate || 3.0,
          gdpGrowth: data.gdpGrowth || 2.0,
          employmentRate: data.employmentRate || 0.95,
          housingStartsGrowth: data.housingStartsGrowth || 5.0,
          constructionCosts: data.constructionCosts || 300,
          populationGrowth: data.populationGrowth || 1.0
        }
      } catch (error) {
        console.error('Failed to fetch market conditions:', error)
        // Fallback to conservative estimates if API fails
        return {
          region: 'United States',
          season: this.getCurrentSeason(),
          interestRates: 6.5,
          inflationRate: 3.0,
          gdpGrowth: 2.0,
          employmentRate: 0.95,
          housingStartsGrowth: 5.0,
          constructionCosts: 300,
          populationGrowth: 1.0
        }
      }
    })
  }

  protected getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  public async getPropertyDetails(address: string) {
    const cacheKey = `property_${address}`
    
    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `https://realty-mole-property-api.p.rapidapi.com/properties?address=${encodeURIComponent(address)}`,
          {
            headers: {
              'X-RapidAPI-Key': this.RAPIDAPI_KEY!,
              'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data[0] // Return first match
      } catch (error) {
        console.error(`Failed to fetch property details for ${address}:`, error)
        throw error
      }
    })
  }

  public async getPropertyValue(propertyId: string) {
    const cacheKey = `value_${propertyId}`
    
    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `https://realty-mole-property-api.p.rapidapi.com/properties/${propertyId}/value`,
          {
            headers: {
              'X-RapidAPI-Key': this.RAPIDAPI_KEY!,
              'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        console.error(`Failed to fetch property value for ${propertyId}:`, error)
        throw error
      }
    })
  }

  public async getComparableProperties(propertyId: string) {
    const cacheKey = `comps_${propertyId}`
    
    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `https://realty-mole-property-api.p.rapidapi.com/properties/${propertyId}/comps`,
          {
            headers: {
              'X-RapidAPI-Key': this.RAPIDAPI_KEY!,
              'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        console.error(`Failed to fetch comparable properties for ${propertyId}:`, error)
        throw error
      }
    })
  }

  public async getRentalEstimate(propertyId: string) {
    const cacheKey = `rental_${propertyId}`
    
    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `https://realty-mole-property-api.p.rapidapi.com/properties/${propertyId}/rentalEstimate`,
          {
            headers: {
              'X-RapidAPI-Key': this.RAPIDAPI_KEY!,
              'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        console.error(`Failed to fetch rental estimate for ${propertyId}:`, error)
        throw error
      }
    })
  }
} 