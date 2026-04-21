// API layer — переключается между мок-данными и реальным бэкендом через .env
// VITE_MOCK=true  → мок-данные (работает без бэкенда)
// VITE_MOCK=false → fetch() запросы на VITE_API_URL

const MOCK_MODE = (import.meta.env?.VITE_MOCK ?? (import.meta.env?.PROD ? 'false' : 'true')) === 'true'
export const API_BASE = import.meta.env?.VITE_API_URL ?? (import.meta.env?.PROD ? window.location.origin : 'http://localhost:4000')

async function api(method, path, body) {
  const token = localStorage.getItem('sm_token')
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Ошибка запроса')
  }
  return res.status === 204 ? null : res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  if (!MOCK_MODE) return api('POST', '/auth/login', { email, password })
  if (email && password) {
    return { token: 'mock-token-2024', user: { name: 'Администратор', email } };
  }
  throw new Error('Неверный логин или пароль');
}

export async function register(name, email, password, company) {
  if (!MOCK_MODE) return api('POST', '/auth/register', { name, email, password, company })
  return { token: 'mock-token-2024', user: { name, email, role: 'admin' } };
}

export async function getProfile() {
  if (!MOCK_MODE) return api('GET', '/auth/me')
  return {
    name: 'Администратор',
    email: 'admin@bbc.kz',
    role: 'Главный бухгалтер',
    positions: ['Главный бухгалтер'],
    categories: ['Административные вопросы', 'Зарплата', 'Кадры'],
    clients: ['ТОО «АлматыСтрой»', 'ИП Сейткалиев А.М.', 'АО «НурСервис»'],
  };
}

// ─── Clients ─────────────────────────────────────────────────────────────────

let mockClients = [
  { id: 1, name: 'ТОО «АлматыСтрой»',       bin: '120540012345', phone: '+7 701 234 56 78', status: 'active',   type: 'Юридическое лицо' },
  { id: 2, name: 'ИП Сейткалиев А.М.',        bin: '890312301234', phone: '+7 777 987 65 43', status: 'active',   type: 'ИП' },
  { id: 3, name: 'ТОО «Каспий Трейд»',        bin: '150630045678', phone: '+7 702 111 22 33', status: 'inactive', type: 'Юридическое лицо' },
  { id: 4, name: 'АО «НурСервис»',            bin: '040712300011', phone: '+7 747 555 44 33', status: 'active',   type: 'АО' },
  { id: 5, name: 'ИП Ахметова Г.Т.',          bin: '950825401122', phone: '+7 700 333 22 11', status: 'active',   type: 'ИП' },
  { id: 6, name: 'ТОО «ЕвразияЛогистик»',     bin: '180910067890', phone: '+7 771 888 77 66', status: 'inactive', type: 'Юридическое лицо' },
  { id: 7, name: 'ГКП «ГородскойТранспорт»',  bin: '000115002233', phone: '+7 727 456 78 90', status: 'active',   type: 'ГКП' },
  { id: 8, name: 'ТОО «КазТехПром»',          bin: '130320055566', phone: '+7 705 999 00 11', status: 'active',   type: 'Юридическое лицо' },
];
let nextClientId = 9;

export async function getClients() {
  if (!MOCK_MODE) return api('GET', '/clients')
  return [...mockClients];
}
export async function createClient(data) {
  if (!MOCK_MODE) return api('POST', '/clients', data)
  const client = { id: nextClientId++, ...data, status: data.status || 'active' };
  mockClients.push(client); return client;
}
export async function updateClient(id, data) {
  if (!MOCK_MODE) return api('PUT', `/clients/${id}`, data)
  mockClients = mockClients.map(c => c.id === id ? { ...c, ...data } : c);
  return mockClients.find(c => c.id === id);
}
export async function deleteClient(id) {
  if (!MOCK_MODE) return api('DELETE', `/clients/${id}`)
  mockClients = mockClients.filter(c => c.id !== id);
}

// ─── Employees ───────────────────────────────────────────────────────────────

let mockEmployees = [
  { id: 1, name: 'Сейткалиева Айгуль Маратовна',  position: 'Бухгалтер',          phone: '+7 701 111 22 33', status: 'active',   iin: '890312401234' },
  { id: 2, name: 'Нурланов Берик Сериккалиевич',   position: 'Старший бухгалтер',  phone: '+7 702 222 33 44', status: 'active',   iin: '870524300123' },
  { id: 3, name: 'Жуматова Гулзира Кайраткызы',    position: 'Налоговый консульт', phone: '+7 777 333 44 55', status: 'active',   iin: '920815201234' },
  { id: 4, name: 'Ахметов Данияр Болатович',       position: 'Кассир',             phone: '+7 747 444 55 66', status: 'inactive', iin: '950201101234' },
  { id: 5, name: 'Касымова Назгуль Ермекқызы',     position: 'Бухгалтер',          phone: '+7 705 555 66 77', status: 'active',   iin: '880630401234' },
  { id: 6, name: 'Бекова Меруерт Аскарқызы',       position: 'Главный бухгалтер',  phone: '+7 771 666 77 88', status: 'active',   iin: '830920301234' },
];
let nextEmployeeId = 7;

export async function getEmployees() {
  if (!MOCK_MODE) return api('GET', '/employees')
  return [...mockEmployees];
}
export async function createEmployee(data) {
  if (!MOCK_MODE) return api('POST', '/employees', data)
  const emp = { id: nextEmployeeId++, ...data, status: data.status || 'active' };
  mockEmployees.push(emp); return emp;
}
export async function updateEmployee(id, data) {
  if (!MOCK_MODE) return api('PUT', `/employees/${id}`, data)
  mockEmployees = mockEmployees.map(e => e.id === id ? { ...e, ...data } : e);
  return mockEmployees.find(e => e.id === id);
}
export async function deleteEmployee(id) {
  if (!MOCK_MODE) return api('DELETE', `/employees/${id}`)
  mockEmployees = mockEmployees.filter(e => e.id !== id);
}

// ─── Billing ─────────────────────────────────────────────────────────────────

let mockInvoices = [
  { id: 1, number: 'СЧ-2024-001', client: 'ТОО «АлматыСтрой»',       amount: 450000,  date: '2024-04-01', dueDate: '2024-04-15', status: 'paid' },
  { id: 2, number: 'СЧ-2024-002', client: 'ИП Сейткалиев А.М.',        amount: 120000,  date: '2024-04-03', dueDate: '2024-04-17', status: 'pending' },
  { id: 3, number: 'СЧ-2024-003', client: 'АО «НурСервис»',            amount: 890000,  date: '2024-04-05', dueDate: '2024-04-19', status: 'overdue' },
  { id: 4, number: 'СЧ-2024-004', client: 'ТОО «КазТехПром»',          amount: 320000,  date: '2024-04-08', dueDate: '2024-04-22', status: 'paid' },
  { id: 5, number: 'СЧ-2024-005', client: 'ИП Ахметова Г.Т.',          amount: 75000,   date: '2024-04-10', dueDate: '2024-04-24', status: 'pending' },
  { id: 6, number: 'СЧ-2024-006', client: 'ГКП «ГородскойТранспорт»',  amount: 1200000, date: '2024-04-12', dueDate: '2024-04-26', status: 'pending' },
  { id: 7, number: 'СЧ-2024-007', client: 'ТОО «Каспий Трейд»',        amount: 560000,  date: '2024-03-15', dueDate: '2024-03-29', status: 'overdue' },
  { id: 8, number: 'СЧ-2024-008', client: 'ТОО «ЕвразияЛогистик»',     amount: 230000,  date: '2024-04-14', dueDate: '2024-04-28', status: 'paid' },
];
let nextInvoiceId = 9;

export async function getInvoices() {
  if (!MOCK_MODE) return api('GET', '/invoices')
  return [...mockInvoices];
}
export async function createInvoice(data) {
  if (!MOCK_MODE) return api('POST', '/invoices', data)
  const invoice = { id: nextInvoiceId++, number: `СЧ-2024-00${nextInvoiceId}`, ...data, status: 'pending' };
  mockInvoices.push(invoice); return invoice;
}
export async function updateInvoice(id, data) {
  if (!MOCK_MODE) return api('PUT', `/invoices/${id}`, data)
  mockInvoices = mockInvoices.map(i => i.id === id ? { ...i, ...data } : i);
  return mockInvoices.find(i => i.id === id);
}
export async function deleteInvoice(id) {
  if (!MOCK_MODE) return api('DELETE', `/invoices/${id}`)
  mockInvoices = mockInvoices.filter(i => i.id !== id);
}

// ─── Journal ─────────────────────────────────────────────────────────────────

const mockJournal = [
  { id: 1,  date: '2024-04-15 09:14', type: 'Счёт',      action: 'Создан счёт СЧ-2024-008',                     user: 'Сейткалиева А.М.' },
  { id: 2,  date: '2024-04-15 09:30', type: 'Клиент',    action: 'Добавлен клиент ТОО «КазТехПром»',            user: 'Нурланов Б.С.' },
  { id: 3,  date: '2024-04-14 14:22', type: 'Счёт',      action: 'Счёт СЧ-2024-004 отмечен как оплаченный',    user: 'Касымова Н.Е.' },
  { id: 4,  date: '2024-04-14 11:05', type: 'Сотрудник', action: 'Изменена должность: Ахметов Д.Б.',            user: 'Бекова М.А.' },
  { id: 5,  date: '2024-04-13 16:40', type: 'Счёт',      action: 'Создан счёт СЧ-2024-007',                     user: 'Сейткалиева А.М.' },
  { id: 6,  date: '2024-04-13 10:15', type: 'Клиент',    action: 'Обновлены данные: ИП Ахметова Г.Т.',          user: 'Нурланов Б.С.' },
  { id: 7,  date: '2024-04-12 15:33', type: 'Счёт',      action: 'Создан счёт СЧ-2024-006',                     user: 'Жуматова Г.К.' },
  { id: 8,  date: '2024-04-12 09:00', type: 'Система',   action: 'Резервная копия данных создана',               user: 'Система' },
  { id: 9,  date: '2024-04-11 13:50', type: 'Клиент',    action: 'Добавлен клиент ГКП «ГородскойТранспорт»',   user: 'Бекова М.А.' },
  { id: 10, date: '2024-04-10 11:20', type: 'Счёт',      action: 'Создан счёт СЧ-2024-005',                     user: 'Сейткалиева А.М.' },
  { id: 11, date: '2024-04-09 16:00', type: 'Сотрудник', action: 'Добавлен сотрудник Касымова Н.Е.',            user: 'Бекова М.А.' },
  { id: 12, date: '2024-04-08 10:45', type: 'Счёт',      action: 'Создан счёт СЧ-2024-004',                     user: 'Нурланов Б.С.' },
  { id: 13, date: '2024-04-07 14:10', type: 'Клиент',    action: 'Деактивирован клиент ТОО «ЕвразияЛогистик»', user: 'Бекова М.А.' },
  { id: 14, date: '2024-04-05 09:30', type: 'Счёт',      action: 'Создан счёт СЧ-2024-003',                     user: 'Жуматова Г.К.' },
  { id: 15, date: '2024-04-03 15:00', type: 'Счёт',      action: 'Создан счёт СЧ-2024-002',                     user: 'Сейткалиева А.М.' },
  { id: 16, date: '2024-04-01 10:00', type: 'Счёт',      action: 'Создан счёт СЧ-2024-001',                     user: 'Нурланов Б.С.' },
  { id: 17, date: '2024-03-30 14:00', type: 'Система',   action: 'Система обновлена до версии 2.1.0',           user: 'Система' },
  { id: 18, date: '2024-03-28 11:30', type: 'Клиент',    action: 'Добавлен клиент ТОО «АлматыСтрой»',          user: 'Бекова М.А.' },
];

export async function getJournal(params = {}) {
  if (!MOCK_MODE) {
    const qs = new URLSearchParams(params).toString()
    const result = await api('GET', `/journal${qs ? '?' + qs : ''}`)
    return Array.isArray(result) ? result : (result.items ?? [])
  }
  return [...mockJournal];
}

// ─── Requests ────────────────────────────────────────────────────────────────

let mockRequests = [
  { id: 1, number: '001', clientId: 1, assigneeId: 2, type: 'external', title: 'Сдать отчётность по НДС за Q1', status: 'new',     createdAt: '2024-04-15T09:00:00', deadline: '2024-04-30T18:00:00' },
  { id: 2, number: '002', clientId: 2, assigneeId: 1, type: 'external', title: 'Подготовить годовой баланс',    status: 'review',  createdAt: '2024-04-14T10:30:00', deadline: '2024-05-01T18:00:00' },
  { id: 3, number: '003', clientId: 4, assigneeId: 3, type: 'external', title: 'Консультация по ЕНС',           status: 'doing',   createdAt: '2024-04-13T14:00:00', deadline: null },
  { id: 4, number: '004', clientId: 1, assigneeId: 5, type: 'internal', title: 'Обновить базу клиентов',        status: 'waiting', createdAt: '2024-04-12T11:00:00', deadline: null },
  { id: 5, number: '005', clientId: 3, assigneeId: 2, type: 'external', title: 'Закрыть дебиторскую задолжн.', status: 'done',    createdAt: '2024-04-10T09:00:00', deadline: '2024-04-20T18:00:00' },
  { id: 6, number: '006', clientId: 5, assigneeId: 1, type: 'external', title: 'Форма 200.00 за I квартал',     status: 'new',     createdAt: '2024-04-16T08:30:00', deadline: '2024-04-25T18:00:00' },
  { id: 7, number: '007', clientId: 7, assigneeId: 6, type: 'external', title: 'Учёт заработной платы март',    status: 'doing',   createdAt: '2024-04-11T13:00:00', deadline: '2024-04-18T18:00:00' },
  { id: 8, number: '008', clientId: 8, assigneeId: 3, type: 'internal', title: 'Аудит внутренней отчётности',   status: 'review',  createdAt: '2024-04-09T16:00:00', deadline: null },
];
let nextRequestId = 9;

export async function getRequests() {
  if (!MOCK_MODE) return api('GET', '/requests')
  return [...mockRequests];
}
export async function createRequest(data) {
  if (!MOCK_MODE) return api('POST', '/requests', data)
  const req = { id: nextRequestId++, number: String(nextRequestId - 1).padStart(3, '0'), ...data, createdAt: new Date().toISOString() };
  mockRequests.unshift(req); return req;
}
export async function updateRequest(id, data) {
  if (!MOCK_MODE) return api('PUT', `/requests/${id}`, data)
  mockRequests = mockRequests.map(r => r.id === id ? { ...r, ...data } : r);
  return mockRequests.find(r => r.id === id);
}
export async function deleteRequest(id) {
  if (!MOCK_MODE) return api('DELETE', `/requests/${id}`)
  mockRequests = mockRequests.filter(r => r.id !== id);
}

// ─── Request Categories ───────────────────────────────────────────────────────

export async function getCategories() {
  if (!MOCK_MODE) return api('GET', '/request-categories')
  return [
    { id: 1, name: 'Административные вопросы' },
    { id: 2, name: 'Зарплата' },
    { id: 3, name: 'Кадры' },
    { id: 4, name: 'Налоги' },
    { id: 5, name: 'Отчётность' },
    { id: 6, name: 'Юридические вопросы' },
  ]
}
export async function createCategory(data) {
  if (!MOCK_MODE) return api('POST', '/request-categories', data)
  return { id: Date.now(), ...data }
}
export async function updateCategory(id, data) {
  if (!MOCK_MODE) return api('PUT', `/request-categories/${id}`, data)
  return { id, ...data }
}
export async function deleteCategory(id) {
  if (!MOCK_MODE) return api('DELETE', `/request-categories/${id}`)
}

// ─── Positions ────────────────────────────────────────────────────────────────

export async function getPositions() {
  if (!MOCK_MODE) return api('GET', '/positions')
  return [
    { id: 1, name: 'Главный бухгалтер' },
    { id: 2, name: 'Старший бухгалтер' },
    { id: 3, name: 'Бухгалтер' },
    { id: 4, name: 'Налоговый консультант' },
    { id: 5, name: 'Кассир' },
  ]
}
export async function createPosition(data) {
  if (!MOCK_MODE) return api('POST', '/positions', data)
  return { id: Date.now(), ...data }
}
export async function updatePosition(id, data) {
  if (!MOCK_MODE) return api('PUT', `/positions/${id}`, data)
  return { id, ...data }
}
export async function deletePosition(id) {
  if (!MOCK_MODE) return api('DELETE', `/positions/${id}`)
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export async function getStatistics() {
  if (!MOCK_MODE) return api('GET', '/statistics')
  return null
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  if (!MOCK_MODE) return api('GET', '/dashboard/stats')
  const clients   = await getClients();
  const employees = await getEmployees();
  const invoices  = await getInvoices();
  return {
    totalClients:      clients.length,
    activeClients:     clients.filter(c => c.status === 'active').length,
    totalEmployees:    employees.length,
    activeEmployees:   employees.filter(e => e.status === 'active').length,
    totalInvoices:     invoices.length,
    paidInvoices:      invoices.filter(i => i.status === 'paid').length,
    pendingInvoices:   invoices.filter(i => i.status === 'pending').length,
    overdueInvoices:   invoices.filter(i => i.status === 'overdue').length,
    totalRevenue:      invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    pendingRevenue:    invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
  };
}
