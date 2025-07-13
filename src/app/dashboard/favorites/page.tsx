'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Search, Trash2, Star, MapPin, TrendingUp, Eye, Plus, X, Loader2, Home } from 'lucide-react'

interface SavedProperty {
  id: string
  address: string
  city: string
  state: string
  coordinates: {
    lat: number
    lng: number
  }
  price: number
  appreciation: number
  type: string
  bedrooms: number
  bathrooms: number
  sqft: number
  dateAdded: string
  notes?: string
}

interface SavedSearch {
  id: string
  name: string
  criteria: {
    location: string
    priceRange: { min: number; max: number }
    propertyType: string
    minBedrooms: number
    maxBedrooms: number
    minYield: number
    maxRisk: string
  }
  results: number
  lastUpdated: string
  alerts: boolean
}

interface AddLocationState {
  isOpen: boolean
  isLoading: boolean
  address: string
  notes: string
  error: string | null
}

// Simple address parser to extract city and state
const parseAddress = (address: string): { city: string; state: string; isValid: boolean } => {
  try {
    // Remove extra spaces and normalize
    const normalized = address.trim().replace(/\s+/g, ' ')
    
    // Split by comma
    const parts = normalized.split(',').map(part => part.trim())
    
    if (parts.length < 2) {
      return { city: 'Unknown', state: 'Unknown', isValid: false }
    }
    
    // Last part should contain state (and possibly ZIP)
    const lastPart = parts[parts.length - 1]
    const stateMatch = lastPart.match(/\b([A-Z]{2})\b/)
    
    if (!stateMatch) {
      return { city: 'Unknown', state: 'Unknown', isValid: false }
    }
    
    const state = stateMatch[1]
    const city = parts[parts.length - 2] || 'Unknown'
    
    return { city, state, isValid: true }
  } catch (error) {
    return { city: 'Unknown', state: 'Unknown', isValid: false }
  }
}

// Generate coordinates based on city (approximate)
const getCityCoordinates = (city: string, state: string): { lat: number; lng: number } => {
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Philadelphia': { lat: 39.9526, lng: -75.1652 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
    'Dallas': { lat: 32.7767, lng: -96.7970 },
    'Austin': { lat: 30.2672, lng: -97.7431 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'Miami': { lat: 25.7617, lng: -80.1918 },
    'Washington': { lat: 38.9072, lng: -77.0369 },
    'Nashville': { lat: 36.1627, lng: -86.7816 },
    'Charlotte': { lat: 35.2271, lng: -80.8431 },
    'Portland': { lat: 45.5152, lng: -122.6784 },
    'Atlanta': { lat: 33.7490, lng: -84.3880 }
  }
  
  const coords = cityCoords[city] || { lat: 39.8283, lng: -98.5795 } // Center of US as fallback
  
  // Add slight random variation for specific address
  const variation = 0.01 // About 1km
  return {
    lat: coords.lat + (Math.random() - 0.5) * variation,
    lng: coords.lng + (Math.random() - 0.5) * variation
  }
}

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('properties')
  const [favoriteProperties, setFavoriteProperties] = useState<SavedProperty[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [addLocationState, setAddLocationState] = useState<AddLocationState>({
    isOpen: false,
    isLoading: false,
    address: '',
    notes: '',
    error: null
  })

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteProperties')
    if (savedFavorites) {
      setFavoriteProperties(JSON.parse(savedFavorites))
    }

    const savedSearchesData = localStorage.getItem('savedSearches')
    if (savedSearchesData) {
      setSavedSearches(JSON.parse(savedSearchesData))
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favoriteProperties', JSON.stringify(favoriteProperties))
  }, [favoriteProperties])

  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches))
  }, [savedSearches])

  const generatePropertyDetails = (address: string, coordinates: { lat: number; lng: number }) => {
    // Generate realistic property details based on coordinates
    const seed = Math.abs(coordinates.lat * coordinates.lng * 1000000) % 10000
    
    const cityPrices: { [key: string]: number } = {
      'San Francisco': 1200000, 'New York': 1200000, 'Los Angeles': 800000,
      'Austin': 485000, 'Miami': 625000, 'Denver': 565000, 'Seattle': 785000,
      'Boston': 785000, 'Dallas': 425000, 'Houston': 385000, 'Chicago': 385000,
      'Phoenix': 485000, 'Nashville': 465000, 'Portland': 585000, 'Atlanta': 425000
    }

    const cityName = address.split(',')[1]?.trim() || 'Unknown'
    const basePrice = cityPrices[cityName] || 350000
    const priceVariation = ((seed % 400) / 400 - 0.5) * 0.4
    const price = Math.round(basePrice * (1 + priceVariation))
    
    const growthVariation = ((seed % 300) / 300 - 0.5) * 0.3
    const baseGrowth = cityName === 'Austin' ? 18.5 : cityName === 'Miami' ? 15.2 : 12.0
    const appreciation = Math.max(2, Math.round(baseGrowth * (1 + growthVariation) * 10) / 10)
    
    return {
      price,
      appreciation,
      type: ['House', 'Condo', 'Townhouse', 'Duplex'][seed % 4],
      bedrooms: Math.max(1, Math.floor((seed % 5) + 2)),
      bathrooms: Math.max(1, Math.floor((seed % 4) + 1)),
      sqft: Math.round(1200 + (seed % 1500))
    }
  }

  const handleAddLocation = async () => {
    if (!addLocationState.address.trim()) {
      setAddLocationState(prev => ({
        ...prev,
        error: 'Please enter a property address'
      }))
      return
    }

    setAddLocationState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      // Parse and validate address
      const { city, state, isValid } = parseAddress(addLocationState.address)
      
      if (!isValid) {
        throw new Error('Please enter a complete address with city and state (e.g., "123 Main St, Austin, TX")')
      }

      // Generate coordinates for the city
      const coordinates = getCityCoordinates(city, state)

      // Generate property details
      const propertyDetails = generatePropertyDetails(addLocationState.address, coordinates)

      // Create new property
      const newProperty: SavedProperty = {
        id: Date.now().toString(),
        address: addLocationState.address,
        city,
        state,
        coordinates,
        ...propertyDetails,
        dateAdded: new Date().toISOString(),
        notes: addLocationState.notes || undefined
      }

      // Add to favorites
      setFavoriteProperties(prev => [newProperty, ...prev])

      // Reset form
      setAddLocationState({
        isOpen: false,
        isLoading: false,
        address: '',
        notes: '',
        error: null
      })

    } catch (error) {
      setAddLocationState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add location'
      }))
    }
  }

  const handleRemoveProperty = (id: string) => {
    setFavoriteProperties(prev => prev.filter(prop => prop.id !== id))
  }

  const handleRemoveSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id))
  }

  const handleToggleAlerts = (id: string) => {
    setSavedSearches(prev => prev.map(search => 
      search.id === id ? { ...search, alerts: !search.alerts } : search
    ))
  }

  const handleNewSearch = () => {
    // For now, create a sample search
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: 'New Search',
      criteria: {
        location: 'Austin, TX',
        priceRange: { min: 300000, max: 600000 },
        propertyType: 'All',
        minBedrooms: 2,
        maxBedrooms: 4,
        minYield: 8,
        maxRisk: 'Medium'
      },
      results: Math.floor(Math.random() * 50) + 10,
      lastUpdated: new Date().toISOString(),
      alerts: false
    }
    setSavedSearches(prev => [newSearch, ...prev])
  }

  const handleViewAllFavorites = () => {
    setActiveTab('properties')
  }

  const handleMarketAlerts = () => {
    // Create a sample alert search
    const alertSearch: SavedSearch = {
      id: Date.now().toString(),
      name: 'Market Alert',
      criteria: {
        location: 'Multiple Cities',
        priceRange: { min: 0, max: 1000000 },
        propertyType: 'All',
        minBedrooms: 1,
        maxBedrooms: 6,
        minYield: 10,
        maxRisk: 'Low'
      },
      results: Math.floor(Math.random() * 25) + 5,
      lastUpdated: new Date().toISOString(),
      alerts: true
    }
    setSavedSearches(prev => [alertSearch, ...prev])
    setActiveTab('searches')
  }

  const handleExploreAreas = () => {
    // Navigate to map page
    window.location.href = '/dashboard/map'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Favorites</h1>
        <p className="text-gray-600">Manage your saved properties and searches</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'properties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Favorite Properties ({favoriteProperties.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('searches')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'searches'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Saved Searches ({savedSearches.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Favorite Properties ({favoriteProperties.length})
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAddLocationState(prev => ({ ...prev, isOpen: true }))}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Location</span>
              </button>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Sort by Date Added</option>
                <option>Sort by Price</option>
                <option>Sort by Appreciation</option>
                <option>Sort by City</option>
              </select>
            </div>
          </div>

          {favoriteProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorite Properties</h3>
              <p className="text-gray-600 mb-4">Start building your portfolio by adding properties you're interested in.</p>
              <button
                onClick={() => setAddLocationState(prev => ({ ...prev, isOpen: true }))}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Property</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center">
                        <Home className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-600">{property.type}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <button 
                        onClick={() => handleRemoveProperty(property.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                        {property.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        ${property.price.toLocaleString()}
                      </h3>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+{property.appreciation}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                    {property.notes && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {property.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Added {new Date(property.dateAdded).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Searches Tab */}
      {activeTab === 'searches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Saved Searches ({savedSearches.length})
            </h2>
            <button 
              onClick={handleNewSearch}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Search</span>
            </button>
          </div>

          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Searches</h3>
              <p className="text-gray-600 mb-4">Save your search criteria to get notified of new properties.</p>
              <button
                onClick={handleNewSearch}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Search</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div key={search.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{search.name}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleAlerts(search.id)}
                            className={`px-2 py-1 text-xs rounded-full ${
                              search.alerts 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {search.alerts ? 'Alerts On' : 'Alerts Off'}
                          </button>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {search.results} results
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Location: {search.criteria.location}</p>
                        <p>Price: ${search.criteria.priceRange.min.toLocaleString()} - ${search.criteria.priceRange.max.toLocaleString()}</p>
                        <p>Type: {search.criteria.propertyType} • {search.criteria.minBedrooms}-{search.criteria.maxBedrooms} bedrooms</p>
                        <p>Min Yield: {search.criteria.minYield}% • Max Risk: {search.criteria.maxRisk}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(search.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        View Results
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemoveSearch(search.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button 
            onClick={handleNewSearch}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Search className="h-6 w-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">New Search</p>
            <p className="text-sm text-gray-600">Create a property search</p>
          </button>
          <button 
            onClick={handleViewAllFavorites}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Heart className="h-6 w-6 text-red-600 mb-2" />
            <p className="font-medium text-gray-900">View All Favorites</p>
            <p className="text-sm text-gray-600">See all saved properties</p>
          </button>
          <button 
            onClick={handleMarketAlerts}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Market Alerts</p>
            <p className="text-sm text-gray-600">Set up price alerts</p>
          </button>
          <button 
            onClick={handleExploreAreas}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <MapPin className="h-6 w-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Explore Areas</p>
            <p className="text-sm text-gray-600">Find new neighborhoods</p>
          </button>
        </div>
      </div>

      {/* Add Location Modal */}
      {addLocationState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Property Location</h3>
              <button
                onClick={() => setAddLocationState(prev => ({ ...prev, isOpen: false }))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Address
                </label>
                <input
                  type="text"
                  value={addLocationState.address}
                  onChange={(e) => setAddLocationState(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street, Austin, TX 78701"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={addLocationState.notes}
                  onChange={(e) => setAddLocationState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this property..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {addLocationState.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{addLocationState.error}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setAddLocationState(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLocation}
                  disabled={addLocationState.isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {addLocationState.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add Property</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 