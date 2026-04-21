import Fastify from 'fastify'
import sensible from '@fastify/sensible'

import prismaPlugin    from './plugins/prisma.js'
import corsPlugin      from './plugins/cors.js'
import jwtPlugin       from './plugins/jwt.js'

import authRoutes       from './routes/auth.js'
import clientRoutes     from './routes/clients.js'
import employeeRoutes   from './routes/employees.js'
import requestRoutes    from './routes/requests.js'
import categoryRoutes   from './routes/categories.js'
import positionRoutes   from './routes/positions.js'
import statisticsRoutes from './routes/statistics.js'
import dashboardRoutes  from './routes/dashboard.js'
import billingRoutes    from './routes/billing.js'
import journalRoutes    from './routes/journal.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(sensible)
  await app.register(corsPlugin)
  await app.register(prismaPlugin)
  await app.register(jwtPlugin)

  await app.register(authRoutes,       { prefix: '/api/auth' })
  await app.register(clientRoutes,     { prefix: '/api/clients' })
  await app.register(employeeRoutes,   { prefix: '/api/employees' })
  await app.register(requestRoutes,    { prefix: '/api/requests' })
  await app.register(categoryRoutes,   { prefix: '/api/request-categories' })
  await app.register(positionRoutes,   { prefix: '/api/positions' })
  await app.register(statisticsRoutes, { prefix: '/api/statistics' })
  await app.register(dashboardRoutes,  { prefix: '/api/dashboard' })
  await app.register(billingRoutes,    { prefix: '/api/invoices' })
  await app.register(journalRoutes,    { prefix: '/api/journal' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
