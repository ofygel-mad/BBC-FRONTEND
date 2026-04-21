import { FastifyPluginAsync } from 'fastify'

const clients: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async (request) => {
    const { search, status, type } = request.query as Record<string, string>
    return fastify.prisma.client.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(status ? { status } : {}),
        ...(type   ? { type }   : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { invoices: true } } },
    })
  })

  fastify.get('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const client = await fastify.prisma.client.findUnique({
      where: { id: Number(id) },
      include: { invoices: { orderBy: { date: 'desc' } } },
    })
    if (!client) return reply.code(404).send({ message: 'Клиент не найден' })
    return client
  })

  fastify.post('/', auth, async (request, reply) => {
    const data = request.body as {
      name: string; bin: string; type: string; phone?: string; status?: string
    }
    const client = await fastify.prisma.client.create({ data })
    reply.code(201)
    return client
  })

  fastify.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as Partial<{
      name: string; bin: string; type: string; phone: string; status: string
    }>
    const client = await fastify.prisma.client.update({
      where: { id: Number(id) },
      data,
    }).catch(() => null)
    if (!client) return reply.code(404).send({ message: 'Клиент не найден' })
    return client
  })

  fastify.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.client.delete({ where: { id: Number(id) } }).catch(() => null)
    reply.code(204)
  })
}

export default clients
