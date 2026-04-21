import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { config } from '../config.js'

const jwtPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(jwt, { secret: config.JWT_SECRET })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ message: 'Unauthorized' })
    }
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default jwtPlugin
