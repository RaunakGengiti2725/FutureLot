import { RealDataService } from '../../lib/services/RealDataService'
import { RapidAPIService } from '../../lib/services/RapidAPIService'
import { CachingService } from '../../lib/services/CachingService'

describe('RealDataService', () => {
  let realDataService: RealDataService
  let rapidApiService: RapidAPIService
  let cachingService: CachingService

  const testCities = [
    { city: 'New York', state: 'NY' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Houston', state: 'TX' },
    { city: 'Phoenix', state: 'AZ' }
  ]

  beforeEach(() => {
    realDataService = RealDataService.getInstance()
    rapidApiService = RapidAPIService.getInstance()
    cachingService = CachingService.getInstance()
  })

  afterEach(() => {
    jest.clearAllMocks()
    cachingService.destroy()
  })

  describe('Property Data Fetching', () => {
    it('should fetch property data for multiple cities', async () => {
      const addresses = testCities.map(({ city, state }) => 
        `123 Main St, ${city}, ${state} 12345`
      )

      const results = await Promise.all(
        addresses.map(address => realDataService.getPropertyData(address))
      )

      results.forEach((result, index) => {
        expect(result).toBeDefined()
        expect(result.address).toContain(testCities[index].city)
        expect(result.currentValue).toBeGreaterThan(0)
      })
    })

    it('should handle API errors gracefully', async () => {
      const invalidAddress = '123 Invalid St, Nowhere, XX 00000'

      await expect(realDataService.getPropertyData(invalidAddress))
        .rejects
        .toThrow('Property data not found')
    })

    it('should use cached data for repeated requests', async () => {
      const address = '123 Main St, New York, NY 12345'
      const fetchSpy = jest.spyOn(rapidApiService, 'getPropertyDetails')

      // First request should fetch data
      const result1 = await realDataService.getPropertyData(address)
      expect(result1).toBeDefined()
      expect(fetchSpy).toHaveBeenCalledTimes(1)

      // Second request should use cache
      const result2 = await realDataService.getPropertyData(address)
      expect(result2).toBeDefined()
      expect(fetchSpy).toHaveBeenCalledTimes(1)

      expect(result1).toEqual(result2)
    })
  })

  describe('Market Research', () => {
    it('should provide market insights for different cities', async () => {
      const results = await Promise.all(
        testCities.map(({ city, state }) => 
          realDataService.getMarketInsights(city, state)
        )
      )

      results.forEach((result, index) => {
        expect(result).toBeDefined()
        expect(result.city).toBe(testCities[index].city)
        expect(result.state).toBe(testCities[index].state)
        expect(result.medianPrice).toBeGreaterThan(0)
        expect(result.priceChange30Day).toBeDefined()
        expect(result.priceChange1Year).toBeDefined()
      })
    })

    it('should handle missing market data', async () => {
      const result = await realDataService.getMarketInsights('Small Town', 'ST')
      
      expect(result).toBeDefined()
      expect(result.confidence).toBeLessThan(80) // Lower confidence for estimated data
      expect(result.medianPrice).toBeGreaterThan(0)
    })
  })

  describe('Data Validation', () => {
    it('should validate property data fields', async () => {
      const address = '123 Main St, New York, NY 12345'
      const result = await realDataService.getPropertyData(address)

      expect(result).toMatchObject({
        address: expect.any(String),
        currentValue: expect.any(Number),
        squareFootage: expect.any(Number),
        bedrooms: expect.any(Number),
        bathrooms: expect.any(Number),
        yearBuilt: expect.any(Number),
        lotSize: expect.any(Number)
      })
    })

    it('should validate market insight fields', async () => {
      const { city, state } = testCities[0]
      const result = await realDataService.getMarketInsights(city, state)

      expect(result).toMatchObject({
        city: expect.any(String),
        state: expect.any(String),
        medianPrice: expect.any(Number),
        inventory: expect.any(Number),
        daysOnMarket: expect.any(Number),
        pricePerSqft: expect.any(Number),
        priceChange30Day: expect.any(Number),
        priceChange1Year: expect.any(Number)
      })
    })
  })

  describe('Performance', () => {
    it('should fetch data for multiple cities in parallel', async () => {
      const startTime = Date.now()
      
      const addresses = testCities.map(({ city, state }) => 
        `123 Main St, ${city}, ${state} 12345`
      )

      const results = await Promise.all(
        addresses.map(address => realDataService.getPropertyData(address))
      )

      const endTime = Date.now()
      const totalTime = endTime - startTime

      expect(results).toHaveLength(testCities.length)
      expect(totalTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should maintain performance under load', async () => {
      const address = '123 Main St, New York, NY 12345'
      const iterations = 10
      const startTime = Date.now()

      const results = await Promise.all(
        Array(iterations).fill(null).map(() => 
          realDataService.getPropertyData(address)
        )
      )

      const endTime = Date.now()
      const totalTime = endTime - startTime
      const averageTime = totalTime / iterations

      expect(results).toHaveLength(iterations)
      expect(averageTime).toBeLessThan(500) // Average time per request < 500ms
    })
  })
}) 