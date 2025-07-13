'use client'

import React, { useState } from 'react'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Shield, Zap, Eye, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'
import SignInForm from './SignInForm'

interface LandingPageProps {
  isAuthenticated?: boolean
  session?: Session | null
}

export function LandingPage({ isAuthenticated = false, session }: LandingPageProps) {
  const [showSignIn, setShowSignIn] = useState(false)
  const router = useRouter()

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="gradient-modern-blue rounded-lg p-2.5 shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              FutureLot.ai
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  {session?.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-10 w-10 rounded-full ring-2 ring-blue-200"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, {session?.user?.name?.split(' ')[0] || 'User'}!
                  </span>
                </div>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoToDashboard}
                  className="btn-modern bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Dashboard
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-md"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSignIn(true)}
                className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-gray-900 shadow-md"
              >
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      {showSignIn && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SignInForm />
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Find Your Next{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Profitable Investment
            </span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            <p className="mb-4">
              Discover profitable real estate opportunities with REAL market data and comprehensive analysis.
              Get genuine insights that can help you make money from property investments.
            </p>
                    
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              🆓 <strong>100% FREE VERSION:</strong> Uses government data sources - no API costs, no subscriptions!
            </div>
                    
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              💰 <strong>Save $140/month:</strong> Free Census, BLS, and FBI data vs paid APIs
            </div>
                    
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
              🎯 <strong>Real Profit Potential:</strong> Identifies undervalued properties and cash flow opportunities
            </div>
          </motion.div>
          
          {isAuthenticated ? (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToDashboard}
              className="btn-modern bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Continue to Dashboard
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSignIn(true)}
              className="btn-modern bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started Free
            </motion.button>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            100% FREE Real Estate Investment Analysis
          </h3>
          <p className="text-lg text-gray-600">
            Everything you need to find profitable investment opportunities - completely free!
          </p>
          <div className="mt-4 inline-flex items-center gap-6 text-sm">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">🆓 Zero Cost</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">🏛️ Government Data</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">💰 Real Profits</span>
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              className="card-modern p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 w-fit mb-6 shadow-sm">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white shadow-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">
            Ready to Find Your Next Investment?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of investors using AI to identify profitable opportunities
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isAuthenticated ? handleGoToDashboard : () => setShowSignIn(true)}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
          >
            {isAuthenticated ? 'Access Dashboard' : 'Start Exploring Now'}
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: TrendingUp,
    title: 'FREE Investment Analysis',
    description: 'Complete investment analysis using US Census, BLS, and FBI data - no API costs or subscriptions required.'
  },
  {
    icon: Eye,
    title: 'Government Data Sources',
    description: 'Official data from Census Bureau, Bureau of Labor Statistics, and other trusted government sources.'
  },
  {
    icon: BarChart3,
    title: 'Real Profit Opportunities',
    description: 'Identify undervalued properties and cash flow opportunities using comprehensive market analysis.'
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Evaluate investment risks using employment data, crime statistics, and economic indicators.'
  },
  {
    icon: Zap,
    title: 'Market Timing',
    description: 'Know when to buy, sell, or hold based on real market conditions and economic trends.'
  },
  {
    icon: MapPin,
    title: 'Save $140/Month',
    description: 'Get professional-grade analysis without expensive API subscriptions or monthly fees.'
  }
] 