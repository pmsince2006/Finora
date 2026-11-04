import dotenv from 'dotenv'

dotenv.config()

interface ServerConfig {
  PORT: number
  NODE_ENV: string
  MONGODB_URI: string
  JWT_SECRET: string
  FRONTEND_ORIGIN: string
}

function validateEnv(): ServerConfig {
  const PORT = parseInt(process.env.PORT || '5000', 10)
  if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
    throw new Error(`Invalid PORT configuration: "${process.env.PORT}". Must be a valid port number between 1 and 65535.`)
  }

  const NODE_ENV = process.env.NODE_ENV || 'development'

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finora'
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error(`Invalid MONGODB_URI: "${MONGODB_URI}". Must start with mongodb:// or mongodb+srv://.`)
  }

  const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV !== 'production' ? 'finora_fallback_local_secret_key_2026_dev' : '')
  if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET environment variable is missing or shorter than 16 characters.')
  }

  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

  return {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    JWT_SECRET,
    FRONTEND_ORIGIN,
  }
}

export const env = validateEnv()
