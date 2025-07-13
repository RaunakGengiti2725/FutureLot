// Formatting utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Risk level utilities
export const getRiskColor = (level: 'Low' | 'Medium' | 'High'): string => {
  switch (level) {
    case 'Low':
      return 'text-green-600'
    case 'Medium':
      return 'text-yellow-600'
    case 'High':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const getRiskBgColor = (level: 'Low' | 'Medium' | 'High'): string => {
  switch (level) {
    case 'Low':
      return 'bg-green-100'
    case 'Medium':
      return 'bg-yellow-100'
    case 'High':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}

// Property utilities
export const getPropertyTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'house':
      return '🏠'
    case 'condo':
      return '🏢'
    case 'townhouse':
      return '🏘️'
    default:
      return '🏠'
  }
}

export const calculateROI = (
  currentValue: number,
  purchasePrice: number,
  annualRent: number,
  expenses: number = 0
): number => {
  const appreciation = currentValue - purchasePrice
  const netRentalIncome = annualRent - expenses
  const totalReturn = appreciation + netRentalIncome
  return (totalReturn / purchasePrice) * 100
}

export const calculateCapRate = (
  netOperatingIncome: number,
  propertyValue: number
): number => {
  return (netOperatingIncome / propertyValue) * 100
}

// Location utilities
export const parseLocation = (locationString: string): { city: string; state: string; country?: string } => {
  const parts = locationString.split(',').map(part => part.trim())
  
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2] || 'US'
    }
  }
  
  return { city: locationString, state: '', country: 'US' }
}

export const formatLocationName = (location: { city: string; state: string; country?: string }): string => {
  return `${location.city}, ${location.state}`
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Array utilities
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Local storage utilities
export const localStorage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
}

// URL utilities
export const createQueryString = (params: Record<string, string | number | boolean>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(queryString)
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
} 

// Standardized property value formatting
export function formatPropertyValue(value: number, options: {
  format?: 'full' | 'compact' | 'abbreviated'
  includeSymbol?: boolean
  precision?: number
} = {}): string {
  const { format = 'full', includeSymbol = true, precision = 0 } = options
  const symbol = includeSymbol ? '$' : ''
  
  if (format === 'compact') {
    // For values >= 1M, show as 1.2M
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`
    }
    // For values >= 1K, show as 750K
    if (value >= 1000) {
      return `${symbol}${Math.round(value / 1000)}K`
    }
    // For values < 1K, show full amount
    return `${symbol}${value.toLocaleString()}`
  }
  
  if (format === 'abbreviated') {
    // For values >= 1M, show as $1.2M
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`
    }
    // For values >= 100K, show as $750K
    if (value >= 100000) {
      return `${symbol}${Math.round(value / 1000)}K`
    }
    // For values < 100K, show full amount
    return `${symbol}${value.toLocaleString()}`
  }
  
  // Default 'full' format - always show complete number with commas
  return `${symbol}${value.toLocaleString()}`
}

// Standardized square footage formatting
export function formatSquareFootage(sqft: number): string {
  return `${sqft.toLocaleString()} sq ft`
}

// Standardized price per square foot formatting
export function formatPricePerSqft(pricePerSqft: number): string {
  return `$${pricePerSqft.toLocaleString()}/sq ft`
} 