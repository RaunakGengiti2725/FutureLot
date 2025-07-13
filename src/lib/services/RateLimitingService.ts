import { ErrorHandlingService } from './ErrorHandlingService'

interface RateLimitConfig {
  maxRequests: number // Maximum requests per window
  windowMs: number // Time window in milliseconds
  queueSize?: number // Maximum queue size (optional)
  retryAfter?: number // Time to wait before retrying in milliseconds
}

interface RateLimitState {
  requests: number
  resetTime: number
  queue: Array<{
    resolve: (value: any) => void
    reject: (error: any) => void
    operation: () => Promise<any>
    timestamp: number
    retryCount: number
  }>
}

export class RateLimitingService {
  private static instance: RateLimitingService | null = null
  private rateLimits: Map<string, RateLimitConfig> = new Map()
  private rateLimitStates: Map<string, RateLimitState> = new Map()
  private errorHandler: ErrorHandlingService
  private queueProcessors: Map<string, NodeJS.Timeout> = new Map()

  private readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 50,
    windowMs: 60000, // 1 minute
    queueSize: 1000,
    retryAfter: 1000
  }

  private constructor() {
    this.errorHandler = ErrorHandlingService.getInstance()
    this.initializeDefaultLimits()
  }

  static getInstance(): RateLimitingService {
    if (!RateLimitingService.instance) {
      RateLimitingService.instance = new RateLimitingService()
    }
    return RateLimitingService.instance
  }

  private initializeDefaultLimits() {
    // RapidAPI limits
    this.setRateLimit('rapidapi', {
      maxRequests: 50,
      windowMs: 60000,
      queueSize: 1000,
      retryAfter: 1000
    })

    // Zillow API limits
    this.setRateLimit('zillow', {
      maxRequests: 100,
      windowMs: 60000,
      queueSize: 2000,
      retryAfter: 1000
    })

    // Default limits for other APIs
    this.setRateLimit('default', this.DEFAULT_CONFIG)
  }

  setRateLimit(apiKey: string, config: Partial<RateLimitConfig>) {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config }
    this.rateLimits.set(apiKey, fullConfig)
    
    if (!this.rateLimitStates.has(apiKey)) {
      this.rateLimitStates.set(apiKey, {
        requests: 0,
        resetTime: Date.now() + fullConfig.windowMs,
        queue: []
      })
      this.startQueueProcessor(apiKey)
    }
  }

  async executeWithRateLimit<T>(
    apiKey: string,
    operation: () => Promise<T>,
    options: {
      priority?: 'high' | 'normal' | 'low'
      timeout?: number
    } = {}
  ): Promise<T> {
    const config = this.rateLimits.get(apiKey) || this.DEFAULT_CONFIG
    const state = this.rateLimitStates.get(apiKey) || {
      requests: 0,
      resetTime: Date.now() + config.windowMs,
      queue: []
    }

    // Reset counter if window has passed
    if (Date.now() >= state.resetTime) {
      state.requests = 0
      state.resetTime = Date.now() + config.windowMs
    }

    // If under rate limit, execute immediately
    if (state.requests < config.maxRequests) {
      state.requests++
      try {
        return await operation()
      } catch (error: any) {
        if (error.response?.status === 429) { // Rate limit exceeded
          return await this.handleRateLimitExceeded(apiKey, operation, options)
        }
        throw error
      }
    }

    // Otherwise, queue the request
    return await this.queueOperation(apiKey, operation, options)
  }

  private async handleRateLimitExceeded<T>(
    apiKey: string,
    operation: () => Promise<T>,
    options: { priority?: 'high' | 'normal' | 'low'; timeout?: number } = {}
  ): Promise<T> {
    const config = this.rateLimits.get(apiKey) || this.DEFAULT_CONFIG
    const retryAfter = config.retryAfter || this.DEFAULT_CONFIG.retryAfter

    // Wait for retryAfter duration
    await new Promise(resolve => setTimeout(resolve, retryAfter))

    // Try again with rate limiting
    return this.executeWithRateLimit(apiKey, operation, options)
  }

  private async queueOperation<T>(
    apiKey: string,
    operation: () => Promise<T>,
    options: { priority?: 'high' | 'normal' | 'low'; timeout?: number } = {}
  ): Promise<T> {
    const config = this.rateLimits.get(apiKey) || this.DEFAULT_CONFIG
    const state = this.rateLimitStates.get(apiKey)!

    // Check queue size limit
    if (config.queueSize && state.queue.length >= config.queueSize) {
      throw new Error(`Queue size limit reached for API ${apiKey}`)
    }

    // Add operation to queue with priority
    return new Promise((resolve, reject) => {
      const queueItem = {
        resolve,
        reject,
        operation,
        timestamp: Date.now(),
        retryCount: 0
      }

      // Insert based on priority
      if (options.priority === 'high') {
        state.queue.unshift(queueItem)
      } else {
        state.queue.push(queueItem)
      }

      // Set timeout if specified
      if (options.timeout) {
        setTimeout(() => {
          const index = state.queue.indexOf(queueItem)
          if (index !== -1) {
            state.queue.splice(index, 1)
            reject(new Error('Operation timed out'))
          }
        }, options.timeout)
      }
    })
  }

  private startQueueProcessor(apiKey: string) {
    // Clear any existing processor
    if (this.queueProcessors.has(apiKey)) {
      clearInterval(this.queueProcessors.get(apiKey))
    }

    // Start new processor
    const processor = setInterval(() => {
      void this.processQueue(apiKey)
    }, 100) // Process queue every 100ms

    this.queueProcessors.set(apiKey, processor)
  }

  private async processQueue(apiKey: string) {
    const state = this.rateLimitStates.get(apiKey)
    const config = this.rateLimits.get(apiKey)
    if (!state || !config || state.queue.length === 0) return

    // Reset counter if window has passed
    if (Date.now() >= state.resetTime) {
      state.requests = 0
      state.resetTime = Date.now() + config.windowMs
    }

    // Process items if under rate limit
    while (state.requests < config.maxRequests && state.queue.length > 0) {
      const item = state.queue.shift()
      if (!item) break

      state.requests++
      try {
        const result = await item.operation()
        item.resolve(result)
      } catch (error: any) {
        if (error.response?.status === 429 && item.retryCount < 3) {
          // Rate limit hit during queue processing, re-queue with higher retry count
          item.retryCount++
          state.queue.unshift(item)
          await new Promise(resolve => setTimeout(resolve, config.retryAfter))
        } else {
          item.reject(error)
        }
      }
    }
  }

  getQueueStats(apiKey: string) {
    const state = this.rateLimitStates.get(apiKey)
    if (!state) return null

    return {
      queueLength: state.queue.length,
      requestsInWindow: state.requests,
      windowResetIn: Math.max(0, state.resetTime - Date.now()),
      oldestQueuedRequest: state.queue[0]?.timestamp || null,
      averageWaitTime: state.queue.length > 0
        ? state.queue.reduce((sum, item) => sum + (Date.now() - item.timestamp), 0) / state.queue.length
        : 0
    }
  }

  destroy() {
    // Clear all queue processors
    Array.from(this.queueProcessors.values()).forEach(processor => {
      clearInterval(processor)
    })
    this.queueProcessors.clear()
    this.rateLimitStates.clear()
  }
} 