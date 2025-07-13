// Property types
export interface Property {
  id: number
  address: string
  lat: number
  lng: number
  price: number
  appreciation: number
  riskScore: 'Low' | 'Medium' | 'High'
  type: 'Condo' | 'House' | 'Townhouse'
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  yearBuilt?: number
}

// Prediction types
export interface Prediction {
  period: string
  appreciation: number
  confidence: number
  factors: string[]
}

export interface PredictionData {
  location: string
  timeframe: string
  predictions: Prediction[]
  rentalYield: {
    currentYield: number
    projectedYield: number
    cashFlow: {
      monthly: number
      annual: number
    }
  }
  riskFactors: {
    market: string
    climate: string
    liquidity: string
  }
}

// Climate risk types
export interface ClimateRisk {
  level: 'Low' | 'Medium' | 'High'
  probability: number
  description: string
  factors: string[]
}

export interface ClimateData {
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  overallRisk: 'Low' | 'Medium' | 'High'
  risks: {
    flood: ClimateRisk
    fire: ClimateRisk
    heat: ClimateRisk
    earthquake: ClimateRisk
    seaLevel: ClimateRisk
  }
  projections: {
    [year: string]: {
      overallRisk: string
      temperature: string
      seaLevel: string
      precipitation: string
    }
  }
  recommendations: string[]
  lastUpdated: string
}

// Search types
export interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  timeframe?: string
}

export interface SearchResult {
  location: string
  filters: SearchFilters
  properties: Property[]
  total: number
  avgAppreciation: number
  timestamp: string
}

// User types
export interface User {
  id: string
  name?: string
  email?: string
  image?: string
  createdAt: string
  updatedAt: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Map types
export interface MapLayer {
  id: string
  name: string
  type: 'heatmap' | 'markers' | 'polygons'
  visible: boolean
  data?: any
}

export interface MapViewport {
  latitude: number
  longitude: number
  zoom: number
  bearing?: number
  pitch?: number
} 