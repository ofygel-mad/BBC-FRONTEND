import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'
import { config } from '../config.js'

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const allowedOrigins = new Set([
    new URL(config.FRONTEND_URL).origin,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.has(origin)) {
        cb(null, true)
      } else {
        cb(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
  })
})

export default corsPlugin
