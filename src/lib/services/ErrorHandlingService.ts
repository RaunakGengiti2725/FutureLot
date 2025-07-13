import { expandedCityData } from '../data/ExtendedCityData'

export interface ErrorResponse {
  success: boolean
  error: {
    code: string
    message: string
    details?: any
    fallbackUsed?: boolean
    fallbackSource?: string
  }
  data?: any
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  exponential?: boolean
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService | null = null
  private cityDataMap: Map<string, any> = new Map()
  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponential: true
  }

  private constructor() {
    this.initializeCityData()
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  private initializeCityData() {
    this.cityDataMap = new Map(
      expandedCityData.map(city => [`${city.name.toLowerCase()}_${city.state.toLowerCase()}`, city])
    )
  }

  async withErrorHandling<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config }
    let lastError: any

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        console.error(`Attempt ${attempt} failed:`, error)

        if (attempt < retryConfig.maxAttempts) {
          const delay = this.calculateDelay(attempt, retryConfig)
          await this.delay(delay)
          continue
        }
      }
    }

    console.log('All attempts failed, using fallback')
    return fallback()
  }

  async withFallback<T>(
    operation: () => Promise<T>,
    fallbackData: T | (() => Promise<T>),
    errorCode: string = 'OPERATION_FAILED'
  ): Promise<ErrorResponse> {
    try {
      const result = await operation()
      return {
        success: true,
        error: {
          code: 'SUCCESS',
          message: 'Operation completed successfully'
        },
        data: result
      }
    } catch (error: any) {
      console.error(`Operation failed with error:`, error)

      const fallbackResult = typeof fallbackData === 'function'
        ? await (fallbackData as () => Promise<T>)()
        : fallbackData

      return {
        success: false,
        error: {
          code: errorCode,
          message: error.message || 'Operation failed',
          details: error,
          fallbackUsed: true,
          fallbackSource: 'Static fallback data'
        },
        data: fallbackResult
      }
    }
  }

  async withCityFallback<T>(
    operation: () => Promise<T>,
    city: string,
    state: string,
    fallbackGenerator: (cityData: any) => T,
    errorCode: string = 'OPERATION_FAILED'
  ): Promise<ErrorResponse> {
    try {
      const result = await operation()
      return {
        success: true,
        error: {
          code: 'SUCCESS',
          message: 'Operation completed successfully'
        },
        data: result
      }
    } catch (error: any) {
      console.error(`Operation failed for ${city}, ${state}:`, error)

      const cityData = this.getCityData(city, state)
      const fallbackResult = cityData
        ? fallbackGenerator(cityData)
        : this.getDefaultFallback()

      return {
        success: false,
        error: {
          code: errorCode,
          message: error.message || 'Operation failed',
          details: error,
          fallbackUsed: true,
          fallbackSource: cityData ? 'City data' : 'Default values'
        },
        data: fallbackResult
      }
    }
  }

  async withGracefulDegradation<T extends Record<string, any>>(
    operations: Array<{
      operation: () => Promise<T>
      weight: number
    }>,
    fallback: () => Promise<T>
  ): Promise<T> {
    let result: T | null = null
    let totalWeight = 0

    for (const { operation, weight } of operations) {
      try {
        const partialResult = await operation()
        result = result
          ? this.mergeResults(result, partialResult, totalWeight, weight)
          : partialResult
        totalWeight += weight
      } catch (error) {
        console.error('Operation failed in graceful degradation:', error)
        continue
      }
    }

    if (!result) {
      console.log('All operations failed, using fallback')
      return fallback()
    }

    return result
  }

  async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    fallback: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        )
      ])
      return result
    } catch (error) {
      console.error('Operation timed out or failed:', error)
      return fallback()
    }
  }

  async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    options: {
      maxFailures: number
      resetTimeout: number
    } = { maxFailures: 5, resetTimeout: 60000 }
  ): Promise<T> {
    const circuitKey = this.getCircuitKey(operation)
    const circuitState = this.getCircuitState(circuitKey)

    if (circuitState.isOpen) {
      if (Date.now() - circuitState.lastFailure > options.resetTimeout) {
        this.resetCircuit(circuitKey)
      } else {
        console.log('Circuit breaker is open, using fallback')
        return fallback()
      }
    }

    try {
      const result = await operation()
      this.recordSuccess(circuitKey)
      return result
    } catch (error) {
      this.recordFailure(circuitKey, options.maxFailures)
      console.error('Operation failed, circuit breaker may open:', error)
      return fallback()
    }
  }

  async withBulkhead<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    maxConcurrent: number = 10
  ): Promise<T> {
    const bulkheadKey = this.getBulkheadKey(operation)
    const activeCalls = this.getActiveCalls(bulkheadKey)

    if (activeCalls >= maxConcurrent) {
      console.log('Too many concurrent calls, using fallback')
      return fallback()
    }

    try {
      this.incrementActiveCalls(bulkheadKey)
      const result = await operation()
      return result
    } finally {
      this.decrementActiveCalls(bulkheadKey)
    }
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const { baseDelay, maxDelay, exponential } = config
    let delay = baseDelay

    if (exponential) {
      delay = baseDelay * Math.pow(2, attempt - 1)
    } else {
      delay = baseDelay * attempt
    }

    return Math.min(delay, maxDelay)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getCityData(city: string, state: string): any {
    const key = `${city.toLowerCase()}_${state.toLowerCase()}`
    return this.cityDataMap.get(key)
  }

  private getDefaultFallback(): any {
    return {
      success: false,
      data: {
        medianHomePrice: 250000,
        rentGrowthRate: 0.05,
        employmentRate: 0.95,
        permitActivity: 50,
        developmentIndex: 50,
        investorInterest: 50,
        priceAppreciationYoY: 0.05,
        rentalYield: 0.06,
        affordabilityIndex: 50,
        futureValueScore: 50
      }
    }
  }

  private mergeResults<T extends Record<string, any>>(
    existing: T,
    partial: T,
    existingWeight: number,
    partialWeight: number
  ): T {
    if (typeof existing !== 'object' || typeof partial !== 'object') {
      return existing
    }

    const totalWeight = existingWeight + partialWeight
    const result = { ...existing }

    for (const key in partial) {
      if (typeof partial[key] === 'number' && typeof existing[key] === 'number') {
        result[key] = (
          (existing[key] * existingWeight + partial[key] * partialWeight) /
          totalWeight
        ) as T[Extract<keyof T, string>]
      } else if (typeof partial[key] === 'object' && partial[key] !== null) {
        result[key] = this.mergeResults(
          existing[key],
          partial[key],
          existingWeight,
          partialWeight
        )
      }
    }

    return result
  }

  // Circuit breaker implementation
  private circuits: Map<string, {
    failures: number
    lastFailure: number
    isOpen: boolean
  }> = new Map()

  private getCircuitKey(operation: Function): string {
    return operation.name || operation.toString()
  }

  private getCircuitState(key: string) {
    return (
      this.circuits.get(key) || {
        failures: 0,
        lastFailure: 0,
        isOpen: false
      }
    )
  }

  private recordSuccess(key: string) {
    this.circuits.set(key, {
      failures: 0,
      lastFailure: 0,
      isOpen: false
    })
  }

  private recordFailure(key: string, maxFailures: number) {
    const state = this.getCircuitState(key)
    state.failures++
    state.lastFailure = Date.now()
    state.isOpen = state.failures >= maxFailures
    this.circuits.set(key, state)
  }

  private resetCircuit(key: string) {
    this.circuits.set(key, {
      failures: 0,
      lastFailure: 0,
      isOpen: false
    })
  }

  // Bulkhead implementation
  private bulkheads: Map<string, number> = new Map()

  private getBulkheadKey(operation: Function): string {
    return operation.name || operation.toString()
  }

  private getActiveCalls(key: string): number {
    return this.bulkheads.get(key) || 0
  }

  private incrementActiveCalls(key: string) {
    const current = this.getActiveCalls(key)
    this.bulkheads.set(key, current + 1)
  }

  private decrementActiveCalls(key: string) {
    const current = this.getActiveCalls(key)
    if (current > 0) {
      this.bulkheads.set(key, current - 1)
    }
  }
} 