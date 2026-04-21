import { FastifyPluginAsync } from 'fastify'

const positions: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async () => {
    return fastify.prisma.position.findMany({ orderBy: { name: 'asc' } })
  })

  fastify.post('/', auth, async (request, reply) => {
    const { name } = request.body as { name: string }
    const pos = await fastify.prisma.position.create({ data: { name } })
    reply.code(201)
    return pos
  })

  fastify.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { name } = request.body as { name: string }
    const pos = await fastify.prisma.position.update({
      where: { id: Number(id) },
      data:  { name },
    }).catch(() => null)
    if (!pos) return reply.code(404).send({ message: 'Должность не найдена' })
    return pos
  })

  fastify.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.position.delete({ where: { id: Number(id) } }).catch(() => null)
    return reply.code(204).send()
  })
}

export default positions
