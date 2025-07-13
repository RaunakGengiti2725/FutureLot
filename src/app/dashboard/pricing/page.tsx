'use client'

import React, { useState } from 'react'
import { Check, Star, Crown, Zap, Shield, TrendingUp, Sparkles } from 'lucide-react'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started with AI real estate analysis',
      features: [
        '3 AI Scout searches per month',
        '1 Property Screener analysis',
        'Basic market analytics',
        '25 property map views',
        'Email support',
        'Access to 150+ cities'
      ],
      limitations: [
        'Limited to 3 searches',
        'Basic climate risk data',
        'Standard support'
      ],
      cta: 'Current Plan',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: { monthly: 29, annual: 290 },
      description: 'Advanced AI tools for serious real estate investors',
      features: [
        '50 AI Scout searches per month',
        '100 Property Screener analyses',
        'Advanced market analytics',
        'Unlimited property map views',
        'Climate-safe area filtering',
        'Priority email support',
        'Export data to CSV',
        'Price change alerts',
        'Comparative market analysis',
        'Investment portfolio tracking'
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      popular: true,
      color: 'blue'
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, annual: 990 },
      description: 'Complete solution for real estate professionals and firms',
      features: [
        'Unlimited AI Scout searches',
        'Unlimited Property Screener analyses',
        'White-label dashboard',
        'API access for integrations',
        'Custom market reports',
        'Dedicated account manager',
        '24/7 phone support',
        'Advanced risk modeling',
        'Team collaboration tools',
        'Custom data sources integration',
        'Predictive analytics dashboard',
        'Multi-market portfolio analysis'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ]

  const getPrice = (plan: any) => {
    const price = plan.price[billingPeriod]
    if (price === 0) return 'Free'
    return billingPeriod === 'annual' ? `$${Math.round(price/12)}/mo` : `$${price}/mo`
  }

  const getFullPrice = (plan: any) => {
    const price = plan.price[billingPeriod]
    if (price === 0) return ''
    return billingPeriod === 'annual' ? `Billed annually ($${price})` : 'Billed monthly'
  }

  const getSavings = (plan: any) => {
    if (billingPeriod === 'annual' && plan.price.annual > 0) {
      const monthlyCost = plan.price.monthly * 12
      const savings = monthlyCost - plan.price.annual
      return Math.round((savings / monthlyCost) * 100)
    }
    return 0
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 mb-6">
          Unlock the full power of AI-driven real estate intelligence
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              billingPeriod === 'monthly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              billingPeriod === 'annual' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 p-8 ${
              plan.popular 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            } hover:shadow-lg transition-all duration-200`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Most Popular</span>
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                {plan.name === 'Free' && <Shield className="h-6 w-6 text-gray-600" />}
                {plan.name === 'Pro' && <Crown className="h-6 w-6 text-blue-600" />}
                {plan.name === 'Enterprise' && <Sparkles className="h-6 w-6 text-purple-600" />}
                <span>{plan.name}</span>
              </h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">{getPrice(plan)}</span>
                {plan.price[billingPeriod] > 0 && billingPeriod === 'annual' && (
                  <span className="text-sm text-gray-500 ml-2 line-through">
                    ${plan.price.monthly}/mo
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{getFullPrice(plan)}</p>
              {getSavings(plan) > 0 && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Save {getSavings(plan)}% annually
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
              
              {plan.limitations.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-xs text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                plan.name === 'Free'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
              disabled={plan.name === 'Free'}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Pro</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { feature: 'AI Scout searches per month', free: '3', pro: '50', enterprise: 'Unlimited' },
                { feature: 'Property Screener analyses', free: '1', pro: '100', enterprise: 'Unlimited' },
                { feature: 'Cities covered', free: '150+', pro: '150+', enterprise: '150+' },
                { feature: 'Climate risk filtering', free: '❌', pro: '✅', enterprise: '✅' },
                { feature: 'API access', free: '❌', pro: '❌', enterprise: '✅' },
                { feature: 'White-label dashboard', free: '❌', pro: '❌', enterprise: '✅' },
                { feature: 'Support level', free: 'Email', pro: 'Priority Email', enterprise: '24/7 Phone' },
                { feature: 'Data export', free: '❌', pro: 'CSV', enterprise: 'CSV + API' },
                { feature: 'Price alerts', free: '❌', pro: '✅', enterprise: '✅' },
                { feature: 'Portfolio tracking', free: '❌', pro: '✅', enterprise: '✅' }
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{row.free}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{row.pro}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              question: 'Can I upgrade or downgrade my plan anytime?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for both monthly and annual billing.'
            },
            {
              question: 'Is there a free trial for paid plans?',
              answer: 'Yes! You can try Pro features for 14 days free. No credit card required for the trial period.'
            },
            {
              question: 'How accurate is the AI analysis?',
              answer: 'Our AI models achieve 96.8% accuracy based on historical data validation. We continuously update our algorithms with new market data.'
            },
            {
              question: 'Do you offer refunds?',
              answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact support for a full refund.'
            }
          ].map((faq, index) => (
            <div key={index} className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white mt-16">
        <h2 className="text-2xl font-bold mb-4">Ready to Supercharge Your Real Estate Investments?</h2>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of investors using AI to find profitable opportunities
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-modern px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium">
            Start 14-Day Free Trial
          </button>
          <button className="btn-modern px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 font-medium">
            Schedule Demo
          </button>
        </div>
      </div>
    </div>
  )
} 