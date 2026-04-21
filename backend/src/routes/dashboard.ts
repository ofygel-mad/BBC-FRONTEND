import { FastifyPluginAsync } from 'fastify'

const dashboard: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/stats', auth, async () => {
    const [
      totalClients,
      activeClients,
      totalEmployees,
      activeEmployees,
      invoices,
      recentJournal,
    ] = await Promise.all([
      fastify.prisma.client.count(),
      fastify.prisma.client.count({ where: { status: 'active' } }),
      fastify.prisma.employee.count(),
      fastify.prisma.employee.count({ where: { status: 'active' } }),
      fastify.prisma.invoice.findMany({
        include: { client: { select: { name: true } } },
        orderBy: { date: 'desc' },
      }),
      fastify.prisma.journalEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const totalRevenue  = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

    return {
      clients:   { total: totalClients,   active: activeClients },
      employees: { total: totalEmployees, active: activeEmployees },
      invoices: {
        total:   invoices.length,
        paid:    invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'pending').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalRevenue,
        pendingAmount,
        overdueAmount,
      },
      recentJournal,
    }
  })
}

export default dashboard
