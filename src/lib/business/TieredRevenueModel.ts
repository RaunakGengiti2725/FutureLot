export interface TieredPlan {
  id: string
  name: string
  price: number
  billing: 'monthly' | 'annual'
  features: PlanFeature[]
  limits: PlanLimits
  value: PlanValue
  target: string[]
  conversion: ConversionStrategy
  profitability: ProfitabilityMetrics
}

export interface PlanFeature {
  feature: string
  included: boolean
  limit?: number
  description: string
  value: number
}

export interface PlanLimits {
  propertiesPerMonth: number
  reportDownloads: number
  dataExports: number
  apiCalls: number
  concurrentUsers: number
  storageGB: number
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated'
}

export interface PlanValue {
  estimatedMonthlyValue: number
  roi: number
  paybackPeriod: number
  competitorComparison: CompetitorComparison
}

export interface ConversionStrategy {
  freeTrialDays: number
  onboardingFlow: string[]
  valueDemo: string[]
  urgencyTactics: string[]
  testimonials: string[]
}

export interface ProfitabilityMetrics {
  costOfService: number
  grossMargin: number
  lifetimeValue: number
  acquisitionCost: number
  churnRate: number
  upgradeRate: number
}

export interface CompetitorComparison {
  competitor: string
  theirPrice: number
  ourAdvantage: string[]
  valueGap: number
}

export interface RevenueStream {
  source: string
  type: 'subscription' | 'one-time' | 'usage' | 'commission'
  revenue: number
  margin: number
  scalability: number
  stability: number
}

export interface MonetizationStrategy {
  primaryRevenue: RevenueStream[]
  secondaryRevenue: RevenueStream[]
  partnerships: PartnershipRevenue[]
  dataMonetization: DataRevenue[]
  premiumServices: PremiumService[]
}

export interface PartnershipRevenue {
  partner: string
  type: 'referral' | 'integration' | 'white-label' | 'data-sharing'
  revenue: number
  terms: string
}

export interface DataRevenue {
  dataType: string
  buyer: string
  revenue: number
  recurring: boolean
  privacy: string
}

export interface PremiumService {
  service: string
  price: number
  margin: number
  demand: number
  delivery: string
}

export class TieredRevenueModel {
  private plans: TieredPlan[] = []
  private monetizationStrategy!: MonetizationStrategy
  private pricing!: PricingStrategy

  constructor() {
    this.initializePlans()
    this.setupMonetizationStrategy()
    this.optimizePricing()
  }

  private initializePlans(): void {
    this.plans = [
      // FREE TIER - Lead Generation & User Acquisition
      {
        id: 'free',
        name: 'Property Explorer',
        price: 0,
        billing: 'monthly',
        features: [
          { feature: 'Basic Property Analysis', included: true, limit: 10, description: 'Government data analysis', value: 50 },
          { feature: 'Market Overview', included: true, description: 'City-level insights', value: 25 },
          { feature: 'Investment Calculator', included: true, description: 'ROI and cash flow basics', value: 30 },
          { feature: 'Risk Assessment', included: true, description: 'Basic risk scoring', value: 40 },
          { feature: 'Email Reports', included: true, limit: 2, description: 'Monthly market updates', value: 15 },
          { feature: 'Community Access', included: true, description: 'Forums and basic support', value: 10 }
        ],
        limits: {
          propertiesPerMonth: 10,
          reportDownloads: 2,
          dataExports: 0,
          apiCalls: 100,
          concurrentUsers: 1,
          storageGB: 0.5,
          supportLevel: 'community'
        },
        value: {
          estimatedMonthlyValue: 170,
          roi: Infinity,
          paybackPeriod: 0,
          competitorComparison: {
            competitor: 'BiggerPockets',
            theirPrice: 39,
            ourAdvantage: ['Government data', 'Free access', 'No ads'],
            valueGap: 209
          }
        },
        target: ['New investors', 'Students', 'Curious homeowners', 'Side hustlers'],
        conversion: {
          freeTrialDays: 0,
          onboardingFlow: ['Welcome tour', 'First analysis', 'Result explanation', 'Upgrade prompt'],
          valueDemo: ['Show premium features', 'Highlight limitations', 'Case studies'],
          urgencyTactics: ['Limited free analyses', 'Popular markets first'],
          testimonials: ['New investor success stories']
        },
        profitability: {
          costOfService: 2,
          grossMargin: -100,
          lifetimeValue: 0,
          acquisitionCost: 15,
          churnRate: 0.25,
          upgradeRate: 0.12
        }
      },

      // STARTER TIER - Entry-level Investors
      {
        id: 'starter',
        name: 'Property Investor',
        price: 29,
        billing: 'monthly',
        features: [
          { feature: 'Advanced Property Analysis', included: true, limit: 50, description: 'Multi-source data integration', value: 150 },
          { feature: 'Comparative Analysis', included: true, description: 'Property vs market comparison', value: 75 },
          { feature: 'Cash Flow Projections', included: true, description: '5-year financial modeling', value: 100 },
          { feature: 'Market Alerts', included: true, limit: 10, description: 'Price drop notifications', value: 50 },
          { feature: 'Professional Reports', included: true, limit: 10, description: 'PDF investment reports', value: 200 },
          { feature: 'Export Data', included: true, limit: 20, description: 'CSV/Excel downloads', value: 40 },
          { feature: 'Email Support', included: true, description: 'Priority support', value: 25 }
        ],
        limits: {
          propertiesPerMonth: 50,
          reportDownloads: 10,
          dataExports: 20,
          apiCalls: 1000,
          concurrentUsers: 1,
          storageGB: 2,
          supportLevel: 'email'
        },
        value: {
          estimatedMonthlyValue: 640,
          roi: 2106, // (640-29)/29 * 100
          paybackPeriod: 1,
          competitorComparison: {
            competitor: 'RealtyMole',
            theirPrice: 99,
            ourAdvantage: ['Government data', 'Better analysis', 'Lower price'],
            valueGap: 611
          }
        },
        target: ['New real estate investors', 'Small portfolio owners', 'House hackers', 'First-time flippers'],
        conversion: {
          freeTrialDays: 14,
          onboardingFlow: ['Premium tour', 'Advanced analysis demo', 'Report generation', 'Success metrics'],
          valueDemo: ['Full property analysis', 'Professional reports', 'Market alerts setup'],
          urgencyTactics: ['Limited time offer', 'Price increase coming'],
          testimonials: ['First deal success stories', 'ROI achievements']
        },
        profitability: {
          costOfService: 5,
          grossMargin: 83,
          lifetimeValue: 348, // 29 * 12 months * (1-churn)
          acquisitionCost: 25,
          churnRate: 0.15,
          upgradeRate: 0.08
        }
      },

      // PROFESSIONAL TIER - Serious Investors
      {
        id: 'professional',
        name: 'Property Professional',
        price: 79,
        billing: 'monthly',
        features: [
          { feature: 'Unlimited Property Analysis', included: true, description: 'No limits on properties', value: 500 },
          { feature: 'Portfolio Management', included: true, description: 'Track multiple properties', value: 200 },
          { feature: 'Market Timing Intelligence', included: true, description: 'Buy/sell recommendations', value: 300 },
          { feature: 'Advanced Risk Analysis', included: true, description: 'Comprehensive risk modeling', value: 250 },
          { feature: 'Deal Flow Alerts', included: true, limit: 50, description: 'Investment opportunities', value: 400 },
          { feature: 'API Access', included: true, limit: 10000, description: 'Integrate with your tools', value: 150 },
          { feature: 'Custom Reports', included: true, description: 'Branded investor reports', value: 300 },
          { feature: 'Priority Support', included: true, description: 'Phone and email support', value: 100 }
        ],
        limits: {
          propertiesPerMonth: -1, // Unlimited
          reportDownloads: 100,
          dataExports: 100,
          apiCalls: 10000,
          concurrentUsers: 3,
          storageGB: 10,
          supportLevel: 'priority'
        },
        value: {
          estimatedMonthlyValue: 2200,
          roi: 2685, // (2200-79)/79 * 100
          paybackPeriod: 1,
          competitorComparison: {
            competitor: 'BiggerPockets Pro',
            theirPrice: 149,
            ourAdvantage: ['More data sources', 'Better analysis', 'API access'],
            valueGap: 2121
          }
        },
        target: ['Active investors', 'Real estate agents', 'Small funds', 'Flippers', 'Wholesalers'],
        conversion: {
          freeTrialDays: 30,
          onboardingFlow: ['Professional setup', 'Portfolio import', 'Advanced training', 'Success planning'],
          valueDemo: ['Portfolio analysis', 'Deal sourcing', 'Market timing', 'ROI tracking'],
          urgencyTactics: ['Exclusive features', 'Limited beta access'],
          testimonials: ['Professional investor stories', 'Portfolio growth cases']
        },
        profitability: {
          costOfService: 12,
          grossMargin: 85,
          lifetimeValue: 1185, // 79 * 15 months average
          acquisitionCost: 75,
          churnRate: 0.10,
          upgradeRate: 0.05
        }
      },

      // ENTERPRISE TIER - Big Players
      {
        id: 'enterprise',
        name: 'Property Enterprise',
        price: 299,
        billing: 'monthly',
        features: [
          { feature: 'Unlimited Everything', included: true, description: 'No restrictions', value: 2000 },
          { feature: 'White Label Solution', included: true, description: 'Brand as your own', value: 1500 },
          { feature: 'Dedicated Account Manager', included: true, description: 'Personal success manager', value: 500 },
          { feature: 'Custom Integrations', included: true, description: 'API integrations built for you', value: 1000 },
          { feature: 'Advanced Analytics', included: true, description: 'Business intelligence dashboard', value: 800 },
          { feature: 'Bulk Data Access', included: true, description: 'Market-wide data exports', value: 1200 },
          { feature: 'Priority Development', included: true, description: 'Feature requests prioritized', value: 600 },
          { feature: 'SLA Guarantee', included: true, description: '99.9% uptime guarantee', value: 300 }
        ],
        limits: {
          propertiesPerMonth: -1,
          reportDownloads: -1,
          dataExports: -1,
          apiCalls: 100000,
          concurrentUsers: -1,
          storageGB: 100,
          supportLevel: 'dedicated'
        },
        value: {
          estimatedMonthlyValue: 7900,
          roi: 2543, // (7900-299)/299 * 100
          paybackPeriod: 1,
          competitorComparison: {
            competitor: 'CoreLogic Enterprise',
            theirPrice: 2000,
            ourAdvantage: ['Lower cost', 'Better features', 'Faster implementation'],
            valueGap: 7601
          }
        },
        target: ['Investment funds', 'REITs', 'Property management companies', 'Large brokerages', 'Institutional investors'],
        conversion: {
          freeTrialDays: 90,
          onboardingFlow: ['Executive presentation', 'Custom demo', 'ROI analysis', 'Implementation plan'],
          valueDemo: ['Enterprise features', 'Cost savings analysis', 'Competitive advantages'],
          urgencyTactics: ['Annual contract discounts', 'Implementation timeline'],
          testimonials: ['Enterprise success stories', 'ROI case studies']
        },
        profitability: {
          costOfService: 45,
          grossMargin: 85,
          lifetimeValue: 8970, // 299 * 30 months average
          acquisitionCost: 500,
          churnRate: 0.05,
          upgradeRate: 0
        }
      }
    ]
  }

  private setupMonetizationStrategy(): void {
    this.monetizationStrategy = {
      primaryRevenue: [
        {
          source: 'Subscription Revenue',
          type: 'subscription',
          revenue: 1500000, // $1.5M annually
          margin: 85,
          scalability: 95,
          stability: 90
        }
      ],
      secondaryRevenue: [
        {
          source: 'Professional Services',
          type: 'one-time',
          revenue: 300000, // $300K annually
          margin: 70,
          scalability: 60,
          stability: 70
        },
        {
          source: 'Training & Certification',
          type: 'one-time',
          revenue: 150000, // $150K annually
          margin: 90,
          scalability: 80,
          stability: 75
        }
      ],
      partnerships: [
        {
          partner: 'Mortgage Lenders',
          type: 'referral',
          revenue: 200000, // $200K annually
          terms: '$500 per qualified referral'
        },
        {
          partner: 'Property Management',
          type: 'referral',
          revenue: 100000, // $100K annually
          terms: '10% of first year revenue'
        },
        {
          partner: 'Real Estate Agents',
          type: 'integration',
          revenue: 180000, // $180K annually
          terms: 'White label licensing'
        }
      ],
      dataMonetization: [
        {
          dataType: 'Market Insights',
          buyer: 'Research Firms',
          revenue: 250000, // $250K annually
          recurring: true,
          privacy: 'Aggregated and anonymized'
        },
        {
          dataType: 'Investment Trends',
          buyer: 'Financial Media',
          revenue: 75000, // $75K annually
          recurring: true,
          privacy: 'Public insights only'
        }
      ],
      premiumServices: [
        {
          service: 'Custom Market Reports',
          price: 5000,
          margin: 80,
          demand: 50,
          delivery: '2 weeks'
        },
        {
          service: 'Investment Consulting',
          price: 500,
          margin: 95,
          demand: 200,
          delivery: '1 hour'
        },
        {
          service: 'Portfolio Optimization',
          price: 2500,
          margin: 85,
          demand: 80,
          delivery: '1 week'
        }
      ]
    }
  }

  private optimizePricing(): void {
    this.pricing = {
      strategy: 'Value-based pricing',
      methodology: 'Customer value optimization',
      elasticity: this.calculatePriceElasticity(),
      optimization: this.optimizePricePoints(),
      testing: this.setupPriceTesting(),
      localization: this.setupRegionalPricing()
    }
  }

  // Revenue Projections
  public calculateRevenueProjections(timeframe: 'monthly' | 'annual'): RevenueProjection {
    const multiplier = timeframe === 'annual' ? 12 : 1

    const subscriptionRevenue = this.plans.reduce((total, plan) => {
      const userBase = this.estimateUserBase(plan.id)
      return total + (plan.price * userBase * multiplier)
    }, 0)

    const partnershipRevenue = this.monetizationStrategy.partnerships.reduce((total, partner) => {
      return total + (partner.revenue * multiplier / 12)
    }, 0)

    const dataRevenue = this.monetizationStrategy.dataMonetization.reduce((total, data) => {
      return total + (data.revenue * multiplier / 12)
    }, 0)

    const servicesRevenue = this.monetizationStrategy.premiumServices.reduce((total, service) => {
      return total + (service.price * service.demand * multiplier)
    }, 0)

    return {
      subscription: subscriptionRevenue,
      partnerships: partnershipRevenue,
      data: dataRevenue,
      services: servicesRevenue,
      total: subscriptionRevenue + partnershipRevenue + dataRevenue + servicesRevenue,
      timeframe
    }
  }

  // User Base Estimation
  private estimateUserBase(planId: string): number {
    const estimates = {
      free: 50000,
      starter: 2500,
      professional: 800,
      enterprise: 50
    }
    return estimates[planId as keyof typeof estimates] || 0
  }

  // Pricing Optimization Methods
  private calculatePriceElasticity(): PriceElasticity {
    return {
      starter: -1.2, // Elastic - price sensitive
      professional: -0.8, // Somewhat elastic
      enterprise: -0.3 // Inelastic - value focused
    }
  }

  private optimizePricePoints(): PriceOptimization {
    return {
      starter: {
        current: 29,
        optimal: 39,
        reasoning: 'Can increase 34% with minimal churn',
        impact: '+25% revenue'
      },
      professional: {
        current: 79,
        optimal: 99,
        reasoning: 'High value perception supports increase',
        impact: '+20% revenue'
      },
      enterprise: {
        current: 299,
        optimal: 399,
        reasoning: 'ROI justifies premium pricing',
        impact: '+28% revenue'
      }
    }
  }

  private setupPriceTesting(): PriceTesting {
    return {
      methods: ['A/B testing', 'Van Westendorp analysis', 'Conjoint analysis'],
      timeline: '3 months per test',
      metrics: ['Conversion rate', 'Customer lifetime value', 'Churn rate'],
      implementation: 'Gradual rollout with cohort analysis'
    }
  }

  private setupRegionalPricing(): RegionalPricing {
    return {
      regions: [
        { region: 'US/Canada', multiplier: 1.0, currency: 'USD' },
        { region: 'Europe', multiplier: 0.9, currency: 'EUR' },
        { region: 'Asia-Pacific', multiplier: 0.7, currency: 'USD' },
        { region: 'Latin America', multiplier: 0.5, currency: 'USD' }
      ],
      strategy: 'Purchasing power parity',
      implementation: 'Geo-IP detection with manual override'
    }
  }

  // Public API Methods
  public getPlans(): TieredPlan[] {
    return this.plans
  }

  public getPlan(planId: string): TieredPlan | undefined {
    return this.plans.find(plan => plan.id === planId)
  }

  public getMonetizationStrategy(): MonetizationStrategy {
    return this.monetizationStrategy
  }

  public calculateCustomerLifetimeValue(planId: string): number {
    const plan = this.getPlan(planId)
    if (!plan) return 0

    const monthlyRevenue = plan.price
    const averageLifetime = 1 / plan.profitability.churnRate
    return monthlyRevenue * averageLifetime
  }

  public calculatePaybackPeriod(planId: string): number {
    const plan = this.getPlan(planId)
    if (!plan) return 0

    const acquisitionCost = plan.profitability.acquisitionCost
    const monthlyProfit = plan.price - plan.profitability.costOfService
    return acquisitionCost / monthlyProfit
  }

  public optimizeConversion(planId: string): ConversionOptimization {
    const plan = this.getPlan(planId)
    if (!plan) throw new Error('Plan not found')

    return {
      currentRate: plan.profitability.upgradeRate,
      optimizedRate: plan.profitability.upgradeRate * 1.5,
      tactics: plan.conversion.valueDemo,
      testing: ['Landing page optimization', 'Trial period adjustment', 'Onboarding flow'],
      expectedImpact: `+${((plan.profitability.upgradeRate * 0.5) * 100).toFixed(1)}% conversion`
    }
  }
}

// Supporting Interfaces
interface PricingStrategy {
  strategy: string
  methodology: string
  elasticity: PriceElasticity
  optimization: PriceOptimization
  testing: PriceTesting
  localization: RegionalPricing
}

interface PriceElasticity {
  starter: number
  professional: number
  enterprise: number
}

interface PriceOptimization {
  starter: OptimizationResult
  professional: OptimizationResult
  enterprise: OptimizationResult
}

interface OptimizationResult {
  current: number
  optimal: number
  reasoning: string
  impact: string
}

interface PriceTesting {
  methods: string[]
  timeline: string
  metrics: string[]
  implementation: string
}

interface RegionalPricing {
  regions: RegionConfig[]
  strategy: string
  implementation: string
}

interface RegionConfig {
  region: string
  multiplier: number
  currency: string
}

interface RevenueProjection {
  subscription: number
  partnerships: number
  data: number
  services: number
  total: number
  timeframe: string
}

interface ConversionOptimization {
  currentRate: number
  optimizedRate: number
  tactics: string[]
  testing: string[]
  expectedImpact: string
} 