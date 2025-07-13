import { PropertyFeatures } from '../ai/models/PropertyData'

interface SearchResult {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  lat: number
  lng: number
  price: number
  squareFootage: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  yearBuilt: number
  walkScore?: number
  transitScore?: number
  bikeScore?: number
}

interface LocationData {
  name: string
  lat: number
  lng: number
  type: 'neighborhood' | 'city' | 'zipcode' | 'address'
}

export class SearchService {
  private static instance: SearchService
  private locationDatabase: LocationData[] = []

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  constructor() {
    this.initializeLocationDatabase()
  }

  // Initialize with real SF Bay Area locations
  private initializeLocationDatabase() {
    this.locationDatabase = [
      // San Francisco Neighborhoods
      { name: 'Mission Bay', lat: 37.7706, lng: -122.3893, type: 'neighborhood' },
      { name: 'SOMA', lat: 37.7749, lng: -122.4194, type: 'neighborhood' },
      { name: 'Castro', lat: 37.7609, lng: -122.4350, type: 'neighborhood' },
      { name: 'Mission District', lat: 37.7599, lng: -122.4148, type: 'neighborhood' },
      { name: 'Pacific Heights', lat: 37.7936, lng: -122.4286, type: 'neighborhood' },
      { name: 'Marina District', lat: 37.8021, lng: -122.4416, type: 'neighborhood' },
      { name: 'Nob Hill', lat: 37.7946, lng: -122.4094, type: 'neighborhood' },
      { name: 'Richmond District', lat: 37.7806, lng: -122.4644, type: 'neighborhood' },
      { name: 'Sunset District', lat: 37.7431, lng: -122.4660, type: 'neighborhood' },
      { name: 'Potrero Hill', lat: 37.7576, lng: -122.4013, type: 'neighborhood' },
      { name: 'Hayes Valley', lat: 37.7749, lng: -122.4244, type: 'neighborhood' },
      { name: 'Chinatown', lat: 37.7941, lng: -122.4078, type: 'neighborhood' },
      { name: 'Financial District', lat: 37.7946, lng: -122.4014, type: 'neighborhood' },
      
      // Cities
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194, type: 'city' },
      { name: 'Oakland', lat: 37.8044, lng: -122.2712, type: 'city' },
      { name: 'Berkeley', lat: 37.8715, lng: -122.2730, type: 'city' },
      { name: 'Palo Alto', lat: 37.4419, lng: -122.1430, type: 'city' },
      { name: 'San Jose', lat: 37.3382, lng: -121.8863, type: 'city' },
      { name: 'Mountain View', lat: 37.3861, lng: -122.0839, type: 'city' },
      { name: 'Sunnyvale', lat: 37.3688, lng: -122.0363, type: 'city' },
      { name: 'Fremont', lat: 37.5485, lng: -121.9886, type: 'city' },
      { name: 'San Mateo', lat: 37.5630, lng: -122.3255, type: 'city' },
      { name: 'Redwood City', lat: 37.4852, lng: -122.2364, type: 'city' },
      
      // ZIP codes (sample)
      { name: '94102', lat: 37.7749, lng: -122.4194, type: 'zipcode' },
      { name: '94110', lat: 37.7599, lng: -122.4148, type: 'zipcode' },
      { name: '94114', lat: 37.7609, lng: -122.4350, type: 'zipcode' },
      { name: '94123', lat: 37.8021, lng: -122.4416, type: 'zipcode' },
      { name: '94107', lat: 37.7706, lng: -122.3893, type: 'zipcode' }
    ]
  }

  // Search for locations based on query
  async searchLocations(query: string, limit: number = 10): Promise<LocationData[]> {
    if (!query || query.length < 2) {
      return []
    }

    const normalizedQuery = query.toLowerCase().trim()
    
    // Search through location database
    const results = this.locationDatabase.filter(location => 
      location.name.toLowerCase().includes(normalizedQuery)
    )

    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === normalizedQuery
      const bExact = b.name.toLowerCase() === normalizedQuery
      const aStarts = a.name.toLowerCase().startsWith(normalizedQuery)
      const bStarts = b.name.toLowerCase().startsWith(normalizedQuery)

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      return a.name.localeCompare(b.name)
    })

    return results.slice(0, limit)
  }

  // Search for properties in a specific location
  async searchProperties(location: LocationData, filters?: {
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    propertyType?: string
  }): Promise<SearchResult[]> {
    
    // Generate realistic properties for the location
    const properties: SearchResult[] = []
    const numProperties = Math.floor(Math.random() * 20) + 10 // 10-30 properties
    
    for (let i = 0; i < numProperties; i++) {
      const property = this.generatePropertyForLocation(location, i)
      
      // Apply filters if provided
      if (filters) {
        if (filters.minPrice && property.price < filters.minPrice) continue
        if (filters.maxPrice && property.price > filters.maxPrice) continue
        if (filters.bedrooms && property.bedrooms !== filters.bedrooms) continue
        if (filters.propertyType && property.propertyType !== filters.propertyType) continue
      }
      
      properties.push(property)
    }

    return properties
  }

  // Generate a realistic property for a given location
  private generatePropertyForLocation(location: LocationData, index: number): SearchResult {
    // Adjust prices based on location
    const locationPremiums: { [key: string]: number } = {
      'Pacific Heights': 2.0,
      'Marina District': 1.6,
      'Nob Hill': 1.7,
      'Mission Bay': 1.4,
      'SOMA': 1.3,
      'Castro': 1.2,
      'Hayes Valley': 1.3,
      'Financial District': 1.4,
      'Mission District': 1.0,
      'Potrero Hill': 1.1,
      'Richmond District': 0.9,
      'Sunset District': 0.85,
      'Palo Alto': 2.2,
      'Mountain View': 1.8,
      'San Jose': 1.2,
      'Oakland': 0.8,
      'Berkeley': 1.1
    }

    const premium = locationPremiums[location.name] || 1.0
    const propertyTypes = ['Condo', 'House', 'Townhouse', 'Duplex']
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
    
    const basePrices: { [key: string]: number } = {
      'Condo': 800000,
      'House': 1400000,
      'Townhouse': 1100000,
      'Duplex': 1600000
    }

    const basePrice = basePrices[propertyType]
    const price = Math.floor(basePrice * premium * (0.7 + Math.random() * 0.6))
    
    const squareFootage = propertyType === 'Condo' 
      ? Math.floor(600 + Math.random() * 1200)
      : Math.floor(1000 + Math.random() * 2500)
    
    const bedrooms = Math.floor(1 + Math.random() * 4)
    const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75 + Math.random()))
    
    // Add small random offset to coordinates
    const lat = location.lat + (Math.random() - 0.5) * 0.01
    const lng = location.lng + (Math.random() - 0.5) * 0.01

    // Generate realistic street addresses
    const streetNames = ['Mission', 'Market', 'Valencia', 'Castro', 'Fillmore', 'Divisadero', 'Hayes', 'Grove', 'Oak', 'Pine', 'Bush', 'Geary']
    const streetNumber = Math.floor(Math.random() * 9999) + 1
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)]
    const address = `${streetNumber} ${streetName} St`

    return {
      id: `prop_${location.name.replace(/\s+/g, '_')}_${index}`,
      address,
      city: location.type === 'city' ? location.name : 'San Francisco',
      state: 'CA',
      zipCode: this.generateZipCode(location),
      lat,
      lng,
      price,
      squareFootage,
      bedrooms,
      bathrooms,
      propertyType: propertyType.toLowerCase().replace(' ', '_'),
      yearBuilt: Math.floor(1960 + Math.random() * 60),
      walkScore: this.calculateWalkScore(location),
      transitScore: this.calculateTransitScore(location),
      bikeScore: this.calculateBikeScore(location)
    }
  }

  private generateZipCode(location: LocationData): string {
    const zipCodes: { [key: string]: string } = {
      'Mission Bay': '94107',
      'SOMA': '94105',
      'Castro': '94114',
      'Mission District': '94110',
      'Pacific Heights': '94115',
      'Marina District': '94123',
      'Nob Hill': '94108',
      'Richmond District': '94118',
      'Sunset District': '94122',
      'Financial District': '94104'
    }

    return zipCodes[location.name] || '94102'
  }

  private calculateWalkScore(location: LocationData): number {
    const walkScores: { [key: string]: number } = {
      'Financial District': 95,
      'SOMA': 92,
      'Mission District': 90,
      'Castro': 88,
      'Hayes Valley': 85,
      'Nob Hill': 82,
      'Marina District': 78,
      'Mission Bay': 75,
      'Pacific Heights': 72,
      'Richmond District': 65,
      'Sunset District': 60
    }

    const baseScore = walkScores[location.name] || 70
    return Math.max(50, Math.min(100, baseScore + (Math.random() - 0.5) * 10))
  }

  private calculateTransitScore(location: LocationData): number {
    const transitScores: { [key: string]: number } = {
      'Financial District': 90,
      'SOMA': 85,
      'Mission District': 80,
      'Castro': 75,
      'Nob Hill': 70,
      'Mission Bay': 68,
      'Hayes Valley': 65,
      'Marina District': 60,
      'Pacific Heights': 55,
      'Richmond District': 50,
      'Sunset District': 45
    }

    const baseScore = transitScores[location.name] || 60
    return Math.max(30, Math.min(100, baseScore + (Math.random() - 0.5) * 15))
  }

  private calculateBikeScore(location: LocationData): number {
    const bikeScores: { [key: string]: number } = {
      'Mission District': 85,
      'Castro': 80,
      'SOMA': 78,
      'Hayes Valley': 75,
      'Mission Bay': 70,
      'Financial District': 65,
      'Marina District': 60,
      'Nob Hill': 55,
      'Pacific Heights': 50,
      'Richmond District': 45,
      'Sunset District': 40
    }

    const baseScore = bikeScores[location.name] || 60
    return Math.max(30, Math.min(100, baseScore + (Math.random() - 0.5) * 20))
  }

  // Get suggestions for autocomplete
  async getSuggestions(query: string): Promise<string[]> {
    const locations = await this.searchLocations(query, 5)
    return locations.map(location => {
      switch (location.type) {
        case 'neighborhood':
          return `${location.name}, San Francisco, CA`
        case 'city':
          return `${location.name}, CA`
        case 'zipcode':
          return `${location.name}, San Francisco, CA`
        default:
          return location.name
      }
    })
  }
} 