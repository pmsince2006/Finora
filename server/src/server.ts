import { app } from './app.js'
import { env } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/db.js'

async function startServer() {
  try {
    await connectDatabase()

    const server = app.listen(env.PORT, () => {
      console.log(`[Finora Backend] Server listening at http://localhost:${env.PORT}`)
      console.log(`[Finora Backend] Environment: ${env.NODE_ENV}`)
      console.log(`[Finora Backend] CORS origin allowed: ${env.FRONTEND_ORIGIN}`)
    })

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n[Finora Backend] Received ${signal}. Gracefully shutting down...`)
      server.close(async () => {
        await disconnectDatabase()
        console.log('[Finora Backend] Database disconnected. Process terminated.')
        process.exit(0)
      })
    }

    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  } catch (error) {
    console.error('[Finora Backend] Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
