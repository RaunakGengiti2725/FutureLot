'use client'

import React from 'react'
import { TrendingUp, Home, BarChart3, MapPin } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Comprehensive real estate market analysis and insights</p>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">National Average</p>
              <p className="text-2xl font-bold text-green-600">+12.3%</p>
            </div>
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Median Price</p>
              <p className="text-2xl font-bold text-blue-600">$485K</p>
            </div>
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Rental Yield</p>
              <p className="text-2xl font-bold text-purple-600">5.8%</p>
            </div>
          </div>
        </div>
        <div className="card-modern p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Hot Markets</p>
              <p className="text-2xl font-bold text-orange-600">25+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Markets */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Performing Markets</h3>
          <div className="space-y-4">
            {[
              { city: 'Austin, TX', appreciation: '+24.5%', score: 89 },
              { city: 'Nashville, TN', appreciation: '+22.8%', score: 86 },
              { city: 'Phoenix, AZ', appreciation: '+21.2%', score: 84 },
              { city: 'Tampa, FL', appreciation: '+19.8%', score: 82 },
              { city: 'Charlotte, NC', appreciation: '+18.5%', score: 81 }
            ].map((market) => (
              <div key={market.city} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-gray-900">{market.city}</p>
                  <p className="text-sm text-green-600">{market.appreciation} appreciation</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{market.score}/100</div>
                  <div className="text-xs text-gray-500">Investment Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Best Rental Yields</h3>
          <div className="space-y-4">
            {[
              { city: 'Cleveland, OH', yield: '15.8%', cashFlow: '+$850' },
              { city: 'Detroit, MI', yield: '12.5%', cashFlow: '+$720' },
              { city: 'Memphis, TN', yield: '11.2%', cashFlow: '+$680' },
              { city: 'Baltimore, MD', yield: '10.8%', cashFlow: '+$650' },
              { city: 'Birmingham, AL', yield: '10.5%', cashFlow: '+$620' }
            ].map((market) => (
              <div key={market.city} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-gray-900">{market.city}</p>
                  <p className="text-sm text-blue-600">{market.cashFlow} monthly cash flow</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{market.yield}</div>
                  <div className="text-xs text-gray-500">Gross Yield</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Trends */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Market Trends & Insights</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Rising Markets</span>
            </div>
            <p className="text-sm text-green-700">Texas and Florida leading nationwide appreciation with strong job growth</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Cash Flow Kings</span>
            </div>
            <p className="text-sm text-blue-700">Rust Belt cities offering exceptional rental yields for investors</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Emerging Opportunities</span>
            </div>
            <p className="text-sm text-purple-700">Secondary markets showing strong fundamentals and growth potential</p>
          </div>
        </div>
      </div>
    </div>
  )
} 