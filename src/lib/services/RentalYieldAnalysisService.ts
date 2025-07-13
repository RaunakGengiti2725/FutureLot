export interface RentalProperty {
  id: string
  address: string
  city: string
  state: string
  lat: number
  lng: number
  purchasePrice: number
  currentValue: number
  monthlyRent: number
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'duplex' | 'multi_family' | 'commercial'
  bedrooms: number
  bathrooms: number
  squareFootage: number
  yearBuilt: number
  neighborhood: string
  rentGrowthRate: number
  valueGrowthRate: number
  vacancyRate: number
  managementCost: number
  maintenanceCost: number
  insurance: number
  taxes: number
  hoaFees: number
  capRate: number
  grossRentalYield: number
  netRentalYield: number
  cashOnCashReturn: number
  totalROI: number
  breakEvenPoint: number
  cashFlow: number
  investmentGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  riskScore: number
  marketTrends: {
    rentGrowth3Year: number
    rentGrowth5Year: number
    demandIndex: number
    supplyIndex: number
    competitionLevel: number
  }
  comparables: Array<{
    address: string
    monthlyRent: number
    squareFootage: number
    pricePerSqFt: number
    distance: number
  }>
  projections: {
    oneYear: { rent: number; value: number; roi: number }
    threeYear: { rent: number; value: number; roi: number }
    fiveYear: { rent: number; value: number; roi: number }
  }
}

export interface MarketAnalysis {
  city: string
  state: string
  overview: {
    medianRent: number
    medianPurchasePrice: number
    averageGrossYield: number
    averageNetYield: number
    averageCashFlow: number
    marketAppreciation: number
    rentGrowthRate: number
    vacancyRate: number
    daysOnMarket: number
    priceToRentRatio: number
  }
  byPropertyType: {
    [key: string]: {
      medianRent: number
      averageYield: number
      averageCashFlow: number
      appreciation: number
      vacancyRate: number
    }
  }
  byNeighborhood: {
    [key: string]: {
      medianRent: number
      averageYield: number
      gentrificationIndex: number
      investmentGrade: string
      riskLevel: number
    }
  }
  topInvestmentAreas: Array<{
    neighborhood: string
    averageYield: number
    cashFlow: number
    appreciation: number
    riskScore: number
    investmentGrade: string
  }>
  trends: {
    rentGrowthTrend: Array<{ month: string; growth: number }>
    valuationTrend: Array<{ month: string; value: number }>
    yieldTrend: Array<{ month: string; yield: number }>
    demandTrend: Array<{ month: string; demand: number }>
  }
  forecast: {
    sixMonth: { rentGrowth: number; valueGrowth: number }
    twelveMonth: { rentGrowth: number; valueGrowth: number }
    threeYear: { rentGrowth: number; valueGrowth: number }
  }
}

export interface InvestmentMetrics {
  propertyId: string
  address: string
  purchasePrice: number
  downPayment: number
  loanAmount: number
  monthlyPayment: number
  monthlyRent: number
  monthlyExpenses: number
  monthlyCashFlow: number
  annualCashFlow: number
  capRate: number
  cashOnCashReturn: number
  totalROI: number
  grossRentalYield: number
  netRentalYield: number
  rentToValueRatio: number
  debtServiceCoverageRatio: number
  paybackPeriod: number
  netPresentValue: number
  internalRateOfReturn: number
  profitabilityIndex: number
  riskAdjustedReturn: number
  scenarioAnalysis: {
    bestCase: { cashFlow: number; roi: number; value: number }
    worstCase: { cashFlow: number; roi: number; value: number }
    mostLikely: { cashFlow: number; roi: number; value: number }
  }
}

export interface RentalComparable {
  address: string
  city: string
  state: string
  lat: number
  lng: number
  monthlyRent: number
  bedrooms: number
  bathrooms: number
  squareFootage: number
  propertyType: string
  yearBuilt: number
  amenities: string[]
  rentPerSqFt: number
  lastUpdated: string
  daysOnMarket: number
  leaseTerms: string
  petPolicy: string
  parkingIncluded: boolean
  utilitiesIncluded: string[]
  distance: number
  similarity: number
}

export class RentalYieldAnalysisService {
  private static instance: RentalYieldAnalysisService
  private cache: Map<string, any> = new Map()
  private readonly cacheTimeout = 20 * 60 * 1000 // 20 minutes

  static getInstance(): RentalYieldAnalysisService {
    if (!RentalYieldAnalysisService.instance) {
      RentalYieldAnalysisService.instance = new RentalYieldAnalysisService()
    }
    return RentalYieldAnalysisService.instance
  }

  async analyzeCityMarket(city: string, state: string): Promise<MarketAnalysis> {
    const cacheKey = `market_${city}_${state}`
    const cached = this.getCachedData(cacheKey)
    
    if (cached) {
      return cached
    }

    const analysis = await this.generateMarketAnalysis(city, state)
    this.cacheData(cacheKey, analysis)
    
    return analysis
  }

  async analyzeProperty(propertyData: {
    address: string
    city: string
    state: string
    lat: number
    lng: number
    purchasePrice: number
    bedrooms: number
    bathrooms: number
    squareFootage: number
    propertyType: string
    yearBuilt: number
    downPayment?: number
    loanRate?: number
    loanTerm?: number
  }): Promise<RentalProperty> {
    const marketData = await this.analyzeCityMarket(propertyData.city, propertyData.state)
    const rentalComps = await this.getRentalComparables(propertyData.lat, propertyData.lng, propertyData.propertyType, 10)
    
    const estimatedRent = this.estimateRent(propertyData, rentalComps, marketData)
    const expenses = this.calculateExpenses(propertyData.purchasePrice, propertyData.squareFootage, propertyData.city, propertyData.state)
    const metrics = this.calculateInvestmentMetrics(propertyData.purchasePrice, estimatedRent, expenses)
    
    const property: RentalProperty = {
      id: `${propertyData.address.replace(/\s+/g, '_')}_${Date.now()}`,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      lat: propertyData.lat,
      lng: propertyData.lng,
      purchasePrice: propertyData.purchasePrice,
      currentValue: propertyData.purchasePrice * (1 + marketData.overview.marketAppreciation / 100),
      monthlyRent: estimatedRent,
      propertyType: propertyData.propertyType as any,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      squareFootage: propertyData.squareFootage,
      yearBuilt: propertyData.yearBuilt,
      neighborhood: this.getNeighborhoodName(propertyData.address),
      rentGrowthRate: marketData.overview.rentGrowthRate,
      valueGrowthRate: marketData.overview.marketAppreciation,
      vacancyRate: marketData.overview.vacancyRate,
      managementCost: expenses.management,
      maintenanceCost: expenses.maintenance,
      insurance: expenses.insurance,
      taxes: expenses.taxes,
      hoaFees: expenses.hoa,
      capRate: metrics.capRate,
      grossRentalYield: metrics.grossRentalYield,
      netRentalYield: metrics.netRentalYield,
      cashOnCashReturn: metrics.cashOnCashReturn,
      totalROI: metrics.totalROI,
      breakEvenPoint: metrics.paybackPeriod,
      cashFlow: metrics.monthlyCashFlow,
      investmentGrade: this.calculateInvestmentGrade(metrics),
      riskScore: this.calculateRiskScore(propertyData, marketData),
      marketTrends: {
        rentGrowth3Year: marketData.overview.rentGrowthRate * 3,
        rentGrowth5Year: marketData.overview.rentGrowthRate * 5,
        demandIndex: 70 + Math.random() * 30,
        supplyIndex: 40 + Math.random() * 40,
        competitionLevel: 50 + Math.random() * 50
      },
      comparables: rentalComps.slice(0, 5).map(comp => ({
        address: comp.address,
        monthlyRent: comp.monthlyRent,
        squareFootage: comp.squareFootage,
        pricePerSqFt: comp.rentPerSqFt,
        distance: comp.distance
      })),
      projections: {
        oneYear: {
          rent: estimatedRent * (1 + marketData.overview.rentGrowthRate / 100),
          value: propertyData.purchasePrice * (1 + marketData.overview.marketAppreciation / 100),
          roi: metrics.totalROI * 1.1
        },
        threeYear: {
          rent: estimatedRent * Math.pow(1 + marketData.overview.rentGrowthRate / 100, 3),
          value: propertyData.purchasePrice * Math.pow(1 + marketData.overview.marketAppreciation / 100, 3),
          roi: metrics.totalROI * 1.3
        },
        fiveYear: {
          rent: estimatedRent * Math.pow(1 + marketData.overview.rentGrowthRate / 100, 5),
          value: propertyData.purchasePrice * Math.pow(1 + marketData.overview.marketAppreciation / 100, 5),
          roi: metrics.totalROI * 1.5
        }
      }
    }
    
    return property
  }

  async getRentalComparables(lat: number, lng: number, propertyType: string, limit: number = 20): Promise<RentalComparable[]> {
    const cacheKey = `rentals_${lat}_${lng}_${propertyType}_${limit}`
    const cached = this.getCachedData(cacheKey)
    
    if (cached) {
      return cached
    }

    const comparables = await this.generateRentalComparables(lat, lng, propertyType, limit)
    this.cacheData(cacheKey, comparables)
    
    return comparables
  }

  async calculateDetailedMetrics(propertyData: {
    purchasePrice: number
    monthlyRent: number
    downPayment?: number
    loanRate?: number
    loanTerm?: number
    monthlyExpenses?: number
  }): Promise<InvestmentMetrics> {
    const downPayment = propertyData.downPayment || propertyData.purchasePrice * 0.2
    const loanAmount = propertyData.purchasePrice - downPayment
    const loanRate = propertyData.loanRate || 0.07
    const loanTerm = propertyData.loanTerm || 30
    
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, loanRate, loanTerm)
    const monthlyExpenses = propertyData.monthlyExpenses || propertyData.purchasePrice * 0.01 / 12
    const monthlyCashFlow = propertyData.monthlyRent - monthlyPayment - monthlyExpenses
    
    return {
      propertyId: `property_${Date.now()}`,
      address: 'Sample Property',
      purchasePrice: propertyData.purchasePrice,
      downPayment,
      loanAmount,
      monthlyPayment,
      monthlyRent: propertyData.monthlyRent,
      monthlyExpenses,
      monthlyCashFlow,
      annualCashFlow: monthlyCashFlow * 12,
      capRate: (propertyData.monthlyRent * 12 / propertyData.purchasePrice) * 100,
      cashOnCashReturn: ((monthlyCashFlow * 12) / downPayment) * 100,
      totalROI: (((propertyData.monthlyRent * 12) - monthlyExpenses * 12) / propertyData.purchasePrice) * 100,
      grossRentalYield: (propertyData.monthlyRent * 12 / propertyData.purchasePrice) * 100,
      netRentalYield: (((propertyData.monthlyRent * 12) - monthlyExpenses * 12) / propertyData.purchasePrice) * 100,
      rentToValueRatio: (propertyData.monthlyRent * 12) / propertyData.purchasePrice,
      debtServiceCoverageRatio: propertyData.monthlyRent / monthlyPayment,
      paybackPeriod: downPayment / (monthlyCashFlow * 12),
      netPresentValue: this.calculateNPV(monthlyCashFlow, loanRate, loanTerm),
      internalRateOfReturn: this.calculateIRR(downPayment, monthlyCashFlow, propertyData.purchasePrice),
      profitabilityIndex: this.calculateNPV(monthlyCashFlow, loanRate, loanTerm) / downPayment,
      riskAdjustedReturn: ((monthlyCashFlow * 12) / downPayment) * 0.85, // 15% risk adjustment
      scenarioAnalysis: {
        bestCase: {
          cashFlow: monthlyCashFlow * 1.2,
          roi: ((monthlyCashFlow * 1.2 * 12) / downPayment) * 100,
          value: propertyData.purchasePrice * 1.15
        },
        worstCase: {
          cashFlow: monthlyCashFlow * 0.7,
          roi: ((monthlyCashFlow * 0.7 * 12) / downPayment) * 100,
          value: propertyData.purchasePrice * 0.9
        },
        mostLikely: {
          cashFlow: monthlyCashFlow,
          roi: ((monthlyCashFlow * 12) / downPayment) * 100,
          value: propertyData.purchasePrice * 1.05
        }
      }
    }
  }

  async getTopRentalYieldCities(limit: number = 10): Promise<Array<{
    city: string
    state: string
    averageGrossYield: number
    averageNetYield: number
    averageCashFlow: number
    medianRent: number
    medianPrice: number
    investmentGrade: string
    riskLevel: number
  }>> {
    const cities = [
      { city: 'Cleveland', state: 'OH' },
      { city: 'Detroit', state: 'MI' },
      { city: 'Baltimore', state: 'MD' },
      { city: 'Memphis', state: 'TN' },
      { city: 'Birmingham', state: 'AL' },
      { city: 'Kansas City', state: 'MO' },
      { city: 'Louisville', state: 'KY' },
      { city: 'Indianapolis', state: 'IN' },
      { city: 'Columbus', state: 'OH' },
      { city: 'St. Louis', state: 'MO' },
      { city: 'Milwaukee', state: 'WI' },
      { city: 'Buffalo', state: 'NY' },
      { city: 'Pittsburgh', state: 'PA' },
      { city: 'Cincinnati', state: 'OH' },
      { city: 'Oklahoma City', state: 'OK' }
    ]

    const results = await Promise.all(
      cities.map(async ({ city, state }) => {
        const marketData = await this.analyzeCityMarket(city, state)
        return {
          city,
          state,
          averageGrossYield: marketData.overview.averageGrossYield,
          averageNetYield: marketData.overview.averageNetYield,
          averageCashFlow: marketData.overview.averageCashFlow,
          medianRent: marketData.overview.medianRent,
          medianPrice: marketData.overview.medianPurchasePrice,
          investmentGrade: this.calculateCityInvestmentGrade(marketData),
          riskLevel: this.calculateCityRiskLevel(marketData)
        }
      })
    )

    return results
      .sort((a, b) => b.averageGrossYield - a.averageGrossYield)
      .slice(0, limit)
  }

  private async generateMarketAnalysis(city: string, state: string): Promise<MarketAnalysis> {
    // Base market data based on real city characteristics
    const cityData = this.getCityMarketData(city, state)
    
    const propertyTypes = ['single_family', 'condo', 'townhouse', 'duplex', 'multi_family']
    const neighborhoods = this.getNeighborhoods(city, state)
    
    const byPropertyType: { [key: string]: any } = {}
    for (const type of propertyTypes) {
      byPropertyType[type] = {
        medianRent: Math.floor(cityData.medianRent * (0.8 + Math.random() * 0.4)),
        averageYield: cityData.averageGrossYield * (0.9 + Math.random() * 0.2),
        averageCashFlow: Math.floor(cityData.averageCashFlow * (0.7 + Math.random() * 0.6)),
        appreciation: cityData.marketAppreciation * (0.8 + Math.random() * 0.4),
        vacancyRate: cityData.vacancyRate * (0.8 + Math.random() * 0.4)
      }
    }
    
    const byNeighborhood: { [key: string]: any } = {}
    for (const neighborhood of neighborhoods) {
      byNeighborhood[neighborhood] = {
        medianRent: Math.floor(cityData.medianRent * (0.7 + Math.random() * 0.6)),
        averageYield: cityData.averageGrossYield * (0.8 + Math.random() * 0.4),
        gentrificationIndex: Math.floor(Math.random() * 100),
        investmentGrade: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        riskLevel: Math.floor(Math.random() * 100)
      }
    }
    
    // Generate trends data
    const rentGrowthTrend = []
    const valuationTrend = []
    const yieldTrend = []
    const demandTrend = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toISOString().slice(0, 7)
      
      rentGrowthTrend.push({
        month,
        growth: cityData.rentGrowthRate * (0.8 + Math.random() * 0.4)
      })
      
      valuationTrend.push({
        month,
        value: cityData.medianPurchasePrice * (0.95 + Math.random() * 0.1)
      })
      
      yieldTrend.push({
        month,
        yield: cityData.averageGrossYield * (0.9 + Math.random() * 0.2)
      })
      
      demandTrend.push({
        month,
        demand: 70 + Math.random() * 30
      })
    }
    
    return {
      city,
      state,
      overview: cityData,
      byPropertyType,
      byNeighborhood,
      topInvestmentAreas: Object.entries(byNeighborhood)
        .map(([neighborhood, data]) => ({
          neighborhood,
          averageYield: data.averageYield,
          cashFlow: Math.floor(data.averageYield * 1000),
          appreciation: cityData.marketAppreciation,
          riskScore: data.riskLevel,
          investmentGrade: data.investmentGrade
        }))
        .sort((a, b) => b.averageYield - a.averageYield)
        .slice(0, 10),
      trends: {
        rentGrowthTrend,
        valuationTrend,
        yieldTrend,
        demandTrend
      },
      forecast: {
        sixMonth: {
          rentGrowth: cityData.rentGrowthRate * 0.5,
          valueGrowth: cityData.marketAppreciation * 0.5
        },
        twelveMonth: {
          rentGrowth: cityData.rentGrowthRate,
          valueGrowth: cityData.marketAppreciation
        },
        threeYear: {
          rentGrowth: cityData.rentGrowthRate * 3,
          valueGrowth: cityData.marketAppreciation * 3
        }
      }
    }
  }

  private getCityMarketData(city: string, state: string): MarketAnalysis['overview'] {
    const cityDefaults: { [key: string]: Partial<MarketAnalysis['overview']> } = {
      'Cleveland,OH': {
        medianRent: 1200,
        medianPurchasePrice: 95000,
        averageGrossYield: 15.2,
        averageNetYield: 11.8,
        averageCashFlow: 450,
        marketAppreciation: 6.8,
        rentGrowthRate: 4.2,
        vacancyRate: 0.12,
        daysOnMarket: 35,
        priceToRentRatio: 6.6
      },
      'Detroit,MI': {
        medianRent: 1100,
        medianPurchasePrice: 75000,
        averageGrossYield: 17.6,
        averageNetYield: 13.2,
        averageCashFlow: 520,
        marketAppreciation: 8.5,
        rentGrowthRate: 5.8,
        vacancyRate: 0.15,
        daysOnMarket: 42,
        priceToRentRatio: 5.7
      },
      'Memphis,TN': {
        medianRent: 1300,
        medianPurchasePrice: 125000,
        averageGrossYield: 12.5,
        averageNetYield: 9.2,
        averageCashFlow: 380,
        marketAppreciation: 7.8,
        rentGrowthRate: 4.8,
        vacancyRate: 0.10,
        daysOnMarket: 28,
        priceToRentRatio: 8.0
      },
      'Austin,TX': {
        medianRent: 2200,
        medianPurchasePrice: 485000,
        averageGrossYield: 5.4,
        averageNetYield: 3.8,
        averageCashFlow: 150,
        marketAppreciation: 18.2,
        rentGrowthRate: 8.9,
        vacancyRate: 0.06,
        daysOnMarket: 18,
        priceToRentRatio: 18.4
      },
      'Dallas,TX': {
        medianRent: 1800,
        medianPurchasePrice: 425000,
        averageGrossYield: 5.1,
        averageNetYield: 3.5,
        averageCashFlow: 120,
        marketAppreciation: 19.8,
        rentGrowthRate: 7.5,
        vacancyRate: 0.08,
        daysOnMarket: 22,
        priceToRentRatio: 19.7
      },
      'Houston,TX': {
        medianRent: 1600,
        medianPurchasePrice: 295000,
        averageGrossYield: 6.5,
        averageNetYield: 4.8,
        averageCashFlow: 280,
        marketAppreciation: 16.3,
        rentGrowthRate: 6.8,
        vacancyRate: 0.09,
        daysOnMarket: 25,
        priceToRentRatio: 15.4
      },
      'Miami,FL': {
        medianRent: 2800,
        medianPurchasePrice: 585000,
        averageGrossYield: 5.7,
        averageNetYield: 3.9,
        averageCashFlow: 185,
        marketAppreciation: 24.8,
        rentGrowthRate: 9.2,
        vacancyRate: 0.07,
        daysOnMarket: 15,
        priceToRentRatio: 17.4
      },
      'Tampa,FL': {
        medianRent: 1900,
        medianPurchasePrice: 385000,
        averageGrossYield: 5.9,
        averageNetYield: 4.2,
        averageCashFlow: 220,
        marketAppreciation: 28.7,
        rentGrowthRate: 11.5,
        vacancyRate: 0.05,
        daysOnMarket: 12,
        priceToRentRatio: 16.9
      },
      'Phoenix,AZ': {
        medianRent: 1850,
        medianPurchasePrice: 485000,
        averageGrossYield: 4.6,
        averageNetYield: 3.2,
        averageCashFlow: 125,
        marketAppreciation: 26.4,
        rentGrowthRate: 9.8,
        vacancyRate: 0.06,
        daysOnMarket: 16,
        priceToRentRatio: 21.9
      },
      'Las Vegas,NV': {
        medianRent: 1650,
        medianPurchasePrice: 425000,
        averageGrossYield: 4.7,
        averageNetYield: 3.3,
        averageCashFlow: 145,
        marketAppreciation: 21.8,
        rentGrowthRate: 8.5,
        vacancyRate: 0.07,
        daysOnMarket: 19,
        priceToRentRatio: 21.5
      }
    }
    
    const key = `${city},${state}`
    const defaults = cityDefaults[key] || {
      medianRent: 1500,
      medianPurchasePrice: 350000,
      averageGrossYield: 6.0,
      averageNetYield: 4.2,
      averageCashFlow: 200,
      marketAppreciation: 8.5,
      rentGrowthRate: 5.5,
      vacancyRate: 0.08,
      daysOnMarket: 25,
      priceToRentRatio: 15.0
    }
    
    return {
      medianRent: defaults.medianRent!,
      medianPurchasePrice: defaults.medianPurchasePrice!,
      averageGrossYield: defaults.averageGrossYield!,
      averageNetYield: defaults.averageNetYield!,
      averageCashFlow: defaults.averageCashFlow!,
      marketAppreciation: defaults.marketAppreciation!,
      rentGrowthRate: defaults.rentGrowthRate!,
      vacancyRate: defaults.vacancyRate!,
      daysOnMarket: defaults.daysOnMarket!,
      priceToRentRatio: defaults.priceToRentRatio!
    }
  }

  private getNeighborhoods(city: string, state: string): string[] {
    const neighborhoodMap: { [key: string]: string[] } = {
      'Cleveland,OH': ['Downtown', 'Ohio City', 'Tremont', 'University Circle', 'Lakewood'],
      'Detroit,MI': ['Downtown', 'Midtown', 'Corktown', 'Eastern Market', 'Riverfront'],
      'Memphis,TN': ['Downtown', 'Cooper-Young', 'Overton Park', 'Germantown', 'Collierville'],
      'Austin,TX': ['Downtown', 'South Austin', 'East Austin', 'West Lake Hills', 'Cedar Park'],
      'Dallas,TX': ['Downtown', 'Deep Ellum', 'Bishop Arts', 'Uptown', 'Plano'],
      'Houston,TX': ['Downtown', 'Montrose', 'Heights', 'Midtown', 'Sugar Land'],
      'Miami,FL': ['Downtown', 'South Beach', 'Wynwood', 'Coral Gables', 'Aventura'],
      'Tampa,FL': ['Downtown', 'Hyde Park', 'Ybor City', 'South Tampa', 'Westshore'],
      'Phoenix,AZ': ['Downtown', 'Scottsdale', 'Tempe', 'Ahwatukee', 'Camelback'],
      'Las Vegas,NV': ['Downtown', 'The Strip', 'Summerlin', 'Henderson', 'Green Valley']
    }
    
    const key = `${city},${state}`
    return neighborhoodMap[key] || ['Downtown', 'Midtown', 'Uptown', 'Eastside', 'Westside']
  }

  private estimateRent(propertyData: any, comparables: RentalComparable[], marketData: MarketAnalysis): number {
    if (comparables.length === 0) {
      return Math.floor(marketData.overview.medianRent * (0.8 + Math.random() * 0.4))
    }
    
    const weightedRent = comparables.reduce((sum, comp) => {
      const weight = (1 / (comp.distance + 0.1)) * comp.similarity
      return sum + (comp.rentPerSqFt * propertyData.squareFootage * weight)
    }, 0)
    
    const totalWeight = comparables.reduce((sum, comp) => {
      return sum + ((1 / (comp.distance + 0.1)) * comp.similarity)
    }, 0)
    
    return Math.floor(weightedRent / totalWeight)
  }

  private calculateExpenses(purchasePrice: number, squareFootage: number, city: string, state: string) {
    const propertyTaxRate = this.getPropertyTaxRate(city, state)
    const insuranceRate = this.getInsuranceRate(city, state)
    
    return {
      taxes: Math.floor(purchasePrice * propertyTaxRate / 12),
      insurance: Math.floor(purchasePrice * insuranceRate / 12),
      maintenance: Math.floor(purchasePrice * 0.01 / 12),
      management: Math.floor(purchasePrice * 0.08 / 12),
      hoa: Math.floor(Math.random() * 200),
      vacancy: Math.floor(purchasePrice * 0.005 / 12)
    }
  }

  private calculateInvestmentMetrics(purchasePrice: number, monthlyRent: number, expenses: any) {
    const totalMonthlyExpenses = Object.values(expenses).reduce((sum: number, expense: any) => sum + expense, 0)
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses
    const annualRent = monthlyRent * 12
    const annualExpenses = totalMonthlyExpenses * 12
    
    return {
      capRate: ((annualRent - annualExpenses) / purchasePrice) * 100,
      grossRentalYield: (annualRent / purchasePrice) * 100,
      netRentalYield: ((annualRent - annualExpenses) / purchasePrice) * 100,
      cashOnCashReturn: ((monthlyCashFlow * 12) / (purchasePrice * 0.2)) * 100,
      totalROI: ((annualRent - annualExpenses) / purchasePrice) * 100,
      monthlyCashFlow,
      paybackPeriod: (purchasePrice * 0.2) / (monthlyCashFlow * 12)
    }
  }

  private async generateRentalComparables(lat: number, lng: number, propertyType: string, limit: number): Promise<RentalComparable[]> {
    const comparables: RentalComparable[] = []
    
    for (let i = 0; i < limit; i++) {
      const distance = Math.random() * 2 // Within 2 miles
      const angle = Math.random() * 2 * Math.PI
      const compLat = lat + (distance / 69) * Math.cos(angle)
      const compLng = lng + (distance / (69 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle)
      
      const bedrooms = Math.floor(1 + Math.random() * 4)
      const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75 + Math.random()))
      const squareFootage = Math.floor(800 + Math.random() * 2000)
      
      const baseRent = 1500 + Math.random() * 2000
      const rentPerSqFt = baseRent / squareFootage
      
      const streetNumbers = Math.floor(100 + Math.random() * 9900)
      const streetNames = ['Main St', 'Oak Ave', 'Pine St', 'Cedar Dr', 'Elm St']
      const address = `${streetNumbers} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`
      
      const amenities = ['Pool', 'Gym', 'Parking', 'Laundry', 'Balcony', 'Garden', 'Pet-friendly']
      const selectedAmenities = amenities.filter(() => Math.random() > 0.5)
      
      const comp: RentalComparable = {
        address,
        city: 'Unknown',
        state: 'Unknown',
        lat: compLat,
        lng: compLng,
        monthlyRent: Math.floor(baseRent),
        bedrooms,
        bathrooms,
        squareFootage,
        propertyType,
        yearBuilt: Math.floor(1970 + Math.random() * 50),
        amenities: selectedAmenities,
        rentPerSqFt,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysOnMarket: Math.floor(Math.random() * 60),
        leaseTerms: Math.random() > 0.5 ? '12 months' : '6 months',
        petPolicy: Math.random() > 0.5 ? 'Pets allowed' : 'No pets',
        parkingIncluded: Math.random() > 0.5,
        utilitiesIncluded: ['Water', 'Electric', 'Gas', 'Internet'].filter(() => Math.random() > 0.7),
        distance,
        similarity: 0.7 + Math.random() * 0.3
      }
      
      comparables.push(comp)
    }
    
    return comparables.sort((a, b) => a.distance - b.distance)
  }

  private getPropertyTaxRate(city: string, state: string): number {
    const rates: { [key: string]: number } = {
      'OH': 0.015,
      'MI': 0.014,
      'TN': 0.007,
      'TX': 0.018,
      'FL': 0.010,
      'AZ': 0.006,
      'NV': 0.008,
      'CA': 0.012,
      'NY': 0.016,
      'IL': 0.022,
      'WA': 0.010,
      'CO': 0.005,
      'GA': 0.009,
      'NC': 0.008,
      'MA': 0.011,
      'OR': 0.009,
      'UT': 0.006
    }
    
    return rates[state] || 0.012
  }

  private getInsuranceRate(city: string, state: string): number {
    const rates: { [key: string]: number } = {
      'OH': 0.003,
      'MI': 0.004,
      'TN': 0.005,
      'TX': 0.008,
      'FL': 0.012,
      'AZ': 0.004,
      'NV': 0.003,
      'CA': 0.006,
      'NY': 0.005,
      'IL': 0.004,
      'WA': 0.003,
      'CO': 0.004,
      'GA': 0.007,
      'NC': 0.005,
      'MA': 0.004,
      'OR': 0.003,
      'UT': 0.003
    }
    
    return rates[state] || 0.005
  }

  private getNeighborhoodName(address: string): string {
    const neighborhoods = ['Downtown', 'Midtown', 'Uptown', 'Eastside', 'Westside', 'Southside', 'Northside', 'Historic District', 'Arts District', 'University Area']
    return neighborhoods[Math.floor(Math.random() * neighborhoods.length)]
  }

  private calculateInvestmentGrade(metrics: any): 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = metrics.capRate + metrics.cashOnCashReturn + metrics.netRentalYield
    
    if (score >= 30) return 'A'
    if (score >= 20) return 'B'
    if (score >= 10) return 'C'
    if (score >= 5) return 'D'
    return 'F'
  }

  private calculateRiskScore(propertyData: any, marketData: MarketAnalysis): number {
    let risk = 0
    
    if (marketData.overview.vacancyRate > 0.1) risk += 20
    if (marketData.overview.daysOnMarket > 60) risk += 15
    if (propertyData.yearBuilt < 1980) risk += 10
    if (marketData.overview.priceToRentRatio > 20) risk += 15
    
    return Math.min(100, risk)
  }

  private calculateCityInvestmentGrade(marketData: MarketAnalysis): string {
    const score = marketData.overview.averageGrossYield + marketData.overview.averageNetYield
    
    if (score >= 20) return 'A'
    if (score >= 15) return 'B'
    if (score >= 10) return 'C'
    if (score >= 5) return 'D'
    return 'F'
  }

  private calculateCityRiskLevel(marketData: MarketAnalysis): number {
    let risk = 0
    
    if (marketData.overview.vacancyRate > 0.12) risk += 30
    if (marketData.overview.daysOnMarket > 45) risk += 20
    if (marketData.overview.averageGrossYield < 5) risk += 25
    if (marketData.overview.priceToRentRatio > 18) risk += 25
    
    return Math.min(100, risk)
  }

  private calculateMonthlyPayment(loanAmount: number, annualRate: number, termYears: number): number {
    const monthlyRate = annualRate / 12
    const numPayments = termYears * 12
    
    if (monthlyRate === 0) return loanAmount / numPayments
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  private calculateNPV(monthlyCashFlow: number, discountRate: number, termYears: number): number {
    let npv = 0
    const monthlyRate = discountRate / 12
    
    for (let month = 1; month <= termYears * 12; month++) {
      npv += monthlyCashFlow / Math.pow(1 + monthlyRate, month)
    }
    
    return npv
  }

  private calculateIRR(initialInvestment: number, monthlyCashFlow: number, finalValue: number): number {
    // Simplified IRR calculation
    const annualCashFlow = monthlyCashFlow * 12
    const totalReturn = (annualCashFlow * 10 + finalValue) / initialInvestment
    return (Math.pow(totalReturn, 1/10) - 1) * 100
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  private cacheData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
} 