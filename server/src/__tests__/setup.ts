import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach } from 'vitest'
import { connectDatabase, disconnectDatabase } from '../config/db.js'

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/finora_test'

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'finora_test_jwt_secret_key_32characterslong'
  await connectDatabase(TEST_DB_URI)
})

beforeEach(async () => {
  // Clear all collections between test cases for complete isolation
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections()
    for (const collection of collections) {
      await collection.deleteMany({})
    }
  }
})

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.dropDatabase()
    } catch {
      // Ignore drop database errors
    }
  }
  await disconnectDatabase()
})
