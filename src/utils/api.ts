import { PredictionData, SearchResult, ClimateData, Property } from '@/types'

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : '/api'

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Prediction API calls
export const predictionApi = {
  getPredictions: async (location: string, timeframe: string = '12'): Promise<PredictionData> => {
    return apiCall<PredictionData>(`/predictions?location=${encodeURIComponent(location)}&timeframe=${timeframe}`)
  },

  analyzePrediction: async (location: string, parameters: any): Promise<any> => {
    return apiCall<any>('/predictions', {
      method: 'POST',
      body: JSON.stringify({ location, parameters }),
    })
  },
}

// Search API calls
export const searchApi = {
  getLocationSuggestions: async (query: string): Promise<{ suggestions: string[] }> => {
    return apiCall<{ suggestions: string[] }>(`/search?q=${encodeURIComponent(query)}&type=suggestions`)
  },

  getProperties: async (): Promise<{ properties: Property[] }> => {
    return apiCall<{ properties: Property[] }>('/search?type=properties')
  },

  searchProperties: async (location: string, filters: any): Promise<SearchResult> => {
    return apiCall<SearchResult>('/search', {
      method: 'POST',
      body: JSON.stringify({ location, filters }),
    })
  },
}

// Climate API calls
export const climateApi = {
  getClimateData: async (location: string, lat?: number, lng?: number): Promise<ClimateData> => {
    const params = new URLSearchParams({ location })
    if (lat !== undefined) params.append('lat', lat.toString())
    if (lng !== undefined) params.append('lng', lng.toString())
    
    return apiCall<ClimateData>(`/climate?${params.toString()}`)
  },

  analyzeMultipleLocations: async (locations: Array<{ address: string; lat: number; lng: number }>): Promise<any> => {
    return apiCall<any>('/climate', {
      method: 'POST',
      body: JSON.stringify({ locations }),
    })
  },
}

// Error handling utilities
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Loading states for React components
export const createLoadingState = () => ({
  loading: false,
  error: null as string | null,
  data: null as any,
})

// Utility for handling async operations in components
export const withAsyncHandler = <T>(
  asyncFn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
) => {
  return async () => {
    try {
      const result = await asyncFn()
      onSuccess?.(result)
      return result
    } catch (error) {
      const errorMessage = handleApiError(error)
      onError?.(errorMessage)
      throw error
    }
  }
} 