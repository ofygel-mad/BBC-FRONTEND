import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Admin user ──────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin' },
    update: { password: await bcrypt.hash('admin', 10) },
    create: {
      email:    'admin',
      password: await bcrypt.hash('admin', 10),
      name:     'Администратор',
      role:     'admin',
    },
  })

  // ─── Positions ───────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.position.upsert({ where: { name: 'Главный бухгалтер' },  update: {}, create: { name: 'Главный бухгалтер' } }),
    prisma.position.upsert({ where: { name: 'Старший бухгалтер' },  update: {}, create: { name: 'Старший бухгалтер' } }),
    prisma.position.upsert({ where: { name: 'Бухгалтер' },          update: {}, create: { name: 'Бухгалтер' } }),
    prisma.position.upsert({ where: { name: 'Налоговый консультант' }, update: {}, create: { name: 'Налоговый консультант' } }),
    prisma.position.upsert({ where: { name: 'Кассир' },             update: {}, create: { name: 'Кассир' } }),
  ])

  // ─── Request categories ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.requestCategory.upsert({ where: { name: 'Административные вопросы' }, update: {}, create: { name: 'Административные вопросы' } }),
    prisma.requestCategory.upsert({ where: { name: 'Зарплата' },                 update: {}, create: { name: 'Зарплата' } }),
    prisma.requestCategory.upsert({ where: { name: 'Кадры' },                    update: {}, create: { name: 'Кадры' } }),
    prisma.requestCategory.upsert({ where: { name: 'Налоги' },                   update: {}, create: { name: 'Налоги' } }),
    prisma.requestCategory.upsert({ where: { name: 'Отчётность' },               update: {}, create: { name: 'Отчётность' } }),
    prisma.requestCategory.upsert({ where: { name: 'Юридические вопросы' },      update: {}, create: { name: 'Юридические вопросы' } }),
  ])

  // ─── Clients ─────────────────────────────────────────────────────────────────
  const clients = await Promise.all([
    prisma.client.upsert({ where: { bin: '120540012345' }, update: {}, create: { name: 'ТОО «АлматыСтрой»',       bin: '120540012345', phone: '+7 701 234 56 78', status: 'active',   type: 'Юридическое лицо' } }),
    prisma.client.upsert({ where: { bin: '890312301234' }, update: {}, create: { name: 'ИП Сейткалиев А.М.',      bin: '890312301234', phone: '+7 777 987 65 43', status: 'active',   type: 'ИП' } }),
    prisma.client.upsert({ where: { bin: '150630045678' }, update: {}, create: { name: 'ТОО «Каспий Трейд»',      bin: '150630045678', phone: '+7 702 111 22 33', status: 'inactive', type: 'Юридическое лицо' } }),
    prisma.client.upsert({ where: { bin: '040712300011' }, update: {}, create: { name: 'АО «НурСервис»',           bin: '040712300011', phone: '+7 747 555 44 33', status: 'active',   type: 'АО' } }),
    prisma.client.upsert({ where: { bin: '950825401122' }, update: {}, create: { name: 'ИП Ахметова Г.Т.',         bin: '950825401122', phone: '+7 700 333 22 11', status: 'active',   type: 'ИП' } }),
    prisma.client.upsert({ where: { bin: '180910067890' }, update: {}, create: { name: 'ТОО «ЕвразияЛогистик»',   bin: '180910067890', phone: '+7 771 888 77 66', status: 'inactive', type: 'Юридическое лицо' } }),
    prisma.client.upsert({ where: { bin: '000115002233' }, update: {}, create: { name: 'ГКП «ГородскойТранспорт»', bin: '000115002233', phone: '+7 727 456 78 90', status: 'active',   type: 'ГКП' } }),
    prisma.client.upsert({ where: { bin: '130320055566' }, update: {}, create: { name: 'ТОО «КазТехПром»',         bin: '130320055566', phone: '+7 705 999 00 11', status: 'active',   type: 'Юридическое лицо' } }),
  ])

  // ─── Employees ───────────────────────────────────────────────────────────────
  const employees = await Promise.all([
    prisma.employee.upsert({ where: { iin: '890312401234' }, update: {}, create: { name: 'Сейткалиева Айгуль Маратовна',  position: 'Бухгалтер',           phone: '+7 701 111 22 33', status: 'active',   iin: '890312401234' } }),
    prisma.employee.upsert({ where: { iin: '870524300123' }, update: {}, create: { name: 'Нурланов Берик Сериккалиевич',   position: 'Старший бухгалтер',   phone: '+7 702 222 33 44', status: 'active',   iin: '870524300123' } }),
    prisma.employee.upsert({ where: { iin: '920815201234' }, update: {}, create: { name: 'Жуматова Гулзира Кайраткызы',    position: 'Налоговый консультант', phone: '+7 777 333 44 55', status: 'active',   iin: '920815201234' } }),
    prisma.employee.upsert({ where: { iin: '950201101234' }, update: {}, create: { name: 'Ахметов Данияр Болатович',       position: 'Кассир',              phone: '+7 747 444 55 66', status: 'inactive', iin: '950201101234' } }),
    prisma.employee.upsert({ where: { iin: '880630401234' }, update: {}, create: { name: 'Касымова Назгуль Ермекқызы',     position: 'Бухгалтер',           phone: '+7 705 555 66 77', status: 'active',   iin: '880630401234' } }),
    prisma.employee.upsert({ where: { iin: '830920301234' }, update: {}, create: { name: 'Бекова Меруерт Аскарқызы',       position: 'Главный бухгалтер',   phone: '+7 771 666 77 88', status: 'active',   iin: '830920301234' } }),
  ])

  // ─── Invoices ─────────────────────────────────────────────────────────────────
  const [alm, sep, kas, nur, akh, evc, gkt, kaz] = clients
  await Promise.all([
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-001' }, update: {}, create: { number: 'СЧ-2024-001', clientId: alm.id, amount: 450000,  date: new Date('2024-04-01'), dueDate: new Date('2024-04-15'), status: 'paid' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-002' }, update: {}, create: { number: 'СЧ-2024-002', clientId: sep.id, amount: 120000,  date: new Date('2024-04-03'), dueDate: new Date('2024-04-17'), status: 'pending' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-003' }, update: {}, create: { number: 'СЧ-2024-003', clientId: nur.id, amount: 890000,  date: new Date('2024-04-05'), dueDate: new Date('2024-04-19'), status: 'overdue' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-004' }, update: {}, create: { number: 'СЧ-2024-004', clientId: kaz.id, amount: 320000,  date: new Date('2024-04-08'), dueDate: new Date('2024-04-22'), status: 'paid' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-005' }, update: {}, create: { number: 'СЧ-2024-005', clientId: akh.id, amount: 75000,   date: new Date('2024-04-10'), dueDate: new Date('2024-04-24'), status: 'pending' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-006' }, update: {}, create: { number: 'СЧ-2024-006', clientId: gkt.id, amount: 1200000, date: new Date('2024-04-12'), dueDate: new Date('2024-04-26'), status: 'pending' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-007' }, update: {}, create: { number: 'СЧ-2024-007', clientId: kas.id, amount: 560000,  date: new Date('2024-03-15'), dueDate: new Date('2024-03-29'), status: 'overdue' } }),
    prisma.invoice.upsert({ where: { number: 'СЧ-2024-008' }, update: {}, create: { number: 'СЧ-2024-008', clientId: evc.id, amount: 230000,  date: new Date('2024-04-14'), dueDate: new Date('2024-04-28'), status: 'paid' } }),
  ])

  // ─── Requests ─────────────────────────────────────────────────────────────────
  const [emp1, emp2, emp3, , emp5, emp6] = employees
  const [cl1, cl2, , cl4, cl5, , cl7, cl8] = clients

  const requestSeeds = [
    { number: '00001', title: 'Сдать отчётность по НДС за Q1',       type: 'external', status: 'new',     clientId: cl1.id, assigneeId: emp2.id, deadline: new Date('2026-04-30T18:00:00') },
    { number: '00002', title: 'Расчёт заработной платы за апрель',    type: 'external', status: 'doing',   clientId: cl2.id, assigneeId: emp1.id, deadline: new Date('2026-04-25T17:00:00') },
    { number: '00003', title: 'Подготовить акт сверки с налоговой',   type: 'external', status: 'review',  clientId: cl4.id, assigneeId: emp3.id, deadline: new Date('2026-05-05T12:00:00') },
    { number: '00004', title: 'Консультация по оптимизации налогов',  type: 'external', status: 'waiting', clientId: cl5.id, assigneeId: emp6.id, deadline: null },
    { number: '00005', title: 'Восстановление бухгалтерского учёта',  type: 'external', status: 'new',     clientId: cl7.id, assigneeId: emp5.id, deadline: new Date('2026-05-15T18:00:00') },
    { number: '00006', title: 'Формирование финансовой отчётности',   type: 'external', status: 'done',    clientId: cl8.id, assigneeId: emp2.id, deadline: new Date('2026-04-20T17:00:00') },
    { number: '00007', title: 'Проверка первичной документации',      type: 'internal', status: 'new',     clientId: cl1.id, assigneeId: emp1.id, deadline: null },
    { number: '00008', title: 'Подача налоговой декларации КПН',      type: 'external', status: 'doing',   clientId: cl4.id, assigneeId: emp3.id, deadline: new Date('2026-04-28T17:00:00') },
    { number: '00009', title: 'Расчёт отпускных сотрудника',          type: 'internal', status: 'review',  clientId: cl2.id, assigneeId: emp6.id, deadline: null },
    { number: '00010', title: 'Оформление кадровых документов',       type: 'external', status: 'waiting', clientId: cl5.id, assigneeId: emp5.id, deadline: new Date('2026-05-01T12:00:00') },
  ]

  for (const seed of requestSeeds) {
    await prisma.request.upsert({
      where:  { number: seed.number },
      update: {},
      create: seed,
    })
  }

  // ─── Journal entries ─────────────────────────────────────────────────────────
  const existingJournal = await prisma.journalEntry.count()
  if (existingJournal === 0) {
    await prisma.journalEntry.createMany({
      data: [
        { type: 'Заявка',    action: 'Создана заявка №00010 — Оформление кадровых документов', user: 'Сейткалиева А.М.' },
        { type: 'Заявка',    action: 'Статус заявки №00006 изменён на «Выполнена»',             user: 'Нурланов Б.С.' },
        { type: 'Клиент',    action: 'Добавлен клиент ТОО «КазТехПром»',                        user: 'Бекова М.А.' },
        { type: 'Заявка',    action: 'Создана заявка №00009 — Расчёт отпускных',                user: 'Касымова Н.Е.' },
        { type: 'Счёт',      action: 'Создан счёт СЧ-2024-008',                                 user: 'Сейткалиева А.М.' },
        { type: 'Счёт',      action: 'Счёт СЧ-2024-004 отмечен как оплаченный',                user: 'Нурланов Б.С.' },
        { type: 'Сотрудник', action: 'Изменена должность: Ахметов Д.Б.',                        user: 'Бекова М.А.' },
        { type: 'Система',   action: 'Резервная копия данных создана',                           user: 'Система' },
      ],
    })
  }

  console.log('✅ Seed completed')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
