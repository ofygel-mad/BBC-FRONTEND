import { afterAll, beforeAll, describe, expect, it } from 'vitest'

process.env.DATABASE_URL ??= 'postgresql://postgres:password@127.0.0.1:5432/salyk_ci'
process.env.JWT_SECRET ??= 'test-secret-key-with-at-least-32-chars'
process.env.FRONTEND_URL ??= 'http://127.0.0.1:3000'
process.env.PORT ??= '4000'

let app: any
let authHeader: Record<string, string>

describe('backend api', () => {
  beforeAll(async () => {
    const { buildApp } = await import('../src/app.js')
    app = await buildApp()
    await app.ready()

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin', password: 'admin' },
    })

    expect(login.statusCode).toBe(200)
    const body = login.json()
    authHeader = { authorization: `Bearer ${body.token}` }
  })

  afterAll(async () => {
    await app?.close()
  })

  it('reports health status', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })

  it('rejects unauthenticated access to protected resources', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/clients' })

    expect(response.statusCode).toBe(401)
  })

  it('returns seeded clients for authenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/clients',
      headers: authHeader,
    })

    expect(response.statusCode).toBe(200)
    const clients = response.json()
    expect(clients.length).toBeGreaterThan(0)
    expect(clients[0]).toHaveProperty('name')
    expect(clients[0]).toHaveProperty('bin')
  })

  it('creates requests against the real prisma-backed api', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/requests',
      headers: authHeader,
      payload: {
        title: `CI request ${Date.now()}`,
        type: 'external',
        status: 'new',
        clientId: 1,
        assigneeId: 1,
      },
    })

    expect(response.statusCode).toBe(201)
    const request = response.json()
    expect(request.number).toMatch(/^\d{5}$/)
    expect(request.clientId).toBe(1)
    expect(request.assigneeId).toBe(1)
  })

  it('returns paginated journal data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/journal?page=1&limit=5',
      headers: authHeader,
    })

    expect(response.statusCode).toBe(200)
    const journal = response.json()
    expect(Array.isArray(journal.items)).toBe(true)
    expect(journal.items.length).toBeGreaterThan(0)
    expect(journal.total).toBeGreaterThanOrEqual(journal.items.length)
  })
})
