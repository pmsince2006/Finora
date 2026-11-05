import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import './setup.js'

describe('Backend Health Endpoints (/api/health)', () => {
  it('returns 200 and liveness payload on /api/health/live', async () => {
    const res = await request(app).get('/api/health/live')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('live')
    expect(res.body.service).toBe('finora-backend')
    expect(res.body.uptime).toBeGreaterThanOrEqual(0)
    expect(res.body.timestamp).toBeDefined()
  })

  it('returns 200 and ready payload when database is connected on /api/health/ready', async () => {
    const res = await request(app).get('/api/health/ready')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ready')
    expect(res.body.service).toBe('finora-backend')
    expect(res.body.database).toBe('connected')
  })

  it('returns 200 and general health payload on /api/health', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('finora-backend')
    expect(res.body.database).toBe('connected')
    expect(res.body.uptime).toBeGreaterThanOrEqual(0)
  })
})
