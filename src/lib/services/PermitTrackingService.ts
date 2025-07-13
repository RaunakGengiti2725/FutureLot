export interface PermitData {
  id: string
  permitNumber: string
  type: 'residential' | 'commercial' | 'mixed_use' | 'infrastructure' | 'renovation'
  subtype: string
  status: 'filed' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  address: string
  city: string
  state: string
  zipCode: string
  lat: number
  lng: number
  filedDate: string
  approvedDate?: string
  completedDate?: string
  estimatedCompletion?: string
  valuation: number
  squareFootage: number
  units: number
  floors: number
  description: string
  developer: string
  contractor: string
  architect?: string
  impactRadius: number // in miles
  impactScore: number // 0-100
  gentrificationPotential: number // 0-100
  investmentImplication: {
    propertyValueImpact: number // percentage
    rentalDemandImpact: number
    timeframe: string
    confidence: number
  }
}

export interface DevelopmentCluster {
  id: string
  name: string
  center: { lat: number; lng: number }
  radius: number
  permits: PermitData[]
  totalInvestment: number
  totalUnits: number
  averageImpactScore: number
  gentrificationRisk: number
  timeline: {
    startDate: string
    peakActivity: string
    estimatedCompletion: string
  }
  marketImpact: {
    propertyValueIncrease: number
    rentalPriceIncrease: number
    demandIncrease: number
    supplyIncrease: number
  }
}

export interface TransitProject {
  id: string
  name: string
  type: 'subway' | 'light_rail' | 'bus_rapid_transit' | 'highway' | 'bridge'
  status: 'proposed' | 'planned' | 'approved' | 'construction' | 'completed'
  route: Array<{ lat: number; lng: number; stationName?: string }>
  budget: number
  timeline: {
    announced: string
    startConstruction: string
    estimatedCompletion: string
  }
  impactZones: Array<{
    center: { lat: number; lng: number }
    radius: number
    valueImpact: number
    accessibility: number
  }>
  ridership: {
    projected: number
    current?: number
  }
}

export interface InfrastructureProject {
  id: string
  name: string
  type: 'school' | 'hospital' | 'park' | 'shopping_center' | 'office_complex' | 'stadium' | 'airport'
  status: 'proposed' | 'approved' | 'construction' | 'completed'
  location: { lat: number; lng: number }
  address: string
  city: string
  state: string
  investment: number
  timeline: {
    announced: string
    startDate: string
    completionDate: string
  }
  impact: {
    propertyValueRadius: number
    valueIncrease: number
    jobsCreated: number
    populationAttraction: number
  }
}

export class PermitTrackingService {
  private static instance: PermitTrackingService
  private cache: Map<string, any> = new Map()
  private readonly cacheTimeout = 30 * 60 * 1000 // 30 minutes

  static getInstance(): PermitTrackingService {
    if (!PermitTrackingService.instance) {
      PermitTrackingService.instance = new PermitTrackingService()
    }
    return PermitTrackingService.instance
  }

  async getPermitsByCity(city: string, state: string, limit: number = 100): Promise<PermitData[]> {
    const cacheKey = `permits_${city}_${state}_${limit}`
    const cached = this.getCachedData(cacheKey)
    
    if (cached) {
      return cached
    }

    const permits = await this.generatePermitsForCity(city, state, limit)
    this.cacheData(cacheKey, permits)
    
    return permits
  }

  async getPermitsByLocation(lat: number, lng: number, radius: number = 5, limit: number = 50): Promise<PermitData[]> {
    const cacheKey = `permits_location_${lat}_${lng}_${radius}_${limit}`
    const cached = this.getCachedData(cacheKey)
    
    if (cached) {
      return cached
    }

    const permits = await this.generatePermitsForLocation(lat, lng, radius, limit)
    this.cacheData(cacheKey, permits)
    
    return permits
  }

  async getDevelopmentClusters(city: string, state: string): Promise<DevelopmentCluster[]> {
    const permits = await this.getPermitsByCity(city, state, 500)
    return this.identifyDevelopmentClusters(permits)
  }

  async getTransitProjects(city: string, state: string): Promise<TransitProject[]> {
    const cacheKey = `transit_${city}_${state}`
    const cached = this.getCachedData(cacheKey)
    
    if (cached) {
      return cached
    }

    const projects = await this.generateTransitProjects(city, state)
    this.cacheData(cacheKey, projects)
    
    return projects
  }

  async getInfrastructureProjects(city: string, state: string): Promise<InfrastructureProject[]> {
    const cacheKey = `infrastructure_${city}_${state}`
    const cached = this.getCachedData(cacheKey)
    
    if (cached) {
      return cached
    }

    const projects = await this.generateInfrastructureProjects(city, state)
    this.cacheData(cacheKey, projects)
    
    return projects
  }

  async getPermitActivityScore(lat: number, lng: number, radius: number = 2): Promise<number> {
    const permits = await this.getPermitsByLocation(lat, lng, radius, 100)
    
    if (permits.length === 0) return 0
    
    const recentPermits = permits.filter(p => {
      const filedDate = new Date(p.filedDate)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return filedDate > sixMonthsAgo
    })
    
    const totalValue = recentPermits.reduce((sum, p) => sum + p.valuation, 0)
    const totalUnits = recentPermits.reduce((sum, p) => sum + p.units, 0)
    
    // Score based on recent activity, investment value, and unit count
    const activityScore = Math.min(100, (recentPermits.length / 10) * 100)
    const valueScore = Math.min(100, (totalValue / 10000000) * 100)
    const unitScore = Math.min(100, (totalUnits / 100) * 100)
    
    return Math.round((activityScore + valueScore + unitScore) / 3)
  }

  async getGentrificationRisk(city: string, state: string, neighborhoodName: string): Promise<number> {
    const permits = await this.getPermitsByCity(city, state, 1000)
    const neighborhoodPermits = permits.filter(p => 
      p.description.toLowerCase().includes(neighborhoodName.toLowerCase()) ||
      p.address.toLowerCase().includes(neighborhoodName.toLowerCase())
    )
    
    if (neighborhoodPermits.length === 0) return 0
    
    const luxuryPermits = neighborhoodPermits.filter(p => 
      p.valuation > 1000000 || 
      p.description.toLowerCase().includes('luxury') ||
      p.description.toLowerCase().includes('premium')
    )
    
    const mixedUsePermits = neighborhoodPermits.filter(p => p.type === 'mixed_use')
    const commercialPermits = neighborhoodPermits.filter(p => p.type === 'commercial')
    
    const luxuryRatio = luxuryPermits.length / neighborhoodPermits.length
    const mixedUseRatio = mixedUsePermits.length / neighborhoodPermits.length
    const commercialRatio = commercialPermits.length / neighborhoodPermits.length
    
    return Math.round((luxuryRatio + mixedUseRatio + commercialRatio) * 100)
  }

  private async generatePermitsForCity(city: string, state: string, limit: number): Promise<PermitData[]> {
    const permits: PermitData[] = []
    
    // Get city center coordinates (simplified - in real app would use geocoding)
    const cityCoords = this.getCityCoordinates(city, state)
    
    for (let i = 0; i < limit; i++) {
      const permit = this.generatePermit(city, state, cityCoords, i)
      permits.push(permit)
    }
    
    return permits.sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime())
  }

  private async generatePermitsForLocation(lat: number, lng: number, radius: number, limit: number): Promise<PermitData[]> {
    const permits: PermitData[] = []
    
    for (let i = 0; i < limit; i++) {
      const angle = Math.random() * 2 * Math.PI
      const distance = Math.random() * radius
      const offsetLat = (distance / 69) * Math.cos(angle) // 69 miles per degree latitude
      const offsetLng = (distance / (69 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle)
      
      const permitLat = lat + offsetLat
      const permitLng = lng + offsetLng
      
      const permit = this.generatePermit('Unknown', 'Unknown', { lat: permitLat, lng: permitLng }, i)
      permits.push(permit)
    }
    
    return permits.sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime())
  }

  private generatePermit(city: string, state: string, coords: { lat: number; lng: number }, index: number): PermitData {
    const types: PermitData['type'][] = ['residential', 'commercial', 'mixed_use', 'infrastructure', 'renovation']
    const subtypes = {
      residential: ['Single Family Home', 'Apartment Complex', 'Condominium', 'Townhouse', 'Affordable Housing'],
      commercial: ['Office Building', 'Retail Store', 'Restaurant', 'Hotel', 'Warehouse'],
      mixed_use: ['Mixed Use Development', 'Live/Work Space', 'Transit-Oriented Development'],
      infrastructure: ['Road Improvement', 'Water System', 'Electrical Grid', 'Telecommunications'],
      renovation: ['Home Renovation', 'Building Modernization', 'Historic Restoration']
    }
    
    const type = types[Math.floor(Math.random() * types.length)]
    const subtype = subtypes[type][Math.floor(Math.random() * subtypes[type].length)]
    
    const statuses: PermitData['status'][] = ['filed', 'approved', 'in_progress', 'completed', 'rejected']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const filedDate = new Date()
    filedDate.setDate(filedDate.getDate() - Math.floor(Math.random() * 730)) // Random date within last 2 years
    
    const lat = coords.lat + (Math.random() - 0.5) * 0.1
    const lng = coords.lng + (Math.random() - 0.5) * 0.1
    
    const streetNumbers = Math.floor(100 + Math.random() * 9900)
    const streetNames = ['Main St', 'Oak Ave', 'Pine St', 'Cedar Dr', 'Elm St', 'First Ave', 'Second St', 'Park Blvd']
    const address = `${streetNumbers} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`
    
    const valuation = this.generateValuation(type, subtype)
    const squareFootage = this.generateSquareFootage(type, subtype)
    const units = this.generateUnits(type, subtype)
    const floors = type === 'residential' ? Math.floor(1 + Math.random() * 4) : Math.floor(1 + Math.random() * 20)
    
    const developers = ['ABC Development', 'XYZ Construction', 'Premier Builders', 'Urban Development Group', 'City Planning Corp']
    const contractors = ['BuildCorp', 'Construction Plus', 'Metro Builders', 'Quality Construction', 'Reliable Contractors']
    
    const impactScore = this.calculateImpactScore(type, valuation, units, squareFootage)
    const gentrificationPotential = this.calculateGentrificationPotential(type, valuation, subtype)
    
    return {
      id: `permit_${city}_${index}`,
      permitNumber: `P${String(index).padStart(6, '0')}`,
      type,
      subtype,
      status,
      address,
      city,
      state,
      zipCode: this.generateZipCode(city, state),
      lat,
      lng,
      filedDate: filedDate.toISOString().split('T')[0],
      approvedDate: status !== 'filed' ? new Date(filedDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      completedDate: status === 'completed' ? new Date(filedDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      estimatedCompletion: status === 'in_progress' ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      valuation,
      squareFootage,
      units,
      floors,
      description: `${subtype} - ${valuation.toLocaleString()} investment`,
      developer: developers[Math.floor(Math.random() * developers.length)],
      contractor: contractors[Math.floor(Math.random() * contractors.length)],
      architect: Math.random() > 0.5 ? 'Architectural Partners' : undefined,
      impactRadius: this.calculateImpactRadius(valuation, type),
      impactScore,
      gentrificationPotential,
      investmentImplication: {
        propertyValueImpact: this.calculatePropertyValueImpact(type, valuation, units),
        rentalDemandImpact: this.calculateRentalDemandImpact(type, units),
        timeframe: this.calculateTimeframe(type, status),
        confidence: Math.floor(60 + Math.random() * 30)
      }
    }
  }

  private generateValuation(type: PermitData['type'], subtype: string): number {
    const baseValues = {
      residential: 500000,
      commercial: 2000000,
      mixed_use: 5000000,
      infrastructure: 1000000,
      renovation: 100000
    }
    
    const multiplier = 0.3 + Math.random() * 2.0
    return Math.floor(baseValues[type] * multiplier)
  }

  private generateSquareFootage(type: PermitData['type'], subtype: string): number {
    const baseSizes = {
      residential: 2000,
      commercial: 10000,
      mixed_use: 50000,
      infrastructure: 5000,
      renovation: 1500
    }
    
    const multiplier = 0.5 + Math.random() * 3.0
    return Math.floor(baseSizes[type] * multiplier)
  }

  private generateUnits(type: PermitData['type'], subtype: string): number {
    if (type === 'residential') {
      if (subtype.includes('Single Family')) return 1
      if (subtype.includes('Apartment') || subtype.includes('Affordable')) return Math.floor(20 + Math.random() * 200)
      if (subtype.includes('Condominium')) return Math.floor(5 + Math.random() * 50)
      if (subtype.includes('Townhouse')) return Math.floor(3 + Math.random() * 12)
    }
    
    if (type === 'mixed_use') {
      return Math.floor(10 + Math.random() * 100)
    }
    
    return 1
  }

  private calculateImpactScore(type: PermitData['type'], valuation: number, units: number, squareFootage: number): number {
    let score = 0
    
    // Valuation impact (0-40 points)
    score += Math.min(40, (valuation / 10000000) * 40)
    
    // Units impact (0-30 points)
    score += Math.min(30, (units / 100) * 30)
    
    // Size impact (0-20 points)
    score += Math.min(20, (squareFootage / 50000) * 20)
    
    // Type impact (0-10 points)
    const typeScores = {
      mixed_use: 10,
      commercial: 8,
      residential: 6,
      infrastructure: 5,
      renovation: 3
    }
    score += typeScores[type]
    
    return Math.round(score)
  }

  private calculateGentrificationPotential(type: PermitData['type'], valuation: number, subtype: string): number {
    let potential = 0
    
    if (type === 'mixed_use') potential += 30
    if (type === 'commercial' && subtype.includes('Office')) potential += 25
    if (valuation > 5000000) potential += 20
    if (valuation > 10000000) potential += 15
    if (subtype.toLowerCase().includes('luxury')) potential += 20
    if (subtype.toLowerCase().includes('premium')) potential += 15
    
    return Math.min(100, potential)
  }

  private calculatePropertyValueImpact(type: PermitData['type'], valuation: number, units: number): number {
    let impact = 0
    
    if (type === 'mixed_use') impact += 8
    if (type === 'commercial') impact += 6
    if (type === 'residential') impact += 4
    if (type === 'infrastructure') impact += 3
    
    if (valuation > 5000000) impact += 3
    if (valuation > 10000000) impact += 2
    
    if (units > 50) impact += 2
    if (units > 100) impact += 1
    
    return Math.min(15, impact)
  }

  private calculateRentalDemandImpact(type: PermitData['type'], units: number): number {
    let impact = 0
    
    if (type === 'residential') impact += units * 0.1
    if (type === 'mixed_use') impact += units * 0.05
    if (type === 'commercial') impact += 2
    
    return Math.min(10, impact)
  }

  private calculateTimeframe(type: PermitData['type'], status: PermitData['status']): string {
    if (status === 'completed') return 'Immediate'
    if (status === 'in_progress') return '6-18 months'
    if (status === 'approved') return '1-3 years'
    return '2-5 years'
  }

  private calculateImpactRadius(valuation: number, type: PermitData['type']): number {
    let radius = 0.5 // base radius in miles
    
    if (valuation > 10000000) radius += 1.5
    else if (valuation > 5000000) radius += 1.0
    else if (valuation > 1000000) radius += 0.5
    
    if (type === 'infrastructure') radius += 1.0
    if (type === 'mixed_use') radius += 0.5
    if (type === 'commercial') radius += 0.3
    
    return Math.round(radius * 10) / 10
  }

  private identifyDevelopmentClusters(permits: PermitData[]): DevelopmentCluster[] {
    const clusters: DevelopmentCluster[] = []
    const clusteredPermits = new Set<string>()
    
    for (const permit of permits) {
      if (clusteredPermits.has(permit.id)) continue
      
      const nearbyPermits = permits.filter(p => 
        !clusteredPermits.has(p.id) &&
        this.calculateDistance(permit.lat, permit.lng, p.lat, p.lng) <= 1 // 1 mile radius
      )
      
      if (nearbyPermits.length >= 5) { // Minimum 5 permits to form a cluster
        const cluster = this.createCluster(nearbyPermits)
        clusters.push(cluster)
        
        nearbyPermits.forEach(p => clusteredPermits.add(p.id))
      }
    }
    
    return clusters.sort((a, b) => b.totalInvestment - a.totalInvestment)
  }

  private createCluster(permits: PermitData[]): DevelopmentCluster {
    const totalInvestment = permits.reduce((sum, p) => sum + p.valuation, 0)
    const totalUnits = permits.reduce((sum, p) => sum + p.units, 0)
    const avgImpactScore = permits.reduce((sum, p) => sum + p.impactScore, 0) / permits.length
    const avgGentrificationRisk = permits.reduce((sum, p) => sum + p.gentrificationPotential, 0) / permits.length
    
    const centerLat = permits.reduce((sum, p) => sum + p.lat, 0) / permits.length
    const centerLng = permits.reduce((sum, p) => sum + p.lng, 0) / permits.length
    
    const dates = permits.map(p => new Date(p.filedDate)).sort((a, b) => a.getTime() - b.getTime())
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]
    
    return {
      id: `cluster_${permits[0].city}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${permits[0].city} Development Cluster`,
      center: { lat: centerLat, lng: centerLng },
      radius: 1,
      permits,
      totalInvestment,
      totalUnits,
      averageImpactScore: Math.round(avgImpactScore),
      gentrificationRisk: Math.round(avgGentrificationRisk),
      timeline: {
        startDate: startDate.toISOString().split('T')[0],
        peakActivity: new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2).toISOString().split('T')[0],
        estimatedCompletion: new Date(endDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      marketImpact: {
        propertyValueIncrease: Math.min(25, totalInvestment / 10000000 * 5),
        rentalPriceIncrease: Math.min(20, totalUnits / 100 * 3),
        demandIncrease: Math.min(30, avgImpactScore / 10 * 3),
        supplyIncrease: Math.min(15, totalUnits / 200 * 15)
      }
    }
  }

  private async generateTransitProjects(city: string, state: string): Promise<TransitProject[]> {
    const projects: TransitProject[] = []
    const cityCoords = this.getCityCoordinates(city, state)
    
    // Generate 2-5 transit projects per city
    const projectCount = Math.floor(2 + Math.random() * 4)
    
    for (let i = 0; i < projectCount; i++) {
      const project = this.generateTransitProject(city, state, cityCoords, i)
      projects.push(project)
    }
    
    return projects
  }

  private generateTransitProject(city: string, state: string, coords: { lat: number; lng: number }, index: number): TransitProject {
    const types: TransitProject['type'][] = ['subway', 'light_rail', 'bus_rapid_transit', 'highway', 'bridge']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const statuses: TransitProject['status'][] = ['proposed', 'planned', 'approved', 'construction', 'completed']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const names = {
      subway: ['Metro Line', 'Underground Extension', 'Subway Expansion'],
      light_rail: ['Light Rail Line', 'Tram Extension', 'Rail Connection'],
      bus_rapid_transit: ['BRT Line', 'Express Bus Route', 'Rapid Transit'],
      highway: ['Highway Extension', 'Interstate Connection', 'Bypass Route'],
      bridge: ['Bridge Project', 'River Crossing', 'Overpass Construction']
    }
    
    const name = `${names[type][Math.floor(Math.random() * names[type].length)]} ${index + 1}`
    
    // Generate route points
    const route = []
    const routeLength = 3 + Math.floor(Math.random() * 8) // 3-10 stops
    
    for (let i = 0; i < routeLength; i++) {
      const angle = (i / routeLength) * Math.PI * 2
      const distance = 0.05 + Math.random() * 0.1
      const lat = coords.lat + Math.cos(angle) * distance
      const lng = coords.lng + Math.sin(angle) * distance
      
      route.push({
        lat,
        lng,
        stationName: type !== 'highway' && type !== 'bridge' ? `Station ${i + 1}` : undefined
      })
    }
    
    const budget = Math.floor(100000000 + Math.random() * 2000000000) // $100M - $2B
    
    const announced = new Date()
    announced.setMonth(announced.getMonth() - Math.floor(Math.random() * 60)) // 0-5 years ago
    
    const startConstruction = new Date(announced)
    startConstruction.setMonth(startConstruction.getMonth() + Math.floor(Math.random() * 24)) // 0-2 years after announcement
    
    const completion = new Date(startConstruction)
    completion.setMonth(completion.getMonth() + Math.floor(12 + Math.random() * 60)) // 1-5 years construction
    
    return {
      id: `transit_${city}_${index}`,
      name,
      type,
      status,
      route,
      budget,
      timeline: {
        announced: announced.toISOString().split('T')[0],
        startConstruction: startConstruction.toISOString().split('T')[0],
        estimatedCompletion: completion.toISOString().split('T')[0]
      },
      impactZones: route.map(point => ({
        center: { lat: point.lat, lng: point.lng },
        radius: type === 'subway' || type === 'light_rail' ? 0.5 : 0.3,
        valueImpact: 10 + Math.random() * 20,
        accessibility: 80 + Math.random() * 20
      })),
      ridership: {
        projected: Math.floor(10000 + Math.random() * 100000),
        current: status === 'completed' ? Math.floor(5000 + Math.random() * 80000) : undefined
      }
    }
  }

  private async generateInfrastructureProjects(city: string, state: string): Promise<InfrastructureProject[]> {
    const projects: InfrastructureProject[] = []
    const cityCoords = this.getCityCoordinates(city, state)
    
    // Generate 3-8 infrastructure projects per city
    const projectCount = Math.floor(3 + Math.random() * 6)
    
    for (let i = 0; i < projectCount; i++) {
      const project = this.generateInfrastructureProject(city, state, cityCoords, i)
      projects.push(project)
    }
    
    return projects
  }

  private generateInfrastructureProject(city: string, state: string, coords: { lat: number; lng: number }, index: number): InfrastructureProject {
    const types: InfrastructureProject['type'][] = ['school', 'hospital', 'park', 'shopping_center', 'office_complex', 'stadium', 'airport']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const statuses: InfrastructureProject['status'][] = ['proposed', 'approved', 'construction', 'completed']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const names = {
      school: ['Elementary School', 'High School', 'Community College', 'University Campus'],
      hospital: ['Medical Center', 'General Hospital', 'Specialty Clinic', 'Emergency Center'],
      park: ['Community Park', 'Recreation Center', 'Sports Complex', 'Green Space'],
      shopping_center: ['Shopping Mall', 'Retail Complex', 'Outlet Center', 'Mixed-Use Retail'],
      office_complex: ['Business Park', 'Corporate Center', 'Tech Campus', 'Office Tower'],
      stadium: ['Sports Stadium', 'Arena', 'Convention Center', 'Entertainment Complex'],
      airport: ['Airport Expansion', 'Regional Airport', 'Airfield', 'Aviation Center']
    }
    
    const name = `${names[type][Math.floor(Math.random() * names[type].length)]} ${index + 1}`
    
    const lat = coords.lat + (Math.random() - 0.5) * 0.2
    const lng = coords.lng + (Math.random() - 0.5) * 0.2
    
    const streetNumbers = Math.floor(1 + Math.random() * 9999)
    const streetNames = ['Main St', 'Central Ave', 'Park Blvd', 'Commerce Dr', 'Industrial Way']
    const address = `${streetNumbers} ${streetNames[Math.floor(Math.random() * streetNames.length)]}`
    
    const baseInvestments = {
      school: 50000000,
      hospital: 200000000,
      park: 20000000,
      shopping_center: 100000000,
      office_complex: 150000000,
      stadium: 500000000,
      airport: 1000000000
    }
    
    const investment = Math.floor(baseInvestments[type] * (0.5 + Math.random() * 1.5))
    
    const announced = new Date()
    announced.setMonth(announced.getMonth() - Math.floor(Math.random() * 36))
    
    const startDate = new Date(announced)
    startDate.setMonth(startDate.getMonth() + Math.floor(Math.random() * 18))
    
    const completionDate = new Date(startDate)
    completionDate.setMonth(completionDate.getMonth() + Math.floor(12 + Math.random() * 48))
    
    const impactRadii = {
      school: 2,
      hospital: 3,
      park: 1,
      shopping_center: 3,
      office_complex: 2,
      stadium: 5,
      airport: 10
    }
    
    return {
      id: `infrastructure_${city}_${index}`,
      name,
      type,
      status,
      location: { lat, lng },
      address,
      city,
      state,
      investment,
      timeline: {
        announced: announced.toISOString().split('T')[0],
        startDate: startDate.toISOString().split('T')[0],
        completionDate: completionDate.toISOString().split('T')[0]
      },
      impact: {
        propertyValueRadius: impactRadii[type],
        valueIncrease: 5 + Math.random() * 15,
        jobsCreated: Math.floor(investment / 100000),
        populationAttraction: Math.floor(investment / 1000000)
      }
    }
  }

  private getCityCoordinates(city: string, state: string): { lat: number; lng: number } {
    // Simplified city coordinates - in real app would use geocoding service
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'San Francisco,CA': { lat: 37.7749, lng: -122.4194 },
      'Los Angeles,CA': { lat: 34.0522, lng: -118.2437 },
      'San Diego,CA': { lat: 32.7157, lng: -117.1611 },
      'Austin,TX': { lat: 30.2672, lng: -97.7431 },
      'Dallas,TX': { lat: 32.7767, lng: -96.7970 },
      'Houston,TX': { lat: 29.7604, lng: -95.3698 },
      'New York,NY': { lat: 40.7128, lng: -74.0060 },
      'Miami,FL': { lat: 25.7617, lng: -80.1918 },
      'Seattle,WA': { lat: 47.6062, lng: -122.3321 },
      'Denver,CO': { lat: 39.7392, lng: -104.9903 },
      'Phoenix,AZ': { lat: 33.4484, lng: -112.0740 },
      'Chicago,IL': { lat: 41.8781, lng: -87.6298 },
      'Atlanta,GA': { lat: 33.7490, lng: -84.3880 },
      'Boston,MA': { lat: 42.3601, lng: -71.0589 }
    }
    
    const key = `${city},${state}`
    return cityCoords[key] || { lat: 39.8283, lng: -98.5795 } // Default to center of US
  }

  private generateZipCode(city: string, state: string): string {
    const zipRanges: { [key: string]: [string, string] } = {
      'San Francisco,CA': ['94102', '94199'],
      'Los Angeles,CA': ['90001', '90099'],
      'San Diego,CA': ['92101', '92199'],
      'Austin,TX': ['78701', '78799'],
      'Dallas,TX': ['75201', '75399'],
      'Houston,TX': ['77001', '77099'],
      'New York,NY': ['10001', '10299'],
      'Miami,FL': ['33101', '33199'],
      'Seattle,WA': ['98101', '98199'],
      'Denver,CO': ['80201', '80299'],
      'Phoenix,AZ': ['85001', '85099'],
      'Chicago,IL': ['60601', '60699'],
      'Atlanta,GA': ['30301', '30399'],
      'Boston,MA': ['02101', '02199']
    }
    
    const key = `${city},${state}`
    const range = zipRanges[key]
    
    if (range) {
      const min = parseInt(range[0])
      const max = parseInt(range[1])
      return String(Math.floor(Math.random() * (max - min + 1)) + min)
    }
    
    return '00000'
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
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