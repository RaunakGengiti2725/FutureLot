'use client'

import React, { useState, createContext, useContext } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  MapPin, 
  Search, 
  Heart, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Home,
  BarChart3,
  Shield,
  Sparkles,
  CreditCard
} from 'lucide-react'
import { SearchBar } from './SearchBar'
import { RealEstateChatbot } from './RealEstateChatbot'

// Create context for sharing search data
interface DashboardContextType {
  searchData: any
  selectedCity: { name: string; state: string; lat: number; lng: number } | null
  setSearchData: (data: any) => void
  setSelectedCity: (city: { name: string; state: string; lat: number; lng: number } | null) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayout')
  }
  return context
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchData, setSearchData] = useState<any>(null)
  const [selectedCity, setSelectedCity] = useState<{ name: string; state: string; lat: number; lng: number } | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home, href: '/dashboard' },
    { id: 'map', name: 'Zone Map', icon: MapPin, href: '/dashboard/map' },
    { id: 'ai-scout', name: 'AI Scout', icon: Search, href: '/dashboard/ai-scout' },
    { id: 'property-screener', name: 'Property Screener', icon: TrendingUp, href: '/dashboard/property-screener' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
    { id: 'predictions', name: 'Predictions', icon: TrendingUp, href: '/dashboard/predictions' },
    { id: 'climate', name: 'Climate Risk', icon: Shield, href: '/dashboard/climate' },
    { id: 'favorites', name: 'Favorites', icon: Heart, href: '/dashboard/favorites' },
    { id: 'pricing', name: 'Pricing', icon: CreditCard, href: '/dashboard/pricing' },
    { id: 'settings', name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
  }

  const currentPage = navigation.find(item => item.href === pathname) || navigation[0]

  const contextValue: DashboardContextType = {
    searchData,
    selectedCity,
    setSearchData,
    setSelectedCity
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="h-screen w-screen bg-gray-50 flex overflow-hidden">
        {/* Mobile menu overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:shadow-none border-r border-gray-100 flex-shrink-0`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 rounded-lg p-2.5 shadow-sm">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    FutureLot.ai
                  </span>
                  <div className="text-xs text-gray-500">Real Estate Intelligence</div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 font-medium ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* AI Status */}
            <div className="p-4 bg-blue-50 border-t border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-800">AI Status: Active</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                150+ Cities • 100K+ Properties • 96.8% Accuracy
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
                </div>
                <span className="text-xs text-gray-600">97%</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-3 mb-4">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-10 w-10 rounded-full ring-2 ring-blue-200"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-600">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-0">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentPage.name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'Comprehensive real estate intelligence powered by AI'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">180+</div>
                    <div className="text-xs text-gray-600">Cities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">2.5M+</div>
                    <div className="text-xs text-gray-600">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600">97.2%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto bg-gray-50 h-full">
            <div className="max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Real Estate Chatbot */}
      <RealEstateChatbot />
    </DashboardContext.Provider>
  )
} 