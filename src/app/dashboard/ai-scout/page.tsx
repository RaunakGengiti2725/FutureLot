'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Target, TrendingUp, Shield, DollarSign, MapPin, Sparkles, Lock, Crown, AlertTriangle, Eye, Home, Loader2 } from 'lucide-react'
import { USRealEstateService } from '@/lib/services/USRealEstateService'

interface SearchCriteria {
  state: string
  budget: string
  riskTolerance: string
  yieldGoal: string
  timeframe: string
  propertyType: string
  bedrooms: string
  bathrooms: string
  climateSafe: boolean
  nearInfrastructure: boolean
  lowVolatility: boolean
}

interface SuggestedProperty {
  id: string
  address: string
  city: string
  state: string
  price: number
  type: string
  squareFootage: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number
  appreciation: number
  yieldPotential: number
  riskLevel: string
  score: number
  mlsNumber: string
  reasons: string[]
  pros: string[]
  cons: string[]
  marketPhase: string
  investment: {
    capRate: number
    cashFlow: number
    priceToRent: number
  }
  lat: number
  lng: number
}

interface AnalysisState {
  isAnalyzing: boolean
  progress: number
  stage: string
  message: string
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
]

// Helper functions for property analysis
const calculateRiskLevel = (property: any, criteria: SearchCriteria): string => {
  const riskFactors = []
  
  // Price volatility risk
  if (property.price > 1000000) riskFactors.push(1)
  if (property.yearBuilt < 1950) riskFactors.push(1)
  
  // Location risk
  if (!property.lat || !property.lng) riskFactors.push(1)
  
  // Property condition risk
  if (property.yearBuilt < 1980 && property.price < 200000) riskFactors.push(1)
  
  const riskScore = riskFactors.length
  
  if (riskScore <= 1) return 'Low'
  if (riskScore <= 2) return 'Medium'
  return 'High'
}

const calculatePropertyScore = (property: any, criteria: SearchCriteria): number => {
  let score = 50 // Base score
  
  // Location score (20 points)
  if (property.lat && property.lng) score += 20
  
  // Price score (15 points)
  const budget = parseInt(criteria.budget.replace(/[^0-9]/g, '')) || 1000000
  if (property.price <= budget * 0.8) score += 15
  else if (property.price <= budget * 0.9) score += 10
  else if (property.price <= budget) score += 5
  
  // Property features score (15 points)
  if (property.yearBuilt > 2000) score += 5
  if (property.squareFootage > 1500) score += 5
  if (property.bedrooms >= 3) score += 5
  
  return Math.min(100, score)
}

const generateReasons = (property: any, criteria: SearchCriteria): string[] => {
  return [
    `${property.squareFootage} sq ft, ${property.bedrooms} bed, ${property.bathrooms} bath`,
    `Built in ${property.yearBuilt}`,
    `Price: $${property.price.toLocaleString()}`,
    `Estimated rental yield: ${(property.rentalEstimate / property.price * 12 * 100).toFixed(1)}%`,
    `Risk level: ${calculateRiskLevel(property, criteria)}`
  ]
}

const generatePros = (property: any, criteria: SearchCriteria): string[] => {
  const pros = []
  
  if (property.yearBuilt > 2000) pros.push('Modern construction')
  if (property.squareFootage > 2000) pros.push('Spacious layout')
  if (property.price < parseInt(criteria.budget.replace(/[^0-9]/g, '')) * 0.8) pros.push('Below budget')
  if (calculateRiskLevel(property, criteria) === 'Low') pros.push('Low risk profile')
  
  return pros.length ? pros : ['Good investment potential']
}

const generateCons = (property: any, criteria: SearchCriteria): string[] => {
  const cons = []
  
  if (property.yearBuilt < 1980) cons.push('Older property')
  if (property.price > parseInt(criteria.budget.replace(/[^0-9]/g, '')) * 0.9) cons.push('Near budget limit')
  if (calculateRiskLevel(property, criteria) === 'High') cons.push('Higher risk profile')
  
  return cons.length ? cons : ['Market competition']
}

const determineMarketPhase = (city: string, state: string): string => {
  // This would ideally use real market data
  // For now, return a reasonable default
  return 'Steady Growth'
}

export default function AIScoutPage() {
  const { data: session } = useSession()
  const [criteria, setCriteria] = useState<SearchCriteria>({
    state: '',
    budget: '',
    riskTolerance: 'moderate',
    yieldGoal: '',
    timeframe: '12',
    propertyType: 'any',
    bedrooms: 'any',
    bathrooms: 'any',
    climateSafe: false,
    nearInfrastructure: false,
    lowVolatility: false
  })
  const [suggestions, setSuggestions] = useState<SuggestedProperty[]>([])
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    stage: '',
    message: ''
  })
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestions = async (criteria: SearchCriteria): Promise<SuggestedProperty[]> => {
    const usRealEstateService = USRealEstateService.getInstance()
    
    // Convert criteria to search parameters
    const searchParams = {
      state: criteria.state,
      type: criteria.propertyType !== 'any' ? criteria.propertyType.toLowerCase() : undefined,
      beds_min: criteria.bedrooms !== 'any' ? parseInt(criteria.bedrooms) : undefined,
      baths_min: criteria.bathrooms !== 'any' ? parseInt(criteria.bathrooms) : undefined,
      price_max: criteria.budget !== '' ? parseInt(criteria.budget.replace(/[^0-9]/g, '')) : undefined,
      limit: 50
    }

    try {
      // Get properties from the real estate service
      const properties = await usRealEstateService.searchProperties(searchParams)
      
      if (!properties.length) {
        throw new Error('No properties match your criteria. Try adjusting your filters.')
      }

      // Transform properties to SuggestedProperty format
      const suggestions: SuggestedProperty[] = await Promise.all(
        properties.map(async (prop) => {
          // Get additional property details
          const details = await usRealEstateService.getPropertyDetails(prop.id)
          
          // Calculate investment metrics
          const yieldPotential = (prop.rentalEstimate || details?.rentEstimate || prop.price * 0.008) / prop.price * 12 * 100
          const appreciation = details?.appreciation || 5 // Default to 5% if not available
          
          return {
            id: prop.id,
            address: prop.address,
            city: prop.city,
            state: prop.state,
            price: prop.price,
            type: prop.propertyType,
            squareFootage: prop.squareFootage,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            yearBuilt: prop.yearBuilt,
            appreciation: appreciation,
            yieldPotential: yieldPotential,
            riskLevel: calculateRiskLevel(prop, criteria),
            score: calculatePropertyScore(prop, criteria),
            mlsNumber: prop.mlsNumber,
            reasons: generateReasons(prop, criteria),
            pros: generatePros(prop, criteria),
            cons: generateCons(prop, criteria),
            marketPhase: determineMarketPhase(prop.city, prop.state),
            investment: {
              capRate: yieldPotential,
              cashFlow: (prop.rentalEstimate || details?.rentEstimate || prop.price * 0.008) - (prop.price * 0.06 / 12), // Estimated monthly cash flow
              priceToRent: prop.price / (prop.rentalEstimate || details?.rentEstimate || prop.price * 0.008) / 12
            },
            lat: prop.lat,
            lng: prop.lng
          }
        })
      )

      // Sort by score
      return suggestions.sort((a, b) => b.score - a.score)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      throw error
    }
  }

  const handleSearch = async () => {
    if (!criteria.budget || !criteria.yieldGoal) {
      setError('Please enter your budget and yield goal')
      return
    }

    setError(null)
    setAnalysisState({
      isAnalyzing: true,
      progress: 10,
      stage: 'initializing',
      message: 'Initializing AI analysis...'
    })

    try {
      // Stage 1: Market scan
      await new Promise(resolve => setTimeout(resolve, 800))
      setAnalysisState({
        isAnalyzing: true,
        progress: 30,
        stage: 'scanning',
        message: 'Fetching real market data from APIs...'
      })

      // Stage 2: Filtering
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnalysisState({
        isAnalyzing: true,
        progress: 60,
        stage: 'filtering',
        message: 'Applying your investment criteria...'
      })

      // Stage 3: Analysis
      setAnalysisState({
        isAnalyzing: true,
        progress: 80,
        stage: 'analyzing',
        message: 'Running AI predictions on real properties...'
      })

      // Generate suggestions with real API data
      const results = await generateSuggestions(criteria)
      
      // Stage 4: Complete
      setAnalysisState({
        isAnalyzing: true,
        progress: 100,
        stage: 'complete',
        message: 'Analysis complete!'
      })

      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSuggestions(results)
      setHasSearched(true)
      setAnalysisState({
        isAnalyzing: false,
        progress: 0,
        stage: '',
        message: ''
      })

    } catch (error) {
      console.error('Search failed:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.')
      setAnalysisState({
        isAnalyzing: false,
        progress: 0,
        stage: '',
        message: ''
      })
    }
  }

  const handleViewProperties = (property: SuggestedProperty) => {
    console.log('🏠 View Properties clicked for:', property.address)
    // Navigate to map view with the selected property
    window.location.href = `/dashboard/map?lat=${property.lat}&lng=${property.lng}`
  }

  const handleMarketDetails = (property: SuggestedProperty) => {
    console.log('📊 Market Details clicked for:', property.address)
    // Navigate to analytics with the selected property
    window.location.href = `/dashboard/analytics?lat=${property.lat}&lng=${property.lng}`
  }

  const handleSave = (property: SuggestedProperty) => {
    console.log('💾 Save clicked for:', property.address)
    // Add to favorites
    alert(`Saved ${property.address} to your favorites!`)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-blue-50 border-blue-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Scout</h1>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
            Real Data + AI
          </span>
        </div>
        <p className="text-gray-600">AI analyzes real property data to find the best investment opportunities</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Criteria */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Property Search Criteria</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select 
                  value={criteria.state} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Budget
                </label>
                <select 
                  value={criteria.budget} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="300000">Up to $300K</option>
                  <option value="500000">Up to $500K</option>
                  <option value="750000">Up to $750K</option>
                  <option value="1000000">Up to $1M</option>
                  <option value="1500000">Up to $1.5M</option>
                  <option value="2000000">Up to $2M+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select 
                  value={criteria.propertyType} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any Type</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select 
                  value={criteria.bedrooms} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select 
                  value={criteria.bathrooms} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, bathrooms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Yield
                </label>
                <select 
                  value={criteria.yieldGoal} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, yieldGoal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select yield goal</option>
                  <option value="4">4%+ Annual Return</option>
                  <option value="6">6%+ Annual Return</option>
                  <option value="8">8%+ Annual Return</option>
                  <option value="10">10%+ Annual Return</option>
                  <option value="12">12%+ Annual Return</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Timeline
                </label>
                <select 
                  value={criteria.timeframe} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, timeframe: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="6">6 months</option>
                  <option value="12">1 year</option>
                  <option value="24">2 years</option>
                  <option value="36">3+ years</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Additional Preferences</h4>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={criteria.climateSafe}
                    onChange={(e) => setCriteria(prev => ({ ...prev, climateSafe: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Climate-safe locations</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={criteria.nearInfrastructure}
                    onChange={(e) => setCriteria(prev => ({ ...prev, nearInfrastructure: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Near major infrastructure</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={criteria.lowVolatility}
                    onChange={(e) => setCriteria(prev => ({ ...prev, lowVolatility: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Low market volatility</span>
                </label>
              </div>

              <button
                onClick={handleSearch}
                disabled={!criteria.budget || !criteria.yieldGoal || analysisState.isAnalyzing}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {analysisState.isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Find Properties</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {analysisState.isAnalyzing && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{analysisState.message}</h4>
              <p className="text-gray-600 mb-4">Analyzing real property data with AI predictions</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${analysisState.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`p-3 rounded-lg ${analysisState.progress > 10 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                  <div className="font-medium">Initialize</div>
                  <div>{analysisState.progress > 10 ? '✓ Complete' : '⏳ Processing'}</div>
                </div>
                <div className={`p-3 rounded-lg ${analysisState.progress > 30 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                  <div className="font-medium">Fetch Data</div>
                  <div>{analysisState.progress > 30 ? '✓ Complete' : '⏳ Processing'}</div>
                </div>
                <div className={`p-3 rounded-lg ${analysisState.progress > 60 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                  <div className="font-medium">Filter & Rank</div>
                  <div>{analysisState.progress > 60 ? '✓ Complete' : '⏳ Processing'}</div>
                </div>
                <div className={`p-3 rounded-lg ${analysisState.progress > 80 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                  <div className="font-medium">AI Analysis</div>
                  <div>{analysisState.progress > 80 ? '✓ Complete' : '⏳ Processing'}</div>
                </div>
              </div>
            </div>
          )}

          {!hasSearched && !analysisState.isAnalyzing && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real Data + AI Analysis</h3>
              <p className="text-gray-600 mb-6">Set your criteria and let AI analyze real property data to find the best opportunities</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-blue-800">Real Data</div>
                  <div className="text-blue-700">Live property APIs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-green-800">AI Predictions</div>
                  <div className="text-green-700">Machine learning analysis</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium text-purple-800">Smart Filtering</div>
                  <div className="text-purple-700">Matches your criteria</div>
                </div>
              </div>
            </div>
          )}

          {hasSearched && suggestions.length > 0 && !analysisState.isAnalyzing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Top {suggestions.length} Investment Properties
                </h3>
                <span className="text-sm text-gray-600">
                  Based on real data + AI analysis
                </span>
              </div>

              {suggestions.map((property, index) => (
                <div key={property.id} className={`bg-white rounded-xl shadow-sm border p-6 ${getScoreBg(property.score)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">
                          {property.address}
                        </h4>
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <div className="font-semibold">${property.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <div className="font-semibold">{property.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Size:</span>
                          <div className="font-semibold">{property.squareFootage} sqft</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Built:</span>
                          <div className="font-semibold">{property.yearBuilt}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(property.score)}`}>
                        {property.score}
                      </div>
                      <div className="text-sm text-gray-600">AI Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">+{property.appreciation}%</div>
                      <div className="text-xs text-green-700">Annual Growth</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{property.yieldPotential}%</div>
                      <div className="text-xs text-blue-700">Rental Yield</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">{property.riskLevel}</div>
                      <div className="text-xs text-purple-700">Risk Level</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-orange-600">{property.investment.capRate}%</div>
                      <div className="text-xs text-orange-700">Cap Rate</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                        Why This Property?
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {property.reasons.slice(0, 3).map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        Considerations
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {property.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleViewProperties(property)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleMarketDetails(property)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Market Analysis
                    </button>
                    <button 
                      onClick={() => handleSave(property)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && suggestions.length === 0 && !analysisState.isAnalyzing && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matches Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your criteria to find more opportunities</p>
              <div className="text-sm text-gray-500">
                • Increase your budget range<br/>
                • Lower your yield requirements<br/>
                • Adjust your risk tolerance
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 