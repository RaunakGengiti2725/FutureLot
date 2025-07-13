import { CachingService } from '../../lib/services/CachingService'

describe('CachingService', () => {
  let cachingService: CachingService

  beforeEach(() => {
    cachingService = CachingService.getInstance()
  })

  afterEach(() => {
    cachingService.destroy()
  })

  describe('Cache Operations', () => {
    it('should cache and retrieve data correctly', async () => {
      const testData = { id: 1, name: 'Test' }
      const fetcher = jest.fn().mockResolvedValue(testData)

      // First call should fetch data
      const result1 = await cachingService.get('testCache', 'key1', fetcher)
      expect(result1).toEqual(testData)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result2 = await cachingService.get('testCache', 'key1', fetcher)
      expect(result2).toEqual(testData)
      expect(fetcher).toHaveBeenCalledTimes(1) // Should not call fetcher again
    })

    it('should respect cache TTL', async () => {
      const testData = { id: 1, name: 'Test' }
      const fetcher = jest.fn().mockResolvedValue(testData)

      // Configure cache with short TTL
      cachingService.createCache('shortTTL', {
        ttl: 100, // 100ms
        maxSize: 10
      })

      // First call should fetch data
      await cachingService.get('shortTTL', 'key1', fetcher)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Second call should fetch fresh data
      await cachingService.get('shortTTL', 'key1', fetcher)
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('should handle cache eviction when size limit is reached', async () => {
      const testData = (id: number) => ({ id, name: `Test ${id}` })
      
      // Configure cache with small size limit
      cachingService.createCache('smallCache', {
        ttl: 1000,
        maxSize: 2
      })

      // Add three items to trigger eviction
      await cachingService.get('smallCache', 'key1', () => Promise.resolve(testData(1)))
      await cachingService.get('smallCache', 'key2', () => Promise.resolve(testData(2)))
      await cachingService.get('smallCache', 'key3', () => Promise.resolve(testData(3)))

      const stats = cachingService.getStats('smallCache')
      expect(stats.size).toBeLessThanOrEqual(2)
      expect(stats.evictions).toBeGreaterThan(0)
    })
  })

  describe('Cache Compression', () => {
    it('should compress and decompress data correctly', async () => {
      const largeData = {
        id: 1,
        name: 'Test',
        description: 'A'.repeat(1000) // Large string to trigger compression
      }
      const fetcher = jest.fn().mockResolvedValue(largeData)

      // Configure cache with compression enabled
      cachingService.createCache('compressedCache', {
        ttl: 1000,
        compression: true
      })

      const result = await cachingService.get('compressedCache', 'key1', fetcher)
      expect(result).toEqual(largeData)
    })
  })

  describe('Cache Analytics', () => {
    it('should track cache hits and misses', async () => {
      const testData = { id: 1, name: 'Test' }
      const fetcher = jest.fn().mockResolvedValue(testData)

      // Configure new cache
      cachingService.createCache('statsCache', {
        ttl: 1000
      })

      // First call should be a miss
      await cachingService.get('statsCache', 'key1', fetcher)

      // Second call should be a hit
      await cachingService.get('statsCache', 'key1', fetcher)

      const stats = cachingService.getStats('statsCache')
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
    })

    it('should track cache performance metrics', async () => {
      const testData = { id: 1, name: 'Test' }
      const fetcher = jest.fn().mockResolvedValue(testData)

      // Configure new cache
      cachingService.createCache('perfCache', {
        ttl: 1000
      })

      // Make some cache operations
      await cachingService.get('perfCache', 'key1', fetcher)
      await cachingService.get('perfCache', 'key1', fetcher)

      const stats = cachingService.getStats('perfCache')
      expect(stats.avgAccessTime).toBeGreaterThan(0)
      expect(stats.size).toBe(1)
    })
  })

  describe('Background Operations', () => {
    it('should perform background revalidation', async () => {
      const initialData = { id: 1, version: 1 }
      const updatedData = { id: 1, version: 2 }
      const fetcher = jest.fn()
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData)

      // Configure cache with stale-while-revalidate
      cachingService.createCache('revalidateCache', {
        ttl: 100,
        staleWhileRevalidate: true
      })

      // First call gets initial data
      const result1 = await cachingService.get('revalidateCache', 'key1', fetcher)
      expect(result1).toEqual(initialData)

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150))

      // Second call should return stale data but trigger revalidation
      const result2 = await cachingService.get('revalidateCache', 'key1', fetcher)
      expect(result2).toEqual(initialData) // Still get old data

      // Wait for revalidation
      await new Promise(resolve => setTimeout(resolve, 100))

      // Third call should get new data
      const result3 = await cachingService.get('revalidateCache', 'key1', fetcher)
      expect(result3).toEqual(updatedData)
    })
  })
}) 