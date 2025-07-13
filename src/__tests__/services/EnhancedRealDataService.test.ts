import { EnhancedRealDataService } from '../../lib/services/EnhancedRealDataService'
import { RapidAPIService } from '../../lib/services/RapidAPIService'
import { RateLimitingService } from '../../lib/services/RateLimitingService'
import { CachingService } from '../../lib/services/CachingService'

describe('EnhancedRealDataService', () => {
  let enhancedService: EnhancedRealDataService
  let rapidApiService: RapidAPIService
  let rateLimitingService: RateLimitingService
  let cachingService: CachingService

  const testCities = [
    { city: 'New York', state: 'NY', expectedPrice: 1000000 },
    { city: 'San Francisco', state: 'CA', expectedPrice: 1200000 },
    { city: 'Austin', state: 'TX', expectedPrice: 500000 },
    { city: 'Miami', state: 'FL', expectedPrice: 600000 },
    { city: 'Denver', state: 'CO', expectedPrice: 550000 }
  ]

  beforeEach(() => {
    enhancedService = EnhancedRealDataService.getInstance()
    rapidApiService = RapidAPIService.getInstance()
    rateLimitingService = RateLimitingService.getInstance()
    cachingService = CachingService.getInstance()
  })

  afterEach(() => {
    jest.clearAllMocks()
    cachingService.destroy()
    rateLimitingService.destroy()
  })

  describe('Enhanced Property Data', () => {
    it('should fetch enhanced property data with additional metrics', async () => {
      const address = '123 Main St, New York, NY 12345'
      const result = await enhancedService.getPropertyData(address)

      expect(result).toBeDefined()
      expect(result.zestimate).toBeDefined()
      expect(result.rentZestimate).toBeDefined()
      expect(result.walkScore).toBeDefined()
      expect(result.transitScore).toBeDefined()
      expect(result.comparables).toHaveLength(10)
      expect(result.marketTrends).toBeDefined()
    })

    it('should handle rate limits when fetching multiple properties', async () => {
      const addresses = testCities.map(({ city, state }) => 
        `123 Main St, ${city}, ${state} 12345`
      )

      const results = await Promise.all(
        addresses.map(address => enhancedService.getPropertyData(address))
      )

      expect(results).toHaveLength(testCities.length)
      results.forEach((result, index) => {
        expect(result.price).toBeGreaterThan(testCities[index].expectedPrice * 0.5)
        expect(result.price).toBeLessThan(testCities[index].expectedPrice * 1.5)
      })
    })

    it('should provide accurate rental estimates', async () => {
      const address = '123 Main St, San Francisco, CA 94105'
      const result = await enhancedService.getPropertyData(address)

      expect(result.rentZestimate).toBeDefined()
      expect(result.rentZestimate).toBeGreaterThan(0)
      // Typical rent should be 0.4% to 1.1% of property value monthly
      expect(result.rentZestimate / result.price).toBeGreaterThan(0.004)
      expect(result.rentZestimate / result.price).toBeLessThan(0.011)
    })
  })

  describe('Market Analysis', () => {
    it('should provide comprehensive market analysis', async () => {
      const { city, state } = testCities[0]
      const result = await enhancedService.getMarketAnalysis(city, state)

      expect(result).toMatchObject({
        medianPrice: expect.any(Number),
        priceChange30Day: expect.any(Number),
        priceChange1Year: expect.any(Number),
        inventory: expect.any(Number),
        daysOnMarket: expect.any(Number),
        marketHotness: expect.any(Number),
        supplyDemandIndex: expect.any(Number),
        priceToRentRatio: expect.any(Number),
        investmentScore: expect.any(Number)
      })
    })

    it('should analyze investment potential', async () => {
      const results = await Promise.all(
        testCities.map(({ city, state }) => 
          enhancedService.getInvestmentAnalysis(city, state)
        )
      )

      results.forEach(result => {
        expect(result.investmentScore).toBeDefined()
        expect(result.investmentScore).toBeGreaterThanOrEqual(0)
        expect(result.investmentScore).toBeLessThanOrEqual(100)
        expect(result.riskLevel).toBeOneOf(['low', 'medium', 'high'])
        expect(result.expectedAppreciation).toBeDefined()
        expect(result.rentalYield).toBeDefined()
      })
    })
  })

  describe('Data Integration', () => {
    it('should integrate multiple data sources', async () => {
      const address = '123 Main St, Miami, FL 33101'
      const result = await enhancedService.getPropertyData(address)

      // Check that data is integrated from multiple sources
      expect(result.zestimate).toBeDefined() // Zillow
      expect(result.walkScore).toBeDefined() // WalkScore
      expect(result.comparables).toBeDefined() // RapidAPI
      expect(result.marketTrends).toBeDefined() // Market Research
      expect(result.climateRisk).toBeDefined() // Climate data
    })

    it('should handle missing data gracefully', async () => {
      const address = '123 Main St, Small Town, ST 12345'
      const result = await enhancedService.getPropertyData(address)

      // Should still provide estimates even with missing data
      expect(result.price).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThan(80)
      expect(result.dataQuality).toBeDefined()
      expect(result.estimationMethod).toBeDefined()
    })
  })

  describe('Performance and Reliability', () => {
    it('should maintain performance with caching', async () => {
      const address = '123 Main St, Denver, CO 80202'
      const iterations = 5
      const startTime = Date.now()

      // First request - should fetch fresh data
      const firstResult = await enhancedService.getPropertyData(address)
      const firstRequestTime = Date.now() - startTime

      // Subsequent requests - should use cache
      const cachedResults = await Promise.all(
        Array(iterations - 1).fill(null).map(() => 
          enhancedService.getPropertyData(address)
        )
      )

      const totalTime = Date.now() - startTime
      const averageCachedTime = (totalTime - firstRequestTime) / (iterations - 1)

      expect(cachedResults.every(result => 
        result.price === firstResult.price
      )).toBe(true)
      expect(averageCachedTime).toBeLessThan(firstRequestTime / 2)
    })

    it('should handle concurrent requests efficiently', async () => {
      const addresses = testCities.map(({ city, state }) => 
        `123 Main St, ${city}, ${state} 12345`
      )

      const startTime = Date.now()
      const results = await Promise.all([
        ...addresses.map(address => enhancedService.getPropertyData(address)),
        ...addresses.map(address => enhancedService.getPropertyData(address)) // Duplicate requests
      ])

      const totalTime = Date.now() - startTime

      expect(results).toHaveLength(testCities.length * 2)
      expect(totalTime).toBeLessThan(10000) // Should complete within 10 seconds
    })
  })
}) 