import { expandedCityData } from '../data/ExtendedCityData'
import { RealMarketData, NeighborhoodMetrics, EconomicIndicators } from './RealDataService'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  correctedData?: any
  confidence: number
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
  expectedRange?: {
    min: number
    max: number
  }
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
  value?: any
  suggestedValue?: any
  confidence?: number
}

export interface ValidationRules {
  required?: boolean
  type?: 'number' | 'string' | 'boolean' | 'object' | 'array'
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  enum?: any[]
  custom?: (value: any, context: any) => boolean
  dependencies?: string[]
  transform?: (value: any) => any
}

export interface ValidationContext {
  city: string
  state: string
  cityData: any
  timestamp: string
  source: string
  data?: any
}

export class DataValidationService {
  private static instance: DataValidationService | null = null
  private cityDataMap: Map<string, any> = new Map()
  private readonly validationRules: Map<string, Record<string, ValidationRules>> = new Map()

  private constructor() {
    this.initializeCityData()
    this.initializeValidationRules()
  }

  static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService()
    }
    return DataValidationService.instance
  }

  private initializeCityData() {
    this.cityDataMap = new Map(
      expandedCityData.map(city => [`${city.name.toLowerCase()}_${city.state.toLowerCase()}`, city])
    )
  }

  private initializeValidationRules() {
    // Market data validation rules
    this.validationRules.set('marketData', {
      currentValue: {
        required: true,
        type: 'number',
        min: 0,
        custom: (value, context) => {
          const cityData = context.cityData
          const medianPrice = cityData.medianHomePrice
          return value >= medianPrice * 0.3 && value <= medianPrice * 3
        }
      },
      estimatedValue: {
        required: true,
        type: 'number',
        min: 0,
        dependencies: ['currentValue'],
        custom: (value, context) => {
          const currentValue = context.data.currentValue
          return value >= currentValue * 0.7 && value <= currentValue * 1.3
        }
      },
      rentEstimate: {
        required: true,
        type: 'number',
        min: 0,
        custom: (value, context) => {
          const cityData = context.cityData
          const propertyValue = context.data.currentValue
          const minYield = 0.03 // 3% minimum rental yield
          const maxYield = 0.15 // 15% maximum rental yield
          const annualRent = value * 12
          return annualRent >= propertyValue * minYield && annualRent <= propertyValue * maxYield
        }
      },
      priceChange30Day: {
        required: true,
        type: 'number',
        min: -0.2, // -20% max decrease
        max: 0.2 // 20% max increase
      },
      priceChange1Year: {
        required: true,
        type: 'number',
        min: -0.3, // -30% max decrease
        max: 0.5 // 50% max increase
      },
      marketHotness: {
        required: true,
        type: 'number',
        min: 0,
        max: 100
      },
      daysOnMarket: {
        required: true,
        type: 'number',
        min: 0,
        max: 365
      },
      inventory: {
        required: true,
        type: 'number',
        min: 0,
        max: 24 // months of inventory
      },
      walkScore: {
        required: true,
        type: 'number',
        min: 0,
        max: 100
      },
      transitScore: {
        required: true,
        type: 'number',
        min: 0,
        max: 100
      },
      schoolRating: {
        required: true,
        type: 'number',
        min: 0,
        max: 10
      },
      crimeRate: {
        required: true,
        type: 'number',
        min: 0,
        max: 100
      },
      appreciation12Month: {
        required: true,
        type: 'number',
        min: -0.3, // -30% max decrease
        max: 0.5 // 50% max increase
      }
    })

    // Neighborhood metrics validation rules
    this.validationRules.set('neighborhoodMetrics', {
      medianHomePrice: {
        required: true,
        type: 'number',
        min: 0,
        custom: (value, context) => {
          const cityData = context.cityData
          return value >= cityData.medianHomePrice * 0.5 && value <= cityData.medianHomePrice * 1.5
        }
      },
      priceAppreciation1Year: {
        required: true,
        type: 'number',
        min: -0.3,
        max: 0.5,
        custom: (value, context) => {
          const cityData = context.cityData
          return Math.abs(value - cityData.priceAppreciationYoY / 100) <= 0.2
        }
      },
      rentalYield: {
        required: true,
        type: 'number',
        min: 0.02, // 2% minimum
        max: 0.15 // 15% maximum
      },
      population: {
        required: true,
        type: 'number',
        min: 0,
        custom: (value, context) => {
          const cityData = context.cityData
          return value >= cityData.population * 0.8 && value <= cityData.population * 1.2
        }
      },
      employmentRate: {
        required: true,
        type: 'number',
        min: 0.5,
        max: 1,
        custom: (value, context) => {
          const cityData = context.cityData
          return Math.abs(value - cityData.employmentRate / 100) <= 0.1
        }
      },
      newConstructionPermits: {
        required: true,
        type: 'number',
        min: 0,
        custom: (value, context) => {
          const cityData = context.cityData
          return value >= cityData.permitActivity * 0.5 && value <= cityData.permitActivity * 1.5
        }
      }
    })

    // Economic indicators validation rules
    this.validationRules.set('economicIndicators', {
      gdpGrowth: {
        required: true,
        type: 'number',
        min: -0.1, // -10% minimum
        max: 0.15 // 15% maximum
      },
      unemployment: {
        required: true,
        type: 'number',
        min: 0.02, // 2% minimum
        max: 0.2 // 20% maximum
      },
      jobGrowth: {
        required: true,
        type: 'number',
        min: -0.1,
        max: 0.15
      },
      populationGrowth: {
        required: true,
        type: 'number',
        min: -0.05,
        max: 0.1
      },
      incomeGrowth: {
        required: true,
        type: 'number',
        min: -0.1,
        max: 0.15
      },
      businessGrowth: {
        required: true,
        type: 'number',
        min: -0.1,
        max: 0.2
      },
      constructionActivity: {
        required: true,
        type: 'number',
        min: 0,
        max: 1
      },
      permitActivity: {
        required: true,
        type: 'number',
        min: 0,
        max: 1
      }
    })
  }

  validateMarketData(
    data: Partial<RealMarketData>,
    city: string,
    state: string,
    source: string = 'unknown'
  ): ValidationResult {
    const context: ValidationContext = {
      city,
      state,
      cityData: this.getCityData(city, state),
      timestamp: new Date().toISOString(),
      source
    }

    return this.validate(data, 'marketData', context)
  }

  validateNeighborhoodMetrics(
    data: Partial<NeighborhoodMetrics>,
    city: string,
    state: string,
    source: string = 'unknown'
  ): ValidationResult {
    const context: ValidationContext = {
      city,
      state,
      cityData: this.getCityData(city, state),
      timestamp: new Date().toISOString(),
      source
    }

    return this.validate(data, 'neighborhoodMetrics', context)
  }

  validateEconomicIndicators(
    data: Partial<EconomicIndicators>,
    city: string,
    state: string,
    source: string = 'unknown'
  ): ValidationResult {
    const context: ValidationContext = {
      city,
      state,
      cityData: this.getCityData(city, state),
      timestamp: new Date().toISOString(),
      source
    }

    return this.validate(data, 'economicIndicators', context)
  }

  private validate(
    data: any,
    ruleSet: string,
    context: ValidationContext
  ): ValidationResult {
    const rules = this.validationRules.get(ruleSet)
    if (!rules) {
      throw new Error(`Validation rules not found for ${ruleSet}`)
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const correctedData = { ...data }
    let validFields = 0
    let totalFields = 0

    // Add data to context for cross-field validation
    context.data = data

    for (const [field, fieldRules] of Object.entries(rules)) {
      totalFields++
      const value = data[field]

      // Check required fields
      if (fieldRules.required && (value === undefined || value === null)) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED_FIELD_MISSING',
          value
        })
        continue
      }

      // Skip validation for optional empty fields
      if (!fieldRules.required && (value === undefined || value === null)) {
        continue
      }

      // Type validation
      if (fieldRules.type && typeof value !== fieldRules.type) {
        errors.push({
          field,
          message: `${field} must be of type ${fieldRules.type}`,
          code: 'INVALID_TYPE',
          value
        })
        continue
      }

      // Numeric range validation
      if (fieldRules.type === 'number') {
        if (fieldRules.min !== undefined && value < fieldRules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${fieldRules.min}`,
            code: 'BELOW_MINIMUM',
            value,
            expectedRange: {
              min: fieldRules.min,
              max: fieldRules.max || Infinity
            }
          })
          continue
        }

        if (fieldRules.max !== undefined && value > fieldRules.max) {
          errors.push({
            field,
            message: `${field} must be at most ${fieldRules.max}`,
            code: 'ABOVE_MAXIMUM',
            value,
            expectedRange: {
              min: fieldRules.min || -Infinity,
              max: fieldRules.max
            }
          })
          continue
        }
      }

      // String length validation
      if (fieldRules.type === 'string') {
        if (fieldRules.minLength !== undefined && value.length < fieldRules.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${fieldRules.minLength} characters`,
            code: 'STRING_TOO_SHORT',
            value
          })
          continue
        }

        if (fieldRules.maxLength !== undefined && value.length > fieldRules.maxLength) {
          errors.push({
            field,
            message: `${field} must be at most ${fieldRules.maxLength} characters`,
            code: 'STRING_TOO_LONG',
            value
          })
          continue
        }

        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
          errors.push({
            field,
            message: `${field} does not match required pattern`,
            code: 'PATTERN_MISMATCH',
            value
          })
          continue
        }
      }

      // Enum validation
      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${fieldRules.enum.join(', ')}`,
          code: 'INVALID_ENUM_VALUE',
          value
        })
        continue
      }

      // Custom validation
      if (fieldRules.custom && !fieldRules.custom(value, context)) {
        warnings.push({
          field,
          message: `${field} value is outside expected range`,
          code: 'CUSTOM_VALIDATION_WARNING',
          value
        })
      }

      // Dependency validation
      if (fieldRules.dependencies) {
        for (const dep of fieldRules.dependencies) {
          if (data[dep] === undefined || data[dep] === null) {
            errors.push({
              field,
              message: `${field} requires ${dep} to be present`,
              code: 'MISSING_DEPENDENCY',
              value
            })
            continue
          }
        }
      }

      // Value transformation
      if (fieldRules.transform) {
        try {
          correctedData[field] = fieldRules.transform(value)
        } catch (error) {
          warnings.push({
            field,
            message: `Failed to transform ${field}`,
            code: 'TRANSFORM_FAILED',
            value
          })
        }
      }

      validFields++
    }

    const confidence = (validFields / totalFields) * 100

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData: errors.length === 0 ? correctedData : undefined,
      confidence
    }
  }

  private getCityData(city: string, state: string): any {
    const key = `${city.toLowerCase()}_${state.toLowerCase()}`
    return this.cityDataMap.get(key)
  }
} 