'use client'

import React from 'react'
import { TrendingUp, DollarSign, MapPin, AlertTriangle } from 'lucide-react'

export function StatsCards() {
  const stats = [
    {
      title: 'Total Searches',
      value: '127',
      change: '+12%',
      changeType: 'positive',
      icon: MapPin,
      color: 'blue'
    },
    {
      title: 'Avg. Appreciation',
      value: '8.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Portfolio Value',
      value: '$2.4M',
      change: '+15.3%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Risk Alerts',
      value: '3',
      change: '-1',
      changeType: 'positive',
      icon: AlertTriangle,
      color: 'yellow'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="card-modern p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <div className="flex items-center">
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-red-700 bg-red-100'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
            <div
              className={`p-4 rounded-xl shadow-sm ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-yellow-100'
              }`}
            >
              <stat.icon
                className={`h-7 w-7 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-yellow-600'
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 