import { FastifyPluginAsync } from 'fastify'

const billing: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async (request) => {
    const { search, status, clientId } = request.query as Record<string, string>
    return fastify.prisma.invoice.findMany({
      where: {
        ...(search   ? { number: { contains: search, mode: 'insensitive' } } : {}),
        ...(status   ? { status }           : {}),
        ...(clientId ? { clientId: Number(clientId) } : {}),
      },
      include: { client: { select: { id: true, name: true, bin: true } } },
      orderBy: { date: 'desc' },
    })
  })

  fastify.get('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const invoice = await fastify.prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: { client: true },
    })
    if (!invoice) return reply.code(404).send({ message: 'Счёт не найден' })
    return invoice
  })

  fastify.post('/', auth, async (request, reply) => {
    const data = request.body as {
      number: string; clientId: number; amount: number
      date: string; dueDate: string; status?: string
    }
    const invoice = await fastify.prisma.invoice.create({
      data: {
        ...data,
        date:    new Date(data.date),
        dueDate: new Date(data.dueDate),
      },
      include: { client: { select: { id: true, name: true } } },
    })
    reply.code(201)
    return invoice
  })

  fastify.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const raw = request.body as Partial<{
      number: string; clientId: number; amount: number
      date: string; dueDate: string; status: string
    }>
    const data: Record<string, unknown> = { ...raw }
    if (raw.date)    data['date']    = new Date(raw.date)
    if (raw.dueDate) data['dueDate'] = new Date(raw.dueDate)
    const invoice = await fastify.prisma.invoice.update({
      where: { id: Number(id) },
      data,
      include: { client: { select: { id: true, name: true } } },
    }).catch(() => null)
    if (!invoice) return reply.code(404).send({ message: 'Счёт не найден' })
    return invoice
  })

  fastify.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.invoice.delete({ where: { id: Number(id) } }).catch(() => null)
    reply.code(204)
  })
}

export default billing
