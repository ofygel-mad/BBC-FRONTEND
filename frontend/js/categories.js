import { renderSidebar, checkAuth, showToast, confirmDelete, openModal, closeModal } from './app.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('categories');

let items = [];
let editId = null;

const tbody     = document.getElementById('cat-tbody');
const emptyEl   = document.getElementById('empty-cat');
const form      = document.getElementById('cat-form');
const formError = document.getElementById('form-error');
const modalTitle = document.getElementById('modal-title');

async function load() {
  items = await getCategories().catch(() => []);
  render();
}

function render() {
  if (!items.length) {
    tbody.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  tbody.innerHTML = items.map(c => `
    <tr>
      <td><span class="fw-600">${c.name}</span></td>
      <td class="text-muted">—</td>
      <td>
        <div class="actions">
          <button type="button" class="action-btn action-edit" onclick="window._editCat(${c.id})">Изменить</button>
          <button type="button" class="action-btn action-delete" onclick="window._deleteCat(${c.id})">Удалить</button>
        </div>
      </td>
    </tr>`).join('');
}

function openCreate(id = null) {
  editId = id;
  formError.textContent = '';
  form.reset();
  if (id) {
    const c = items.find(x => x.id === id);
    modalTitle.textContent = 'Изменить категорию';
    document.getElementById('f-name').value = c.name;
  } else {
    modalTitle.textContent = 'Добавить категорию';
  }
  openModal('cat-modal');
}

document.getElementById('btn-add').addEventListener('click', () => openCreate());
document.getElementById('modal-close').addEventListener('click', () => closeModal('cat-modal'));
document.getElementById('btn-cancel').addEventListener('click', () => closeModal('cat-modal'));

form.addEventListener('submit', async e => {
  e.preventDefault();
  formError.textContent = '';
  const name = document.getElementById('f-name').value.trim();
  if (!name) { formError.textContent = 'Введите название'; return; }

  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    if (editId) {
      const updated = await updateCategory(editId, { name });
      items = items.map(c => c.id === editId ? { ...c, ...updated } : c);
      showToast('Категория обновлена');
    } else {
      const created = await createCategory({ name });
      items.push(created);
      showToast('Категория добавлена');
    }
    closeModal('cat-modal');
    render();
  } catch (err) {
    formError.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

window._editCat = (id) => openCreate(id);
window._deleteCat = async (id) => {
  if (!confirmDelete('Удалить эту категорию?')) return;
  try {
    await deleteCategory(id);
    items = items.filter(c => c.id !== id);
    showToast('Категория удалена');
    render();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

load();
