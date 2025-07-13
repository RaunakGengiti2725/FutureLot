'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Building, 
  Users, 
  Activity, 
  Shield, 
  Zap,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Star,
  Award,
  Briefcase,
  Home,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ComprehensiveDashboardProps {
  searchData: any
  selectedCity: { name: string; state: string; lat: number; lng: number } | null
}

export function ComprehensiveDashboard({ searchData, selectedCity }: ComprehensiveDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  if (!searchData || !selectedCity) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FutureLot.ai</h2>
          <p className="text-gray-600 mb-6">Search for a city above to unlock comprehensive real estate intelligence</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-blue-600">🏙️ 25+ Major Cities</div>
              <div className="text-sm text-gray-600">Nationwide coverage</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-green-600">📊 100,000+ Properties</div>
              <div className="text-sm text-gray-600">Real data analysis</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-lg font-semibold text-purple-600">🤖 AI-Powered</div>
              <div className="text-sm text-gray-600">96.8% accuracy</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Market Overview', icon: BarChart3 },
    { id: 'investment', name: 'Investment Analysis', icon: DollarSign },
    { id: 'development', name: 'Development Intelligence', icon: Building },
    { id: 'neighborhoods', name: 'Neighborhoods', icon: MapPin },
    { id: 'rental', name: 'Rental Market', icon: Home },
    { id: 'infrastructure', name: 'Infrastructure', icon: Zap },
    { id: 'forecast', name: 'Future Outlook', icon: Target }
  ]

  const analytics = searchData.analytics || {}
  const marketOverview = searchData.marketOverview || {}
  const developmentIntelligence = searchData.developmentIntelligence || {}
  const neighborhoods = searchData.neighborhoods || []
  const rentalMarket = searchData.rentalMarket || {}
  const infrastructure = searchData.infrastructure || {}

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCity.name}, {selectedCity.state}
                </h1>
                <p className="text-gray-600">
                  Comprehensive Real Estate Intelligence • Generated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Investment Score</div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.investmentScore || 'N/A'}/100
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Future Value</div>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.futureValuePrediction || 'N/A'}/100
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                ${marketOverview.medianHomePrice?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Median Price</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {marketOverview.priceAppreciationYoY?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-xs text-gray-600">YoY Growth</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {marketOverview.rentalYield?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-xs text-gray-600">Rental Yield</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {marketOverview.walkScore || 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Walk Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {developmentIntelligence.totalPermits || 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Active Permits</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">
                {marketOverview.employmentRate ? (marketOverview.employmentRate * 100).toFixed(1) : 'N/A'}%
              </div>
              <div className="text-xs text-gray-600">Employment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Investment Score Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Investment Score</h3>
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.investmentScore || 'N/A'}/100
                </div>
                <div className="text-sm text-gray-600">
                  Based on growth, yield, employment, and development activity
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Market Momentum</h3>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analytics.marketMomentum || 'N/A'}/100
                </div>
                <div className="text-sm text-gray-600">
                  Current market velocity and trend strength
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
                  <Shield className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analytics.riskAssessment?.overall || 'N/A'}/100
                </div>
                <div className="text-sm text-gray-600">
                  Overall investment risk level: {analytics.riskAssessment?.level || 'N/A'}
                </div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchData.marketInsights?.slice(0, 4).map((insight: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === 'positive' ? 'bg-green-500' :
                        insight.type === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(insight.confidence * 100)}%
                          </span>
                          <span className={`text-xs ${
                            insight.impact > 0 ? 'text-green-600' :
                            insight.impact < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            Impact: {insight.impact > 0 ? '+' : ''}{Math.round(insight.impact * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'investment' && (
          <div className="space-y-8">
            {/* ROI Projections */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {analytics.roiProjections?.oneYear || 'N/A'}%
                  </div>
                  <div className="text-sm text-gray-600">1 Year ROI</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {analytics.roiProjections?.threeYear || 'N/A'}%
                  </div>
                  <div className="text-sm text-gray-600">3 Year ROI</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {analytics.roiProjections?.fiveYear || 'N/A'}%
                  </div>
                  <div className="text-sm text-gray-600">5 Year ROI</div>
                </div>
              </div>
            </div>

            {/* Investment Opportunities */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Investment Cities</h3>
              <div className="space-y-3">
                {searchData.investmentOpportunities?.topCities?.slice(0, 5).map((city: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{city.city}, {city.state}</div>
                        <div className="text-sm text-gray-600">
                          Future Score: {city.futureValueScore}/100
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {city.priceAppreciationYoY?.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">YoY Growth</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'development' && (
          <div className="space-y-8">
            {/* Development Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Permits</h3>
                  <Building className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {developmentIntelligence.totalPermits || 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Investment</h3>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${developmentIntelligence.totalInvestment ? 
                    (developmentIntelligence.totalInvestment / 1000000).toFixed(1) + 'M' : 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {developmentIntelligence.activeProjects || 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Avg Impact</h3>
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {developmentIntelligence.averageImpactScore?.toFixed(0) || 'N/A'}/100
                </div>
              </div>
            </div>

            {/* Development Hot Spots */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Hot Spots</h3>
              <div className="space-y-3">
                {developmentIntelligence.hotSpots?.slice(0, 10).map((spot: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        spot.impactScore > 80 ? 'bg-red-500' :
                        spot.impactScore > 60 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{spot.address}</div>
                        <div className="text-sm text-gray-600">
                          {spot.type} • ${spot.valuation?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {spot.impactScore}/100
                      </div>
                      <div className="text-sm text-gray-600">Impact Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'neighborhoods' && (
          <div className="space-y-8">
            {/* Neighborhood Rankings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Neighborhoods by Future Score</h3>
              <div className="space-y-3">
                {neighborhoods.slice(0, 10).map((neighborhood: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{neighborhood.name}</div>
                        <div className="text-sm text-gray-600">
                          Median Price: ${neighborhood.housing?.medianHomePrice?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {neighborhood.investment?.appreciationRate?.toFixed(1) || 'N/A'}%
                        </div>
                        <div className="text-xs text-gray-600">Appreciation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {neighborhood.permits || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">Permits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {neighborhood.futureScore || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">Future Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'rental' && (
          <div className="space-y-8">
            {/* Rental Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Median Rent</h3>
                  <Home className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  ${rentalMarket.overview?.medianRent?.toLocaleString() || 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Average Yield</h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {rentalMarket.overview?.averageGrossYield?.toFixed(1) || 'N/A'}%
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rent Growth</h3>
                  <LineChart className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {rentalMarket.overview?.rentGrowthRate?.toFixed(1) || 'N/A'}%
                </div>
              </div>
            </div>

            {/* Top Investment Areas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rental Investment Areas</h3>
              <div className="space-y-3">
                {rentalMarket.topInvestmentAreas?.slice(0, 8).map((area: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        area.investmentGrade === 'A' ? 'bg-green-500' :
                        area.investmentGrade === 'B' ? 'bg-blue-500' :
                        area.investmentGrade === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {area.investmentGrade}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{area.neighborhood}</div>
                        <div className="text-sm text-gray-600">
                          Risk Score: {area.riskScore}/100
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {area.averageYield?.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Yield</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          ${area.cashFlow?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Cash Flow</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'infrastructure' && (
          <div className="space-y-8">
            {/* Transit Projects */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transit Projects</h3>
              <div className="space-y-3">
                {infrastructure.transit?.map((project: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        project.status === 'construction' ? 'bg-green-500' :
                        project.status === 'approved' ? 'bg-blue-500' :
                        project.status === 'planned' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">
                          {project.type} • ${(project.budget / 1000000).toFixed(0)}M budget
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {project.status.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Est. {new Date(project.timeline?.estimatedCompletion).getFullYear()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure Projects */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure Projects</h3>
              <div className="space-y-3">
                {infrastructure.infrastructure?.map((project: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        project.status === 'construction' ? 'bg-green-500' :
                        project.status === 'approved' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">
                          {project.type} • ${(project.investment / 1000000).toFixed(0)}M investment
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {project.status.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {project.impact?.jobsCreated?.toLocaleString()} jobs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'forecast' && (
          <div className="space-y-8">
            {/* Future Outlook */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Outlook</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Market Projections</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">6 Month Forecast</span>
                      <span className="font-medium text-green-600">
                        +{rentalMarket.forecast?.sixMonth?.valueGrowth?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">12 Month Forecast</span>
                      <span className="font-medium text-green-600">
                        +{rentalMarket.forecast?.twelveMonth?.valueGrowth?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">3 Year Forecast</span>
                      <span className="font-medium text-green-600">
                        +{rentalMarket.forecast?.threeYear?.valueGrowth?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Risk Factors</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-600">Gentrification Risk</span>
                      <span className="font-medium text-red-600">
                        {analytics.gentrificationRisk || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm text-gray-600">Market Risk</span>
                      <span className="font-medium text-yellow-600">
                        {analytics.riskAssessment?.market || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Economic Risk</span>
                      <span className="font-medium text-blue-600">
                        {analytics.riskAssessment?.economic || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 