import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal',
    })
  } catch (error) {
    console.warn('Prisma client initialization warning:', error)
    // Return a mock client if database isn't available
    return new PrismaClient({
      datasources: {
        db: {
          url: 'file:./fallback.db'
        }
      }
    })
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful database connection check
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.warn('⚠️ Database connection issue:', error)
    return false
  }
} 