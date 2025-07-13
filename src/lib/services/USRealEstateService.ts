import axios from 'axios'

export interface USRealEstateProperty {
  property_id: string
  listing_id?: string
  address: {
    line: string
    city: string
    state_code: string
    postal_code: string
  }
  price: number
  beds: number
  baths: number
  sqft: number
  lot_size?: number
  year_built?: number
  property_type: string
  listing_status: string
  days_on_market?: number
  price_per_sqft?: number
  description?: string
  photos?: string[]
  features?: string[]
  schools?: any[]
  tax_assessed_value?: number
  tax_annual_amount?: number
  mls?: {
    id: string
    name: string
  }
}

export interface PropertyEstimate {
  estimate: number
  low: number
  high: number
  date: string
  confidence_score?: number
}

export class USRealEstateService {
  private static instance: USRealEstateService | null = null
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY

  private constructor() {
    if (!this.RAPIDAPI_KEY) {
      console.warn('RAPIDAPI_KEY not found. Service will use mock data.')
    }
  }

  public static getInstance(): USRealEstateService {
    if (!USRealEstateService.instance) {
      USRealEstateService.instance = new USRealEstateService()
    }
    return USRealEstateService.instance
  }

  private getHeaders() {
    return {
      'X-RapidAPI-Key': this.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    }
  }

  private fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return Promise.resolve(cached.data)
    }

    return fetcher().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() })
      return data
    })
  }

  public async searchProperties(params: {
    city: string
    state: string
    offset?: number
    limit?: number
    sort?: string
    type?: string
    beds_min?: number
    beds_max?: number
    baths_min?: number
    baths_max?: number
    price_min?: number
    price_max?: number
    sqft_min?: number
    sqft_max?: number
    year_built_min?: number
    year_built_max?: number
  }) {
    const cacheKey = `search_${JSON.stringify(params)}`

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await axios.get('https://us-real-estate.p.rapidapi.com/v2/for-sale', {
          params: {
            city: params.city,
            state_code: params.state,
            offset: params.offset || 0,
            limit: params.limit || 50,
            sort: params.sort || 'newest',
            property_type: params.type || 'single_family,multi_family,condo,townhouse',
            beds_min: params.beds_min,
            beds_max: params.beds_max,
            baths_min: params.baths_min,
            baths_max: params.baths_max,
            price_min: params.price_min,
            price_max: params.price_max,
            sqft_min: params.sqft_min,
            sqft_max: params.sqft_max,
            year_built_min: params.year_built_min,
            year_built_max: params.year_built_max
          },
          headers: this.getHeaders()
        })

        if (response.data.data?.home_search?.results) {
          return response.data.data.home_search.results.map((property: any) => ({
            id: property.property_id,
            address: property.location.address.line,
            city: property.location.address.city,
            state: property.location.address.state,
            zipCode: property.location.address.postal_code,
            lat: property.location.address.coordinate.lat,
            lng: property.location.address.coordinate.lon,
            price: property.list_price,
            squareFootage: property.description.sqft,
            bedrooms: property.description.beds,
            bathrooms: property.description.baths,
            yearBuilt: property.description.year_built,
            propertyType: property.description.type,
            lotSize: property.description.lot_sqft,
            daysOnMarket: property.list_date ? Math.floor((Date.now() - new Date(property.list_date).getTime()) / (1000 * 60 * 60 * 24)) : null,
            pricePerSqft: property.list_price / property.description.sqft,
            photos: property.photos?.map((photo: any) => photo.href) || [],
            source: 'RapidAPI',
            mlsNumber: property.mls?.id || `RAPID-${property.property_id}`
          }))
        }
        return []
      } catch (error) {
        console.error('Failed to search properties:', error)
        throw error
      }
    })
  }

  public async getMarketStats(params: { city: string; state: string }) {
    const cacheKey = `market_${params.city}_${params.state}`

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await axios.get('https://us-real-estate.p.rapidapi.com/v2/market-stats', {
          params: {
            city: params.city,
            state_code: params.state
          },
          headers: this.getHeaders()
        })

        if (response.data.data?.market_stats) {
          const stats = response.data.data.market_stats
          return {
            medianPrice: stats.median_price,
            medianPricePerSqft: stats.median_price_per_sqft,
            daysOnMarket: stats.median_days_on_market,
            totalListings: stats.total_listings,
            newListings: stats.new_listings,
            priceReduced: stats.price_reduced,
            medianRent: stats.median_rent,
            priceAppreciation: stats.price_appreciation_12month,
            inventory: stats.months_of_inventory,
            marketHotness: stats.market_hotness,
            affordabilityIndex: stats.affordability_index
          }
        }
        return null
      } catch (error) {
        console.error('Failed to get market stats:', error)
        throw error
      }
    })
  }

  public async getPropertyDetails(propertyId: string) {
    const cacheKey = `property_${propertyId}`

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await axios.get('https://us-real-estate.p.rapidapi.com/v2/property-detail', {
          params: { property_id: propertyId },
          headers: this.getHeaders()
        })

        if (response.data.data?.property) {
          const property = response.data.data.property
          return {
            id: property.property_id,
            address: property.location.address.line,
            city: property.location.address.city,
            state: property.location.address.state,
            zipCode: property.location.address.postal_code,
            lat: property.location.address.coordinate.lat,
            lng: property.location.address.coordinate.lon,
            price: property.list_price,
            squareFootage: property.description.sqft,
            bedrooms: property.description.beds,
            bathrooms: property.description.baths,
            yearBuilt: property.description.year_built,
            propertyType: property.description.type,
            lotSize: property.description.lot_sqft,
            daysOnMarket: property.list_date ? Math.floor((Date.now() - new Date(property.list_date).getTime()) / (1000 * 60 * 60 * 24)) : null,
            pricePerSqft: property.list_price / property.description.sqft,
            photos: property.photos?.map((photo: any) => photo.href) || [],
            description: property.description.text,
            features: property.features,
            schools: property.schools,
            taxHistory: property.tax_history,
            priceHistory: property.price_history,
            source: 'RapidAPI',
            mlsNumber: property.mls?.id || `RAPID-${property.property_id}`
          }
        }
        return null
      } catch (error) {
        console.error('Failed to get property details:', error)
        throw error
      }
    })
  }
} 