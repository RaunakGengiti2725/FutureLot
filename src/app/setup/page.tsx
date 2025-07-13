'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const envTemplate = `# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here-change-this-in-production

# Google OAuth (Required for authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Keys (Required for property data)
RAPIDAPI_KEY=your-rapidapi-key-here

# Optional API Keys (for enhanced features)
CENSUS_API_KEY=your-census-api-key
BLS_API_KEY=your-bls-api-key
FRED_API_KEY=your-fred-api-key
NOAA_API_KEY=your-noaa-api-key`

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Application Setup</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Authentication Error Detected
              </h2>
              <p className="text-red-700">
                Google OAuth is not configured. Please follow the steps below to set up your application.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1: Create .env.local */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 1: Create Environment File
            </h2>
            <p className="text-gray-600 mb-4">
              Create a file named <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> in the root directory of your project with the following content:
            </p>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {envTemplate}
              </pre>
              <button
                onClick={() => handleCopy(envTemplate, 'env')}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                {copiedSection === 'env' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Google OAuth Setup */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 2: Set Up Google OAuth
            </h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <div>
                  Go to the{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Google Cloud Console
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Create a new project or select an existing one</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Click "Create Credentials" → "OAuth client ID"</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Choose "Web application" as the application type</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">5.</span>
                <div>
                  Add the following to Authorized redirect URIs:
                  <code className="block bg-gray-100 px-2 py-1 rounded mt-1">
                    http://localhost:3000/api/auth/callback/google
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">6.</span>
                <span>Copy your Client ID and Client Secret to the .env.local file</span>
              </li>
            </ol>
          </div>

          {/* Step 3: RapidAPI Setup */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 3: Get RapidAPI Key (for Property Data)
            </h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <div>
                  Sign up at{' '}
                  <a
                    href="https://rapidapi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    RapidAPI
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <div>
                  Subscribe to the{' '}
                  <a
                    href="https://rapidapi.com/datascraper/api/us-real-estate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    US Real Estate API
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Copy your RapidAPI key to the .env.local file</span>
              </li>
            </ol>
          </div>

          {/* Step 4: Database Setup */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 4: Initialize Database
            </h2>
            <p className="text-gray-600 mb-4">
              Run the following commands in your terminal:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg">
                <code>npx prisma generate</code>
              </div>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg">
                <code>npx prisma db push</code>
              </div>
            </div>
          </div>

          {/* Step 5: Restart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Step 5: Restart the Application
            </h2>
            <p className="text-gray-600 mb-4">
              After setting up your environment variables, restart the development server:
            </p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg mb-4">
              <code>npm run dev</code>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>

        {/* Optional APIs Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Note: Optional API Keys
          </h3>
          <p className="text-blue-700">
            The Census, BLS, FRED, and NOAA API keys are optional but recommended for enhanced features. 
            These are free government APIs that provide additional data for better analysis.
          </p>
        </div>
      </div>
    </div>
  )
} 