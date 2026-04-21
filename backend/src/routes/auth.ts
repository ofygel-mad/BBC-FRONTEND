import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', async (request, reply) => {
    const { name, email, password, company } = request.body as {
      name: string; email: string; password: string; company?: string
    }

    if (!name || !email || !password) {
      return reply.code(400).send({ message: 'Имя, email и пароль обязательны' })
    }

    const exists = await fastify.prisma.user.findUnique({ where: { email } })
    if (exists) {
      return reply.code(409).send({ message: 'Пользователь с таким email уже существует' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await fastify.prisma.user.create({
      data: { name, email, password: hashed, role: 'admin' },
    })

    const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role })
    return reply.code(201).send({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  })

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    if (!email || !password) {
      return reply.code(400).send({ message: 'Email и пароль обязательны' })
    }

    const user = await fastify.prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.code(401).send({ message: 'Неверный email или пароль' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return reply.code(401).send({ message: 'Неверный email или пароль' })
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role })
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  })

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const payload = request.user as { id: number }
    const user = await fastify.prisma.user.findUnique({
      where:  { id: payload.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!user) return reply.code(404).send({ message: 'Пользователь не найден' })

    const [categories, positions] = await Promise.all([
      fastify.prisma.requestCategory.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
      fastify.prisma.position.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
    ])

    return {
      ...user,
      positions:  positions.map(p => p.name),
      categories: categories.map(c => c.name),
      clients:    [],
    }
  })
}

export default auth
