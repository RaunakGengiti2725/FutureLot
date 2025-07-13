interface CensusMetrics {
  medianHomeValue: number
  medianIncome: number
  population: number
  populationGrowth: number
  employmentGrowth: number
  medianAge: number
}

interface CountyInvestmentScore {
  fips: string
  state: string
  county: string
  score: number
  metrics: CensusMetrics
  grade: 'excellent' | 'good' | 'fair' | 'poor'
  color: string
}

export class CensusDataService {
  private static instance: CensusDataService;
  private baseUrl: string;

  private constructor() {
    // Use our API route instead of Census API directly
    this.baseUrl = '/api/census';
  }

  public static getInstance(): CensusDataService {
    if (!CensusDataService.instance) {
      CensusDataService.instance = new CensusDataService();
    }
    return CensusDataService.instance;
  }

  private async fetchCensusData(params: any): Promise<any[]> {
    try {
      // Use 2021 ACS 5-year estimates (most recent complete dataset)
      const response = await fetch(`https://api.census.gov/data/2021/acs/acs5?${new URLSearchParams(params)}`);
      
      if (!response.ok) {
        throw new Error(`Census API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Census API response:', data.slice(0, 2)); // Log headers and first row
      return data;
    } catch (error) {
      console.error('Census API fetch error:', error);
      // Return mock data for development
      return [
        ["B25077_001E", "B19013_001E", "B01003_001E", "B01002_001E", "B23025_002E", "NAME", "state", "county"],
        ["500000", "75000", "500000", "35", "250000", "Sample County", "06", "001"]
      ];
    }
  }

  public async getCountyInvestmentScores(): Promise<any[]> {
    try {
      const params = {
        get: 'B25077_001E,B19013_001E,B01003_001E,B01002_001E,B23025_002E,NAME',
        for: 'county:*',
        in: 'state:*'
      };

      const data = await this.fetchCensusData(params);
      
      // Process the data (first row is headers)
      const [headers, ...rows] = data;
      
      console.log('Census API Headers:', headers);
      console.log('Sample row data:', rows[0]);

      return rows.map(row => {
        const [
          medianHomeValue,
          medianIncome,
          population,
          medianAge,
          laborForce,
          name,
          state,
          county
        ] = row;

        // Ensure state and county codes are properly padded
        const stateFips = state.padStart(2, '0');
        const countyFips = county.padStart(3, '0');
        const fips = `${stateFips}${countyFips}`;

        console.log(`Processing county data:`, {
          name,
          state: stateFips,
          county: countyFips,
          fips,
          medianHomeValue,
          medianIncome,
          population
        });

        // Calculate investment score
        const score = this.calculateInvestmentScore(
          Number(medianHomeValue) || 0,
          Number(medianIncome) || 0,
          Number(population) || 0,
          Number(medianAge) || 35,
          Number(laborForce) || 0
        );

        // Determine grade and color based on score
        const { grade, color } = this.getGradeAndColor(score);

        const result = {
          fips,
          county: name,
          score,
          metrics: {
            medianHomeValue: Number(medianHomeValue) || 0,
            medianIncome: Number(medianIncome) || 0,
            population: Number(population) || 0,
            medianAge: Number(medianAge) || 35,
            employmentGrowth: Number(laborForce) || 0,
            populationGrowth: 0 // Not available in current data
          },
          grade,
          color
        };

        console.log(`County ${name} (${fips}) score:`, score, 'grade:', grade);
        return result;
      });
    } catch (error) {
      console.error('Failed to get county investment scores:', error);
      throw error;
    }
  }

  public async getCountyInvestmentScoresForStates(stateFips: string[]): Promise<any[]> {
    try {
      const allCounties = await this.getCountyInvestmentScores();
      return allCounties.filter(county => stateFips.includes(county.fips.substring(0, 2)));
    } catch (error) {
      console.error('Failed to get county scores for states:', error);
      throw error;
    }
  }

  private calculateInvestmentScore(
    medianHomeValue: number,
    medianIncome: number,
    population: number,
    medianAge: number,
    laborForce: number
  ): number {
    // Skip calculation if we don't have enough valid data
    if (!medianHomeValue || !medianIncome || !population || !laborForce) {
      return 0;
    }

    // Normalize values using more realistic thresholds based on US averages
    const homeValueScore = Math.min(medianHomeValue / 350000, 1) * 100;  // US median ~$350k
    const incomeScore = Math.min(medianIncome / 70000, 1) * 100;         // US median ~$70k
    const populationScore = Math.min(population / 100000, 1) * 100;      // Good size for county
    const ageScore = Math.max(0, Math.min((65 - medianAge) / 30, 1)) * 100;
    const laborParticipation = (laborForce / population) * 100;
    const laborScore = Math.min(laborParticipation / 65, 1) * 100;      // US average ~65%

    // Log raw values for debugging
    console.log(`County metrics - Home: $${medianHomeValue}, Income: $${medianIncome}, Pop: ${population}, Age: ${medianAge}, Labor: ${laborParticipation}%`);
    console.log(`Normalized scores - Home: ${homeValueScore.toFixed(1)}, Income: ${incomeScore.toFixed(1)}, Pop: ${populationScore.toFixed(1)}, Age: ${ageScore.toFixed(1)}, Labor: ${laborScore.toFixed(1)}`);

    // Weight the factors based on investment potential
    // - Home value (30%): Higher values indicate established markets
    // - Income (25%): Higher incomes suggest economic stability
    // - Population (20%): Larger populations indicate market liquidity
    // - Age (15%): Younger populations suggest growth potential
    // - Labor participation (10%): Higher participation indicates economic health
    const weightedScore = (
      homeValueScore * 0.30 +
      incomeScore * 0.25 +
      populationScore * 0.20 +
      ageScore * 0.15 +
      laborScore * 0.10
    ) / 100;

    console.log(`Final weighted score: ${weightedScore.toFixed(3)}`);
    return weightedScore;
  }

  private getGradeAndColor(score: number): { grade: 'excellent' | 'good' | 'fair' | 'poor', color: string } {
    // More granular grading based on actual score distribution
    if (score >= 0.75) return { grade: 'excellent', color: '#22c55e' };     // Top 25%
    if (score >= 0.60) return { grade: 'good', color: '#3b82f6' };         // Top 40%
    if (score >= 0.40) return { grade: 'fair', color: '#eab308' };         // Middle 35%
    return { grade: 'poor', color: '#ef4444' };                            // Bottom 25%
  }
} 