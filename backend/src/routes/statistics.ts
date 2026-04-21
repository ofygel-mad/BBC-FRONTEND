import { FastifyPluginAsync } from 'fastify'

const statistics: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/', auth, async () => {
    const [requests, clients, employees] = await Promise.all([
      fastify.prisma.request.findMany({
        select: { id: true, status: true, clientId: true, assigneeId: true },
      }),
      fastify.prisma.client.findMany({
        select: { id: true, name: true, status: true },
      }),
      fastify.prisma.employee.findMany({
        select: { id: true, name: true, position: true, status: true },
      }),
    ])

    const active  = requests.filter(r => r.status === 'new'    || r.status === 'waiting')
    const process = requests.filter(r => r.status === 'review' || r.status === 'doing')

    const activeClients  = new Set(active.map(r => r.clientId)).size
    const processClients = new Set(process.map(r => r.clientId)).size

    const byClient = clients.map(c => {
      const reqs = requests.filter(r => r.clientId === c.id)
      return {
        client:  { id: c.id, name: c.name },
        total:   reqs.length,
        active:  reqs.filter(r => r.status === 'new'    || r.status === 'waiting').length,
        process: reqs.filter(r => r.status === 'review' || r.status === 'doing').length,
        done:    reqs.filter(r => r.status === 'done').length,
      }
    })

    const byEmployee = employees.map(e => {
      const reqs = requests.filter(r => r.assigneeId === e.id)
      return {
        employee: { id: e.id, name: e.name, position: e.position },
        total:    reqs.length,
        active:   reqs.filter(r => r.status === 'new'    || r.status === 'waiting').length,
        process:  reqs.filter(r => r.status === 'review' || r.status === 'doing').length,
        done:     reqs.filter(r => r.status === 'done').length,
      }
    })

    return {
      active:  { count: active.length,  clients: activeClients },
      process: { count: process.length, clients: processClients },
      total:   requests.length,
      byClient,
      byEmployee,
    }
  })
}

export default statistics
