import { FastifyPluginAsync } from 'fastify'

const categories: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async () => {
    return fastify.prisma.requestCategory.findMany({ orderBy: { name: 'asc' } })
  })

  fastify.post('/', auth, async (request, reply) => {
    const { name } = request.body as { name: string }
    const cat = await fastify.prisma.requestCategory.create({ data: { name } })
    reply.code(201)
    return cat
  })

  fastify.put('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { name } = request.body as { name: string }
    const cat = await fastify.prisma.requestCategory.update({
      where: { id: Number(id) },
      data:  { name },
    }).catch(() => null)
    if (!cat) return reply.code(404).send({ message: 'Категория не найдена' })
    return cat
  })

  fastify.delete('/:id', auth, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.requestCategory.delete({ where: { id: Number(id) } }).catch(() => null)
    return reply.code(204).send()
  })
}

export default categories
