import { renderSidebar, checkAuth, showToast, openModal, closeModal, formatDateTime, avatarColor, debounce } from './app.js';
import { getRequests, createRequest, updateRequest, deleteRequest, getClients, getEmployees } from './api.js';

if (!checkAuth()) throw new Error('not authenticated');
renderSidebar('requests');

// ─── State ────────────────────────────────────────────────────────────────────
let allRequests = [];
let clients     = [];
let employees   = [];
let editingId   = null;
let currentView = 'board';

const COLUMNS = [
  { id: 'new',      label: 'Новая',           badge: 'badge-new' },
  { id: 'review',   label: 'На рассмотрении', badge: 'badge-review' },
  { id: 'doing',    label: 'На выполнении',   badge: 'badge-doing' },
  { id: 'waiting',  label: 'Требует ответа',  badge: 'badge-waiting' },
  { id: 'done',     label: 'Выполнена',       badge: 'badge-done' },
];

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  [allRequests, clients, employees] = await Promise.all([
    getRequests().catch(() => []),
    getClients().catch(() => []),
    getEmployees().catch(() => []),
  ]);
  populateFilters();
  render();
}

function populateFilters() {
  const fClient   = document.getElementById('f-client');
  const fAssignee = document.getElementById('f-assignee');
  const rClient   = document.getElementById('r-client');
  const rAssignee = document.getElementById('r-assignee');

  clients.forEach(c => {
    fClient.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.name}</option>`);
    rClient.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.name}</option>`);
  });
  employees.forEach(e => {
    fAssignee.insertAdjacentHTML('beforeend', `<option value="${e.id}">${e.name}</option>`);
    rAssignee.insertAdjacentHTML('beforeend', `<option value="${e.id}">${e.name}</option>`);
  });
}

// ─── Render ───────────────────────────────────────────────────────────────────
function getFiltered() {
  const client   = document.getElementById('f-client')?.value;
  const type     = document.getElementById('f-type')?.value;
  const assignee = document.getElementById('f-assignee')?.value;
  const search   = document.getElementById('f-search')?.value?.toLowerCase() ?? '';
  return allRequests.filter(r => {
    if (client   && String(r.clientId) !== client)     return false;
    if (type     && r.type !== type)                   return false;
    if (assignee && String(r.assigneeId) !== assignee) return false;
    if (search   && !String(r.number ?? r.id).toLowerCase().includes(search)) return false;
    return true;
  });
}

function render() {
  if (currentView === 'board') renderBoard();
  else if (currentView === 'list') renderList();
}

function renderBoard() {
  const board = document.getElementById('kanban-board');
  const items = getFiltered();

  board.innerHTML = COLUMNS.map(col => {
    const colItems = items.filter(r => (r.status || 'new') === col.id);
    const cards = colItems.map(r => cardHtml(r)).join('');
    return `
      <div class="kanban-col">
        <div class="kanban-col-header">
          <span class="kanban-col-title">${col.label}</span>
          <span class="kanban-col-count">${colItems.length}</span>
        </div>
        ${cards || `<div class="empty-state" style="padding:24px 8px"><p style="font-size:12px">Нет заявок</p></div>`}
      </div>`;
  }).join('');

  board.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('click', () => openDetail(Number(card.dataset.id)));
  });
}

function cardHtml(r) {
  const client   = clients.find(c => c.id === r.clientId);
  const assignee = employees.find(e => e.id === r.assigneeId);
  const name     = client?.name ?? '—';
  const bg       = avatarColor(name);
  const letter   = name.charAt(0).toUpperCase();
  const num      = r.number ? `№ ${r.number}` : `#${r.id}`;
  const date     = r.createdAt ? formatDateTime(r.createdAt) : '';
  const deadline = r.deadline ? formatDateTime(r.deadline) : '';

  return `
    <div class="ticket-card" data-id="${r.id}">
      <div class="ticket-client">
        <div class="client-avatar" style="background:${bg}">${letter}</div>
        <span class="client-name">${name}</span>
      </div>
      <div class="ticket-num-row">
        <span class="ticket-dot"></span>
        <span class="ticket-num">${num}</span>
        <span class="ticket-sep">|</span>
        <span class="ticket-date">${date}</span>
      </div>
      <p class="ticket-title">${r.title ?? '—'}</p>
      ${assignee ? `<p class="ticket-assignee-line">${assignee.name}</p>` : ''}
      ${deadline ? `<p class="ticket-deadline-line">до ${deadline}</p>` : ''}
    </div>`;
}

function renderList() {
  const tbody = document.getElementById('list-body');
  const items = getFiltered();
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Нет заявок</td></tr>`;
    return;
  }

  const statusLabel = { new:'Новая', review:'На рассмотрении', doing:'На выполнении', waiting:'Требует ответа', done:'Выполнена' };
  const badgeClass  = { new:'badge-new', review:'badge-review', doing:'badge-doing', waiting:'badge-waiting', done:'badge-done' };

  tbody.innerHTML = items.map(r => {
    const client   = clients.find(c => c.id === r.clientId);
    const assignee = employees.find(e => e.id === r.assigneeId);
    const status   = r.status || 'new';
    return `
      <tr>
        <td>${client?.name ?? '—'}</td>
        <td>${r.number ?? `#${r.id}`}</td>
        <td>${r.createdAt ? formatDateTime(r.createdAt) : '—'}</td>
        <td>${r.type === 'internal' ? 'Внутренняя' : 'Внешняя'}</td>
        <td>${r.title ?? r.description ?? '—'}</td>
        <td>${r.deadline ? formatDateTime(r.deadline) : '—'}</td>
        <td>${assignee?.name ?? '—'}</td>
        <td><span class="badge ${badgeClass[status]}">${statusLabel[status] ?? status}</span></td>
      </tr>`;
  }).join('');
}

// ─── Detail (simple alert for now — will be expanded) ────────────────────────
function openDetail(id) {
  const r = allRequests.find(x => x.id === id);
  if (!r) return;
  // TODO: implement slide-in detail panel
  console.log('open detail', r);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openCreate() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Новая заявка';
  document.getElementById('modal-save-btn').textContent = 'Создать';
  document.getElementById('r-title').value = '';
  document.getElementById('r-deadline').value = '';
  openModal('modal-request');
}

async function save() {
  const title    = document.getElementById('r-title').value.trim();
  const clientId = Number(document.getElementById('r-client').value);
  const type     = document.getElementById('r-type').value;
  const assigneeId = Number(document.getElementById('r-assignee').value) || null;
  const deadline = document.getElementById('r-deadline').value || null;

  if (!title) { showToast('Введите название заявки', 'error'); return; }

  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true;
  try {
    const data = { title, clientId, type, assigneeId, deadline, status: 'new' };
    if (editingId) {
      const updated = await updateRequest(editingId, data);
      allRequests = allRequests.map(r => r.id === editingId ? updated : r);
      showToast('Заявка обновлена');
    } else {
      const created = await createRequest(data);
      allRequests.unshift(created);
      showToast('Заявка создана');
    }
    closeModal('modal-request');
    render();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ─── View switcher ────────────────────────────────────────────────────────────
function setView(v) {
  currentView = v;
  ['board', 'list', 'calendar'].forEach(name => {
    document.getElementById(`view-${name}`).classList.toggle('hidden', name !== v);
    document.getElementById(`btn-${name}`).classList.toggle('active', name === v);
  });
  render();
}

// ─── Event bindings ───────────────────────────────────────────────────────────
document.getElementById('btn-board').addEventListener('click', () => setView('board'));
document.getElementById('btn-list').addEventListener('click', () => setView('list'));
document.getElementById('btn-calendar').addEventListener('click', () => setView('calendar'));

document.getElementById('btn-filter').addEventListener('click', () => {
  document.getElementById('filter-bar').classList.toggle('hidden');
});

document.getElementById('btn-create').addEventListener('click', openCreate);
document.addEventListener('header:add', openCreate);
document.getElementById('modal-save-btn').addEventListener('click', save);
document.getElementById('modal-close-btn').addEventListener('click', () => closeModal('modal-request'));
document.getElementById('modal-cancel-btn').addEventListener('click', () => closeModal('modal-request'));

const rerender = debounce(render, 250);
['f-client','f-type','f-assignee'].forEach(id =>
  document.getElementById(id)?.addEventListener('change', rerender)
);
document.getElementById('f-search')?.addEventListener('input', rerender);

// ─── Start ────────────────────────────────────────────────────────────────────
init();
