import mongoose from 'mongoose'
import { env } from './env.js'

let isConnected = false

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    if (env.NODE_ENV !== 'test') {
      console.log(`[Finora DB] Connected to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`)
    }
    return conn
  } catch (error) {
    console.error('[Finora DB] MongoDB connection failed:', error instanceof Error ? error.message : error)
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    isConnected = false
  }
}
