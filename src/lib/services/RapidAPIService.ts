import axios from 'axios'
import { RateLimitingService } from './RateLimitingService'

export interface RapidAPIConfig {
  apiKey: string
  baseURL: string
  endpoints: {
    propertyDetails: string
    propertyValue: string
    propertyHistory: string
    comparables: string
    rentEstimate: string
    marketTrends: string
    demographics: string
  }
}

export interface RapidAPIResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export class RapidAPIService {
  private static instance: RapidAPIService | null = null
  private readonly config: RapidAPIConfig
  private readonly cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly rateLimiter: RateLimitingService

  private constructor() {
    this.config = {
      apiKey: process.env.RAPIDAPI_KEY || '',
      baseURL: 'https://realty-mole-property-api.p.rapidapi.com',
      endpoints: {
        propertyDetails: '/properties',
        propertyValue: '/properties/{id}/value',
        propertyHistory: '/properties/{id}/history',
        comparables: '/saleComps',
        rentEstimate: '/rentComps',
        marketTrends: '/trends',
        demographics: '/demographics'
      }
    }
    this.rateLimiter = RateLimitingService.getInstance()
  }

  static getInstance(): RapidAPIService {
    if (!RapidAPIService.instance) {
      RapidAPIService.instance = new RapidAPIService()
    }
    return RapidAPIService.instance
  }

  async getPropertyDetails(address: string): Promise<RapidAPIResponse<any>> {
    const cacheKey = `property_${address}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.makeRequest('propertyDetails', {
        params: { address }
      })

      const result = {
        success: true,
        data: response.data[0],
        timestamp: new Date().toISOString()
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      return this.handleError('Property details fetch failed', error)
    }
  }

  async getPropertyValue(propertyId: string): Promise<RapidAPIResponse<any>> {
    const cacheKey = `value_${propertyId}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.makeRequest('propertyValue', {
        urlParams: { id: propertyId }
      })

      const result = {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      return this.handleError('Property value fetch failed', error)
    }
  }

  async getComparables(address: string, params: any = {}): Promise<RapidAPIResponse<any>> {
    const cacheKey = `comps_${address}_${JSON.stringify(params)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.makeRequest('comparables', {
        params: {
          address,
          ...params,
          limit: params.limit || 10,
          radius: params.radius || 1,
          daysOld: params.daysOld || 180
        }
      })

      const result = {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      return this.handleError('Comparables fetch failed', error)
    }
  }

  async getRentEstimate(address: string, params: any = {}): Promise<RapidAPIResponse<any>> {
    const cacheKey = `rent_${address}_${JSON.stringify(params)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.makeRequest('rentEstimate', {
        params: {
          address,
          ...params,
          limit: params.limit || 10,
          radius: params.radius || 1
        }
      })

      const result = {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      return this.handleError('Rent estimate fetch failed', error)
    }
  }

  async getMarketTrends(city: string, state: string): Promise<RapidAPIResponse<any>> {
    const cacheKey = `trends_${city}_${state}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await this.makeRequest('marketTrends', {
        params: { city, state }
      })

      const result = {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      return this.handleError('Market trends fetch failed', error)
    }
  }

  private async makeRequest(
    endpoint: keyof RapidAPIConfig['endpoints'],
    options: {
      params?: any
      urlParams?: Record<string, string>
    } = {}
  ): Promise<any> {
    let url = this.config.endpoints[endpoint]
    
    // Replace URL parameters
    if (options.urlParams) {
      Object.entries(options.urlParams).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value)
      })
    }

    // Use rate limiter to handle the request
    return this.rateLimiter.executeWithRateLimit(
      'rapidapi',
      async () => {
        const response = await axios.get(`${this.config.baseURL}${url}`, {
          params: options.params,
          headers: {
            'X-RapidAPI-Key': this.config.apiKey,
            'X-RapidAPI-Host': new URL(this.config.baseURL).host
          }
        })
        return response
      },
      {
        priority: 'normal',
        timeout: 30000 // 30 seconds timeout
      }
    )
  }

  private handleError(message: string, error: any): RapidAPIResponse<any> {
    console.error(message, error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || message,
      timestamp: new Date().toISOString()
    }
  }

  private getFromCache(key: string): RapidAPIResponse<any> | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: RapidAPIResponse<any>): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
} 