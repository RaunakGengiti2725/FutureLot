import { RateLimitingService } from '../../lib/services/RateLimitingService'

describe('RateLimitingService', () => {
  let rateLimiter: RateLimitingService

  beforeEach(() => {
    rateLimiter = RateLimitingService.getInstance()
  })

  afterEach(() => {
    rateLimiter.destroy()
  })

  describe('Rate Limiting', () => {
    it('should execute requests within rate limit immediately', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 2,
        windowMs: 1000,
        queueSize: 5
      })

      const operation = jest.fn().mockResolvedValue('success')
      
      const results = await Promise.all([
        rateLimiter.executeWithRateLimit(apiKey, operation),
        rateLimiter.executeWithRateLimit(apiKey, operation)
      ])

      expect(results).toEqual(['success', 'success'])
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should queue requests when rate limit is exceeded', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 1,
        windowMs: 1000,
        queueSize: 5
      })

      const operation = jest.fn()
        .mockImplementationOnce(() => Promise.resolve('first'))
        .mockImplementationOnce(() => Promise.resolve('second'))

      const firstRequest = rateLimiter.executeWithRateLimit(apiKey, operation)
      const secondRequest = rateLimiter.executeWithRateLimit(apiKey, operation)

      const results = await Promise.all([firstRequest, secondRequest])
      expect(results).toEqual(['first', 'second'])
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should handle rate limit exceeded errors and retry', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 1,
        windowMs: 1000,
        retryAfter: 100
      })

      const operation = jest.fn()
        .mockRejectedValueOnce({ response: { status: 429 } })
        .mockResolvedValueOnce('success')

      const result = await rateLimiter.executeWithRateLimit(apiKey, operation)
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
    })
  })

  describe('Queue Management', () => {
    it('should respect queue size limits', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 1,
        windowMs: 1000,
        queueSize: 1
      })

      const operation = jest.fn().mockResolvedValue('success')

      // First request should execute immediately
      const first = rateLimiter.executeWithRateLimit(apiKey, operation)
      // Second request should be queued
      const second = rateLimiter.executeWithRateLimit(apiKey, operation)
      // Third request should fail due to queue size limit
      const third = rateLimiter.executeWithRateLimit(apiKey, operation)

      await expect(first).resolves.toBe('success')
      await expect(second).resolves.toBe('success')
      await expect(third).rejects.toThrow('Queue size limit reached')
    })

    it('should prioritize high priority requests in queue', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 1,
        windowMs: 1000,
        queueSize: 5
      })

      const operation = jest.fn()
        .mockImplementationOnce(() => Promise.resolve('first'))
        .mockImplementationOnce(() => Promise.resolve('high-priority'))
        .mockImplementationOnce(() => Promise.resolve('normal-priority'))

      // First request executes immediately
      const first = rateLimiter.executeWithRateLimit(apiKey, operation)
      // Queue a normal priority request
      const normal = rateLimiter.executeWithRateLimit(apiKey, operation, { priority: 'normal' })
      // Queue a high priority request
      const high = rateLimiter.executeWithRateLimit(apiKey, operation, { priority: 'high' })

      const results = await Promise.all([first, normal, high])
      expect(results).toEqual(['first', 'normal-priority', 'high-priority'])
    })

    it('should handle request timeouts', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 1,
        windowMs: 1000,
        queueSize: 5
      })

      const operation = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 500)))

      // First request should execute immediately
      const first = rateLimiter.executeWithRateLimit(apiKey, operation)
      // Second request should timeout
      const second = rateLimiter.executeWithRateLimit(apiKey, operation, { timeout: 100 })

      await expect(first).resolves.not.toThrow()
      await expect(second).rejects.toThrow('Operation timed out')
    })
  })

  describe('Analytics', () => {
    it('should track queue statistics', async () => {
      const apiKey = 'test-api'
      rateLimiter.setRateLimit(apiKey, {
        maxRequests: 1,
        windowMs: 1000,
        queueSize: 5
      })

      const operation = jest.fn().mockResolvedValue('success')

      // Execute first request
      await rateLimiter.executeWithRateLimit(apiKey, operation)

      // Queue second request
      const queuedRequest = rateLimiter.executeWithRateLimit(apiKey, operation)

      const stats = rateLimiter.getQueueStats(apiKey)
      expect(stats).toMatchObject({
        queueLength: 1,
        requestsInWindow: 1
      })

      await queuedRequest
    })
  })
}) 