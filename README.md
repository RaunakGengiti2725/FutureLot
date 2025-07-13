# FutureLot.ai 🏠

**The world's most advanced AI-powered real estate prediction platform**

Discover tomorrow's hottest neighborhoods today using data-driven AI intelligence. FutureLot.ai empowers users to make smarter investment decisions with block-level property predictions, interactive heatmaps, and comprehensive market analysis.

## 🚀 Features

### 🧠 Core Functionality
- **AI-Powered Predictions**: Property appreciation forecasts for 6, 12, and 36 months
- **Interactive Heatmaps**: Visual investment insights with real-time market data
- **Rental Yield Simulations**: Calculate potential cash flow and ROI
- **Climate Risk Analysis**: Comprehensive flood, fire, and heat risk assessments
- **Infrastructure Intelligence**: Track upcoming transit and development projects

### 🔒 Authentication & Security
- **Secure Login**: Google OAuth integration with NextAuth.js
- **User Management**: Persistent user sessions and data
- **Protected Routes**: Dashboard access for authenticated users only

### 📊 Dashboard Features
- **Modern UI**: Clean, responsive design inspired by Zillow and Redfin
- **Multi-tab Navigation**: Overview, Search, Analytics, Predictions, Climate, Favorites
- **Real-time Stats**: Dynamic cards showing portfolio performance
- **Interactive Maps**: Property search with visual overlays and data points

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication middleware
- **Prisma ORM**: Database management
- **SQLite**: Local database (easily upgradeable to PostgreSQL)

### Future Integrations
- **Mapbox**: Interactive maps and geospatial data
- **Real Estate APIs**: Property data and market trends
- **Climate APIs**: Environmental risk data
- **AI/ML Services**: Advanced prediction models

## 🏗️ Project Structure

```
FutureLot.ai/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── predictions/   # AI predictions
│   │   │   ├── search/        # Location search
│   │   │   └── climate/       # Climate data
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── providers/         # React providers
│   │   └── ui/                # UI components
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Helper functions
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/futurelot-ai.git
   cd futurelot-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here-change-this-in-production
   
   # Google OAuth (Required)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # RapidAPI Key (Required for property data)
   RAPIDAPI_KEY=your-rapidapi-key-here
   
   # Optional API Keys (Free government APIs for enhanced features)
   CENSUS_API_KEY=your-census-api-key
   BLS_API_KEY=your-bls-api-key
   FRED_API_KEY=your-fred-api-key
   NOAA_API_KEY=your-noaa-api-key
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Google OAuth Setup (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add to Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy your Client ID and Client Secret to `.env.local`

### RapidAPI Setup (Required for Property Data)
1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to [US Real Estate API](https://rapidapi.com/datascraper/api/us-real-estate)
3. Copy your RapidAPI key to `.env.local`

### Optional API Keys (Free Government APIs)
These enhance the application with additional data:

- **Census API**: [Sign up here](https://api.census.gov/data/key_signup.html)
- **BLS API**: [Get key here](https://www.bls.gov/developers/home.htm)
- **FRED API**: [Register here](https://fred.stlouisfed.org/docs/api/api_key.html)
- **NOAA API**: [Request token here](https://www.ncdc.noaa.gov/cdo-web/token)

### Database Configuration
The project uses SQLite by default for development. For production:

1. **PostgreSQL Setup**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/futurelot"
   ```

2. **Update Prisma schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

## 🚨 Troubleshooting

### Common Issues

1. **"Google OAuth is not configured" error**
   - Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`
   - Verify the redirect URI in Google Console matches exactly
   - Visit `/setup` for a step-by-step guide

2. **"Unable to open database file" error**
   - Run `npx prisma generate` and `npx prisma db push`
   - Ensure the `prisma` folder exists and has write permissions

3. **"Invalid client" OAuth error**
   - Double-check your Google OAuth credentials
   - Make sure you're not using the demo values (`demo-client-id`)

4. **API data not loading**
   - Verify your `RAPIDAPI_KEY` is valid
   - Check you have an active subscription to US Real Estate API

## 🧪 API Endpoints

### Authentication
- `GET/POST /api/auth/*` - NextAuth.js authentication

### Properties
- `GET /api/properties` - Search properties
- `GET /api/property/analyze` - Analyze specific property

### Predictions
- `GET /api/predictions` - Get property predictions
- `POST /api/predictions` - Analyze specific property

### Search
- `GET /api/search` - Location suggestions and property search
- `POST /api/search` - Advanced property search with filters

### Climate
- `GET /api/climate` - Get climate risk data
- `POST /api/climate` - Batch climate analysis

## 🎨 UI Components

### Dashboard Components
- **DashboardLayout**: Main layout with sidebar navigation
- **MapView**: Interactive property map with layers
- **SearchBar**: Location search with suggestions
- **StatsCards**: Performance metrics display

### UI Components
- **LoadingSpinner**: Reusable loading indicator
- **Various utility components** for consistent styling

## 🔮 Future Enhancements

### Phase 1: Core Features
- [ ] Real Mapbox integration
- [ ] Live property data feeds
- [ ] Advanced filtering and sorting
- [ ] User favorites and saved searches

### Phase 2: AI & Analytics
- [ ] Machine learning prediction models
- [ ] Advanced market analytics
- [ ] Comparative market analysis
- [ ] Investment portfolio tracking

### Phase 3: Advanced Features
- [ ] Real-time notifications
- [ ] Market trend alerts
- [ ] Social features and sharing
- [ ] Mobile application

## 📚 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands
- `npx prisma studio` - Open database browser
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx prisma migrate dev` - Create and run migrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- NextAuth.js for authentication
- Prisma for database management
- All the open-source contributors

## 📞 Support

For support and questions:
- 📧 Email: support@futurelot.ai
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/futurelot-ai/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/futurelot-ai/wiki)

---

**Built with ❤️ for the future of real estate investing** 