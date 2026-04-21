import { FastifyPluginAsync } from 'fastify'

const requests: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async (request) => {
    const { status, clientId, assigneeId, type } = request.query as Record<string, string>
    return fastify.prisma.request.findMany({
      where: {
        ...(status     ? { status }                            : {}),
        ...(clientId   ? { clientId:   Number(clientId) }     : {}),
        ...(assigneeId ? { assigneeId: Number(assigneeId) }   : {}),
        ...(type       ? { type }                              : {}),
      },
      include: {
        client:   { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  fastify.post('/', auth, async (request, reply) => {
    const body = request.body as {
      title: string
      type?: string
      status?: string
      clientId: number
      assigneeId?: number | null
      categoryId?: number | null
      deadline?: string | null
    }

    const last = await fastify.prisma.request.findFirst({ orderBy: { id: 'desc' } })
    const number = String((last ? Number(last.number) + 1 : 1)).padStart(5, '0')

    const req = await fastify.prisma.request.create({
      data: {
        number,
        title:      body.title,
        type:       body.type       ?? 'external',
        status:     body.status     ?? 'new',
        clientId:   body.clientId,
        assigneeId: body.assigneeId ?? null,
        categoryId: body.categoryId ?? null,
        deadline:   body.deadline   ? new Date(body.deadline) : null,
      },
      include: {
        client:   { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    })
    reply.code(201)
    return req
  })

  fastify.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Partial<{
      title: string
      type: string
      status: string
      clientId: number
      assigneeId: number | null
      categoryId: number | null
      deadline: string | null
    }>

    const { deadline, ...rest } = body
    const req = await fastify.prisma.request.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        ...(deadline !== undefined
          ? { deadline: deadline ? new Date(deadline) : null }
          : {}),
      },
      include: {
        client:   { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }).catch(() => null)

    if (!req) return reply.code(404).send({ message: 'Заявка не найдена' })
    return req
  })

  fastify.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.request.delete({ where: { id: Number(id) } }).catch(() => null)
    return reply.code(204).send()
  })
}

export default requests
