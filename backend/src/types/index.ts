import type { FastifyRequest } from 'fastify'

export interface JwtPayload {
  id: number
  email: string
  role: string
}

export interface AuthRequest extends FastifyRequest {
  user: JwtPayload
}
