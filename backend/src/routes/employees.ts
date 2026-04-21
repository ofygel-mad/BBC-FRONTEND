import { FastifyPluginAsync } from 'fastify'

const employees: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async (request) => {
    const { search, status, position } = request.query as Record<string, string>
    return fastify.prisma.employee.findMany({
      where: {
        ...(search   ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(status   ? { status }   : {}),
        ...(position ? { position } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  fastify.get('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const employee = await fastify.prisma.employee.findUnique({ where: { id: Number(id) } })
    if (!employee) return reply.code(404).send({ message: 'Сотрудник не найден' })
    return employee
  })

  fastify.post('/', auth, async (request, reply) => {
    const data = request.body as {
      name: string; iin: string; position: string; phone?: string; status?: string
    }
    const employee = await fastify.prisma.employee.create({ data })
    reply.code(201)
    return employee
  })

  fastify.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as Partial<{
      name: string; iin: string; position: string; phone: string; status: string
    }>
    const employee = await fastify.prisma.employee.update({
      where: { id: Number(id) },
      data,
    }).catch(() => null)
    if (!employee) return reply.code(404).send({ message: 'Сотрудник не найден' })
    return employee
  })

  fastify.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.employee.delete({ where: { id: Number(id) } }).catch(() => null)
    reply.code(204)
  })
}

export default employees
