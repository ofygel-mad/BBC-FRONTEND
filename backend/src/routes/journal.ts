import { FastifyPluginAsync } from 'fastify'

const journal: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async (request) => {
    const {
      page = '1',
      limit = '20',
      type,
      from,
      to,
    } = request.query as Record<string, string>

    const skip = (Number(page) - 1) * Number(limit)

    const where = {
      ...(type ? { type }  : {}),
      ...(from || to ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to)   } : {}),
        },
      } : {}),
    }

    const [items, total] = await Promise.all([
      fastify.prisma.journalEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      fastify.prisma.journalEntry.count({ where }),
    ])

    return { items, total, page: Number(page), limit: Number(limit) }
  })

  fastify.post('/', auth, async (request, reply) => {
    const data = request.body as { type: string; action: string; user: string }
    const entry = await fastify.prisma.journalEntry.create({ data })
    reply.code(201)
    return entry
  })
}

export default journal
