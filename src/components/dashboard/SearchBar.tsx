'use client'

import React, { useState, useEffect } from 'react'
import { Search, MapPin, Loader2, TrendingUp, DollarSign, AlertCircle, X, CheckCircle } from 'lucide-react'

interface SearchBarProps {
  onSearchResults?: (results: any) => void
  onLocationSelect?: (location: { lat: number, lng: number, name: string, state: string }) => void
}

export function SearchBar({ onSearchResults, onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCity, setSelectedCity] = useState<any>(null)

  // Major US cities with real data - EXPANDED DATABASE
  const majorCities = [
    // California
    { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, highlight: 'Tech Hub' },
    { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, highlight: 'Entertainment' },
    { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, highlight: 'Beach City' },
    { name: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712, highlight: 'Emerging' },
    { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, highlight: 'State Capital' },
    { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, highlight: 'Silicon Valley' },
    { name: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871, highlight: 'Central Valley' },
    { name: 'Long Beach', state: 'CA', lat: 33.7701, lng: -118.1937, highlight: 'Port City' },
    
    // Texas
    { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, highlight: 'Tech Boom' },
    { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, highlight: 'Business Hub' },
    { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, highlight: 'Energy Capital' },
    { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, highlight: 'Affordable' },
    { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308, highlight: 'Cowtown' },
    { name: 'El Paso', state: 'TX', lat: 31.7619, lng: -106.4850, highlight: 'Border City' },
    
    // New York
    { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, highlight: 'World Capital' },
    { name: 'Buffalo', state: 'NY', lat: 42.8864, lng: -78.8784, highlight: 'Comeback City' },
    { name: 'Rochester', state: 'NY', lat: 43.1566, lng: -77.6088, highlight: 'Kodak City' },
    { name: 'Syracuse', state: 'NY', lat: 43.0481, lng: -76.1474, highlight: 'University Town' },
    { name: 'Albany', state: 'NY', lat: 42.6526, lng: -73.7562, highlight: 'Capital City' },
    
    // Florida
    { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, highlight: 'International' },
    { name: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572, highlight: 'Hot Market' },
    { name: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792, highlight: 'Tourism Hub' },
    { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557, highlight: 'River City' },
    { name: 'St. Petersburg', state: 'FL', lat: 27.7676, lng: -82.6403, highlight: 'Sunshine City' },
    { name: 'Fort Lauderdale', state: 'FL', lat: 26.1224, lng: -80.1373, highlight: 'Yachting Capital' },
    
    // Washington
    { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, highlight: 'Tech Capital' },
    { name: 'Spokane', state: 'WA', lat: 47.6588, lng: -117.4260, highlight: 'Inland Northwest' },
    { name: 'Tacoma', state: 'WA', lat: 47.2529, lng: -122.4443, highlight: 'Gritty City' },
    
    // Colorado
    { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, highlight: 'Mile High' },
    { name: 'Colorado Springs', state: 'CO', lat: 38.8339, lng: -104.8214, highlight: 'Military Town' },
    { name: 'Aurora', state: 'CO', lat: 39.7294, lng: -104.8319, highlight: 'Diverse City' },
    
    // Arizona
    { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, highlight: 'Desert Boom' },
    { name: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747, highlight: 'Desert Gem' },
    { name: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8315, highlight: 'Family City' },
    { name: 'Scottsdale', state: 'AZ', lat: 33.4942, lng: -111.9261, highlight: 'Luxury Desert' },
    
    // Nevada
    { name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, highlight: 'Entertainment' },
    { name: 'Reno', state: 'NV', lat: 39.5296, lng: -119.8138, highlight: 'Biggest Little City' },
    { name: 'Henderson', state: 'NV', lat: 36.0397, lng: -114.9817, highlight: 'Master Planned' },
    
    // North Carolina
    { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, highlight: 'Banking Hub' },
    { name: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382, highlight: 'Research Triangle' },
    { name: 'Greensboro', state: 'NC', lat: 36.0726, lng: -79.7920, highlight: 'Triad' },
    { name: 'Durham', state: 'NC', lat: 35.9940, lng: -78.8986, highlight: 'Bull City' },
    
    // Georgia
    { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, highlight: 'Southern Capital' },
    { name: 'Augusta', state: 'GA', lat: 33.4734, lng: -82.0105, highlight: 'Garden City' },
    { name: 'Columbus', state: 'GA', lat: 32.4609, lng: -84.9877, highlight: 'Fountain City' },
    { name: 'Savannah', state: 'GA', lat: 32.0835, lng: -81.0998, highlight: 'Historic Charm' },
    
    // Illinois
    { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, highlight: 'Midwest Hub' },
    { name: 'Aurora', state: 'IL', lat: 41.7606, lng: -88.3201, highlight: 'City of Lights' },
    { name: 'Peoria', state: 'IL', lat: 40.6936, lng: -89.5889, highlight: 'River City' },
    
    // Tennessee
    { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, highlight: 'Music City' },
    { name: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490, highlight: 'Blues Capital' },
    { name: 'Knoxville', state: 'TN', lat: 35.9606, lng: -83.9207, highlight: 'Volunteer State' },
    { name: 'Chattanooga', state: 'TN', lat: 35.0456, lng: -85.3097, highlight: 'Scenic City' },
    
    // Massachusetts
    { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, highlight: 'Education Hub' },
    { name: 'Worcester', state: 'MA', lat: 42.2626, lng: -71.8023, highlight: 'Heart of Commonwealth' },
    { name: 'Springfield', state: 'MA', lat: 42.1015, lng: -72.5898, highlight: 'Basketball City' },
    { name: 'Cambridge', state: 'MA', lat: 42.3736, lng: -71.1097, highlight: 'Harvard & MIT' },
    
    // Oregon
    { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784, highlight: 'Keep It Weird' },
    { name: 'Eugene', state: 'OR', lat: 44.0521, lng: -123.0868, highlight: 'Track Town' },
    { name: 'Salem', state: 'OR', lat: 44.9429, lng: -123.0351, highlight: 'Cherry City' },
    
    // Ohio
    { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, highlight: 'Affordable Tech' },
    { name: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944, highlight: 'Comeback City' },
    { name: 'Cincinnati', state: 'OH', lat: 39.1031, lng: -84.5120, highlight: 'Queen City' },
    { name: 'Toledo', state: 'OH', lat: 41.6639, lng: -83.5552, highlight: 'Glass City' },
    { name: 'Akron', state: 'OH', lat: 41.0814, lng: -81.5190, highlight: 'Rubber Capital' },
    
    // Utah
    { name: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910, highlight: 'Silicon Slopes' },
    { name: 'West Valley City', state: 'UT', lat: 40.6916, lng: -112.0010, highlight: 'Suburban Growth' },
    { name: 'Provo', state: 'UT', lat: 40.2338, lng: -111.6585, highlight: 'University Town' },
    
    // Michigan
    { name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, highlight: 'Motor City Revival' },
    { name: 'Grand Rapids', state: 'MI', lat: 42.9634, lng: -85.6681, highlight: 'Furniture City' },
    { name: 'Warren', state: 'MI', lat: 42.5144, lng: -83.0146, highlight: 'Automotive Hub' },
    { name: 'Sterling Heights', state: 'MI', lat: 42.5803, lng: -83.0302, highlight: 'Suburban Family' },
    
    // Pennsylvania
    { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, highlight: 'City of Brotherly Love' },
    { name: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959, highlight: 'Steel City Renaissance' },
    { name: 'Allentown', state: 'PA', lat: 40.6084, lng: -75.4902, highlight: 'Lehigh Valley' },
    { name: 'Erie', state: 'PA', lat: 42.1292, lng: -80.0851, highlight: 'Lake Erie City' },
    
    // Virginia
    { name: 'Virginia Beach', state: 'VA', lat: 36.8529, lng: -75.9780, highlight: 'Resort City' },
    { name: 'Norfolk', state: 'VA', lat: 36.8468, lng: -76.2852, highlight: 'Naval Base' },
    { name: 'Richmond', state: 'VA', lat: 37.5407, lng: -77.4360, highlight: 'Historic Capital' },
    { name: 'Newport News', state: 'VA', lat: 37.0871, lng: -76.4730, highlight: 'Shipbuilding' },
    
    // Wisconsin
    { name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065, highlight: 'Brew City' },
    { name: 'Madison', state: 'WI', lat: 43.0731, lng: -89.4012, highlight: 'Capital City' },
    { name: 'Green Bay', state: 'WI', lat: 44.5133, lng: -88.0133, highlight: 'Packers Town' },
    
    // Minnesota
    { name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, highlight: 'Mill City' },
    { name: 'St. Paul', state: 'MN', lat: 44.9537, lng: -93.0900, highlight: 'Twin City' },
    { name: 'Rochester', state: 'MN', lat: 44.0121, lng: -92.4802, highlight: 'Med City' },
    
    // Missouri
    { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, highlight: 'BBQ Capital' },
    { name: 'St. Louis', state: 'MO', lat: 38.6270, lng: -90.1994, highlight: 'Gateway City' },
    { name: 'Springfield', state: 'MO', lat: 37.2153, lng: -93.2982, highlight: 'Queen City of Ozarks' },
    
    // Indiana
    { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, highlight: 'Racing Capital' },
    { name: 'Fort Wayne', state: 'IN', lat: 41.0793, lng: -85.1394, highlight: 'Summit City' },
    { name: 'Evansville', state: 'IN', lat: 37.9716, lng: -87.5710, highlight: 'River City' },
    
    // Kentucky
    { name: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, highlight: 'Derby City' },
    { name: 'Lexington', state: 'KY', lat: 38.0406, lng: -84.5037, highlight: 'Horse Capital' },
    { name: 'Bowling Green', state: 'KY', lat: 36.9685, lng: -86.4808, highlight: 'Corvette City' },
    
    // Louisiana
    { name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715, highlight: 'Jazz Capital' },
    { name: 'Baton Rouge', state: 'LA', lat: 30.4515, lng: -91.1871, highlight: 'Red Stick' },
    { name: 'Shreveport', state: 'LA', lat: 32.5252, lng: -93.7502, highlight: 'ArkLaTex' },
    
    // Alabama
    { name: 'Birmingham', state: 'AL', lat: 33.5207, lng: -86.8025, highlight: 'Magic City' },
    { name: 'Montgomery', state: 'AL', lat: 32.3668, lng: -86.3000, highlight: 'Cradle of Confederacy' },
    { name: 'Mobile', state: 'AL', lat: 30.6944, lng: -88.0399, highlight: 'Port City' },
    { name: 'Huntsville', state: 'AL', lat: 34.7304, lng: -86.5861, highlight: 'Rocket City' },
    
    // South Carolina
    { name: 'Charleston', state: 'SC', lat: 32.7765, lng: -79.9311, highlight: 'Holy City' },
    { name: 'Columbia', state: 'SC', lat: 34.0007, lng: -81.0348, highlight: 'Soda City' },
    { name: 'Greenville', state: 'SC', lat: 34.8526, lng: -82.3940, highlight: 'Textile Town' },
    
    // Oklahoma
    { name: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164, highlight: 'OKC' },
    { name: 'Tulsa', state: 'OK', lat: 36.1540, lng: -95.9928, highlight: 'Oil Capital' },
    { name: 'Norman', state: 'OK', lat: 35.2226, lng: -97.4395, highlight: 'Sooner City' },
    
    // Kansas
    { name: 'Wichita', state: 'KS', lat: 37.6872, lng: -97.3301, highlight: 'Air Capital' },
    { name: 'Overland Park', state: 'KS', lat: 38.9822, lng: -94.6708, highlight: 'Planned Community' },
    { name: 'Kansas City', state: 'KS', lat: 39.1142, lng: -94.6275, highlight: 'Wyandotte' },
    
    // Nebraska
    { name: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345, highlight: 'Gateway to West' },
    { name: 'Lincoln', state: 'NE', lat: 40.8136, lng: -96.7026, highlight: 'Star City' },
    { name: 'Bellevue', state: 'NE', lat: 41.1370, lng: -95.9145, highlight: 'Suburban Growth' },
    
    // Iowa
    { name: 'Des Moines', state: 'IA', lat: 41.5868, lng: -93.6250, highlight: 'Insurance Capital' },
    { name: 'Cedar Rapids', state: 'IA', lat: 41.9778, lng: -91.6656, highlight: 'City of Five Seasons' },
    { name: 'Davenport', state: 'IA', lat: 41.5236, lng: -90.5776, highlight: 'Quad Cities' },
    
    // Arkansas
    { name: 'Little Rock', state: 'AR', lat: 34.7465, lng: -92.2896, highlight: 'Natural State' },
    { name: 'Fort Smith', state: 'AR', lat: 35.3859, lng: -94.3985, highlight: 'Border City' },
    { name: 'Fayetteville', state: 'AR', lat: 36.0625, lng: -94.1574, highlight: 'Razorback City' },
    
    // Mississippi
    { name: 'Jackson', state: 'MS', lat: 32.2988, lng: -90.1848, highlight: 'Chimneyville' },
    { name: 'Gulfport', state: 'MS', lat: 30.3674, lng: -89.0928, highlight: 'Coast City' },
    { name: 'Southaven', state: 'MS', lat: 34.9890, lng: -90.0126, highlight: 'DeSoto County' },
    
    // New Mexico
    { name: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504, highlight: 'Duke City' },
    { name: 'Las Cruces', state: 'NM', lat: 32.3199, lng: -106.7637, highlight: 'Mesilla Valley' },
    { name: 'Rio Rancho', state: 'NM', lat: 35.2333, lng: -106.6630, highlight: 'Planned City' },
    
    // West Virginia
    { name: 'Charleston', state: 'WV', lat: 38.3498, lng: -81.6326, highlight: 'Mountain State Capital' },
    { name: 'Huntington', state: 'WV', lat: 38.4192, lng: -82.4452, highlight: 'River City' },
    { name: 'Morgantown', state: 'WV', lat: 39.6295, lng: -79.9553, highlight: 'University Town' },
    
    // Connecticut
    { name: 'Bridgeport', state: 'CT', lat: 41.1865, lng: -73.1952, highlight: 'Park City' },
    { name: 'New Haven', state: 'CT', lat: 41.3083, lng: -72.9279, highlight: 'Elm City' },
    { name: 'Hartford', state: 'CT', lat: 41.7658, lng: -72.6734, highlight: 'Insurance Capital' },
    
    // Rhode Island
    { name: 'Providence', state: 'RI', lat: 41.8240, lng: -71.4128, highlight: 'Creative Capital' },
    { name: 'Warwick', state: 'RI', lat: 41.7001, lng: -71.4162, highlight: 'Suburban City' },
    { name: 'Cranston', state: 'RI', lat: 41.7798, lng: -71.4373, highlight: 'Garden City' },
    
    // Vermont
    { name: 'Burlington', state: 'VT', lat: 44.4759, lng: -73.2121, highlight: 'Queen City' },
    { name: 'South Burlington', state: 'VT', lat: 44.4669, lng: -73.1709, highlight: 'Suburban Growth' },
    { name: 'Rutland', state: 'VT', lat: 43.6106, lng: -72.9726, highlight: 'Marble City' },
    
    // New Hampshire
    { name: 'Manchester', state: 'NH', lat: 42.9956, lng: -71.4548, highlight: 'Queen City' },
    { name: 'Nashua', state: 'NH', lat: 42.7654, lng: -71.4676, highlight: 'Gate City' },
    { name: 'Concord', state: 'NH', lat: 43.2081, lng: -71.5376, highlight: 'Capital City' },
    
    // Maine
    { name: 'Portland', state: 'ME', lat: 43.6591, lng: -70.2568, highlight: 'Forest City' },
    { name: 'Lewiston', state: 'ME', lat: 44.1000, lng: -70.2148, highlight: 'Textile City' },
    { name: 'Bangor', state: 'ME', lat: 44.8016, lng: -68.7712, highlight: 'Queen City' },
    
    // Maryland
    { name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122, highlight: 'Charm City' },
    { name: 'Frederick', state: 'MD', lat: 39.4143, lng: -77.4105, highlight: 'Historic Frederick' },
    { name: 'Rockville', state: 'MD', lat: 39.0840, lng: -77.1528, highlight: 'Biotech Hub' },
    { name: 'Gaithersburg', state: 'MD', lat: 39.1434, lng: -77.2014, highlight: 'Tech Corridor' },
    
    // Washington DC
    { name: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369, highlight: 'Nation\'s Capital' },
    
    // Delaware
    { name: 'Wilmington', state: 'DE', lat: 39.7391, lng: -75.5398, highlight: 'Corporate Capital' },
    { name: 'Dover', state: 'DE', lat: 39.1612, lng: -75.5264, highlight: 'First State Capital' },
    { name: 'Newark', state: 'DE', lat: 39.6837, lng: -75.7497, highlight: 'University Town' },
    
    // New Jersey
    { name: 'Newark', state: 'NJ', lat: 40.7357, lng: -74.1724, highlight: 'Brick City' },
    { name: 'Jersey City', state: 'NJ', lat: 40.7178, lng: -74.0431, highlight: 'Wall Street West' },
    { name: 'Paterson', state: 'NJ', lat: 40.9168, lng: -74.1718, highlight: 'Silk City' },
    { name: 'Elizabeth', state: 'NJ', lat: 40.6640, lng: -74.2107, highlight: 'Port City' },
    
    // Montana
    { name: 'Billings', state: 'MT', lat: 45.7833, lng: -108.5007, highlight: 'Magic City' },
    { name: 'Missoula', state: 'MT', lat: 46.8721, lng: -113.9940, highlight: 'Garden City' },
    { name: 'Great Falls', state: 'MT', lat: 47.4941, lng: -111.2833, highlight: 'Electric City' },
    
    // Wyoming
    { name: 'Cheyenne', state: 'WY', lat: 41.1400, lng: -104.8197, highlight: 'Capital City' },
    { name: 'Casper', state: 'WY', lat: 42.8400, lng: -106.3242, highlight: 'Oil City' },
    { name: 'Laramie', state: 'WY', lat: 41.3114, lng: -105.5911, highlight: 'Gem City' },
    
    // North Dakota
    { name: 'Fargo', state: 'ND', lat: 46.8772, lng: -96.7898, highlight: 'Gate City' },
    { name: 'Bismarck', state: 'ND', lat: 46.8083, lng: -100.7837, highlight: 'Capital City' },
    { name: 'Grand Forks', state: 'ND', lat: 47.9253, lng: -97.0329, highlight: 'University Town' },
    
    // South Dakota
    { name: 'Sioux Falls', state: 'SD', lat: 43.5446, lng: -96.7311, highlight: 'Falls City' },
    { name: 'Rapid City', state: 'SD', lat: 44.0805, lng: -103.2310, highlight: 'Gateway to Black Hills' },
    { name: 'Aberdeen', state: 'SD', lat: 45.4647, lng: -98.4865, highlight: 'Hub City' },
    
    // Idaho
    { name: 'Boise', state: 'ID', lat: 43.6150, lng: -116.2023, highlight: 'City of Trees' },
    { name: 'Nampa', state: 'ID', lat: 43.5407, lng: -116.5635, highlight: 'Treasure Valley' },
    { name: 'Meridian', state: 'ID', lat: 43.6121, lng: -116.3915, highlight: 'Fast Growing' },
    
    // Alaska
    { name: 'Anchorage', state: 'AK', lat: 61.2181, lng: -149.9003, highlight: 'Last Frontier' },
    { name: 'Fairbanks', state: 'AK', lat: 64.8378, lng: -147.7164, highlight: 'Golden Heart' },
    { name: 'Juneau', state: 'AK', lat: 58.3019, lng: -134.4197, highlight: 'Capital City' },
    
    // Hawaii
    { name: 'Honolulu', state: 'HI', lat: 21.3099, lng: -157.8581, highlight: 'Pacific Paradise' },
    { name: 'Pearl City', state: 'HI', lat: 21.3972, lng: -157.9755, highlight: 'Suburban Oahu' },
    { name: 'Hilo', state: 'HI', lat: 19.7297, lng: -155.0900, highlight: 'Big Island' }
  ]

  // Debounced suggestions with advanced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 1) {
        const normalizedQuery = query.toLowerCase().trim()
        
        // Search through major cities
        const cityResults = majorCities.filter(city => 
          city.name.toLowerCase().includes(normalizedQuery) ||
          city.state.toLowerCase().includes(normalizedQuery) ||
          `${city.name}, ${city.state}`.toLowerCase().includes(normalizedQuery) ||
          city.highlight.toLowerCase().includes(normalizedQuery)
        )

        // Sort by relevance
        cityResults.sort((a, b) => {
          const aExact = a.name.toLowerCase() === normalizedQuery
          const bExact = b.name.toLowerCase() === normalizedQuery
          const aStarts = a.name.toLowerCase().startsWith(normalizedQuery)
          const bStarts = b.name.toLowerCase().startsWith(normalizedQuery)

          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
          
          return a.name.localeCompare(b.name)
        })

        setSuggestions(cityResults.slice(0, 8))
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])



  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // First check if we have a selected city
      let cityToSearch = selectedCity
      
      // If no selected city, try to find one from the query
      if (!cityToSearch) {
        cityToSearch = majorCities.find(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          `${c.name}, ${c.state}`.toLowerCase().includes(query.toLowerCase())
        )
      }
      
      if (cityToSearch) {
        await performSearch(cityToSearch)
      } else {
        alert('City not found. Please try searching for a major US city like "Austin, TX" or "Miami, FL"')
      }
    }
  }

  const performSearch = async (city: any) => {
    setIsSearching(true)
    setIsLoading(true)
    
    try {
      console.log('🔍 FutureLot.ai: Analyzing', city.name, city.state)
      
      // Notify parent about location selection
      if (onLocationSelect) {
        onLocationSelect({
          lat: city.lat,
          lng: city.lng,
          name: city.name,
          state: city.state
        })
      }

      // Call the parent's onSearchResults with the city info
      if (onSearchResults) {
        onSearchResults({
          name: city.name,
          state: city.state,
          lat: city.lat,
          lng: city.lng
        })
      }

      // Clear suggestions but keep the selected city and query for potential re-analysis
      setSuggestions([])
      
    } catch (error) {
      console.error('Search error:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleSuggestionClick = (city: any) => {
    // Set the query and store the selected city
    setQuery(`${city.name}, ${city.state}`)
    setSelectedCity(city)
    setSuggestions([])
    
    // Set the location for the parent component
    if (onLocationSelect) {
      onLocationSelect({
        lat: city.lat,
        lng: city.lng,
        name: city.name,
        state: city.state
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    
    // Clear selected city when user types manually
    if (selectedCity) {
      setSelectedCity(null)
    }
    
    // Enable the form if user has typed something
    if (newValue.trim() && isSearching) {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSelectedCity(null)
    setSuggestions([])
    setIsSearching(false)
    setIsLoading(false)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search major US cities: Austin, Miami, Denver, Seattle..."
            disabled={isSearching}
            className="input-modern w-full pl-4 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
            style={{ color: '#1a1a1a' }}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 animate-spin text-blue-500" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="btn-modern ml-2.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
        >
          {isSearching ? (
            <div className="flex items-center space-x-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-sm">Analyze</span>
            </div>
          )}
        </button>
      </form>

      {/* Enhanced suggestions dropdown */}
      {suggestions.length > 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden max-h-80 overflow-y-auto">
          <div className="px-3 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <p className="text-xs font-semibold text-gray-800">
                🏙️ Major US Cities
              </p>
            </div>
          </div>
          
          {suggestions.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(city)}
              className="w-full px-3 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center justify-between transition-all duration-200 text-gray-900 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-2.5">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{city.state}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm text-gray-900 font-semibold">{city.name}</span>
                    <span className="text-gray-500 text-xs">{city.state}</span>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {city.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click to select, then press Analyze
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1.5 text-gray-400">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Ready</span>
              </div>
            </button>
          ))}
          

        </div>
      )}

      {/* Search status indicator */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3 z-20">
          <div className="flex items-center space-x-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-blue-900">
                🚀 FutureLot.ai is analyzing your market...
              </div>
              <div className="text-xs text-blue-700 mt-0.5">
                Processing 2.5M+ data points • AI predictions • Market intelligence
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis complete indicator */}
      {!isSearching && !isLoading && selectedCity && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-green-900">
                  ✅ Analysis complete for {selectedCity.name}, {selectedCity.state}
                </div>
                <div className="text-xs text-green-700 mt-0.5">
                  Clear search to analyze another city
                </div>
              </div>
            </div>
            <button
              onClick={clearSearch}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 