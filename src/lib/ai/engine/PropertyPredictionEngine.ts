import * as tf from '@tensorflow/tfjs'
import { PropertyFeatures, PropertyPrediction, MarketConditions } from '../models/PropertyData'

export class PropertyPredictionEngine {
  private static instance: PropertyPredictionEngine | null = null
  private model: tf.LayersModel | null = null
  private isTraining: boolean = false
  private modelLoaded: boolean = false
  private initializationPromise: Promise<void> | null = null

  private constructor() {}

  public static getInstance(): PropertyPredictionEngine {
    if (!PropertyPredictionEngine.instance) {
      PropertyPredictionEngine.instance = new PropertyPredictionEngine()
    }
    return PropertyPredictionEngine.instance
  }

  public async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = new Promise<void>(async (resolve, reject) => {
      try {
        if (!this.modelLoaded) {
          // Set backend to WebGL
          await tf.setBackend('webgl')
          console.log('Using WebGL backend:', await tf.getBackend())

          // Dispose any existing model
          if (this.model) {
            this.model.dispose()
            this.model = null
          }

          // Clear TensorFlow memory
          tf.engine().reset()
          tf.disposeVariables()

          // Try to load pre-trained model
          try {
            this.model = await tf.loadLayersModel('/models/property-prediction-model.json')
            this.modelLoaded = true
            console.log('Loaded pre-trained model')
          } catch (error) {
            // Create new model if no pre-trained model exists
            console.log('Creating new model...')
            this.model = this.createModel()
            this.modelLoaded = true
          }
        }
        resolve()
      } catch (error) {
        console.error('Failed to initialize model:', error)
        reject(error)
      }
    })

    return this.initializationPromise
  }

  private createModel(): tf.LayersModel {
    // Neural network architecture for property prediction
    const model = tf.sequential()

    // Input layer - 25 features
    model.add(tf.layers.dense({
      inputShape: [25],
      units: 128,
      activation: 'relu',
      kernelInitializer: 'glorotUniform',
      name: 'input_layer'
    }))

    // Hidden layers with dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.3 }))
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'glorotUniform',
      name: 'hidden_layer_1'
    }))

    model.add(tf.layers.dropout({ rate: 0.2 }))
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'glorotUniform',
      name: 'hidden_layer_2'
    }))

    model.add(tf.layers.dropout({ rate: 0.1 }))
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
      kernelInitializer: 'glorotUniform',
      name: 'hidden_layer_3'
    }))

    // Output layer - 3 predictions (6m, 12m, 36m appreciation)
    model.add(tf.layers.dense({
      units: 3,
      activation: 'linear',
      name: 'output_layer'
    }))

    // Compile model with optimizer and loss function
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
  }

  // Feature engineering - convert raw property data to ML features
  private extractFeatures(property: PropertyFeatures, market: MarketConditions): number[] {
    const currentYear = new Date().getFullYear()
    
    return [
      // Location features (normalized) - 3 features
      property.walkScore / 100,
      property.transitScore / 100,
      property.bikeScore / 100,
      
      // Property characteristics (normalized) - 6 features
      Math.log(property.squareFootage) / 10,
      property.bedrooms / 10,
      property.bathrooms / 10,
      Math.log(property.lotSize + 1) / 15,
      (currentYear - property.yearBuilt) / 100,
      this.encodePropertyType(property.propertyType),
      
      // Economic indicators (normalized) - 4 features
      property.medianHouseholdIncome / 100000,
      property.employmentRate,
      property.populationDensity / 10000,
      property.crimeRate / 100,
      
      // Market features (normalized) - 4 features
      Math.log(property.currentPrice) / 15,
      property.pricePerSqFt / 1000,
      property.daysOnMarket / 365,
      property.inventoryLevel / 10,
      
      // Infrastructure (normalized) - 4 features
      property.distanceToDowntown / 50,
      property.distanceToSchools / 10,
      property.distanceToTransit / 5,
      property.plannedDevelopments / 10,
      
      // Climate risks (normalized) - 1 feature
      (property.floodRisk + property.fireRisk + property.earthquakeRisk + property.seaLevelRisk) / 4,
      
      // Market dynamics - 3 features
      property.supplyDemandRatio,
      market.interestRates / 10,
      property.seasonality
    ]
  }

  private encodePropertyType(type: string): number {
    const encoding = {
      'single_family': 0.25,
      'condo': 0.5,
      'townhouse': 0.75,
      'multi_family': 1.0
    }
    return encoding[type as keyof typeof encoding] || 0.5
  }

  // Calculate appreciation based on historical data and trends
  private calculateHistoricalTrend(property: PropertyFeatures): number {
    const currentPrice = property.currentPrice
    const price6m = property.price6MonthsAgo
    const price1y = property.price1YearAgo
    const price2y = property.price2YearsAgo

    if (price2y > 0) {
      // Calculate compound annual growth rate
      const cagr = Math.pow(currentPrice / price2y, 1/2) - 1
      return cagr
    }
    
    if (price1y > 0) {
      return (currentPrice / price1y) - 1
    }
    
    if (price6m > 0) {
      return ((currentPrice / price6m) - 1) * 2 // Annualized
    }
    
    return 0
  }

  // Main prediction method
  async predict(property: PropertyFeatures, market: MarketConditions): Promise<PropertyPrediction> {
    if (!this.model || !this.modelLoaded) {
      await this.initialize()
    }

    if (!this.model) {
      throw new Error('Model not loaded')
    }

    const features = this.extractFeatures(property, market)
    const inputTensor = tf.tensor2d([features], [1, 25])

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor
      const predictionData = await prediction.data()

      // Extract predictions for 6m, 12m, 36m
      const sixMonthAppreciation = predictionData[0]
      const twelveMonthAppreciation = predictionData[1]
      const thirtySixMonthAppreciation = predictionData[2]

      // Apply market conditions and trends
      const historicalTrend = this.calculateHistoricalTrend(property)
      const marketMultiplier = this.getMarketMultiplier(market)

      // Calculate final predictions with confidence
      const predictions = {
        sixMonth: {
          appreciation: this.adjustPrediction(sixMonthAppreciation, historicalTrend, marketMultiplier, 0.5),
          price: property.currentPrice * (1 + sixMonthAppreciation * 0.5),
          confidence: this.calculateConfidence(features, 0.5)
        },
        twelveMonth: {
          appreciation: this.adjustPrediction(twelveMonthAppreciation, historicalTrend, marketMultiplier, 1.0),
          price: property.currentPrice * (1 + twelveMonthAppreciation),
          confidence: this.calculateConfidence(features, 1.0)
        },
        thirtySixMonth: {
          appreciation: this.adjustPrediction(thirtySixMonthAppreciation, historicalTrend, marketMultiplier, 3.0),
          price: property.currentPrice * (1 + thirtySixMonthAppreciation * 3),
          confidence: this.calculateConfidence(features, 3.0)
        }
      }

      const factors = this.analyzeFactors(property, market)
      const riskScore = this.calculateRiskScore(property, market)

      return {
        propertyId: `prop_${Date.now()}`,
        currentPrice: property.currentPrice,
        predictions,
        factors,
        riskScore,
        timestamp: new Date()
      }

    } finally {
      inputTensor.dispose()
    }
  }

  private adjustPrediction(rawPrediction: number, historicalTrend: number, marketMultiplier: number, timeHorizon: number): number {
    // Combine ML prediction with historical trend and market conditions
    const trendWeight = 0.3
    const marketWeight = 0.2
    const mlWeight = 0.5

    const adjustedPrediction = (
      rawPrediction * mlWeight +
      historicalTrend * trendWeight +
      (marketMultiplier - 1) * marketWeight
    ) * timeHorizon

    // Clamp to reasonable bounds
    return Math.max(-0.5, Math.min(2.0, adjustedPrediction))
  }

  private getMarketMultiplier(market: MarketConditions): number {
    // Economic indicators impact on real estate
    const interestRateImpact = 1 - (market.interestRates - 3) * 0.1
    const inflationImpact = 1 + (market.inflationRate - 2) * 0.05
    const gdpImpact = 1 + market.gdpGrowth * 0.1
    const employmentImpact = 1 + (market.employmentRate - 0.05) * 0.2

    return (interestRateImpact + inflationImpact + gdpImpact + employmentImpact) / 4
  }

  private calculateConfidence(features: number[], timeHorizon: number): number {
    // Confidence decreases with time horizon and increases with data quality
    const dataQuality = features.reduce((acc, val) => acc + (isNaN(val) ? 0 : 1), 0) / features.length
    const timeDecay = 1 - (timeHorizon - 0.5) * 0.1
    
    return Math.max(0.5, Math.min(0.95, dataQuality * timeDecay))
  }

  private analyzeFactors(property: PropertyFeatures, market: MarketConditions) {
    const positive = []
    const negative = []

    // Analyze positive factors
    if (property.walkScore > 70) {
      positive.push({
        factor: 'High Walkability',
        impact: 0.05,
        description: 'Excellent walkability score increases property desirability'
      })
    }

    if (property.plannedDevelopments > 3) {
      positive.push({
        factor: 'Infrastructure Development',
        impact: 0.08,
        description: 'Planned developments will improve neighborhood value'
      })
    }

    if (market.gdpGrowth > 0.02) {
      positive.push({
        factor: 'Economic Growth',
        impact: 0.06,
        description: 'Strong GDP growth supports property appreciation'
      })
    }

    // Analyze negative factors
    if (property.floodRisk > 0.6) {
      negative.push({
        factor: 'Flood Risk',
        impact: -0.04,
        description: 'High flood risk may limit appreciation potential'
      })
    }

    if (market.interestRates > 6) {
      negative.push({
        factor: 'High Interest Rates',
        impact: -0.07,
        description: 'Elevated mortgage rates reduce buyer demand'
      })
    }

    if (property.crimeRate > 70) {
      negative.push({
        factor: 'Crime Rate',
        impact: -0.05,
        description: 'High crime rate impacts property values negatively'
      })
    }

    return { positive, negative }
  }

  private calculateRiskScore(property: PropertyFeatures, market: MarketConditions): number {
    const climateRisk = (property.floodRisk + property.fireRisk + property.earthquakeRisk + property.seaLevelRisk) / 4
    const marketRisk = Math.abs(market.interestRates - 4) / 4
    const economicRisk = Math.max(0, (1 - market.employmentRate) - 0.04) * 5
    const locationRisk = Math.max(0, property.crimeRate - 50) / 50

    return (climateRisk + marketRisk + economicRisk + locationRisk) / 4
  }

  // Method to continuously improve the model with new data
  async updateModel(trainingData: Array<{ features: PropertyFeatures, market: MarketConditions, actualAppreciation: number[] }>) {
    if (!this.model || this.isTraining) return

    this.isTraining = true

    try {
      const xs = trainingData.map(d => this.extractFeatures(d.features, d.market))
      const ys = trainingData.map(d => d.actualAppreciation)

      const xTensor = tf.tensor2d(xs)
      const yTensor = tf.tensor2d(ys)

      await this.model.fit(xTensor, yTensor, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}`)
          }
        }
      })

      // Save the updated model
      await this.model.save('localstorage://property-prediction-model')

      xTensor.dispose()
      yTensor.dispose()

    } finally {
      this.isTraining = false
    }
  }

  dispose() {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.modelLoaded = false
      this.initializationPromise = null
    }
  }
} 