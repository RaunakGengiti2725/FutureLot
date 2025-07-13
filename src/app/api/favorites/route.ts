import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

interface FavoriteProperty {
  id: string
  address: string
  city: string
  state: string
  price: number
  futureScore: number
  appreciation: number
  propertyType: string
  bedrooms: number
  bathrooms: number
  sqft: number
  pricePerSqft: number
  coordinates: {
    lat: number
    lng: number
  }
  addedAt: string
  userId?: string
}

// In-memory storage for favorites (in production, use a database)
const favoritesStorage = new Map<string, FavoriteProperty[]>()

// Get user ID from session or use a guest ID
async function getUserId(request: NextRequest): Promise<string> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      return session.user.email
    }
  } catch (error) {
    console.log('No session found, using guest storage')
  }
  
  // For guest users, use a simple identifier from headers
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  return `guest-${Buffer.from(userAgent + ip).toString('base64').slice(0, 16)}`
}

// GET - Retrieve user's favorites
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const favorites = favoritesStorage.get(userId) || []
    
    console.log(`📋 Retrieved ${favorites.length} favorites for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      favorites: favorites.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()),
      count: favorites.length
    })
    
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve favorites' 
    }, { status: 500 })
  }
}

// POST - Add a property to favorites
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const propertyData = await request.json()
    
    if (!propertyData.address || !propertyData.city || !propertyData.state) {
      return NextResponse.json({ 
        error: 'Missing required property data' 
      }, { status: 400 })
    }
    
    const favorites = favoritesStorage.get(userId) || []
    
    // Check if property already exists in favorites
    const existingIndex = favorites.findIndex(fav => 
      fav.address.toLowerCase() === propertyData.address.toLowerCase()
    )
    
    if (existingIndex !== -1) {
      return NextResponse.json({ 
        error: 'Property already in favorites',
        alreadyExists: true
      }, { status: 409 })
    }
    
    // Create new favorite
    const newFavorite: FavoriteProperty = {
      id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      price: propertyData.price || 0,
      futureScore: propertyData.futureScore || 0,
      appreciation: propertyData.appreciation || 0,
      propertyType: propertyData.propertyType || 'Unknown',
      bedrooms: propertyData.bedrooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      sqft: propertyData.sqft || 0,
      pricePerSqft: propertyData.pricePerSqft || 0,
      coordinates: propertyData.coordinates || { lat: 0, lng: 0 },
      addedAt: new Date().toISOString(),
      userId: userId
    }
    
    favorites.push(newFavorite)
    favoritesStorage.set(userId, favorites)
    
    console.log(`⭐ Added property to favorites: ${propertyData.address} for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Property added to favorites',
      favorite: newFavorite,
      totalFavorites: favorites.length
    })
    
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ 
      error: 'Failed to add property to favorites' 
    }, { status: 500 })
  }
}

// DELETE - Remove a property from favorites
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('id')
    const address = searchParams.get('address')
    
    if (!favoriteId && !address) {
      return NextResponse.json({ 
        error: 'Must provide either favorite ID or address' 
      }, { status: 400 })
    }
    
    const favorites = favoritesStorage.get(userId) || []
    
    let removedIndex = -1
    if (favoriteId) {
      removedIndex = favorites.findIndex(fav => fav.id === favoriteId)
    } else if (address) {
      removedIndex = favorites.findIndex(fav => 
        fav.address.toLowerCase() === address.toLowerCase()
      )
    }
    
    if (removedIndex === -1) {
      return NextResponse.json({ 
        error: 'Property not found in favorites' 
      }, { status: 404 })
    }
    
    const removedFavorite = favorites.splice(removedIndex, 1)[0]
    favoritesStorage.set(userId, favorites)
    
    console.log(`🗑️ Removed property from favorites: ${removedFavorite.address} for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites',
      removedFavorite: removedFavorite,
      totalFavorites: favorites.length
    })
    
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json({ 
      error: 'Failed to remove property from favorites' 
    }, { status: 500 })
  }
}

// PUT - Update a favorite property
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const updateData = await request.json()
    
    if (!updateData.id) {
      return NextResponse.json({ 
        error: 'Favorite ID is required' 
      }, { status: 400 })
    }
    
    const favorites = favoritesStorage.get(userId) || []
    const favoriteIndex = favorites.findIndex(fav => fav.id === updateData.id)
    
    if (favoriteIndex === -1) {
      return NextResponse.json({ 
        error: 'Property not found in favorites' 
      }, { status: 404 })
    }
    
    // Update the favorite with new data
    favorites[favoriteIndex] = {
      ...favorites[favoriteIndex],
      ...updateData,
      id: favorites[favoriteIndex].id, // Keep original ID
      addedAt: favorites[favoriteIndex].addedAt, // Keep original date
      userId: userId
    }
    
    favoritesStorage.set(userId, favorites)
    
    console.log(`📝 Updated favorite: ${favorites[favoriteIndex].address} for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Favorite updated successfully',
      favorite: favorites[favoriteIndex],
      totalFavorites: favorites.length
    })
    
  } catch (error) {
    console.error('Update favorite error:', error)
    return NextResponse.json({ 
      error: 'Failed to update favorite' 
    }, { status: 500 })
  }
} 