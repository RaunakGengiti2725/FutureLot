'use client'

import React from 'react'
import { Shield, AlertTriangle, Waves, Thermometer, Cloud, MapPin } from 'lucide-react'

export default function ClimateRiskPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Climate Risk</h1>
        <p className="text-gray-600">Climate risk assessment and resilience planning for real estate investments</p>
      </div>

      {/* Risk Assessment Overview */}
      <div className="card-modern p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Climate Risk Assessment</h3>
            <p className="text-sm text-gray-600">Comprehensive analysis of climate-related risks for real estate</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">High</div>
            <div className="text-sm text-gray-600">Coastal Areas</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">Medium</div>
            <div className="text-sm text-gray-600">Inland Cities</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">Low</div>
            <div className="text-sm text-gray-600">Mountain Regions</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">150+</div>
            <div className="text-sm text-gray-600">Cities Analyzed</div>
          </div>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Waves className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Flood Risk</h3>
              <p className="text-sm text-gray-600">Sea level rise & flooding</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Miami, FL</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New Orleans, LA</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Houston, TX</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Medium</span>
            </div>
          </div>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Thermometer className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Heat Risk</h3>
              <p className="text-sm text-gray-600">Extreme heat events</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Phoenix, AZ</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Las Vegas, NV</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Austin, TX</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Medium</span>
            </div>
          </div>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Cloud className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Storm Risk</h3>
              <p className="text-sm text-gray-600">Hurricanes & severe weather</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tampa, FL</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Charleston, SC</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Norfolk, VA</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Markets */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">High-Risk Markets</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { city: 'Miami, FL', risk: 'Sea Level Rise', score: 85, trend: 'Increasing' },
            { city: 'New Orleans, LA', risk: 'Flooding', score: 92, trend: 'Increasing' },
            { city: 'Phoenix, AZ', risk: 'Extreme Heat', score: 78, trend: 'Increasing' },
            { city: 'Tampa, FL', risk: 'Hurricanes', score: 81, trend: 'Stable' },
            { city: 'San Diego, CA', risk: 'Wildfire', score: 72, trend: 'Increasing' },
            { city: 'Norfolk, VA', risk: 'Storm Surge', score: 75, trend: 'Increasing' }
          ].map((market) => (
            <div key={market.city} className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{market.city}</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {market.score}/100
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{market.risk}</p>
              <p className="text-xs text-red-700 font-medium">{market.trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptation Strategies */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Climate Adaptation Strategies</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Flood Protection</span>
              </div>
              <p className="text-sm text-blue-700">Elevation requirements, flood barriers, improved drainage systems</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Heat Resilience</span>
              </div>
              <p className="text-sm text-green-700">Cool roofs, energy-efficient HVAC, urban tree canopy</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Cloud className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">Storm Preparedness</span>
              </div>
              <p className="text-sm text-purple-700">Impact-resistant windows, backup power, emergency planning</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Location Strategy</span>
              </div>
              <p className="text-sm text-orange-700">Avoid high-risk zones, prioritize inland and elevated areas</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Insurance Coverage</span>
              </div>
              <p className="text-sm text-red-700">Comprehensive flood, wind, and climate-related coverage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 