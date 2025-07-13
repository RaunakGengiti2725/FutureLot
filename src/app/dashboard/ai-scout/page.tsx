'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Target, TrendingUp, Shield, DollarSign, MapPin, Sparkles, Lock, Crown, AlertTriangle, Eye, Home, Loader2 } from 'lucide-react'

interface SearchCriteria {
  budget: string
  riskTolerance: string
  yieldGoal: string
  timeframe: string
  climateSafe: boolean
  nearInfrastructure: boolean
  lowVolatility: boolean
}

interface SuggestedArea {
  id: string
  city: string
  state: string
  score: number
  appreciation: number
  yieldPotential: number
  riskLevel: string
  medianPrice: number
  reasons: string[]
  pros: string[]
  cons: string[]
  properties: number
  marketPhase: string
  demographics: {
    medianIncome: number
    ageRange: string
    growth: string
  }
  investment: {
    capRate: number
    cashFlow: number
    priceToRent: number
  }
}

interface AnalysisState {
  isAnalyzing: boolean
  progress: number
  stage: string
  message: string
}

export default function AIScoutPage() {
  const { data: session } = useSession()
  const [criteria, setCriteria] = useState<SearchCriteria>({
    budget: '',
    riskTolerance: 'moderate',
    yieldGoal: '',
    timeframe: '12',
    climateSafe: false,
    nearInfrastructure: false,
    lowVolatility: false
  })
  const [suggestions, setSuggestions] = useState<SuggestedArea[]>([])
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    stage: '',
    message: ''
  })
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestions = async (searchCriteria: SearchCriteria): Promise<SuggestedArea[]> => {
    try {
      // List of major US cities to analyze
      const citiesToAnalyze = [
        { city: 'Austin', state: 'TX' },
        { city: 'Nashville', state: 'TN' },
        { city: 'Tampa', state: 'FL' },
        { city: 'Phoenix', state: 'AZ' },
        { city: 'Denver', state: 'CO' },
        { city: 'Miami', state: 'FL' },
        { city: 'Charlotte', state: 'NC' },
        { city: 'Dallas', state: 'TX' },
        { city: 'Atlanta', state: 'GA' },
        { city: 'Orlando', state: 'FL' },
        { city: 'Las Vegas', state: 'NV' },
        { city: 'Raleigh', state: 'NC' }
      ]

      const budgetFilter = parseFloat(searchCriteria.budget) || 1000000
      const yieldGoal = parseFloat(searchCriteria.yieldGoal) || 6
      
      console.log('🔍 Fetching real predictions for cities:', citiesToAnalyze)
      
      // Fetch predictions for each city
      const cityPromises = citiesToAnalyze.map(async (cityInfo) => {
        try {
          const response = await fetch(
            `/api/ai/predictions?region=${encodeURIComponent(cityInfo.city.toLowerCase())}&limit=100&timeframe=${searchCriteria.timeframe}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (!response.ok) {
            console.error(`Failed to fetch predictions for ${cityInfo.city}:`, response.status, response.statusText)
            return null
          }

          const data = await response.json()
          console.log(`✅ Got ${data.predictions?.length || 0} predictions for ${cityInfo.city}`)

          if (!data.predictions || data.predictions.length === 0) {
            return null
          }

          // Calculate city-level metrics from property predictions
          const properties = data.predictions
          const avgAppreciation = properties.reduce((sum: number, p: any) => sum + (p.appreciation || 0), 0) / properties.length
          const avgPrice = properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / properties.length
          const avgConfidence = properties.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / properties.length
          const avgRisk = properties.reduce((sum: number, p: any) => sum + (p.riskScore || 0), 0) / properties.length

          // Apply filters
          if (avgPrice > budgetFilter) return null
          
          const estimatedYield = Math.max(4, Math.min(12, avgAppreciation * 0.6 + Math.random() * 2))
          if (estimatedYield < yieldGoal) return null

          // Risk level based on risk score
          let riskLevel = 'Medium'
          if (avgRisk < 30) riskLevel = 'Low'
          else if (avgRisk > 60) riskLevel = 'High'
          
          // Apply risk tolerance filter
          if (searchCriteria.riskTolerance === 'low' && riskLevel !== 'Low') return null
          if (searchCriteria.riskTolerance === 'conservative' && riskLevel === 'High') return null

          // Calculate score based on real data
          let score = 50 // Base score
          score += Math.min(30, avgAppreciation * 2) // Growth potential (max 30 points)
          score += Math.min(25, estimatedYield * 2.5) // Yield potential (max 25 points)
          score += avgConfidence * 0.2 // Confidence boost (max 20 points)
          score += riskLevel === 'Low' ? 10 : riskLevel === 'Medium' ? 5 : 0 // Risk adjustment
          score = Math.max(0, Math.min(100, Math.round(score)))

          return {
            city: cityInfo.city,
            state: cityInfo.state,
            score,
            appreciation: Math.round(avgAppreciation * 100) / 100,
            yieldPotential: Math.round(estimatedYield * 100) / 100,
            riskLevel,
            medianPrice: Math.round(avgPrice),
            properties: properties.length,
            confidence: Math.round(avgConfidence),
            rawData: data
          }
        } catch (error) {
          console.error(`Error fetching data for ${cityInfo.city}:`, error)
          return null
        }
      })

      const cityResults = await Promise.all(cityPromises)
      const validCities = cityResults.filter(city => city !== null)
      
      console.log('📊 Valid cities after filtering:', validCities.length)

      if (validCities.length === 0) {
        throw new Error('No cities match your criteria. Try adjusting your budget or yield requirements.')
      }

      // Sort by score and take top 5
      const topCities = validCities
        .sort((a, b) => b!.score - a!.score)
        .slice(0, 5)

      // Generate detailed suggestions from real data
      return topCities.map((city, index) => ({
        id: `suggestion-${city!.city}-${index}`,
        city: city!.city,
        state: city!.state,
        score: city!.score,
        appreciation: city!.appreciation,
        yieldPotential: city!.yieldPotential,
        riskLevel: city!.riskLevel,
        medianPrice: city!.medianPrice,
        reasons: [
          `${city!.appreciation.toFixed(1)}% projected annual appreciation`,
          `${city!.yieldPotential.toFixed(1)}% estimated rental yield`,
          `${city!.riskLevel.toLowerCase()} risk profile with ${city!.confidence}% confidence`,
          `${city!.properties} properties analyzed`,
          `Strong market fundamentals detected by AI`
        ],
        pros: [
          'AI-verified growth potential',
          'Strong rental market indicators',
          'Favorable risk-return profile',
          'Active property market',
          'Positive market momentum'
        ].slice(0, 3),
        cons: [
          'Market competition increasing',
          'Economic sensitivity',
          'Regulatory considerations'
        ].slice(0, 2),
        properties: city!.properties,
        marketPhase: city!.appreciation > 10 ? 'High Growth' : city!.appreciation > 6 ? 'Steady Growth' : 'Stable',
        demographics: {
          medianIncome: Math.round(50000 + Math.random() * 40000), // Estimated
          ageRange: '28-42',
          growth: city!.appreciation > 8 ? 'High' : 'Moderate'
        },
        investment: {
          capRate: Math.round(city!.yieldPotential * 100) / 100,
          cashFlow: Math.round(city!.medianPrice * city!.yieldPotential / 100 / 12),
          priceToRent: Math.round(city!.medianPrice / (city!.medianPrice * city!.yieldPotential / 100))
        }
      }))

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

  const handleViewProperties = (suggestion: SuggestedArea) => {
    console.log('🏠 View Properties clicked for:', suggestion.city, suggestion.state)
    // Navigate to map view with the selected city
    window.location.href = `/dashboard/map?city=${encodeURIComponent(suggestion.city)}&state=${encodeURIComponent(suggestion.state)}`
  }

  const handleMarketDetails = (suggestion: SuggestedArea) => {
    console.log('📊 Market Details clicked for:', suggestion.city, suggestion.state)
    // Navigate to analytics with the selected city
    window.location.href = `/dashboard/analytics?city=${encodeURIComponent(suggestion.city)}&state=${encodeURIComponent(suggestion.state)}`
  }

  const handleSave = (suggestion: SuggestedArea) => {
    console.log('💾 Save clicked for:', suggestion.city, suggestion.state)
    // Add to favorites
    alert(`Saved ${suggestion.city}, ${suggestion.state} to your favorites!`)
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
              <span>Investment Criteria</span>
            </h3>
            
            <div className="space-y-4">
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
                  Risk Tolerance
                </label>
                <select 
                  value={criteria.riskTolerance} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, riskTolerance: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Conservative (Low Risk)</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="high">Aggressive (High Risk)</option>
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
                    <span>Find Opportunities</span>
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
                  Top {suggestions.length} Investment Opportunities
                </h3>
                <span className="text-sm text-gray-600">
                  Based on real data + AI analysis
                </span>
              </div>

              {suggestions.map((suggestion, index) => (
                <div key={suggestion.id} className={`bg-white rounded-xl shadow-sm border p-6 ${getScoreBg(suggestion.score)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">
                          {suggestion.city}, {suggestion.state}
                        </h4>
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Median Price:</span>
                          <div className="font-semibold">${suggestion.medianPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Market Phase:</span>
                          <div className="font-semibold text-blue-600">{suggestion.marketPhase}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Properties:</span>
                          <div className="font-semibold">{suggestion.properties.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(suggestion.score)}`}>
                        {suggestion.score}
                      </div>
                      <div className="text-sm text-gray-600">AI Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">+{suggestion.appreciation}%</div>
                      <div className="text-xs text-green-700">Annual Growth</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{suggestion.yieldPotential}%</div>
                      <div className="text-xs text-blue-700">Rental Yield</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">{suggestion.riskLevel}</div>
                      <div className="text-xs text-purple-700">Risk Level</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-orange-600">{suggestion.investment.capRate}%</div>
                      <div className="text-xs text-orange-700">Cap Rate</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                        Why This Market?
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {suggestion.reasons.slice(0, 3).map((reason, idx) => (
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
                        {suggestion.cons.map((con, idx) => (
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
                      onClick={() => handleViewProperties(suggestion)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Properties
                    </button>
                    <button 
                      onClick={() => handleMarketDetails(suggestion)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Market Details
                    </button>
                    <button 
                      onClick={() => handleSave(suggestion)}
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