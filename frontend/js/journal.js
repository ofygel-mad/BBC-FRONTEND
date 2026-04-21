import { renderSidebar, checkAuth, formatDateTime } from './app.js';
import { getJournal } from './api.js';

if (!checkAuth()) throw new Error('not auth');
renderSidebar('journal');

const PAGE_SIZE = 12;
let allEntries = [];
let currentPage = 1;

const grid       = document.getElementById('journal-grid');
const emptyEl    = document.getElementById('empty-journal');
const pagination = document.getElementById('pagination');
const countLabel = document.getElementById('count-label');
const search     = document.getElementById('search');
const filterType = document.getElementById('filter-type');
const btnReset   = document.getElementById('btn-reset');

const TYPE_COLOR = {
  'Счёт':      '#0175c2',
  'Клиент':    '#fd0047',
  'Сотрудник': '#16a34a',
  'Заявка':    '#7c3aed',
  'Система':   '#8a8a8a',
};

function filtered() {
  const q    = search.value.toLowerCase();
  const type = filterType.value;
  return allEntries.filter(e =>
    (!q    || e.action.toLowerCase().includes(q) || e.user.toLowerCase().includes(q)) &&
    (!type || e.type === type)
  );
}

function render() {
  const items = filtered();
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > pages) currentPage = pages;
  const slice = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  countLabel.textContent = `Показано ${slice.length} из ${total}`;

  if (!slice.length) {
    grid.innerHTML = '';
    emptyEl.classList.remove('hidden');
    pagination.innerHTML = '';
    return;
  }
  emptyEl.classList.add('hidden');

  grid.innerHTML = slice.map(e => {
    const dateStr = e.createdAt ? formatDateTime(e.createdAt) : (e.date ?? '');
    return `
      <div class="journal-card">
        <div class="journal-card-date">${dateStr}</div>
        <div class="journal-card-user">${e.user}</div>
        <div class="journal-card-action">${e.action}</div>
      </div>`;
  }).join('');

  if (pages <= 1) { pagination.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="window._goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - currentPage) <= 1) {
      html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="window._goPage(${p})">${p}</button>`;
    } else if (Math.abs(p - currentPage) === 2) {
      html += `<span class="text-muted" style="padding:0 4px">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="window._goPage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''}>›</button>`;
  pagination.innerHTML = html;
}

window._goPage = (p) => { currentPage = p; render(); };

[search, filterType].forEach(el => {
  el.addEventListener('input',  () => { currentPage = 1; render(); });
  el.addEventListener('change', () => { currentPage = 1; render(); });
});

btnReset.addEventListener('click', () => {
  search.value = ''; filterType.value = '';
  currentPage = 1; render();
});

async function init() {
  allEntries = await getJournal().catch(() => []);
  render();
}

init();
