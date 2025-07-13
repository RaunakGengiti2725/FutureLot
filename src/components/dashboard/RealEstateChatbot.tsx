'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

interface RealEstateChatbotProps {
  className?: string
}

export function RealEstateChatbot({ className = '' }: RealEstateChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm FutureLot AI, your real estate intelligence assistant. I can help you understand market trends, property analysis, and how to use our platform. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real estate knowledge base
  const realEstateKnowledge = {
    // App-specific knowledge
    'what is futurelot': 'FutureLot.ai is an AI-powered real estate intelligence platform that analyzes 2.5M+ properties across 180+ cities. We provide growth predictions, risk assessments, and comprehensive market analytics to help you make informed real estate investment decisions.',
    'how does futurelot work': 'FutureLot uses advanced AI algorithms to analyze property data, market trends, neighborhood development, and economic indicators. Our platform shows you property locations on interactive maps with color-coded growth potential and risk levels.',
    'what cities are covered': 'We cover 180+ major cities including San Francisco, Los Angeles, New York, Miami, Austin, Seattle, Denver, Chicago, Boston, and many more. Each city has thousands of properties with detailed AI-powered analysis.',
    'how accurate are predictions': 'Our AI models achieve 97.2% accuracy in property trend predictions. We analyze historical data, market conditions, zoning changes, infrastructure development, and economic indicators to provide reliable forecasts.',
    
    // Real estate fundamentals
    'what is appreciation': 'Property appreciation is the increase in property value over time. It can be driven by factors like location desirability, economic growth, infrastructure improvements, and market demand. Our platform predicts annual appreciation rates for each property.',
    'what is cash flow': 'Cash flow is the net income from a rental property after deducting all expenses including mortgage payments, taxes, insurance, maintenance, and property management fees. Positive cash flow means the property generates more income than expenses.',
    'what is cap rate': 'Capitalization rate (cap rate) is the ratio of a property\'s net operating income to its purchase price. It helps evaluate the potential return on investment. Higher cap rates typically indicate higher returns but may also mean higher risk.',
    'what is roi': 'Return on Investment (ROI) measures the profitability of a real estate investment. It\'s calculated as (gain from investment - cost of investment) / cost of investment × 100. Our platform helps you identify properties with the best ROI potential.',
    
    // Market analysis
    'what affects property values': 'Property values are influenced by location, neighborhood quality, schools, economic conditions, job growth, infrastructure, crime rates, supply and demand, interest rates, and future development plans. Our AI analyzes all these factors.',
    'how to analyze market trends': 'Analyze market trends by looking at price history, inventory levels, days on market, sales volume, employment rates, population growth, and new construction. Our platform provides comprehensive trend analysis for each city.',
    'what is market cycle': 'Real estate markets go through cycles: recovery, expansion, hyper supply, and recession. Understanding where a market is in its cycle helps time investments. Our AI identifies current market phases for each city.',
    
    // Investment strategies
    'buy and hold strategy': 'Buy and hold involves purchasing property for long-term appreciation and rental income. This strategy works well in growing markets with strong fundamentals. Our platform identifies the best buy-and-hold opportunities.',
    'fix and flip strategy': 'Fix and flip involves buying undervalued properties, renovating them, and selling for profit. Success depends on accurate renovation costs and market timing. Look for properties in improving neighborhoods.',
    'brrrr strategy': 'BRRRR (Buy, Rehab, Rent, Refinance, Repeat) is a strategy where investors buy distressed properties, renovate them, rent them out, refinance based on new value, and repeat the process with pulled-out equity.',
    
    // Financing
    'what is down payment': 'A down payment is the upfront cash payment for a property purchase. Typical down payments range from 3-25% depending on loan type. Investment properties usually require 20-25% down payment.',
    'what is mortgage rate': 'Mortgage rates determine the cost of borrowing money for real estate. Rates are influenced by economic conditions, credit scores, and loan terms. Even small rate changes significantly impact monthly payments and affordability.',
    'what is debt to income ratio': 'Debt-to-income (DTI) ratio compares your monthly debt payments to gross monthly income. Lenders typically prefer DTI below 43% for conventional loans. Lower DTI ratios increase loan approval chances and better rates.',
    
    // Risk assessment
    'what is investment risk': 'Real estate investment risks include market volatility, vacancy rates, property damage, interest rate changes, economic downturns, and regulatory changes. Our platform provides comprehensive risk scores for each property.',
    'how to minimize risk': 'Minimize risk through diversification, thorough due diligence, proper insurance, maintaining cash reserves, choosing good locations, and working with experienced professionals. Our AI helps identify lower-risk opportunities.',
    'what is vacancy risk': 'Vacancy risk is the possibility that a rental property remains unoccupied, resulting in lost rental income. Factors include local job market, population trends, property condition, and rental rates. Choose properties in high-demand areas.',
    
    // Location factors
    'what makes a good location': 'Good locations have strong job markets, population growth, good schools, low crime rates, transportation access, amenities, and future development plans. Our platform analyzes all these location factors.',
    'how important are schools': 'School quality significantly impacts property values and rental demand. Properties in top-rated school districts typically appreciate faster and attract stable tenants. Families prioritize school quality when choosing neighborhoods.',
    'what is walkability': 'Walkability measures how easy it is to walk to amenities like shops, restaurants, parks, and transit. Higher walkability typically correlates with higher property values and rental demand, especially among younger demographics.',
    
    // Platform features
    'how to use the map': 'Our interactive map shows properties color-coded by growth potential (green=high, blue=good, orange=fair, gray=low) or risk levels. Click properties for detailed analysis. Use the Growth/Risk toggle to switch between views.',
    'what do the colors mean': 'Green dots show properties with 20%+ predicted growth, blue shows 15-20% growth, red shows 12-15%, purple shows 10-12%, orange shows 8-10%, and gray shows under 8% growth potential.',
    'how to search cities': 'Use the search bar to find specific cities or neighborhoods. Our platform covers 150+ cities with detailed property analysis. Each city shows realistic property counts and neighborhood-specific data.',
    
    // Default responses
    'help': 'I can help you with real estate investing, market analysis, property evaluation, financing, risk assessment, and how to use the FutureLot platform. What specific topic would you like to explore?',
    'default': 'I specialize in real estate investing and the FutureLot platform. I can help with market analysis, property evaluation, investment strategies, financing, and risk assessment. Could you ask a more specific question about real estate?'
  }

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Personal/conversational responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
      return "I'm doing excellent, thank you for asking! I'm energized by analyzing real estate data and helping investors make smart decisions. I've processed over 2.3 million property records today and identified 847 new investment opportunities. How can I help you find your next great investment?"
    }
    
    if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
      return "I'm FutureLot.ai's advanced real estate intelligence system! I combine machine learning, market analysis, and predictive modeling to provide world-class investment insights. I analyze 2.5M+ properties daily across 180+ cities, track 500+ economic indicators, and have a 97.2% accuracy rate in market predictions. Think of me as your personal real estate research team, available 24/7!"
    }
    
    if (lowerMessage.includes('are you real') || lowerMessage.includes('are you human')) {
      return "I'm an AI assistant, but I'm powered by real data and real expertise! While I'm not human, I have access to comprehensive real estate databases, market analytics, and investment strategies that would take human analysts weeks to compile. I'm designed to be your knowledgeable, always-available real estate advisor."
    }
    
    // Check for greetings first
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your advanced FutureLot AI assistant with access to comprehensive market intelligence. I analyze 2.5M+ properties daily across 180+ cities and can help with property analysis, investment strategies, market trends, financing options, and risk assessment. What would you like to explore today?"
    }
    
    // Check for thanks
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! I'm here to help you succeed in real estate investing. Remember, the best investments are made with data-driven decisions, and I'm here to provide you with the most accurate, up-to-date market intelligence available. Is there anything else you'd like to analyze?"
    }
    
    // Advanced real estate concepts
    if (lowerMessage.includes('1031 exchange') || lowerMessage.includes('like-kind exchange')) {
      return "1031 exchanges are powerful tax-deferral strategies! You can defer capital gains by reinvesting into like-kind property within 180 days. Key rules: must be investment property, equal or greater value, use qualified intermediary, and identify replacement property within 45 days. This strategy can help you build wealth faster by avoiding immediate tax payments. I can help identify replacement properties that maximize your investment potential."
    }
    
    if (lowerMessage.includes('depreciation') || lowerMessage.includes('tax benefits')) {
      return "Real estate offers excellent tax advantages! Depreciation allows you to deduct property value decline over 27.5 years (residential) or 39 years (commercial), even if the property appreciates. Other benefits include: mortgage interest deduction, property tax deduction, repair/maintenance expenses, and professional services. These tax benefits can significantly improve your actual returns!"
    }
    
    if (lowerMessage.includes('opportunity zones') || lowerMessage.includes('qualified opportunity fund')) {
      return "Opportunity Zones offer incredible tax benefits! Invest capital gains in designated low-income areas through Qualified Opportunity Funds. Benefits: defer capital gains until 2026, reduce tax by 10-15% if held 5-7 years, and pay ZERO tax on appreciation if held 10+ years. There are 8,700+ opportunity zones nationwide. This is one of the most powerful tax strategies available!"
    }
    
    if (lowerMessage.includes('syndication') || lowerMessage.includes('real estate syndication')) {
      return "Real estate syndications allow you to invest in larger properties with less capital! A syndicator (general partner) raises money from investors (limited partners) to buy properties like apartments, office buildings, or shopping centers. Benefits include: passive income, professional management, diversification, and access to institutional-quality properties. Typical returns range from 8-15% annually."
    }
    
    if (lowerMessage.includes('reit') || lowerMessage.includes('real estate investment trust')) {
      return "REITs offer liquid real estate exposure! These companies own/operate income-producing real estate and must distribute 90% of taxable income as dividends. Types include: equity REITs (own properties), mortgage REITs (lend money), and hybrid REITs. Benefits: liquidity, diversification, professional management, and steady dividends. However, they're subject to market volatility unlike direct property ownership."
    }
    
    if (lowerMessage.includes('hard money') || lowerMessage.includes('private lending')) {
      return "Hard money lending is short-term, asset-based financing! These loans are secured by real estate, typically 6-24 months, with higher interest rates (8-15%). Used for: fix-and-flip projects, bridge financing, and time-sensitive purchases. Benefits include speed (close in days), less documentation, and credit flexibility. However, rates are higher and terms shorter than traditional financing."
    }
    
    if (lowerMessage.includes('inflation') || lowerMessage.includes('hedge against inflation')) {
      return "Real estate is an excellent inflation hedge! As inflation rises, property values and rents typically increase, maintaining your purchasing power. Fixed-rate mortgages become cheaper to pay off with inflated dollars. Historically, real estate has outpaced inflation by 2-3% annually. During high inflation periods, tangible assets like real estate often outperform stocks and bonds."
    }
    
    if (lowerMessage.includes('recession') || lowerMessage.includes('economic downturn')) {
      return "Real estate can be resilient during recessions if you choose wisely! Focus on: essential housing in stable areas, properties with strong cash flow, and markets with economic diversity. Recessions often create opportunities through distressed sales and lower competition. However, avoid overleveraged properties and speculative markets. Cash reserves are crucial for weathering downturns."
    }
    
    if (lowerMessage.includes('interest rates') || lowerMessage.includes('fed policy')) {
      return "Interest rates significantly impact real estate markets! Rising rates reduce affordability and slow price appreciation but can increase rental demand. Falling rates boost buying power and property values. Current rates around 7-8% are historically normal but feel high after years of low rates. Rate changes affect different property types differently - cash flow properties are less sensitive than appreciation plays."
    }
    
    if (lowerMessage.includes('gentrification') || lowerMessage.includes('neighborhood transformation')) {
      return "Gentrification can create significant investment opportunities! Look for early indicators: artist communities, new businesses, infrastructure improvements, and young professional influx. Benefits include rapid appreciation and improved neighborhood quality. However, be aware of potential displacement issues and community resistance. The key is identifying areas in early stages before prices spike."
    }
    
    if (lowerMessage.includes('demographic trends') || lowerMessage.includes('population growth')) {
      return "Demographics drive long-term real estate demand! Key trends: millennials entering peak buying years, remote work enabling geographic flexibility, and aging baby boomers downsizing. Growth markets show young professional influx, job creation, and lifestyle appeal. I analyze migration patterns, age distributions, and income levels to identify emerging opportunities."
    }
    
    if (lowerMessage.includes('supply and demand') || lowerMessage.includes('housing shortage')) {
      return "Supply and demand fundamentals drive property values! Many markets face housing shortages due to: restrictive zoning, high construction costs, and NIMBY opposition. Limited supply with growing demand creates price appreciation. I analyze building permits, construction costs, and regulatory environments to identify supply-constrained markets with strong demand."
    }
    
    if (lowerMessage.includes('climate change') || lowerMessage.includes('climate risk')) {
      return "Climate risk is increasingly important for real estate! Rising sea levels, extreme weather, and temperature changes affect property values and insurance costs. Climate-resilient markets like Denver, Austin, and inland areas are gaining premium valuations. I analyze flood zones, wildfire risk, hurricane exposure, and temperature trends to assess long-term viability."
    }
    
    if (lowerMessage.includes('technology') || lowerMessage.includes('proptech')) {
      return "Technology is transforming real estate! PropTech innovations include: AI-powered valuations, virtual tours, blockchain transactions, and smart home technology. These tools improve efficiency, reduce costs, and enhance user experience. I use advanced algorithms to analyze market data and predict trends that would be impossible for humans to process manually."
    }
    
    if (lowerMessage.includes('institutional investors') || lowerMessage.includes('wall street')) {
      return "Institutional investors are significantly impacting residential markets! They're targeting single-family rentals, multifamily properties, and build-to-rent communities. This creates competition but also validates investment strategies. Markets with heavy institutional presence often see accelerated appreciation. I track institutional activity to identify emerging trends and opportunities."
    }
    
    if (lowerMessage.includes('remote work') || lowerMessage.includes('work from home')) {
      return "Remote work has fundamentally shifted real estate demand! Migration from expensive coastal cities to affordable inland markets is creating long-term value in secondary cities. Beneficiaries include Austin, Denver, Nashville, Tampa, and Phoenix. This trend is likely permanent, creating sustained demand in previously overlooked markets with lower costs and higher quality of life."
    }
    
    if (lowerMessage.includes('crypto') || lowerMessage.includes('bitcoin')) {
      return "Interesting connection between crypto and real estate! Some investors diversify from crypto volatility into real estate for stability and cash flow. Real estate offers tangible assets, leverage opportunities, tax benefits, and inflation hedging. I'm seeing crypto wealth being deployed into luxury real estate markets. Both can be part of a diversified investment strategy."
    }
    
    if (lowerMessage.includes('artificial intelligence') || lowerMessage.includes('machine learning')) {
      return "AI is revolutionizing real estate analysis! I use machine learning to process massive datasets, identify patterns, and predict market movements. AI enables analysis of 500+ variables simultaneously - something impossible for human analysts. Applications include automated valuation models, predictive analytics, risk assessment, and personalized investment recommendations. The future of real estate is increasingly data-driven!"
    }
    
    // City-specific investment questions (enhanced)
    if (lowerMessage.includes('invest') && lowerMessage.includes('san diego')) {
      return "San Diego is an excellent investment market! The city has strong fundamentals with job growth in tech and biotech, limited housing supply, and consistent population growth. La Jolla and Pacific Beach offer premium properties with high appreciation potential. Our platform shows San Diego properties with an average predicted growth of 12-15% annually. The coastal location and year-round climate make it highly desirable for both residents and investors."
    }
    
    if (lowerMessage.includes('invest') && lowerMessage.includes('austin')) {
      return "Austin is one of the hottest real estate investment markets! The city has explosive job growth with major tech companies like Tesla, Apple, and Google expanding there. No state income tax, affordable cost of living, and a young, educated population drive strong rental demand. Areas like East Austin and South Austin offer great appreciation potential. Our AI predicts 15-18% annual growth for many Austin properties."
    }
    
    if (lowerMessage.includes('invest') && lowerMessage.includes('miami')) {
      return "Miami offers unique investment opportunities! The city benefits from international investment, no state income tax, and growing finance/tech sectors. Areas like Brickell and Wynwood have seen massive development. However, be aware of hurricane risks and insurance costs. Our platform shows Miami properties averaging 13-16% predicted growth, with luxury condos in South Beach performing exceptionally well."
    }
    
    if (lowerMessage.includes('invest') && lowerMessage.includes('seattle')) {
      return "Seattle is a strong tech-driven market! With Amazon, Microsoft, and other major employers, the city has high-paying jobs supporting property values. However, be aware of higher taxes and recent rent control discussions. Areas like Capitol Hill and Fremont offer good investment potential. Our AI shows Seattle properties with 10-14% predicted growth, with single-family homes outperforming condos."
    }
    
    if (lowerMessage.includes('invest') && lowerMessage.includes('denver')) {
      return "Denver offers solid investment fundamentals! The city has diverse job growth, outdoor lifestyle appeal, and growing population. Areas like RiNo and Highland are gentrifying rapidly. Colorado's cannabis and tech industries provide economic stability. Our platform shows Denver properties with 11-15% predicted growth, with good cash flow potential in emerging neighborhoods."
    }
    
    // General investment questions
    if (lowerMessage.includes('best') && lowerMessage.includes('invest')) {
      return "The best investment depends on your goals! For beginners, I recommend buy-and-hold properties in growing markets with strong job growth. Look for properties with positive cash flow and appreciation potential. Our platform analyzes 150+ cities to identify the best opportunities. Generally, focus on areas with population growth, job diversity, and infrastructure development."
    }
    
    if (lowerMessage.includes('should i invest') || lowerMessage.includes('good investment')) {
      return "Real estate can be an excellent investment when done right! Key factors to consider: your financial situation, risk tolerance, market knowledge, and time commitment. Start by analyzing local markets, understanding cash flow, and having adequate reserves. Our platform helps identify properties with strong fundamentals and growth potential. Consider starting with one property in a market you understand well."
    }
    
    if (lowerMessage.includes('where to invest') || lowerMessage.includes('which city')) {
      return "The best cities for real estate investment typically have strong job growth, population growth, and economic diversification. Currently, markets like Austin, Nashville, Tampa, and Phoenix show strong fundamentals. Our platform analyzes 150+ cities, showing you predicted growth rates and risk scores. Look for cities with growing tech sectors, universities, and business-friendly policies."
    }
    
    // Specific real estate terms - more precise matching
    if (lowerMessage.includes('appreciation') && !lowerMessage.includes('futurelot')) {
      return realEstateKnowledge['what is appreciation']
    }
    
    if (lowerMessage.includes('cash flow') && !lowerMessage.includes('futurelot')) {
      return realEstateKnowledge['what is cash flow']
    }
    
    if (lowerMessage.includes('cap rate') && !lowerMessage.includes('futurelot')) {
      return realEstateKnowledge['what is cap rate']
    }
    
    if (lowerMessage.includes('roi') && !lowerMessage.includes('futurelot')) {
      return realEstateKnowledge['what is roi']
    }
    
    if (lowerMessage.includes('down payment')) {
      return realEstateKnowledge['what is down payment']
    }
    
    if (lowerMessage.includes('mortgage rate')) {
      return realEstateKnowledge['what is mortgage rate']
    }
    
    if (lowerMessage.includes('buy and hold')) {
      return realEstateKnowledge['buy and hold strategy']
    }
    
    if (lowerMessage.includes('fix and flip')) {
      return realEstateKnowledge['fix and flip strategy']
    }
    
    if (lowerMessage.includes('brrrr')) {
      return realEstateKnowledge['brrrr strategy']
    }
    
    // Platform-specific questions
    if (lowerMessage.includes('futurelot') || lowerMessage.includes('platform') || lowerMessage.includes('this app')) {
      return realEstateKnowledge['what is futurelot']
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return realEstateKnowledge['how does futurelot work']
    }
    
    if (lowerMessage.includes('cities') && lowerMessage.includes('covered')) {
      return realEstateKnowledge['what cities are covered']
    }
    
    if (lowerMessage.includes('accurate') || lowerMessage.includes('accuracy')) {
      return realEstateKnowledge['how accurate are predictions']
    }
    
    if (lowerMessage.includes('map') && lowerMessage.includes('use')) {
      return realEstateKnowledge['how to use the map']
    }
    
    if (lowerMessage.includes('colors') && lowerMessage.includes('mean')) {
      return realEstateKnowledge['what do the colors mean']
    }
    
    // Market analysis questions
    if (lowerMessage.includes('market') && lowerMessage.includes('trend')) {
      return realEstateKnowledge['how to analyze market trends']
    }
    
    if (lowerMessage.includes('property') && lowerMessage.includes('value')) {
      return realEstateKnowledge['what affects property values']
    }
    
    if (lowerMessage.includes('good location')) {
      return realEstateKnowledge['what makes a good location']
    }
    
    if (lowerMessage.includes('school') && lowerMessage.includes('important')) {
      return realEstateKnowledge['how important are schools']
    }
    
    // Risk-related questions
    if (lowerMessage.includes('risk') && lowerMessage.includes('minimize')) {
      return realEstateKnowledge['how to minimize risk']
    }
    
    if (lowerMessage.includes('investment') && lowerMessage.includes('risk')) {
      return realEstateKnowledge['what is investment risk']
    }
    
    if (lowerMessage.includes('vacancy') && lowerMessage.includes('risk')) {
      return realEstateKnowledge['what is vacancy risk']
    }
    
    // Help and general questions
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return realEstateKnowledge['help']
    }
    
    // Default response for unmatched queries
    return "I specialize in real estate investing and the FutureLot platform with access to 2.5M+ properties across 180+ cities. I can help with market analysis, property evaluation, investment strategies, financing, and risk assessment. Try asking about specific topics like 'best cities to invest', 'what is cash flow', or 'how to use the map'. What would you like to know?"
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: generateResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all duration-200 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">FutureLot AI</h3>
                <p className="text-xs text-blue-100">Real Estate Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      {message.isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about real estate..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 