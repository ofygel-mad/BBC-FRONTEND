import { renderSidebar, checkAuth, showToast, confirmDelete, openModal, closeModal } from './app.js';
import { getPositions, createPosition, updatePosition, deletePosition } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('positions');

let items = [];
let editId = null;

const tbody     = document.getElementById('pos-tbody');
const emptyEl   = document.getElementById('empty-pos');
const form      = document.getElementById('pos-form');
const formError = document.getElementById('form-error');
const modalTitle = document.getElementById('modal-title');

async function load() {
  items = await getPositions().catch(() => []);
  render();
}

function render() {
  if (!items.length) {
    tbody.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  tbody.innerHTML = items.map(p => `
    <tr>
      <td><span class="fw-600">${p.name}</span></td>
      <td class="text-muted">—</td>
      <td>
        <div class="actions">
          <button type="button" class="action-btn action-edit" onclick="window._editPos(${p.id})">Изменить</button>
          <button type="button" class="action-btn action-delete" onclick="window._deletePos(${p.id})">Удалить</button>
        </div>
      </td>
    </tr>`).join('');
}

function openCreate(id = null) {
  editId = id;
  formError.textContent = '';
  form.reset();
  if (id) {
    const p = items.find(x => x.id === id);
    modalTitle.textContent = 'Изменить должность';
    document.getElementById('f-name').value = p.name;
  } else {
    modalTitle.textContent = 'Добавить должность';
  }
  openModal('pos-modal');
}

document.getElementById('btn-add').addEventListener('click', () => openCreate());
document.getElementById('modal-close').addEventListener('click', () => closeModal('pos-modal'));
document.getElementById('btn-cancel').addEventListener('click', () => closeModal('pos-modal'));

form.addEventListener('submit', async e => {
  e.preventDefault();
  formError.textContent = '';
  const name = document.getElementById('f-name').value.trim();
  if (!name) { formError.textContent = 'Введите название'; return; }

  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    if (editId) {
      const updated = await updatePosition(editId, { name });
      items = items.map(p => p.id === editId ? { ...p, ...updated } : p);
      showToast('Должность обновлена');
    } else {
      const created = await createPosition({ name });
      items.push(created);
      showToast('Должность добавлена');
    }
    closeModal('pos-modal');
    render();
  } catch (err) {
    formError.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

window._editPos = (id) => openCreate(id);
window._deletePos = async (id) => {
  if (!confirmDelete('Удалить эту должность?')) return;
  try {
    await deletePosition(id);
    items = items.filter(p => p.id !== id);
    showToast('Должность удалена');
    render();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

load();
