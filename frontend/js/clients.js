import { renderSidebar, checkAuth, showToast, confirmDelete } from './app.js';
import { getClients, createClient, updateClient, deleteClient } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('clients');

let allClients = [];
let editId = null;

const tbody       = document.getElementById('clients-tbody');
const empty       = document.getElementById('empty-clients');
const search      = document.getElementById('search');
const filterStatus = document.getElementById('filter-status');
const filterType  = document.getElementById('filter-type');
const modal       = document.getElementById('client-modal');
const form        = document.getElementById('client-form');
const modalTitle  = document.getElementById('modal-title');
const formError   = document.getElementById('form-error');

const BADGE = { active: 'badge-active', inactive: 'badge-inactive' };
const BADGE_LABEL = { active: 'Активный', inactive: 'Неактивный' };

function render(clients) {
  if (!clients.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = clients.map(c => `
    <tr>
      <td><span class="fw-600">${c.name}</span></td>
      <td><span class="text-muted">${c.bin}</span></td>
      <td>${c.type}</td>
      <td>${c.phone || '—'}</td>
      <td><span class="badge ${BADGE[c.status] || 'badge-inactive'}">${BADGE_LABEL[c.status] || c.status}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn action-edit" onclick="window._editClient(${c.id})">Изменить</button>
          <button class="action-btn action-delete" onclick="window._deleteClient(${c.id})">Удалить</button>
        </div>
      </td>
    </tr>`).join('');
}

function filtered() {
  const q  = search.value.toLowerCase();
  const st = filterStatus.value;
  const ty = filterType.value;
  return allClients.filter(c =>
    (!q  || c.name.toLowerCase().includes(q) || c.bin.includes(q)) &&
    (!st || c.status === st) &&
    (!ty || c.type === ty)
  );
}

function refresh() { render(filtered()); }

search.addEventListener('input', refresh);
filterStatus.addEventListener('change', refresh);
filterType.addEventListener('change', refresh);

// Modal helpers
function openModal(id = null) {
  editId = id;
  formError.textContent = '';
  form.reset();
  if (id) {
    const c = allClients.find(x => x.id === id);
    modalTitle.textContent = 'Изменить клиента';
    document.getElementById('client-id').value = c.id;
    document.getElementById('f-name').value    = c.name;
    document.getElementById('f-bin').value     = c.bin;
    document.getElementById('f-type').value    = c.type;
    document.getElementById('f-phone').value   = c.phone || '';
    document.getElementById('f-status').value  = c.status;
  } else {
    modalTitle.textContent = 'Добавить клиента';
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  editId = null;
}

document.getElementById('btn-add').addEventListener('click', () => openModal());
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// Save
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';
  const data = {
    name:   document.getElementById('f-name').value.trim(),
    bin:    document.getElementById('f-bin').value.trim(),
    type:   document.getElementById('f-type').value,
    phone:  document.getElementById('f-phone').value.trim(),
    status: document.getElementById('f-status').value,
  };
  if (!data.name || !data.bin) { formError.textContent = 'Заполните обязательные поля'; return; }
  const btn = document.getElementById('btn-save');
  btn.disabled = true;
  try {
    if (editId) {
      await updateClient(editId, data);
      showToast('Клиент обновлён');
    } else {
      await createClient(data);
      showToast('Клиент добавлен');
    }
    allClients = await getClients();
    refresh();
    closeModal();
  } catch (err) {
    formError.textContent = err.message || 'Ошибка сохранения';
  } finally {
    btn.disabled = false;
  }
});

// Globals for inline onclick
window._editClient = (id) => openModal(id);
window._deleteClient = async (id) => {
  if (!confirmDelete('Удалить этого клиента?')) return;
  await deleteClient(id);
  allClients = await getClients();
  refresh();
  showToast('Клиент удалён', 'success');
};

async function init() {
  allClients = await getClients().catch(() => []);
  refresh();
}

init();
