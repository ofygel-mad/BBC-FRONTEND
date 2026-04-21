import { renderSidebar, checkAuth, showToast, formatMoney, confirmDelete } from './app.js';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('billing');

let allInvoices = [];
let editId = null;

const tbody        = document.getElementById('billing-tbody');
const empty        = document.getElementById('empty-billing');
const search       = document.getElementById('search');
const filterStatus = document.getElementById('filter-status');
const modal        = document.getElementById('billing-modal');
const form         = document.getElementById('billing-form');
const modalTitle   = document.getElementById('modal-title');
const formError    = document.getElementById('form-error');

const STATUS_MAP = {
  paid:    { badge: 'badge-paid',    label: 'Оплачен' },
  pending: { badge: 'badge-pending', label: 'Ожидает' },
  overdue: { badge: 'badge-overdue', label: 'Просрочен' },
};

function renderSummary(invoices) {
  const counts = { paid: 0, pending: 0, overdue: 0 };
  let revenue = 0;
  for (const i of invoices) {
    counts[i.status] = (counts[i.status] || 0) + 1;
    if (i.status === 'paid') revenue += i.amount;
  }
  document.getElementById('billing-summary').innerHTML = `
    <div class="card card-sm" style="flex:1;min-width:140px">
      <p class="stat-label">Оплачено</p>
      <p class="stat-value" style="color:var(--green)">${counts.paid}</p>
    </div>
    <div class="card card-sm" style="flex:1;min-width:140px">
      <p class="stat-label">Ожидает оплаты</p>
      <p class="stat-value" style="color:var(--yellow)">${counts.pending}</p>
    </div>
    <div class="card card-sm" style="flex:1;min-width:140px">
      <p class="stat-label">Просрочено</p>
      <p class="stat-value" style="color:var(--red)">${counts.overdue}</p>
    </div>
    <div class="card card-sm" style="flex:2;min-width:200px">
      <p class="stat-label">Выручка (оплачено)</p>
      <p class="stat-value" style="color:var(--green);font-size:20px">${formatMoney(revenue)}</p>
    </div>`;
}

function render(list) {
  renderSummary(list);
  if (!list.length) { tbody.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(i => {
    const s = STATUS_MAP[i.status] || { badge: 'badge-inactive', label: i.status };
    return `<tr>
      <td><span class="fw-600">${i.number}</span></td>
      <td>${i.client}</td>
      <td>${formatMoney(i.amount)}</td>
      <td>${i.date}</td>
      <td>${i.dueDate}</td>
      <td><span class="badge ${s.badge}">${s.label}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn action-edit" onclick="window._editInvoice(${i.id})">Изменить</button>
          <button class="action-btn action-delete" onclick="window._deleteInvoice(${i.id})">Удалить</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filtered() {
  const q  = search.value.toLowerCase();
  const st = filterStatus.value;
  return allInvoices.filter(i =>
    (!q  || i.number.toLowerCase().includes(q) || i.client.toLowerCase().includes(q)) &&
    (!st || i.status === st)
  );
}

function refresh() { render(filtered()); }

search.addEventListener('input', refresh);
filterStatus.addEventListener('change', refresh);

function openModal(id = null) {
  editId = id; formError.textContent = ''; form.reset();
  const today = new Date().toISOString().split('T')[0];
  if (id) {
    const i = allInvoices.find(x => x.id === id);
    modalTitle.textContent = 'Изменить счёт';
    document.getElementById('invoice-id').value = i.id;
    document.getElementById('f-client').value   = i.client;
    document.getElementById('f-amount').value   = i.amount;
    document.getElementById('f-status').value   = i.status;
    document.getElementById('f-date').value     = i.date;
    document.getElementById('f-due').value      = i.dueDate;
  } else {
    modalTitle.textContent = 'Создать счёт';
    document.getElementById('f-date').value = today;
  }
  modal.classList.add('open'); document.body.style.overflow = 'hidden';
}

function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; editId = null; }

document.getElementById('btn-add').addEventListener('click', () => openModal());
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault(); formError.textContent = '';
  const data = {
    client:  document.getElementById('f-client').value.trim(),
    amount:  parseFloat(document.getElementById('f-amount').value),
    status:  document.getElementById('f-status').value,
    date:    document.getElementById('f-date').value,
    dueDate: document.getElementById('f-due').value,
  };
  if (!data.client || !data.amount || !data.date) { formError.textContent = 'Заполните обязательные поля'; return; }
  const btn = document.getElementById('btn-save'); btn.disabled = true;
  try {
    if (editId) { await updateInvoice(editId, data); showToast('Счёт обновлён'); }
    else        { await createInvoice(data);          showToast('Счёт создан'); }
    allInvoices = await getInvoices();
    refresh(); closeModal();
  } catch (err) { formError.textContent = err.message || 'Ошибка'; }
  finally { btn.disabled = false; }
});

window._editInvoice = (id) => openModal(id);
window._deleteInvoice = async (id) => {
  if (!confirmDelete('Удалить этот счёт?')) return;
  await deleteInvoice(id);
  allInvoices = await getInvoices();
  refresh();
  showToast('Счёт удалён');
};

allInvoices = await getInvoices();
refresh();
