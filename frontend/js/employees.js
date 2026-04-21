import { renderSidebar, checkAuth, showToast, confirmDelete } from './app.js';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('employees');

let allEmployees = [];
let editId = null;

const tbody        = document.getElementById('emp-tbody');
const empty        = document.getElementById('empty-emp');
const search       = document.getElementById('search');
const filterStatus = document.getElementById('filter-status');
const filterPos    = document.getElementById('filter-pos');
const modal        = document.getElementById('emp-modal');
const form         = document.getElementById('emp-form');
const modalTitle   = document.getElementById('modal-title');
const formError    = document.getElementById('form-error');

const BADGE       = { active: 'badge-active', inactive: 'badge-inactive' };
const BADGE_LABEL = { active: 'Активный', inactive: 'Неактивный' };

function populatePositions(employees) {
  const positions = [...new Set(employees.map(e => e.position))].sort();
  filterPos.innerHTML = '<option value="">Все должности</option>' +
    positions.map(p => `<option value="${p}">${p}</option>`).join('');
}

function render(list) {
  if (!list.length) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  tbody.innerHTML = list.map(e => `
    <tr>
      <td><span class="fw-600">${e.name}</span></td>
      <td><span class="text-muted">${e.iin}</span></td>
      <td>${e.position}</td>
      <td>${e.phone || '—'}</td>
      <td><span class="badge ${BADGE[e.status] || 'badge-inactive'}">${BADGE_LABEL[e.status] || e.status}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn action-edit" onclick="window._editEmp(${e.id})">Изменить</button>
          <button class="action-btn action-delete" onclick="window._deleteEmp(${e.id})">Удалить</button>
        </div>
      </td>
    </tr>`).join('');
}

function filtered() {
  const q  = search.value.toLowerCase();
  const st = filterStatus.value;
  const pos = filterPos.value;
  return allEmployees.filter(e =>
    (!q   || e.name.toLowerCase().includes(q) || e.iin.includes(q)) &&
    (!st  || e.status === st) &&
    (!pos || e.position === pos)
  );
}

function refresh() { render(filtered()); }

search.addEventListener('input', refresh);
filterStatus.addEventListener('change', refresh);
filterPos.addEventListener('change', refresh);

function openModal(id = null) {
  editId = id; formError.textContent = ''; form.reset();
  if (id) {
    const e = allEmployees.find(x => x.id === id);
    modalTitle.textContent = 'Изменить сотрудника';
    document.getElementById('emp-id').value      = e.id;
    document.getElementById('f-name').value      = e.name;
    document.getElementById('f-iin').value       = e.iin;
    document.getElementById('f-phone').value     = e.phone || '';
    document.getElementById('f-position').value  = e.position;
    document.getElementById('f-status').value    = e.status;
  } else {
    modalTitle.textContent = 'Добавить сотрудника';
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
    name:     document.getElementById('f-name').value.trim(),
    iin:      document.getElementById('f-iin').value.trim(),
    phone:    document.getElementById('f-phone').value.trim(),
    position: document.getElementById('f-position').value.trim(),
    status:   document.getElementById('f-status').value,
  };
  if (!data.name || !data.iin || !data.position) { formError.textContent = 'Заполните обязательные поля'; return; }
  const btn = document.getElementById('btn-save'); btn.disabled = true;
  try {
    if (editId) { await updateEmployee(editId, data); showToast('Сотрудник обновлён'); }
    else        { await createEmployee(data);          showToast('Сотрудник добавлен'); }
    allEmployees = await getEmployees();
    populatePositions(allEmployees);
    refresh(); closeModal();
  } catch (err) { formError.textContent = err.message || 'Ошибка'; }
  finally { btn.disabled = false; }
});

window._editEmp = (id) => openModal(id);
window._deleteEmp = async (id) => {
  if (!confirmDelete('Удалить этого сотрудника?')) return;
  await deleteEmployee(id);
  allEmployees = await getEmployees();
  populatePositions(allEmployees);
  refresh();
  showToast('Сотрудник удалён');
};

async function init() {
  allEmployees = await getEmployees().catch(() => []);
  populatePositions(allEmployees);
  refresh();
}

init();
