import { RealMarketData, NeighborhoodMetrics, EconomicIndicators } from './RealDataService'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  updateInterval?: number // Background update interval in milliseconds
  staleWhileRevalidate?: boolean // Allow serving stale data while fetching fresh
  compression?: boolean // Enable data compression
  priority?: 'high' | 'medium' | 'low' // Cache eviction priority
  persistToDisk?: boolean // Whether to persist cache to disk
  warmupStrategy?: 'eager' | 'lazy' // Cache warming strategy
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  oldestEntry: Date
  newestEntry: Date
  evictions: number
  avgAccessTime: number
}

export interface CacheEntry<T> {
  key: string
  data: T
  timestamp: number
  expiresAt: number
  lastAccessed: number
  accessCount: number
  size: number
  priority: 'high' | 'medium' | 'low'
  isCompressed: boolean
}

export interface CacheOptions {
  bypassCache?: boolean
  forceFresh?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export class CachingService {
  private static instance: CachingService | null = null
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map()
  private stats: Map<string, CacheStats> = new Map()
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map()
  private readonly CACHE_DIR = path.join(process.cwd(), '.cache')
  private readonly DEFAULT_CONFIG: CacheConfig = {
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 1000,
    updateInterval: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
    compression: true,
    priority: 'medium',
    persistToDisk: true,
    warmupStrategy: 'lazy'
  }

  private constructor() {
    this.ensureCacheDirectory()
    this.initializeCaches()
    this.loadPersistedCaches()
    this.startPeriodicPersistence()
  }

  static getInstance(): CachingService {
    if (!CachingService.instance) {
      CachingService.instance = new CachingService()
    }
    return CachingService.instance
  }

  private initializeCaches() {
    // Initialize caches for different data types
    this.createCache('marketData', {
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 10000,
      updateInterval: 5 * 60 * 1000,
      staleWhileRevalidate: true,
      compression: true,
      priority: 'high'
    })

    this.createCache('neighborhoodMetrics', {
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 5000,
      updateInterval: 30 * 60 * 1000,
      staleWhileRevalidate: true,
      compression: true,
      priority: 'medium'
    })

    this.createCache('economicIndicators', {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 1000,
      updateInterval: 12 * 60 * 60 * 1000,
      staleWhileRevalidate: true,
      compression: true,
      priority: 'low'
    })

    this.createCache('propertyHistory', {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxSize: 50000,
      updateInterval: 24 * 60 * 60 * 1000,
      staleWhileRevalidate: false,
      compression: true,
      priority: 'low'
    })

    this.createCache('marketPredictions', {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 5000,
      updateInterval: 6 * 60 * 60 * 1000,
      staleWhileRevalidate: true,
      compression: true,
      priority: 'medium'
    })
  }

  createCache(name: string, config: Partial<CacheConfig> = {}) {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config }
    this.caches.set(name, new Map())
    this.stats.set(name, {
      hits: 0,
      misses: 0,
      size: 0,
      oldestEntry: new Date(),
      newestEntry: new Date(),
      evictions: 0,
      avgAccessTime: 0
    })

    if (fullConfig.updateInterval) {
      const interval = setInterval(
        () => this.runBackgroundUpdate(name),
        fullConfig.updateInterval
      )
      this.updateIntervals.set(name, interval)
    }
  }

  async get<T>(
    cacheName: string,
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cache = this.caches.get(cacheName)
    if (!cache) {
      throw new Error(`Cache ${cacheName} not found`)
    }

    const stats = this.stats.get(cacheName)
    if (!stats) {
      throw new Error(`Stats for cache ${cacheName} not found`)
    }

    const startTime = Date.now()

    // Bypass cache if requested
    if (options.bypassCache) {
      const data = await fetcher()
      return data
    }

    // Check cache
    const entry = cache.get(key)
    const now = Date.now()

    // Cache hit
    if (entry && !options.forceFresh) {
      const config = this.getConfig(cacheName)
      
      // Entry is still fresh
      if (now < entry.expiresAt) {
        this.updateStats(stats, 'hit', startTime)
        this.updateEntry(cache, entry)
        return this.decompress(entry.data)
      }

      // Entry is stale but we can revalidate in background
      if (config.staleWhileRevalidate) {
        this.updateStats(stats, 'hit', startTime)
        this.revalidateInBackground(cacheName, key, fetcher)
        return this.decompress(entry.data)
      }
    }

    // Cache miss or forced fresh fetch
    this.updateStats(stats, 'miss', startTime)
    const data = await fetcher()
    await this.set(cacheName, key, data, options)
    return data
  }

  async set<T>(
    cacheName: string,
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const cache = this.caches.get(cacheName)
    if (!cache) {
      throw new Error(`Cache ${cacheName} not found`)
    }

    const config = this.getConfig(cacheName)
    const now = Date.now()

    // Compress data if enabled
    const compressedData = config.compression ? await this.compress(data) : data
    const size = this.calculateSize(compressedData)

    // Check cache size limit
    if (config.maxSize && cache.size >= config.maxSize) {
      this.evict(cacheName)
    }

    // Create cache entry
    const entry: CacheEntry<T> = {
      key,
      data: compressedData,
      timestamp: now,
      expiresAt: now + config.ttl,
      lastAccessed: now,
      accessCount: 0,
      size,
      priority: options.priority || config.priority || 'medium',
      isCompressed: config.compression || false
    }

    cache.set(key, entry)
    this.updateCacheStats(cacheName, entry)
  }

  async invalidate(cacheName: string, key: string): Promise<void> {
    const cache = this.caches.get(cacheName)
    if (!cache) {
      throw new Error(`Cache ${cacheName} not found`)
    }

    cache.delete(key)
  }

  async clear(cacheName: string): Promise<void> {
    const cache = this.caches.get(cacheName)
    if (!cache) {
      throw new Error(`Cache ${cacheName} not found`)
    }

    cache.clear()
    this.resetStats(cacheName)
  }

  getStats(cacheName: string): CacheStats {
    const stats = this.stats.get(cacheName)
    if (!stats) {
      throw new Error(`Stats for cache ${cacheName} not found`)
    }
    return { ...stats }
  }

  private getConfig(cacheName: string): CacheConfig {
    switch (cacheName) {
      case 'marketData':
        return {
          ttl: 15 * 60 * 1000,
          maxSize: 10000,
          updateInterval: 5 * 60 * 1000,
          staleWhileRevalidate: true,
          compression: true,
          priority: 'high'
        }
      case 'neighborhoodMetrics':
        return {
          ttl: 60 * 60 * 1000,
          maxSize: 5000,
          updateInterval: 30 * 60 * 1000,
          staleWhileRevalidate: true,
          compression: true,
          priority: 'medium'
        }
      case 'economicIndicators':
        return {
          ttl: 24 * 60 * 60 * 1000,
          maxSize: 1000,
          updateInterval: 12 * 60 * 60 * 1000,
          staleWhileRevalidate: true,
          compression: true,
          priority: 'low'
        }
      default:
        return this.DEFAULT_CONFIG
    }
  }

  private async runBackgroundUpdate(cacheName: string) {
    const cache = this.caches.get(cacheName)
    if (!cache) return

    const now = Date.now()
    const config = this.getConfig(cacheName)
    const updateInterval = config.updateInterval || this.DEFAULT_CONFIG.updateInterval
    const updateWindow = updateInterval / 2

    for (const entry of Array.from(cache.values())) {
      // Update entries that will expire soon
      if (entry.expiresAt - now < updateWindow) {
        try {
          // This would be replaced with actual data fetching logic
          const newData = await this.fetchUpdatedData(cacheName, entry.key)
          await this.set(cacheName, entry.key, newData, { priority: entry.priority })
        } catch (error) {
          console.error(`Failed to update cache entry ${entry.key} in ${cacheName}:`, error)
        }
      }
    }
  }

  private async fetchUpdatedData(cacheName: string, key: string): Promise<any> {
    // This would be replaced with actual data fetching logic
    // For now, return a placeholder
    return {
      timestamp: Date.now(),
      data: {}
    }
  }

  private async revalidateInBackground(
    cacheName: string,
    key: string,
    fetcher: () => Promise<any>
  ) {
    try {
      const data = await fetcher()
      await this.set(cacheName, key, data)
    } catch (error) {
      console.error(`Background revalidation failed for ${key} in ${cacheName}:`, error)
    }
  }

  private evict(cacheName: string) {
    const cache = this.caches.get(cacheName)
    if (!cache) return

    const stats = this.stats.get(cacheName)
    const config = this.getConfig(cacheName)
    const maxSize = config.maxSize || this.DEFAULT_CONFIG.maxSize || 1000

    // Sort entries by priority and last accessed time
    const entries = Array.from(cache.entries())
      .map(([key, entry]) => entry)
      .sort((a, b) => {
        // First sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff

        // Then by last accessed time
        return a.lastAccessed - b.lastAccessed
      })

    // Remove oldest entries until we're under maxSize
    let removed = 0
    while (cache.size > (maxSize * 0.9)) { // Remove until 90% full
      const entry = entries[removed]
      if (!entry) break // Safety check
      cache.delete(entry.key)
      removed++
    }

    if (stats) {
      stats.evictions += removed
    }
  }

  private updateEntry(cache: Map<string, CacheEntry<any>>, entry: CacheEntry<any>) {
    entry.lastAccessed = Date.now()
    entry.accessCount++
    cache.set(entry.key, entry)
  }

  private updateStats(stats: CacheStats, type: 'hit' | 'miss', startTime: number) {
    if (type === 'hit') {
      stats.hits++
    } else {
      stats.misses++
    }

    const accessTime = Date.now() - startTime
    stats.avgAccessTime = (stats.avgAccessTime * (stats.hits + stats.misses - 1) + accessTime) /
      (stats.hits + stats.misses)
  }

  private updateCacheStats(cacheName: string, entry: CacheEntry<any>) {
    const stats = this.stats.get(cacheName)
    if (!stats) return

    stats.size = this.caches.get(cacheName)?.size || 0
    stats.newestEntry = new Date(entry.timestamp)
    if (!stats.oldestEntry || entry.timestamp < stats.oldestEntry.getTime()) {
      stats.oldestEntry = new Date(entry.timestamp)
    }
  }

  private resetStats(cacheName: string) {
    this.stats.set(cacheName, {
      hits: 0,
      misses: 0,
      size: 0,
      oldestEntry: new Date(),
      newestEntry: new Date(),
      evictions: 0,
      avgAccessTime: 0
    })
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length
  }

  private ensureCacheDirectory() {
    if (!fs.existsSync(this.CACHE_DIR)) {
      fs.mkdirSync(this.CACHE_DIR, { recursive: true })
    }
  }

  private getCacheFilePath(cacheName: string): string {
    return path.join(this.CACHE_DIR, `${cacheName}.cache`)
  }

  private async loadPersistedCaches() {
    const cacheNames = Array.from(this.caches.keys())
    for (const cacheName of cacheNames) {
      try {
        const filePath = this.getCacheFilePath(cacheName)
        if (fs.existsSync(filePath)) {
          const compressedData = await fs.promises.readFile(filePath)
          const data = await gunzip(compressedData)
          const persistedCache = JSON.parse(data.toString()) as Record<string, CacheEntry<any>>
          
          // Only load non-expired entries
          const now = Date.now()
          const cache = this.caches.get(cacheName)
          if (cache) {
            Object.entries(persistedCache).forEach(([key, entry]) => {
              if (entry.expiresAt > now) {
                cache.set(key, entry)
              }
            })
          }
        }
      } catch (error) {
        console.error(`Failed to load persisted cache for ${cacheName}:`, error)
      }
    }
  }

  private startPeriodicPersistence() {
    // Persist caches every 5 minutes
    setInterval(() => this.persistCaches(), 5 * 60 * 1000)
  }

  private async persistCaches() {
    const cacheEntries = Array.from(this.caches.entries())
    for (const [cacheName, cache] of cacheEntries) {
      try {
        const config = this.getConfig(cacheName)
        if (config.persistToDisk) {
          const filePath = this.getCacheFilePath(cacheName)
          const data = JSON.stringify(Object.fromEntries(cache))
          const compressedData = await gzip(data)
          await fs.promises.writeFile(filePath, compressedData)
        }
      } catch (error) {
        console.error(`Failed to persist cache ${cacheName}:`, error)
      }
    }
  }

  private async compress(data: any): Promise<Buffer> {
    try {
      const jsonStr = JSON.stringify(data)
      return await gzip(jsonStr)
    } catch (error) {
      console.error('Compression failed:', error)
      return Buffer.from(JSON.stringify(data))
    }
  }

  private async decompress<T>(data: Buffer): Promise<T> {
    try {
      const decompressed = await gunzip(data)
      const parsed = JSON.parse(decompressed.toString()) as T
      return parsed
    } catch (error) {
      console.error('Decompression failed:', error)
      throw error
    }
  }

  async warmCache(cacheName: string, keys: string[], fetcher: (key: string) => Promise<any>) {
    const cache = this.caches.get(cacheName)
    if (!cache) return

    const config = this.getConfig(cacheName)
    const strategy = config.warmupStrategy || 'lazy'
    const DEFAULT_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutes
    const updateInterval = Math.max(
      config.updateInterval || this.DEFAULT_CONFIG.updateInterval || DEFAULT_UPDATE_INTERVAL,
      1000 // Minimum 1 second
    )

    if (strategy === 'eager') {
      // Warm all keys immediately
      await Promise.all(
        keys.map(async (key) => {
          try {
            const data = await fetcher(key)
            await this.set(cacheName, key, data)
          } catch (error) {
            console.error(`Failed to warm cache for key ${key}:`, error)
          }
        })
      )
    } else {
      // Lazy warming - spread out the warming over time
      const warmingInterval = Math.max(Math.floor(updateInterval / keys.length), 1000) // Minimum 1 second interval
      keys.forEach((key, index) => {
        setTimeout(async () => {
          try {
            const data = await fetcher(key)
            await this.set(cacheName, key, data)
          } catch (error) {
            console.error(`Failed to warm cache for key ${key}:`, error)
          }
        }, warmingInterval * index)
      })
    }
  }

  getAnalytics(cacheName: string) {
    const cache = this.caches.get(cacheName)
    const stats = this.stats.get(cacheName)
    if (!cache || !stats) return null

    const now = Date.now()
    const entries = Array.from(cache.values())

    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
    const expiringWithin = {
      '1min': entries.filter(e => e.expiresAt - now < 60 * 1000).length,
      '5min': entries.filter(e => e.expiresAt - now < 5 * 60 * 1000).length,
      '15min': entries.filter(e => e.expiresAt - now < 15 * 60 * 1000).length
    }
    const priorityDistribution = {
      high: entries.filter(e => e.priority === 'high').length,
      medium: entries.filter(e => e.priority === 'medium').length,
      low: entries.filter(e => e.priority === 'low').length
    }
    const hitRate = stats.hits / (stats.hits + stats.misses) * 100

    return {
      ...stats,
      memoryUsage: totalSize,
      expiringWithin,
      priorityDistribution,
      hitRate
    }
  }

  // Cleanup on service destruction
  destroy() {
    void this.persistCaches() // Persist caches before destruction
    Array.from(this.updateIntervals.values()).forEach(interval => {
      clearInterval(interval)
    })
    this.updateIntervals.clear()
    this.caches.clear()
    this.stats.clear()
  }
} 