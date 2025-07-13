'use client'

import React from 'react'
import { TrendingUp, BarChart3, MapPin } from 'lucide-react'

export default function PredictionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Predictions</h1>
        <p className="text-gray-600">AI-powered market predictions and future outlooks</p>
      </div>

      {/* AI Prediction Overview */}
      <div className="card-modern p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Prediction Engine</h3>
            <p className="text-sm text-gray-600">Advanced machine learning models analyzing 100K+ properties</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">97.2%</div>
            <div className="text-sm text-gray-600">Prediction Accuracy</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2.5M</div>
            <div className="text-sm text-gray-600">Properties Analyzed</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">47</div>
            <div className="text-sm text-gray-600">Data Sources</div>
          </div>
        </div>
      </div>

      {/* Market Predictions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">6-Month Predictions</h3>
          <div className="space-y-4">
            {[
              { city: 'Austin, TX', current: '$485K', predicted: '$524K', change: '+8.0%', confidence: 94 },
              { city: 'Miami, FL', current: '$625K', predicted: '$662K', change: '+5.9%', confidence: 89 },
              { city: 'Denver, CO', current: '$565K', predicted: '$598K', change: '+5.8%', confidence: 87 },
              { city: 'Nashville, TN', current: '$465K', predicted: '$492K', change: '+5.8%', confidence: 91 }
            ].map((pred) => (
              <div key={pred.city} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{pred.city}</p>
                  <p className="text-sm text-gray-600">{pred.current} → {pred.predicted}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{pred.change}</div>
                  <div className="text-xs text-gray-500">{pred.confidence}% confidence</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Long-term Outlook (2-3 Years)</h3>
          <div className="space-y-4">
            {[
              { market: 'Tech Hubs', trend: 'Continued Growth', outlook: '+15-25%', risk: 'Medium' },
              { market: 'Sunbelt Cities', trend: 'Strong Appreciation', outlook: '+20-35%', risk: 'Low' },
              { market: 'Secondary Markets', trend: 'Emerging Opportunity', outlook: '+10-20%', risk: 'Low' },
              { market: 'Coastal Premium', trend: 'Moderate Growth', outlook: '+5-15%', risk: 'High' }
            ].map((outlook) => (
              <div key={outlook.market} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{outlook.market}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    outlook.risk === 'Low' ? 'bg-green-100 text-green-800' :
                    outlook.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {outlook.risk} Risk
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{outlook.trend}</p>
                <p className="text-lg font-bold text-blue-600">{outlook.outlook}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Factors */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Prediction Factors</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-1">Economic Indicators</div>
            <div className="text-xs text-blue-700">Employment, GDP, Interest rates</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800 mb-1">Supply & Demand</div>
            <div className="text-xs text-green-700">Inventory, Construction, Migration</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-800 mb-1">Infrastructure</div>
            <div className="text-xs text-purple-700">Transit, Schools, Amenities</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm font-medium text-orange-800 mb-1">Demographics</div>
            <div className="text-xs text-orange-700">Population, Age, Income</div>
          </div>
        </div>
      </div>
    </div>
  )
} 